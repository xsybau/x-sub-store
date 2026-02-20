import { Schema, model, models } from "mongoose";

export const UserSchema = new Schema(
  {
    email: { type: String, index: true }, // Optional for users, just a label
    label: { type: String, required: true },
    description: { type: String, default: "" },
    tagIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
      default: [],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const User = models.User || model("User", UserSchema);
