import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILawyer extends Document {
  userId: Types.ObjectId;
  clerkId: string;
  
  // Professional Details
  barRegistrationNumber: string;
  yearsOfExperience: number;
  specializations: string[];
  languagesSpoken: string[];
  
  // Education
  education: {
    degree: string;
    university: string;
    yearOfGraduation: number;
  }[];
  
  // Experience & Stats
  totalCasesSolved: number;
  successRate: number; // percentage
  about: string;
  
  // Pricing
  fees: {
    perHour: number;
    perHalfHour: number;
    currency: string;
  };
  
  // Availability
  availability: {
    day: string; // Monday, Tuesday, etc.
    slots: {
      startTime: string; // "09:00"
      endTime: string;   // "17:00"
    }[];
  }[];
  
  // Ratings & Reviews
  averageRating: number;
  totalReviews: number;
  
  // Status
  isActive: boolean;
  isVerified: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const LawyerSchema = new Schema<ILawyer>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  barRegistrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  yearsOfExperience: {
    type: Number,
    required: true,
    min: 0
  },
  specializations: [{
    type: String,
    required: true,
    trim: true
  }],
  languagesSpoken: [{
    type: String,
    required: true,
    trim: true
  }],
  education: [{
    degree: {
      type: String,
      required: true,
      trim: true
    },
    university: {
      type: String,
      required: true,
      trim: true
    },
    yearOfGraduation: {
      type: Number,
      required: true
    }
  }],
  totalCasesSolved: {
    type: Number,
    default: 0,
    min: 0
  },
  successRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  about: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  fees: {
    perHour: {
      type: Number,
      required: true,
      min: 0
    },
    perHalfHour: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP']
    }
  },
  availability: [{
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    slots: [{
      startTime: {
        type: String,
        required: true
      },
      endTime: {
        type: String,
        required: true
      }
    }]
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.models.Lawyer || mongoose.model<ILawyer>('Lawyer', LawyerSchema);
