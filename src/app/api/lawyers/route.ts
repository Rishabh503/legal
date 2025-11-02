import connectDB from '@/lib/db';
import Lawyer from '@/lib/models/lawyer';
import User from '@/lib/models/user';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/errorHandler';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { IUserModel, ILawyerModel } from '@/types/models'; // Assuming you create this file

// 1. Interface for the Mongoose query object
interface LawyerQuery {
  isActive?: boolean;
  specializations?: { $in: string[] };
  languagesSpoken?: { $in: string[] };
  averageRating?: { $gte: number };
  'fees.perHour'?: { $lte: number };
}

// 2. Interface for the Populated Lawyer result
// We define the expected shape after population: lawyer.userId should be the User model
interface PopulatedLawyer extends Omit<ILawyerModel, 'userId'> {
    userId: IUserModel;
}

// GET all lawyers with filters
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const specialization = searchParams.get('specialization');
    const language = searchParams.get('language');
    const minRating = searchParams.get('minRating');
    const maxFee = searchParams.get('maxFee');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Build query
    // FIX 1: Replaced 'any' with the specific 'LawyerQuery' interface
    const query: LawyerQuery = { isActive: true };

    if (specialization) {
      query.specializations = { $in: [specialization] };
    }

    if (language) {
      query.languagesSpoken = { $in: [language] };
    }

    if (minRating) {
      query.averageRating = { $gte: parseFloat(minRating) };
    }

    if (maxFee) {
      query['fees.perHour'] = { $lte: parseFloat(maxFee) };
    }

    // Get lawyers with populated user data
    // FIX 2: Specified the expected return type for the lawyers array
    const lawyers = await Lawyer.find(query)
      .populate('userId', 'firstName lastName email profileImage')
      .sort({ averageRating: -1, totalReviews: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean() as PopulatedLawyer[]; // Cast the result to the populated type

    // Search by name if search param exists
    let filteredLawyers: PopulatedLawyer[] = lawyers;
    if (search) {
      // FIX 2: Replaced 'lawyer: any' with the correct PopulatedLawyer type
      filteredLawyers = lawyers.filter((lawyer: PopulatedLawyer) => {
        // Accessing userId fields is now type-safe
        const fullName = `${lawyer.userId.firstName} ${lawyer.userId.lastName}`.toLowerCase();
        return fullName.includes(search.toLowerCase());
      });
    }

    const total = await Lawyer.countDocuments(query);

    return createSuccessResponse({
      lawyers: filteredLawyers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Create lawyer profile (called during onboarding)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();

    const body = await req.json();

    // Check if lawyer profile already exists
    const existingLawyer = await Lawyer.findOne({ clerkId: userId });
    
    if (existingLawyer) {
      return createErrorResponse('Lawyer profile already exists', 400);
    }

    // Get user
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    if (user.role !== 'lawyer') {
      return createErrorResponse('User is not a lawyer', 403);
    }

    // Create lawyer profile
    const lawyer = await Lawyer.create({
      userId: user._id,
      clerkId: userId,
      ...body
    });

    return createSuccessResponse(lawyer, 'Lawyer profile created', 201);
  } catch (error) {
    return handleApiError(error);
  }
}