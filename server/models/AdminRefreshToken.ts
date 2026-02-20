import { Schema, model, models, type Model, type Types } from "mongoose";

export interface AdminRefreshTokenDocument {
  adminId: Types.ObjectId;
  tokenIdHash: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  replacedByTokenIdHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const AdminRefreshTokenSchema = new Schema<AdminRefreshTokenDocument>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
    tokenIdHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, index: true },
    replacedByTokenIdHash: { type: String, index: true },
  },
  { timestamps: true },
);

export const AdminRefreshToken =
  (models.AdminRefreshToken as Model<AdminRefreshTokenDocument> | undefined) ||
  model<AdminRefreshTokenDocument>(
    "AdminRefreshToken",
    AdminRefreshTokenSchema,
  );
