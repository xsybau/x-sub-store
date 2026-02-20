import { Schema, model, models } from "mongoose";

export const AuditLogSchema = new Schema(
  {
    actorAdminId: { type: Schema.Types.ObjectId, ref: "Admin", index: true },
    action: { type: String, required: true },
    targetType: { type: String },
    targetId: { type: Schema.Types.ObjectId },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

export const AuditLog = models.AuditLog || model("AuditLog", AuditLogSchema);
