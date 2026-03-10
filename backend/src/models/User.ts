import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  department?: string;
  year?: string;
  usn?: string;
  role: 'admin' | 'organizer' | 'student' | 'faculty' | 'visitor';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    year: {
      type: String,
      trim: true,
    },
    usn: {
      type: String,
      trim: true,
      uppercase: true,
    },
    role: {
      type: String,
      enum: ['admin', 'organizer', 'student', 'faculty', 'visitor'],
      default: 'student',
    },
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', async function (next) {
  // Normalize year: '1' -> '1st', '2' -> '2nd', etc.
  if (this.isModified('year') && this.year) {
    const yearMap: Record<string, string> = { '1': '1st', '2': '2nd', '3': '3rd', '4': '4th' };
    if (yearMap[this.year]) {
      this.year = yearMap[this.year];
    }
  }

  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
