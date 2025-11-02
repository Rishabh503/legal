import connectDB from '@/lib/db';
import { User, Lawyer } from '@/lib/models';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/errorHandler';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// GET single lawyer by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const p=await params
    console.log(p)
    const lawyer = await Lawyer.findById(p.id)
      .populate('userId', 'firstName lastName email profileImage phone')
      .lean();

      console.log(lawyer)

    if (!lawyer) {
      return createErrorResponse('Lawyer not found', 404);
    }

    return createSuccessResponse(lawyer);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH - Update lawyer profile
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
 const p=await params
    const lawyer = await Lawyer.findById(p.id);

    if (!lawyer) {
      return createErrorResponse('Lawyer not found', 404);
    }

    // Check if user owns this profile
    if (lawyer.clerkId !== userId) {
      return createErrorResponse('Forbidden', 403);
    }

    const body = await req.json();

    // Update lawyer profile
    const updatedLawyer = await Lawyer.findByIdAndUpdate(
      p.id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email profileImage');

    return createSuccessResponse(updatedLawyer, 'Profile updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Deactivate lawyer profile
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();
    const p=await params
    const lawyer = await Lawyer.findById(pid);

    if (!lawyer) {
      return createErrorResponse('Lawyer not found', 404);
    }

    // Check if user owns this profile
    if (lawyer.clerkId !== userId) {
      return createErrorResponse('Forbidden', 403);
    }

    // Deactivate instead of delete
    lawyer.isActive = false;
    await lawyer.save();

    return createSuccessResponse(null, 'Profile deactivated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}