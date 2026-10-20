import mongoose, { Document, Schema, Types } from 'mongoose';

export type RoomType =
  | 'bedroom'
  | 'master_bedroom'
  | 'living_room'
  | 'hall'
  | 'kitchen'
  | 'bathroom'
  | 'dining_room'
  | 'study_room'
  | 'store_room'
  | 'utility_room'
  | 'balcony'
  | 'pooja_room'
  | 'other';

export type RoomConstructionStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'needs_repair';

export type RoomInteriorStatus = 'not_started' | 'in_progress' | 'completed';

export type ChecklistItemStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'not_applicable';

export interface IRoomDefect {
  _id?: Types.ObjectId;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedDate: Date;
  resolved: boolean;
  resolvedDate?: Date;
  notes?: string;
}

export interface IRoom extends Document {
  property: Types.ObjectId;
  floor: Types.ObjectId;
  roomId: string; // e.g., "RM-G01"
  name: string;
  roomType: RoomType;
  dimensions: {
    length: number; // in feet
    width: number; // in feet
    height: number; // in feet
  };
  areaSqFt: number; // calculated: length * width
  photos: string[];
  floorPlanLocation?: string;
  constructionStatus: RoomConstructionStatus;
  interiorStatus: RoomInteriorStatus;
  checklist: {
    electrical: ChecklistItemStatus;
    plumbing: ChecklistItemStatus;
    flooring: ChecklistItemStatus;
    painting: ChecklistItemStatus;
    doors: ChecklistItemStatus;
    windows: ChecklistItemStatus;
  };
  occupancyStatus: 'occupied' | 'vacant' | 'under_maintenance';
  defects: IRoomDefect[];
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DefectSchema = new Schema<IRoomDefect>(
  {
    description: { type: String, required: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    reportedDate: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
    resolvedDate: { type: Date },
    notes: { type: String, default: '' },
  },
  { _id: true }
);

const RoomSchema = new Schema<IRoom>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    floor: { type: Schema.Types.ObjectId, ref: 'Floor', required: true, index: true },
    roomId: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    roomType: {
      type: String,
      enum: [
        'bedroom',
        'master_bedroom',
        'living_room',
        'hall',
        'kitchen',
        'bathroom',
        'dining_room',
        'study_room',
        'store_room',
        'utility_room',
        'balcony',
        'pooja_room',
        'other',
      ],
      required: true,
      default: 'bedroom',
    },
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 10 },
    },
    areaSqFt: { type: Number, default: 0 },
    photos: [{ type: String }],
    floorPlanLocation: { type: String, default: '' },
    constructionStatus: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'needs_repair'],
      default: 'in_progress',
    },
    interiorStatus: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    checklist: {
      electrical: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'not_applicable'],
        default: 'not_started',
      },
      plumbing: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'not_applicable'],
        default: 'not_started',
      },
      flooring: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'not_applicable'],
        default: 'not_started',
      },
      painting: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'not_applicable'],
        default: 'not_started',
      },
      doors: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'not_applicable'],
        default: 'not_started',
      },
      windows: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'not_applicable'],
        default: 'not_started',
      },
    },
    occupancyStatus: {
      type: String,
      enum: ['occupied', 'vacant', 'under_maintenance'],
      default: 'vacant',
    },
    defects: [DefectSchema],
    notes: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Pre-save hook to calculate areaSqFt
RoomSchema.pre('save', function (next) {
  if (this.dimensions && this.dimensions.length && this.dimensions.width) {
    this.areaSqFt = Math.round(this.dimensions.length * this.dimensions.width * 100) / 100;
  }
  next();
});

export const Room = mongoose.model<IRoom>('Room', RoomSchema);
