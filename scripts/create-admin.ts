import mongoose from 'mongoose';
import { Admin } from '../server/models/Admin';
import { hashPassword } from '../server/utils/password';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    email: { type: 'string' },
    password: { type: 'string' },
    force: { type: 'boolean' }
  },
  strict: false,
  allowPositionals: true
});

const email = typeof values.email === 'string' ? values.email : '';
const password = typeof values.password === 'string' ? values.password : '';
const force = values.force === true;

if (!email || !password) {
  console.error('Usage: bun scripts/create-admin.ts --email <email> --password <password> [--force]');
  process.exit(1);
}

const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/v2ray-hub';

async function main() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to DB');

    const existing = await Admin.findOne({ email }).select('_id');
    if (existing) {
      if (!force) {
        console.error(`Admin with email ${email} already exists. Use --force to overwrite password.`);
        process.exit(1);
      }
      const hash = await hashPassword(password);
      await Admin.findByIdAndUpdate(existing._id, { passwordHash: hash });
      console.log(`Updated admin ${email}`);
    } else {
      const hash = await hashPassword(password);
      await Admin.create({
        email,
        passwordHash: hash,
        role: 'ADMIN'
      });
      console.log(`Created admin ${email}`);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
