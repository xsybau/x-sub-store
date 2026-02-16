import { Schema, model, models } from "mongoose";

export const AdminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    role: { type: String, default: "ADMIN" },
  },
  { timestamps: true },
);

export const Admin = models.Admin || model("Admin", AdminSchema);
