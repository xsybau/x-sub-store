import { Schema, model, models, type Model } from "mongoose";

export interface TagDocument {
  name: string;
  normalizedName: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const normalizeTagName = (name: string): string => {
  return name.trim().toLowerCase();
};

export const TagSchema = new Schema<TagDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    normalizedName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    isDefault: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

TagSchema.pre("validate", function () {
  if (typeof this.name === "string") {
    this.name = this.name.trim();
    this.normalizedName = normalizeTagName(this.name);
  }
});

export const Tag =
  (models.Tag as Model<TagDocument> | undefined) ||
  model<TagDocument>("Tag", TagSchema);
