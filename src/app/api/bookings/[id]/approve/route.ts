import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Booking from '@/lib/models/booking';
import Lawyer from '@/lib/models/lawyer';
import { handleApiError, createSuccessResponse, createErrorResponse } from '@/lib/utils/errorHandler';

// Function to generate random alphanumeric string
function generateRoomId(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// POST - Approve booking (Lawyer only)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();

    // Get lawyer
    const lawyer = await Lawyer.findOne({ clerkId: userId });
    
    if (!lawyer) {
      return createErrorResponse('Only lawyers can approve bookings', 403);
    }

    // Get booking
    const booking = await Booking.findById(params.id);

    if (!booking) {
      return createErrorResponse('Booking not found', 404);
    }

    // Verify lawyer owns this booking
    if (booking.lawyerId.toString() !== lawyer._id.toString()) {
      return createErrorResponse('Forbidden', 403);
    }

    // Check if booking is pending
    if (booking.status !== 'pending') {
      return createErrorResponse('Only pending bookings can be approved', 400);
    }

    const body = await req.json();
    const { confirmedDateTime, lawyerNotes } = body;

    // Generate meeting link automatically
    const roomId = generateRoomId(12);
    const meetingLink = `https://video-call-legalmate.vercel.app/meeting/${roomId}`;

    // Update booking
    booking.status = 'approved';
    booking.approvedAt = new Date();
    booking.confirmedDateTime = new Date(confirmedDateTime);
    booking.meetingLink = meetingLink;
    
    if (lawyerNotes) {
      booking.lawyerNotes = lawyerNotes;
    }

    await booking.save();

    await booking.populate([
      { path: 'clientId', select: 'firstName lastName email' },
      { 
        path: 'lawyerId',
        populate: { path: 'userId', select: 'firstName lastName email' }
      }
    ]);

    return createSuccessResponse(
      booking,
      'Booking approved successfully. Meeting link generated.'
    );
  } catch (error) {
    return handleApiError(error);
  }
}