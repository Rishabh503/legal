import connectDB from '@/lib/db';
import Lawyer from '@/lib/models/lawyer';
import Review from '@/lib/models/review';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/errorHandler';
import { NextRequest } from 'next/server';

// GET all reviews for a specific lawyer
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Check if lawyer exists
        const p=await params
    const lawyer = await Lawyer.findById(p.id);

    if (!lawyer) {
      return createErrorResponse('Lawyer not found', 404);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get reviews for this lawyer
    const reviews = await Review.find({ 
      lawyerId: p.id,
      isVisible: true 
    })
      .populate('clientId', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments({ 
      lawyerId: p.id,
      isVisible: true 
    });

    // Calculate rating distribution
    const allReviews = await Review.find({ 
      lawyerId: p.id,
      isVisible: true 
    }).select('rating');

    const ratingDistribution = {
      5: allReviews.filter(r => r.rating === 5).length,
      4: allReviews.filter(r => r.rating === 4).length,
      3: allReviews.filter(r => r.rating === 3).length,
      2: allReviews.filter(r => r.rating === 2).length,
      1: allReviews.filter(r => r.rating === 1).length,
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