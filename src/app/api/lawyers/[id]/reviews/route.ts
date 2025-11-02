import connectDB from '@/lib/db';
import Lawyer from '@/lib/models/lawyer';
import Review from '@/lib/models/review';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/errorHandler';
import { NextRequest } from 'next/server';

// GET all reviews for a specific lawyer
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ params is a Promise now
) {
  try {
    await connectDB();

    const { id: lawyerId } = await params; // ✅ correctly awaited
    if (!lawyerId) {
      return createErrorResponse('Missing lawyer id', 400);
    }

    // Check if lawyer exists
    const lawyer = await Lawyer.findById(lawyerId);
    if (!lawyer) {
      return createErrorResponse('Lawyer not found', 404);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Get visible reviews for this lawyer
    const reviews = await Review.find({
      lawyerId,
      isVisible: true
    })
      .populate('clientId', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments({
      lawyerId,
      isVisible: true
    });

    // Calculate rating distribution
    const allReviews = await Review.find({
      lawyerId,
      isVisible: true
    }).select('rating');

    const ratingDistribution = {
      5: allReviews.filter(r => r.rating === 5).length,
      4: allReviews.filter(r => r.rating === 4).length,
      3: allReviews.filter(r => r.rating === 3).length,
      2: allReviews.filter(r => r.rating === 2).length,
      1: allReviews.filter(r => r.rating === 1).length
    };

    return createSuccessResponse({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        averageRating: lawyer.averageRating,
        totalReviews: lawyer.totalReviews,
        ratingDistribution
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
