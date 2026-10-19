import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const clearDatabase = async () => {
  console.log('[Script] Connecting...');
  await connectDB();

  // Wait until connected
  let retries = 0;
  while (mongoose.connection.readyState !== 1 && retries < 20) {
    await new Promise((r) => setTimeout(r, 500));
    retries++;
  }

  if (mongoose.connection.readyState !== 1) {
    console.error('[Script] Could not establish connection.');
    process.exit(1);
  }

  console.log('[Script] Connected to:', mongoose.connection.name);

  const collections = ['owners', 'properties', 'tasks', 'reminders'];
  for (const col of collections) {
    try {
      const count = await mongoose.connection.collection(col).countDocuments();
      console.log(`[Script] Collection '${col}' has ${count} records.`);
      const result = await mongoose.connection.collection(col).deleteMany({});
      console.log(`[Script] Deleted ${result.deletedCount} records from '${col}'.`);
    } catch (e: any) {
      console.warn(`[Script] Collection '${col}' error or not found:`, e.message);
    }
  }

  // Remove demo seed users, preserving real user accounts (Rohit Kumar)
  await mongoose.connection.collection('users').deleteMany({
    email: { $in: ['admin@hometrack.com', 'elena@hometrack.com', 'marcus@hometrack.com'] },
  });

  // Check remaining users
  const users = await mongoose.connection.collection('users').find({}).toArray();
  console.log(`[Script] Preserved Real User Accounts (${users.length}):`);
  users.forEach((u) => console.log(` - ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`));

  await mongoose.disconnect();
  console.log('[Script] Complete! Database is clean of all default records. Only registered user accounts remain.');
  process.exit(0);
};

clearDatabase().catch((e) => {
  console.error('[Script] Error:', e);
  process.exit(1);
});
