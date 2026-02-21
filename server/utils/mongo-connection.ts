import mongoose, { type Mongoose } from "mongoose";

type MongoConnectionCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
  uri: string | null;
};

const globalMongo = globalThis as typeof globalThis & {
  __xSubStoreMongoCache?: MongoConnectionCache;
};

const mongoCache: MongoConnectionCache = globalMongo.__xSubStoreMongoCache ?? {
  conn: null,
  promise: null,
  uri: null,
};

if (!globalMongo.__xSubStoreMongoCache) {
  globalMongo.__xSubStoreMongoCache = mongoCache;
}

export const connectMongo = async (mongoUri: string): Promise<Mongoose> => {
  const isSameUri = mongoCache.uri === mongoUri;

  if (isSameUri && mongoCache.conn && mongoose.connection.readyState === 1) {
    return mongoCache.conn;
  }

  if (isSameUri && mongoCache.promise) {
    return mongoCache.promise;
  }

  mongoCache.uri = mongoUri;
  mongoCache.promise = mongoose.connect(mongoUri).then((mongooseInstance) => {
    mongoCache.conn = mongooseInstance;
    return mongooseInstance;
  });

  try {
    return await mongoCache.promise;
  } catch (error) {
    mongoCache.promise = null;
    mongoCache.conn = null;
    throw error;
  }
};
