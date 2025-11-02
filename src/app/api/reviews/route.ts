import connectDB from '@/lib/db';
import Booking from '@/lib/models/booking';
import Lawyer from '@/lib/models/lawyer';
import Review from '@/lib/models/review';
import User from '@/lib/models/user';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/errorHandler';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { Types } from 'mongoose'; // Import Types for ObjectId

// Define the interface for the Mongoose query object
interface ReviewQuery {
  isVisible: boolean;
  lawyerId?: string | Types.ObjectId; // Allow string ID or ObjectId
}

// GET reviews (optionally filtered by lawyerId)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const lawyerId = searchParams.get('lawyerId');

    // FIX: Replaced 'any' with the specific 'ReviewQuery' interface
    const query: ReviewQuery = { isVisible: true };
    
    if (lawyerId) {
      query.lawyerId = lawyerId;
    }

    const reviews = await Review.find(query)
      .populate('clientId', 'firstName lastName profileImage')
      .populate({
        path: 'lawyerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    return createSuccessResponse(reviews);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Create review (Client only, after completed session)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();

    const body = await req.json();
    const { bookingId, rating, reviewText } = body;

    // Get current user
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    if (user.role !== 'client') {
      return createErrorResponse('Only clients can leave reviews', 403);
    }

    // Get booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return createErrorResponse('Booking not found', 404);
    }

    // Verify client owns this booking
    if (booking.clientId.toString() !== user._id.toString()) {
      return createErrorResponse('Forbidden', 403);
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return createErrorResponse('Can only review completed sessions', 400);
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ bookingId });
    
    if (existingReview) {
      return createErrorResponse('Review already exists for this booking', 400);
        }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return createErrorResponse('Rating must be between 1 and 5', 400);
    }

    // Create review
    const review = await Review.create({
      bookingId,
      clientId: user._id,
      lawyerId: booking.lawyerId,
      rating,
      reviewText
    });

    // Update lawyer's average rating
    const lawyer = await Lawyer.findById(booking.lawyerId);
    
    if (lawyer) {
      const allReviews = await Review.find({ lawyerId: lawyer._id, isVisible: true });
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / allReviews.length;

      lawyer.averageRating = parseFloat(avgRating.toFixed(2));
      lawyer.totalReviews = allReviews.length;
      await lawyer.save();
    }

    await review.populate([
      { path: 'clientId', select: 'firstName lastName profileImage' },
      {
        path: 'lawyerId',
        populate: { path: 'userId', select: 'firstName lastName' }
      }
    ]);

    return createSuccessResponse(
      review,
      'Review submitted successfully',
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}