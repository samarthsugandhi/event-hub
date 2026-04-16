import mongoose, { Document, Schema } from 'mongoose';

export interface ICertificate extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  certificateNumber: string;
  issuedAt: Date;
  expiresAt?: Date;
  signedUrl?: string;
  downloadCount?: number;
  lastDownloadedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    issuedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: undefined,
    },
    signedUrl: {
      type: String,
      default: undefined,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastDownloadedAt: {
      type: Date,
      default: undefined,
    },
  },
  { timestamps: true }
);

// Prevent duplicate certificates for same user+event
CertificateSchema.index({ userId: 1, eventId: 1 }, { unique: true });

const Certificate = mongoose.model<ICertificate>('Certificate', CertificateSchema);

export default Certificate;
