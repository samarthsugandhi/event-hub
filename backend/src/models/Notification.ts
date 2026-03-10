import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'event_published' | 'registration_open' | 'registration_closing' | 'event_starting' | 'event_update' | 'general';
  eventId?: mongoose.Types.ObjectId;
  targetRole?: string;
  targetDepartment?: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'event_published',
        'registration_open',
        'registration_closing',
        'event_starting',
        'event_update',
        'general',
      ],
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },
    targetRole: {
      type: String,
    },
    targetDepartment: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
