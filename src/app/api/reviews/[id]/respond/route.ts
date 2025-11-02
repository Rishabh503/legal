import connectDB from '@/lib/db';
import Lawyer from '@/lib/models/lawyer';
import Review from '@/lib/models/review';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/errorHandler';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// POST - Lawyer responds to review
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
      return createErrorResponse('Only lawyers can respond to reviews', 403);
    }

    // Get review
    const review = await Review.findById(params.id);

    if (!review) {
      return createErrorResponse('Review not found', 404);
    }

    // Verify lawyer owns this review
    if (review.lawyerId.toString() !== lawyer._id.toString()) {
      return createErrorResponse('Forbidden', 403);
    }

    // Check if already responded
    if (review.lawyerResponse) {
      return createErrorResponse('Already responded to this review', 400);
    }

    const body = await req.json();
    const { response } = body;

    if (!response || response.trim().length === 0) {
      return createErrorResponse('Response cannot be empty', 400);
    }

    // Update review
    review.lawyerResponse = response;
    review.respondedAt = new Date();
    await review.save();

    await review.populate([
      { path: 'clientId', select: 'firstName lastName profileImage' },
      {
        path: 'lawyerId',
        populate: { path: 'userId', select: 'firstName lastName' }
      }
    ]);

    return createSuccessResponse(
      review,
      'Response added successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}