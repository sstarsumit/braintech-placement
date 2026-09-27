import mongoose from 'mongoose';
import { MONGO_URI } from './env.js';

/**
 * Connects to MongoDB. If no local/remote MongoDB is reachable
 * (common on machines without a Mongo install), falls back to an
 * in-memory MongoDB so the whole app still works for demos.
 */
export async function connectDB() {
  mongoose.set('strictQuery', true);
  const uri = MONGO_URI;
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    console.log(`MongoDB connected: ${uri}`);
    return;
  } catch (err) {
    console.warn(`Local MongoDB not reachable (${err.message}).`);
  }

  console.log('Starting in-memory MongoDB (demo mode — data resets on restart)…');
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const mem = await MongoMemoryServer.create();
  await mongoose.connect(mem.getUri('braintech'));
  console.log('In-memory MongoDB connected.');
}
