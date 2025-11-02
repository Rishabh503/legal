import connectDB from '@/lib/db';
import User from '@/lib/models/user';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/errorHandler';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// Interface for the allowed fields in the update operation
interface UserUpdates {
    firstName?: string;
    lastName?: string;
    phone?: string;
    profileImage?: string;
}

// GET user by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await User.findById(params.id).select('-clerkId').lean();
    
    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    return createSuccessResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH - Update user profile
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();

    // Get user
    const user = await User.findById(params.id);

    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    // Check if user owns this profile
    if (user.clerkId !== userId) {
      return createErrorResponse('Forbidden', 403);
    }

    const body = await req.json();

    // Only allow certain fields to be updated
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'profileImage'];
    // FIX: Replaced 'any' with the specific 'UserUpdates' interface
    const updates: UserUpdates = {}; 

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        // TypeScript infers the type check from the UserUpdates interface and the string keys
        updates[key as keyof UserUpdates] = body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-clerkId');

    return createSuccessResponse(updatedUser, 'Profile updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}