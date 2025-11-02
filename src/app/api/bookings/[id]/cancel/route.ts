import connectDB from '@/lib/db';
import Booking from '@/lib/models/booking';
import Lawyer from '@/lib/models/lawyer';
import User from '@/lib/models/user';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/errorHandler';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// POST - Cancel booking (Client or Lawyer)
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

    // Get booking
    const booking = await Booking.findById(params.id);

    if (!booking) {
      return createErrorResponse('Booking not found', 404);
    }

    // Check if booking can be cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      return createErrorResponse('Cannot cancel this booking', 400);
    }

    // Verify user has access to cancel
    const user = await User.findOne({ clerkId: userId });
    const lawyer = await Lawyer.findOne({ clerkId: userId });

    const canCancel = 
      booking.clientId.toString() === user?._id.toString() ||
      booking.lawyerId.toString() === lawyer?._id.toString();

    if (!canCancel) {
      return createErrorResponse('Forbidden', 403);
    }

    const body = await req.json();
    const { cancellationReason } = body;

    // Update booking
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = cancellationReason || 'No reason provided';

    // Refund if payment was made
    if (booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refunded';
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
      'Booking cancelled successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}