import connectDB from '@/lib/db';
import Booking from '@/lib/models/booking';
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
} from '@/lib/utils/errorHandler';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// ✅ POST - Simulate payment (fake intent)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return createErrorResponse('Unauthorized', 401);

    await connectDB();

    const { bookingId } = await req.json();

    // Validate input
    if (!bookingId) {
      return createErrorResponse('Booking ID is required', 400);
    }

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) return createErrorResponse('Booking not found', 404);

    // Ensure user owns this booking (optional but good for security)
    if (booking.clerkId && booking.clerkId !== userId) {
      return createErrorResponse('Forbidden', 403);
    }

    // Check if already paid
    if (booking.paymentStatus === 'paid') {
      return createErrorResponse('Booking already paid', 400);
    }

    // Create fake payment intent ID
    const fakePaymentIntentId = `pi_fake_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 9)}`;

    // Update booking
    booking.paymentIntentId = fakePaymentIntentId;
    booking.paymentStatus = 'paid';
    await booking.save();

    // Return success response
    return createSuccessResponse(
      {
        paymentIntentId: fakePaymentIntentId,
        amount: booking.amount,
        currency: booking.currency,
        status: 'succeeded',
        message: 'Fake payment successful',
      },
      'Payment processed successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
