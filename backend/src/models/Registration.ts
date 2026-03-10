import mongoose, { Document, Schema } from 'mongoose';

export type AttendanceStatus = 'registered' | 'present' | 'absent';
export type PaymentStatus = 'not_required' | 'pending' | 'completed' | 'failed';

export interface ITeamMember {
  name: string;
  email: string;
  usn: string;
}

export interface IRegistration extends Document {
  registrationId: string;
  eventId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  department: string;
  year: string;
  usn: string;
  teamName?: string;
  teamMembers?: ITeamMember[];
  qrCode: string;
  attendanceStatus: AttendanceStatus;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  checkedInAt?: Date;
  registeredAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    registrationId: {
      type: String,
      required: true,
      unique: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    year: {
      type: String,
      required: [true, 'Year is required'],
    },
    usn: {
      type: String,
      required: [true, 'USN is required'],
      trim: true,
      uppercase: true,
    },
    teamName: {
      type: String,
      trim: true,
    },
    teamMembers: [
      {
        name: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true },
        usn: { type: String, trim: true, uppercase: true },
      },
    ],
    qrCode: {
      type: String,
      required: true,
    },
    attendanceStatus: {
      type: String,
      enum: ['registered', 'present', 'absent'],
      default: 'registered',
    },
    paymentStatus: {
      type: String,
      enum: ['not_required', 'pending', 'completed', 'failed'],
      default: 'not_required',
    },
    paymentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    checkedInAt: {
      type: Date,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

RegistrationSchema.index({ eventId: 1, email: 1 }, { unique: true });
RegistrationSchema.index({ eventId: 1, attendanceStatus: 1 });

export default mongoose.model<IRegistration>('Registration', RegistrationSchema);
