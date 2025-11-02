import connectDB from '@/lib/db';
import Client from '@/lib/models/client';
import User from '@/lib/models/user';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/errorHandler';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// GET current client profile
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();

    const client = await Client.findOne({ clerkId: userId })
      .populate('userId', 'firstName lastName email phone profileImage')
      .lean();

    if (!client) {
      return createErrorResponse('Client profile not found', 404);
    }

    return createSuccessResponse(client);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Create client profile (called during onboarding)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();

    const body = await req.json();

    // Check if client profile already exists
    const existingClient = await Client.findOne({ clerkId: userId });
    
    if (existingClient) {
      return createErrorResponse('Client profile already exists', 400);
    }

    // Get user
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    if (user.role !== 'client') {
      return createErrorResponse('User is not a client', 403);
    }

    // Create client profile
    const client = await Client.create({
      userId: user._id,
      clerkId: userId,
      ...body
    });

    return createSuccessResponse(client, 'Client profile created', 201);
  } catch (error) {
    return handleApiError(error);
  }
}