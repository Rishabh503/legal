import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IClient extends Document {
  userId: Types.ObjectId;
  clerkId: string;
  
  // Personal Details
  dateOfBirth?: Date;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Preferences
  preferredLanguages: string[];
  legalIssueType?: string; // Criminal, Civil, Corporate, etc.
  
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>({
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
  dateOfBirth: {
    type: Date
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  preferredLanguages: [{
    type: String,
    trim: true
  }],
  legalIssueType: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);
