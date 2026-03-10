import mongoose, { Document, Schema } from 'mongoose';

export type EventCategory =
  | 'technical'
  | 'workshop'
  | 'cultural'
  | 'sports'
  | 'seminar'
  | 'hackathon'
  | 'webinar'
  | 'conference'
  | 'other';

export type EventStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export type RegistrationType = 'internal' | 'external';
export type PricingType = 'free' | 'paid';
export type PriceType = 'per_person' | 'per_team';
export type ParticipationType = 'individual' | 'team';

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  category: EventCategory;
  poster?: string;
  date: Date;
  endDate?: Date;
  time: string;
  endTime?: string;
  venue: string;
  locationCoordinates?: {
    lat: number;
    lng: number;
  };
  organizerName: string;
  organizerDepartment: string;
  organizerEmail: string;
  registrationType: RegistrationType;
  externalLink?: string;
  maxParticipants: number;
  registrationDeadline: Date;
  registrationCount: number;
  attendanceCount: number;
  views: number;
  pricingType: PricingType;
  price: number;
  priceType: PriceType;
  participationType: ParticipationType;
  minTeamSize: number;
  maxTeamSize: number;
  createdBy: mongoose.Types.ObjectId;
  status: EventStatus;
  registrationOpen: boolean;
  featured: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Helper: generate URL-safe slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      maxlength: 5000,
    },
    category: {
      type: String,
      required: [true, 'Event category is required'],
      enum: [
        'technical',
        'workshop',
        'cultural',
        'sports',
        'seminar',
        'hackathon',
        'webinar',
        'conference',
        'other',
      ],
    },
    poster: {
      type: String,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    endDate: {
      type: Date,
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
    },
    endTime: {
      type: String,
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      trim: true,
    },
    locationCoordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    organizerName: {
      type: String,
      required: [true, 'Organizer name is required'],
      trim: true,
    },
    organizerDepartment: {
      type: String,
      required: [true, 'Organizer department is required'],
      trim: true,
    },
    organizerEmail: {
      type: String,
      required: [true, 'Organizer email is required'],
      trim: true,
      lowercase: true,
    },
    registrationType: {
      type: String,
      required: true,
      enum: ['internal', 'external'],
      default: 'internal',
    },
    externalLink: {
      type: String,
      trim: true,
    },
    maxParticipants: {
      type: Number,
      required: [true, 'Maximum participants is required'],
      min: 1,
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Registration deadline is required'],
    },
    registrationCount: {
      type: Number,
      default: 0,
    },
    attendanceCount: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    pricingType: {
      type: String,
      enum: ['free', 'paid'],
      default: 'free',
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    priceType: {
      type: String,
      enum: ['per_person', 'per_team'],
      default: 'per_person',
    },
    participationType: {
      type: String,
      enum: ['individual', 'team'],
      default: 'individual',
    },
    minTeamSize: {
      type: Number,
      default: 1,
      min: 1,
    },
    maxTeamSize: {
      type: Number,
      default: 1,
      min: 1,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: [
        'draft',
        'pending',
        'approved',
        'published',
        'rejected',
        'cancelled',
        'completed',
      ],
      default: 'pending',
    },
    registrationOpen: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

EventSchema.virtual('remainingSeats').get(function () {
  return Math.max(0, this.maxParticipants - this.registrationCount);
});

EventSchema.virtual('isLive').get(function () {
  const now = new Date();
  const eventDate = new Date(this.date);
  const eventEnd = this.endDate ? new Date(this.endDate) : new Date(eventDate.getTime() + 4 * 60 * 60 * 1000);
  return now >= eventDate && now <= eventEnd && this.status === 'published';
});

EventSchema.virtual('isTrending').get(function () {
  const fillRate = this.registrationCount / this.maxParticipants;
  const viewScore = this.views >= 50 ? 0.1 : 0; // bonus for high views
  return (fillRate + viewScore) >= 0.7;
});

// Auto-generate slug from title before save
EventSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('title')) {
    let slug = generateSlug(this.title);
    // Ensure uniqueness by appending counter if needed
    const Event = mongoose.model('Event');
    let existing = await Event.findOne({ slug, _id: { $ne: this._id } });
    let counter = 1;
    const baseSlug = slug;
    while (existing) {
      slug = `${baseSlug}-${counter}`;
      existing = await Event.findOne({ slug, _id: { $ne: this._id } });
      counter++;
    }
    this.slug = slug;
  }
  next();
});

EventSchema.index({ status: 1, date: 1 });
EventSchema.index({ category: 1 });
EventSchema.index({ organizerDepartment: 1 });
EventSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<IEvent>('Event', EventSchema);
