import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProperty extends Document {
  propertyId: string; // e.g. "PROP-1001"
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  owner: Types.ObjectId; // Reference to Owner
  startDate: Date;
  expectedCompletionDate: Date;
  actualCompletionDate?: Date;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  propertyPhotos: string[];
  coverPhoto?: string;
  estimatedBudget: number;
  actualExpenses: number;
  squareFeet?: number;
  propertyType: 'residential' | 'commercial' | 'renovation' | 'villa' | 'duplex' | 'other';
  notes?: string;
  progressPercentage: number;
  createdBy: Types.ObjectId; // Scoped to user account
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    propertyId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    owner: { type: Schema.Types.ObjectId, ref: 'Owner', required: true },
    startDate: { type: Date, required: true },
    expectedCompletionDate: { type: Date, required: true },
    actualCompletionDate: { type: Date },
    status: {
      type: String,
      enum: ['planning', 'in_progress', 'completed', 'on_hold'],
      default: 'in_progress',
    },
    propertyPhotos: [{ type: String }],
    coverPhoto: { type: String, default: '' },
    estimatedBudget: { type: Number, default: 0 },
    actualExpenses: { type: Number, default: 0 },
    squareFeet: { type: Number, default: 0 },
    propertyType: {
      type: String,
      enum: ['residential', 'commercial', 'renovation', 'villa', 'duplex', 'other'],
      default: 'residential',
    },
    notes: { type: String, default: '' },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

PropertySchema.index({ propertyId: 1, createdBy: 1 }, { unique: true });
PropertySchema.index({ name: 'text', address: 'text', city: 'text' });
PropertySchema.index({ owner: 1 });
PropertySchema.index({ createdBy: 1 });

export const Property = mongoose.model<IProperty>('Property', PropertySchema);
