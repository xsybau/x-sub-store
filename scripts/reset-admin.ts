import mongoose from "mongoose";
import { parseArgs } from "node:util";
import { Admin } from "../server/models/Admin";
import { hashPassword } from "../server/utils/password";

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    "current-email": { type: "string" },
    "new-email": { type: "string" },
    "new-password": { type: "string" },
  },
  strict: false,
  allowPositionals: true,
});

const currentEmail =
  typeof values["current-email"] === "string"
    ? values["current-email"].trim()
    : "";
const newEmail =
  typeof values["new-email"] === "string" ? values["new-email"].trim() : "";
const newPassword =
  typeof values["new-password"] === "string" ? values["new-password"] : "";

if (!newEmail || !newPassword) {
  console.error(
    "Usage: bun scripts/reset-admin.ts --new-email <email> --new-password <password> [--current-email <current-email>]",
  );
  process.exit(1);
}

const mongoUri =
  process.env.MONGO_URI ||
  process.env.MONGO_URL ||
  "mongodb://localhost:27017/v2ray-hub";

async function main() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to DB");

    let targetAdmin: { _id: unknown; email: string } | null = null;

    if (currentEmail) {
      targetAdmin = await Admin.findOne({ email: currentEmail }).select(
        "_id email",
      );
      if (!targetAdmin) {
        console.error(`Admin with email ${currentEmail} not found.`);
        process.exit(1);
      }
    } else {
      const admins = await Admin.find({})
        .sort({ createdAt: 1 })
        .limit(2)
        .select("_id email");

      if (admins.length === 0) {
        console.error(
          "No admin account exists. Create one first with scripts/create-admin.ts.",
        );
        process.exit(1);
      }

      if (admins.length > 1) {
        console.error(
          "Multiple admins exist. Use --current-email to select which admin to reset.",
        );
        process.exit(1);
      }

      targetAdmin = admins[0] ?? null;
    }

    if (!targetAdmin) {
      console.error("Target admin could not be determined.");
      process.exit(1);
    }

    if (targetAdmin.email !== newEmail) {
      const emailConflict = await Admin.findOne({ email: newEmail }).select(
        "_id",
      );
      if (
        emailConflict &&
        String(emailConflict._id) !== String(targetAdmin._id)
      ) {
        console.error(`Another admin already uses email ${newEmail}.`);
        process.exit(1);
      }
    }

    const passwordHash = await hashPassword(newPassword);

    await Admin.findByIdAndUpdate(targetAdmin._id, {
      email: newEmail,
      passwordHash,
      isActive: true,
    });

    console.log(`Reset admin credentials: ${targetAdmin.email} -> ${newEmail}`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

void main();
