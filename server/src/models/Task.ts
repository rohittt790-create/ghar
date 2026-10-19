import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProgressPhoto {
  url: string;
  caption?: string;
  stage: 'before' | 'during' | 'after';
  uploadedAt: Date;
}

export interface ITaskHistory {
  action: string;
  changedBy: string;
  timestamp: Date;
  previousStatus?: string;
  newStatus?: string;
  notes?: string;
}

export interface ITask extends Document {
  property: Types.ObjectId; // Reference to Property
  taskName: string;
  description: string;
  category:
    | 'Foundation'
    | 'Framing'
    | 'Roofing'
    | 'Plumbing'
    | 'Electrical'
    | 'HVAC'
    | 'Drywall'
    | 'Painting'
    | 'Flooring'
    | 'Masonry'
    | 'Carpentry'
    | 'Landscaping'
    | 'Inspection'
    | 'Exterior'
    | 'Interior Finish'
    | 'Other';
  assignedWorker: string;
  workerPhone?: string;
  startDate: Date;
  dueDate: Date;
  completedDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCost: number;
  actualCost: number;
  notes: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  progressPhotos: IProgressPhoto[];
  history: ITaskHistory[];
  isOverdue?: boolean;
  createdBy: Types.ObjectId; // Scoped to user account
  createdAt: Date;
  updatedAt: Date;
}

const ProgressPhotoSchema = new Schema<IProgressPhoto>(
  {
    url: { type: String, required: true },
    caption: { type: String, default: '' },
    stage: {
      type: String,
      enum: ['before', 'during', 'after'],
      default: 'during',
    },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const TaskHistorySchema = new Schema<ITaskHistory>(
  {
    action: { type: String, required: true },
    changedBy: { type: String, default: 'Admin' },
    timestamp: { type: Date, default: Date.now },
    previousStatus: { type: String },
    newStatus: { type: String },
    notes: { type: String },
  },
  { _id: true }
);

const TaskSchema = new Schema<ITask>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    taskName: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: [
        'Foundation',
        'Framing',
        'Roofing',
        'Plumbing',
        'Electrical',
        'HVAC',
        'Drywall',
        'Painting',
        'Flooring',
        'Masonry',
        'Carpentry',
        'Landscaping',
        'Inspection',
        'Exterior',
        'Interior Finish',
        'Other',
      ],
      default: 'Other',
    },
    assignedWorker: { type: String, required: true, trim: true },
    workerPhone: { type: String, default: '' },
    startDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    completedDate: { type: Date },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    estimatedCost: { type: Number, default: 0 },
    actualCost: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'on_hold'],
      default: 'not_started',
    },
    progressPhotos: [ProgressPhotoSchema],
    history: [TaskHistorySchema],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for isOverdue
TaskSchema.virtual('isOverdue').get(function () {
  if (this.status === 'completed') return false;
  const now = new Date();
  return new Date(this.dueDate) < now;
});

TaskSchema.index({ property: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ category: 1 });
TaskSchema.index({ taskName: 'text', description: 'text', assignedWorker: 'text' });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
