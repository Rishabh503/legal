import connectDB from '@/lib/db';
import Lawyer from '@/lib/models/lawyer';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/errorHandler';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// GET lawyer availability
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const paramid=await params.id
    const lawyer = await Lawyer.findById(paramid).select('availability');

    if (!lawyer) {
      return createErrorResponse('Lawyer not found', 404);
    }

    return createSuccessResponse(lawyer.availability);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH - Update lawyer availability
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
    const paramid=await params.id
    const lawyer = await Lawyer.findById(paramid);

    if (!lawyer) {
      return createErrorResponse('Lawyer not found', 404);
    }

    // Check if user owns this profile
    if (lawyer.clerkId !== userId) {
      return createErrorResponse('Forbidden', 403);
    }

    const { availability } = await req.json();

    // Validate availability structure
    if (!Array.isArray(availability)) {
      return createErrorResponse('Invalid availability format', 400);
    }

    lawyer.availability = availability;
    await lawyer.save();

    return createSuccessResponse(
      lawyer.availability,
      'Availability updated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}