import mongoose, { Document, Schema, Types } from 'mongoose';

export type ResidentRelationship =
  | 'owner'
  | 'spouse'
  | 'child'
  | 'parent'
  | 'relative'
  | 'tenant'
  | 'other';

export type ResidentStatus =
  | 'currently_living'
  | 'temporarily_away'
  | 'moved_out';

export interface IAssignmentHistory {
  room: Types.ObjectId;
  floor: Types.ObjectId;
  roomName?: string;
  floorName?: string;
  assignedDate: Date;
  vacatedDate?: Date;
  notes?: string;
}

export interface IResident extends Document {
  property: Types.ObjectId;
  name: string;
  profilePhoto?: string;
  relationship: ResidentRelationship;
  dob?: Date;
  age?: number;
  phone?: string;
  email?: string;
  currentFloor?: Types.ObjectId;
  currentRoom?: Types.ObjectId;
  moveInDate: Date;
  moveOutDate?: Date;
  status: ResidentStatus;
  notes?: string;
  assignmentHistory: IAssignmentHistory[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentHistorySchema = new Schema<IAssignmentHistory>(
  {
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    floor: { type: Schema.Types.ObjectId, ref: 'Floor', required: true },
    roomName: { type: String },
    floorName: { type: String },
    assignedDate: { type: Date, default: Date.now },
    vacatedDate: { type: Date },
    notes: { type: String, default: '' },
  },
  { _id: true }
);

const ResidentSchema = new Schema<IResident>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    name: { type: String, required: true, trim: true },
    profilePhoto: { type: String, default: '' },
    relationship: {
      type: String,
      enum: ['owner', 'spouse', 'child', 'parent', 'relative', 'tenant', 'other'],
      default: 'relative',
      required: true,
    },
    dob: { type: Date },
    age: { type: Number },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    currentFloor: { type: Schema.Types.ObjectId, ref: 'Floor' },
    currentRoom: { type: Schema.Types.ObjectId, ref: 'Room' },
    moveInDate: { type: Date, default: Date.now },
    moveOutDate: { type: Date },
    status: {
      type: String,
      enum: ['currently_living', 'temporarily_away', 'moved_out'],
      default: 'currently_living',
      index: true,
    },
    notes: { type: String, default: '' },
    assignmentHistory: [AssignmentHistorySchema],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Resident = mongoose.model<IResident>('Resident', ResidentSchema);
