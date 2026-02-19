import { Schema, model, models } from 'mongoose';

export const UpstreamSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  scope: { type: String, enum: ['GLOBAL', 'USER'], default: 'USER', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  enabled: { type: Boolean, default: true },
  type: { type: String, default: 'V2RAY' }, // V2RAY, CLASH, SINGBOX, etc.
  lastFetchStatus: { type: Number },
  lastFetchAt: { type: Date },
  lastError: { type: String },
}, { timestamps: true });

export const Upstream = models.Upstream || model('Upstream', UpstreamSchema);
