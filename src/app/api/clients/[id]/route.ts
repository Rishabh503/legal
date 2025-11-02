import connectDB from '@/lib/db';
import User from '@/lib/models/user';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/errorHandler';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// GET - Check user role and onboarding status
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    return createSuccessResponse({
      role: user.role,
      onboardingCompleted: user.onboardingCompleted,
      userId: user._id
    });
  } catch (error) {
    return handleApiError(error);
  }
}