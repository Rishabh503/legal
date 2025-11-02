// src/types/models.ts
import { Types } from 'mongoose';

// --- BASE USER TYPE ---
export type UserRole = 'client' | 'lawyer';

export interface IUserModel {
  _id: Types.ObjectId; // MongoDB ID
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  profileImage?: string;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// --- LAWYER TYPE (Populated) ---
export interface ILawyerModel {
  _id: Types.ObjectId; // MongoDB ID
  userId: Types.ObjectId | IUserModel; // Can be ID or the populated User object
  clerkId: string;
  barRegistrationNumber: string;
  yearsOfExperience: number;
  specializations: string[];
  languagesSpoken: string[];
  education: {
    degree: string;
    university: string;
    yearOfGraduation: number;
  }[];
  fees: {
    perHour: number;
    perHalfHour: number;
    currency: string;
  };
  availability: {
    day: string;
    slots: { startTime: string; endTime: string }[];
  }[];
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  isVerified: boolean;
  totalCasesSolved: number;
  successRate: number;
  about: string;
  createdAt: Date;
  updatedAt: Date;
}

// --- CLIENT TYPE (Populated) ---
export interface IClientModel {
  _id: Types.ObjectId; // MongoDB ID
  userId: Types.ObjectId | IUserModel;
  clerkId: string;
  dateOfBirth?: Date;
  address?: {
    street: string; 
    city: string; 
    state: string; 
    zipCode: string; 
    country: string;
  };
  preferredLanguages: string[];
  legalIssueType?: string;
  createdAt: Date;
  updatedAt: Date;
}

// --- BOOKING TYPE (Populated) ---
export interface IBookingModel {
  _id: Types.ObjectId;
  clientId: Types.ObjectId | IUserModel; // Populated Client user
  lawyerId: Types.ObjectId | ILawyerModel; // Populated Lawyer profile
  sessionType: 'consultation' | 'follow-up' | 'legal-advice' | 'case-review';
  durationType: 'half-hour' | 'full-hour';
  preferredDate: Date;
  preferredTime: string;
  confirmedDateTime?: Date; // Added
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  issueDescription: string;
  amount: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  meetingLink?: string;
  lawyerNotes?: string; // Added
  clientNotes?: string; // Added
  sessionNotes?: string; // Added
  cancellationReason?: string; // Added
  createdAt: Date;
  updatedAt: Date;
}

// --- REVIEW TYPE (Populated) ---
export interface IReviewModel {
  _id: Types.ObjectId;
  bookingId: Types.ObjectId;
  clientId: Types.ObjectId | IUserModel;
  lawyerId: Types.ObjectId | ILawyerModel;
  rating: number;
  reviewText: string;
  lawyerResponse?: string;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// --- POPULATED BOOKING TYPES FOR FRONTEND ---
// These types represent bookings with populated references

export interface IPopulatedBookingForClient extends Omit<IBookingModel, 'lawyerId' | 'clientId'> {
  clientId: IUserModel;
  lawyerId: ILawyerModel & { userId: IUserModel }; // Lawyer with populated userId
}

export interface IPopulatedBookingForLawyer extends Omit<IBookingModel, 'lawyerId' | 'clientId'> {
  clientId: IUserModel; // Client user directly populated
  lawyerId: ILawyerModel;
}

// --- PROFILE RESPONSE TYPE ---
export interface ILawyerProfile extends ILawyerModel {
  userId: IUserModel; // Always populated in profile responses
}