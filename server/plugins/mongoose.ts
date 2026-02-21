import { connectMongo } from "../utils/mongo-connection";

export default defineNitroPlugin(async (_nitroApp) => {
  const config = useRuntimeConfig();
  const mongoUri =
    config.mongoUri || process.env.MONGO_URI || process.env.MONGO_URL;

  if (!mongoUri) {
    console.warn("MONGO_URI is not set, skipping database connection");
    return;
  }

  try {
    await connectMongo(mongoUri);
    console.log("Connected to MongoDB");
  } catch (error: unknown) {
    console.error("MongoDB connection error:", error);
  }
});
