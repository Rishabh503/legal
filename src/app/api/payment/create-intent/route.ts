import connectDB from '@/lib/db';
import Booking from '@/lib/models/booking';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/errorHandler';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// POST - Create fake payment intent
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();

    const body = await req.json();
    const { bookingId } = body;

    // Get booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return createErrorResponse('Booking not found', 404);
    }

    // Check if already paid
    if (booking.paymentStatus === 'paid') {
      return createErrorResponse('Booking already paid', 400);
    }

    // Generate fake payment intent ID
    const fakePaymentIntentId = `pi_fake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update booking with payment intent
    booking.paymentIntentId = fakePaymentIntentId;
    booking.paymentStatus = 'paid'; // Auto-mark as paid for fake payment
    await booking.save();

    // Return fake payment intent
    return createSuccessResponse({
      paymentIntentId: fakePaymentIntentId,
      amount: booking.amount,
      currency: booking.currency,
      status: 'succeeded',
      message: 'Fake payment successful'
    }, 'Payment processed successfully');
  } catch (error) {
    return handleApiError(error);
  }
}