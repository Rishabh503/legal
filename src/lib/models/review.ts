import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  bookingId: Types.ObjectId;
  clientId: Types.ObjectId;
  lawyerId: Types.ObjectId;
  
  rating: number; // 1-5
  reviewText: string;
  
  // Response from lawyer
  lawyerResponse?: string;
  respondedAt?: Date;
  
  isVisible: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  lawyerId: {
    type: Schema.Types.ObjectId,
    ref: 'Lawyer',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  lawyerResponse: {
    type: String,
    trim: true,
    maxlength: 500
  },
  respondedAt: {
    type: Date
  },
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
ReviewSchema.index({ lawyerId: 1, isVisible: 1 });
ReviewSchema.index({ rating: -1 });

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);