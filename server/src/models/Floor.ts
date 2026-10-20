import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFloor extends Document {
  property: Types.ObjectId; // Reference to Property
  floorNumber: number; // e.g., -1 for Basement, 0 for Ground Floor, 1 for 1st Floor
  name: string; // e.g. "Ground Floor", "First Floor", "Terrace"
  floorPlanImage?: string; // Base64 or URL
  floorPhotos: string[];
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercentage: number;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FloorSchema = new Schema<IFloor>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    floorNumber: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    floorPlanImage: { type: String, default: '' },
    floorPhotos: [{ type: String }],
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'in_progress',
    },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    notes: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness of floorNumber per property
FloorSchema.index({ property: 1, floorNumber: 1 }, { unique: true });

export const Floor = mongoose.model<IFloor>('Floor', FloorSchema);
