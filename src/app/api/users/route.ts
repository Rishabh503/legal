import connectDB from '@/lib/db';
import Client from '@/lib/models/client';
import Lawyer from '@/lib/models/lawyer';
import User from '@/lib/models/user';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/errorHandler';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// GET current user with their profile (lawyer or client)
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();

    // Get user
    const user = await User.findOne({ clerkId: userId }).lean();
    
    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    let profile = null;

    // Get role-specific profile
    if (user.role === 'lawyer') {
      profile = await Lawyer.findOne({ clerkId: userId }).lean();
    } else if (user.role === 'client') {
      profile = await Client.findOne({ clerkId: userId }).lean();
    }

    return createSuccessResponse({
      user,
      profile
    });
  } catch (error) {
    return handleApiError(error);
  }
}