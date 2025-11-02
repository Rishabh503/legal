import connectDB from '@/lib/db';
import Client from '@/lib/models/client';
import Lawyer from '@/lib/models/lawyer';
import User from '@/lib/models/user';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/errorHandler';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("Onboarding - Clerk User ID:", userId);
    
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();

    const body = await req.json();
    const { role, ...profileData } = body;

    console.log("Processing onboarding for role:", role);

    // Find user OR CREATE if doesn't exist (webhook may not have fired yet)
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      console.log("User not found in DB, creating from Clerk data...");
      
      try {
        // Get user info from Clerk
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);
        
        user = await User.create({
          clerkId: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          profileImage: clerkUser.imageUrl,
          onboardingCompleted: false,
          role: 'client'
        });
        
        console.log("✅ User created in DB:", user._id);
      } catch (clerkError) {
        console.error("Failed to get user from Clerk:", clerkError);
        return createErrorResponse('Failed to fetch user data', 500);
      }
    }

    if (user.onboardingCompleted) {
      return createErrorResponse('Onboarding already completed', 400);
    }

    // Update user role and phone
    user.role = role;
    if (profileData.phone) {
      user.phone = profileData.phone;
    }
    user.onboardingCompleted = true;
    await user.save();

    console.log("✅ User updated in database");

    // Create role-specific profile
    if (role === 'lawyer') {
      const lawyerData = {
        userId: user._id,
        clerkId: userId,
        barRegistrationNumber: profileData.barRegistrationNumber,
        yearsOfExperience: profileData.yearsOfExperience,
        specializations: profileData.specializations,
        languagesSpoken: profileData.languagesSpoken,
        education: profileData.education,
        totalCasesSolved: profileData.totalCasesSolved || 0,
        successRate: profileData.successRate || 0,
        about: profileData.about,
        fees: {
          perHour: profileData.perHour,
          perHalfHour: profileData.perHalfHour,
          currency: profileData.currency || 'INR'
        },
        availability: profileData.availability || [],
        isActive: true,
        isVerified: false
      };

      await Lawyer.create(lawyerData);
      console.log("✅ Lawyer profile created");
    } else if (role === 'client') {
      const clientData = {
        userId: user._id,
        clerkId: userId,
        dateOfBirth: profileData.dateOfBirth,
        address: profileData.address,
        preferredLanguages: profileData.preferredLanguages || [],
        legalIssueType: profileData.legalIssueType
      };

      await Client.create(clientData);
      console.log("✅ Client profile created");
    }

    // **UPDATE CLERK METADATA**
    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          onboardingCompleted: true,
          role: role
        }
      });
      console.log("✅ Clerk metadata updated successfully");
    } catch (clerkError) {
      console.error("Failed to update Clerk metadata:", clerkError);
      // Don't fail the request - user can still sign in again
    }

    return createSuccessResponse(
      { user, role },
      'Onboarding completed successfully',
      201
    );
  } catch (error) {
    console.error("Onboarding error:", error);
    return handleApiError(error);
  }
}

// Check if user has completed onboarding
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
      onboardingCompleted: user.onboardingCompleted,
      role: user.role
    });
  } catch (error) {
    return handleApiError(error);
  }
}