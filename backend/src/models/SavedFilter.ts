import mongoose, { Document, Schema } from 'mongoose';

export interface IFilterPreset {
  category?: string;
  search?: string;
  eventState?: 'all' | 'live' | 'open' | 'full';
  sortBy?: 'newest' | 'popular' | 'deadline';
}

export interface ISavedFilter extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  filters: IFilterPreset;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SavedFilterSchema = new Schema<ISavedFilter>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Filter preset name is required'],
      maxlength: 100,
    },
    filters: {
      category: {
        type: String,
        default: undefined,
      },
      search: {
        type: String,
        default: undefined,
      },
      eventState: {
        type: String,
        enum: ['all', 'live', 'open', 'full'],
        default: 'all',
      },
      sortBy: {
        type: String,
        enum: ['newest', 'popular', 'deadline'],
        default: 'newest',
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensure only one preset per (userId, name)
SavedFilterSchema.index({ userId: 1, name: 1 }, { unique: true });

const SavedFilter = mongoose.model<ISavedFilter>('SavedFilter', SavedFilterSchema);

export default SavedFilter;
