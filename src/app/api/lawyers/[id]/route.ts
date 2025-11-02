import connectDB from '@/lib/db';
import { User, Lawyer } from '@/lib/models';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/errorHandler';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// GET single lawyer by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ params is Promise
) {
  try {
    await connectDB();

    const { id: lawyerId } = await params; // ✅ must await in Next.js 15

    const lawyer = await Lawyer.findById(lawyerId)
      .populate('userId', 'firstName lastName email profileImage phone')
      .lean();

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
  { params }: { params: Promise<{ id: string }> } // ✅ fix here
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();

    const { id: lawyerId } = await params; // ✅ await params
    const lawyer = await Lawyer.findById(lawyerId);

    if (!lawyer) {
      return createErrorResponse('Lawyer not found', 404);
    }

    if (lawyer.clerkId !== userId) {
      return createErrorResponse('Forbidden', 403);
    }

    const body = await req.json();

    const updatedLawyer = await Lawyer.findByIdAndUpdate(
      lawyerId,
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
  { params }: { params: Promise<{ id: string }> } // ✅ fix here
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();

    const { id: lawyerId } = await params; // ✅ await params
    const lawyer = await Lawyer.findById(lawyerId);

    if (!lawyer) {
      return createErrorResponse('Lawyer not found', 404);
    }

    if (lawyer.clerkId !== userId) {
      return createErrorResponse('Forbidden', 403);
    }

    lawyer.isActive = false;
    await lawyer.save();

    return createSuccessResponse(null, 'Profile deactivated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
