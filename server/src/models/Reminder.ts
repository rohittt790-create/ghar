import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReminder extends Document {
  title: string;
  description?: string;
  property?: Types.ObjectId;
  task?: Types.ObjectId;
  reminderDate: string; // YYYY-MM-DD
  reminderTime: string; // HH:mm
  type: 'deadline' | 'inspection' | 'task_due' | 'payment' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'dismissed';
  channels: ('browser' | 'in_app' | 'email' | 'whatsapp')[];
  sentAt?: Date;
  notificationKey?: string; // To prevent duplicates
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    property: { type: Schema.Types.ObjectId, ref: 'Property' },
    task: { type: Schema.Types.ObjectId, ref: 'Task' },
    reminderDate: { type: String, required: true }, // Format YYYY-MM-DD
    reminderTime: { type: String, default: '09:00' }, // Format HH:mm
    type: {
      type: String,
      enum: ['deadline', 'inspection', 'task_due', 'payment', 'general'],
      default: 'deadline',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'dismissed'],
      default: 'pending',
    },
    channels: [
      {
        type: String,
        enum: ['browser', 'in_app', 'email', 'whatsapp'],
        default: ['browser', 'in_app'],
      },
    ],
    sentAt: { type: Date },
    notificationKey: { type: String, index: true },
  },
  { timestamps: true }
);

ReminderSchema.index({ reminderDate: 1, status: 1 });
ReminderSchema.index({ property: 1 });

export const Reminder = mongoose.model<IReminder>('Reminder', ReminderSchema);
