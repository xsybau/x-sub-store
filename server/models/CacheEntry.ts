import { Schema, model, models } from "mongoose";

export const CacheEntrySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    contentBase64: { type: String, required: true },
    etag: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }, // TTL index
  },
  { timestamps: true },
);

export const CacheEntry =
  models.CacheEntry || model("CacheEntry", CacheEntrySchema);
