import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOwner extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  profilePicture?: string;
  notes?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  createdBy: Types.ObjectId; // Scoped to user account
  createdAt: Date;
  updatedAt: Date;
}

const OwnerSchema = new Schema<IOwner>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    notes: { type: String, default: '' },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relationship: { type: String, default: '' },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

OwnerSchema.index({ name: 'text', email: 'text', phone: 'text', address: 'text' });
OwnerSchema.index({ createdBy: 1 });

export const Owner = mongoose.model<IOwner>('Owner', OwnerSchema);
