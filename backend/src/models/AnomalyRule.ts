import mongoose, { Document, Schema } from 'mongoose';

export type AnomalyRuleType = 'overflow' | 'no-show-gap' | 'low-attendance';

export interface IAnomalyRule extends Document {
  ruleType: AnomalyRuleType;
  threshold: number;
  description: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnomalyRuleSchema = new Schema<IAnomalyRule>(
  {
    ruleType: {
      type: String,
      enum: ['overflow', 'no-show-gap', 'low-attendance'],
      required: true,
      unique: true,
      index: true,
    },
    threshold: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const AnomalyRule = mongoose.model<IAnomalyRule>('AnomalyRule', AnomalyRuleSchema);

export default AnomalyRule;
