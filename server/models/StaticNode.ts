import { Schema, model, models } from "mongoose";

export const StaticNodeSchema = new Schema(
  {
    name: { type: String, required: true },
    content: { type: String, required: true }, // vmess://... or other
    scope: {
      type: String,
      enum: ["GLOBAL", "USER", "TAG"],
      default: "USER",
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    tagId: { type: Schema.Types.ObjectId, ref: "Tag", index: true },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const StaticNode =
  models.StaticNode || model("StaticNode", StaticNodeSchema);
