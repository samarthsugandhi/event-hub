import mongoose, { Document, Schema } from 'mongoose';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet';

export interface IPayment extends Document {
  paymentId: string;
  registrationId: string;
  eventId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  payerName: string;
  payerEmail: string;
  method?: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  metadata?: Record<string, any>;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    registrationId: {
      type: String,
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    payerName: {
      type: String,
      required: true,
      trim: true,
    },
    payerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    method: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

PaymentSchema.index({ registrationId: 1 });
PaymentSchema.index({ eventId: 1 });
PaymentSchema.index({ payerEmail: 1 });

export default mongoose.model<IPayment>('Payment', PaymentSchema);
