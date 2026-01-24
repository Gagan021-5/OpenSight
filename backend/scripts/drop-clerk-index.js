/**
 * One-time script: drop the leftover clerkId_1 index from users collection.
 * Run: npm run drop-clerk-index
 * (Requires MONGO_URI in .env or default local MongoDB)
 */
import 'dotenv/config';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/opensight';

async function run() {
  await mongoose.connect(MONGO_URI);
  try {
    await mongoose.connection.db.collection('users').dropIndex('clerkId_1');
    console.log('Dropped index clerkId_1 from users.');
  } catch (e) {
    if (e.code === 27 || e.codeName === 'IndexNotFound' || (e.message && e.message.includes('index not found'))) {
      console.log('Index clerkId_1 not found (already removed).');
    } else {
      throw e;
    }
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((err) => { console.error(err); process.exit(1); });
