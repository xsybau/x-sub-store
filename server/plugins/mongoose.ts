import mongoose from 'mongoose';

export default defineNitroPlugin(async (_nitroApp) => {
  const config = useRuntimeConfig();
  const mongoUri = config.mongoUri || process.env.MONGO_URI || process.env.MONGO_URL;

  if (!mongoUri) {
    console.warn('MONGO_URI is not set, skipping database connection');
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (e) {
    console.error('MongoDB connection error:', e);
  }
});
