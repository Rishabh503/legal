import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  from: string;
  to: string;
  content: string;
  timestamp: Date;
}

const ChatSchema: Schema = new Schema({
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'legal-ai-chat'
});

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);