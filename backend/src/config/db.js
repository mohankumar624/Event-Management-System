import mongoose from 'mongoose';
import { env } from './env.js';

let mongod = null;

export async function connectDB() {
  let mongoUri = env.mongoUri;
  const isInMemory = process.env.USE_IN_MEMORY_DB === 'true' || !process.env.MONGO_URI;

  if (env.nodeEnv === 'development' && isInMemory) {
    console.log('Starting in-memory MongoDB server...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log(`In-memory MongoDB started at: ${mongoUri}`);
    } catch (err) {
      console.error('Failed to start in-memory MongoDB:', err.message);
      process.exit(1);
    }
  }

  mongoose.set('strictQuery', true);
  try {
    const dbName = mongoUri.split('/').pop() || 'event_mgmt';
    await mongoose.connect(mongoUri, {
      dbName: dbName.includes('?') ? dbName.split('?')[0] : dbName,
    });
    console.log('MongoDB connected');

    if (mongod) {
      console.log('Running automatic seeding for in-memory database...');
      const { seedDatabase } = await import('../utils/seeder.js');
      await seedDatabase();
      console.log('Automatic seeding completed.');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

export async function closeDB() {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
    console.log('In-memory MongoDB server stopped.');
  }
}

// Handle cleanup on exit
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDB();
  process.exit(0);
});
