import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/errorHandler';
import connectDB from '@/lib/db';
import Booking from '@/lib/models/booking';

// ✅ Must export at least one function (POST or GET)
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { paymentIntentId } = await req.json();
    if (!paymentIntentId) {
      return createErrorResponse('Payment Intent ID is required', 400);
    }

    const booking = await Booking.findOne({ paymentIntentId });
    if (!booking) {
      return createErrorResponse('Invalid payment intent', 404);
    }

    booking.paymentStatus = 'paid';
    await booking.save();

    return createSuccessResponse({ status: 'Payment verified' });
  } catch (error) {
    return createErrorResponse('Verification failed', 500);
  }
}
