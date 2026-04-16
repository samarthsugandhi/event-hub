import mongoose, { Document, Schema } from 'mongoose';

export type FunnelStep = 'discover' | 'view_detail' | 'register' | 'pay' | 'attend';

export interface IAnalyticsEvent extends Document {
  userId?: string; // Optional for anonymous tracking
  eventId?: mongoose.Types.ObjectId;
  step: FunnelStep;
  path?: string;
  metadata?: {
    category?: string;
    searchQuery?: string;
    deviceType?: string;
  };
  createdAt: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    userId: {
      type: String,
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      index: true,
    },
    step: {
      type: String,
      enum: ['discover', 'view_detail', 'register', 'pay', 'attend'],
      required: true,
      index: true,
    },
    path: String,
    metadata: {
      category: String,
      searchQuery: String,
      deviceType: String,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Compound index for efficient user funnel queries
AnalyticsEventSchema.index({ userId: 1, createdAt: -1 });
AnalyticsEventSchema.index({ eventId: 1, createdAt: -1 });

const AnalyticsEvent = mongoose.model<IAnalyticsEvent>('AnalyticsEvent', AnalyticsEventSchema);

export default AnalyticsEvent;
