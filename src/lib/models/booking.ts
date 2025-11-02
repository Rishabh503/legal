// src/lib/models/Booking.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBooking extends Document {
  clientId: Types.ObjectId;
  lawyerId: Types.ObjectId;
  
  // Session Details
  sessionType: 'consultation' | 'follow-up' | 'legal-advice' | 'case-review';
  durationType: 'half-hour' | 'full-hour';
  
  // Scheduling
  preferredDate: Date;
  preferredTime: string; // "14:00"
  confirmedDateTime?: Date;
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  
  // Details
  issueDescription: string;
  clientNotes?: string;
  lawyerNotes?: string;
  
  // Payment
  amount: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentIntentId?: string; // For fake payment tracking
  
  // Meeting
  meetingLink?: string;
  
  // Timeline
  requestedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>({
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
  sessionType: {
    type: String,
    enum: ['consultation', 'follow-up', 'legal-advice', 'case-review'],
    required: true
  },
  durationType: {
    type: String,
    enum: ['half-hour', 'full-hour'],
    required: true
  },
  preferredDate: {
    type: Date,
    required: true
  },
  preferredTime: {
    type: String,
    required: true
  },
  confirmedDateTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  issueDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  clientNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  lawyerNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentIntentId: {
    type: String
  },
  meetingLink: {
    type: String
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date,
  rejectedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String
}, {
  timestamps: true
});

// Index for efficient queries
BookingSchema.index({ clientId: 1, status: 1 });
BookingSchema.index({ lawyerId: 1, status: 1 });
BookingSchema.index({ preferredDate: 1 });

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);