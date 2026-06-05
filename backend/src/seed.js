import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { seedDatabase } from './utils/seeder.js';

async function run() {
  await connectDB();
  await seedDatabase();
  await mongoose.disconnect();
  console.log('Seeding complete.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
