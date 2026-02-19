import { Schema, model, models, type Model } from 'mongoose';

export const AdminRefreshTokenSchema = new Schema({
  adminId: { type: Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
  tokenIdHash: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true, index: true },
  revokedAt: { type: Date, index: true },
  replacedByTokenIdHash: { type: String, index: true }
}, { timestamps: true });

export const AdminRefreshToken = (models.AdminRefreshToken as Model<any>) || model('AdminRefreshToken', AdminRefreshTokenSchema);
