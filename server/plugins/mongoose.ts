import mongoose from "mongoose";

export default defineNitroPlugin((_nitroApp) => {
  const config = useRuntimeConfig();
  const mongoUri =
    config.mongoUri || process.env.MONGO_URI || process.env.MONGO_URL;

  if (!mongoUri) {
    console.warn("MONGO_URI is not set, skipping database connection");
    return;
  }

  void mongoose
    .connect(mongoUri)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error: unknown) => {
      console.error("MongoDB connection error:", error);
    });
});
