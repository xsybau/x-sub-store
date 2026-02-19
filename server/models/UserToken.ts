import { Schema, model, models } from 'mongoose';

export const UserTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true }, // For lookup
  tokenCiphertext: { type: String, required: true }, // For display
  revokedAt: { type: Date, index: true },
  lastUsedAt: { type: Date },
}, { timestamps: true });

export const UserToken = models.UserToken || model('UserToken', UserTokenSchema);
