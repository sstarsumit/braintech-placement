import './config/env.js';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { seedAll } from './seedData.js';

async function main() {
  await connectDB();
  console.log('Seeding demo data…');
  await seedAll();
  console.log('\n✅ Seed complete!\n');
  console.log('Admin login:      admin@braintech.com / admin123');
  console.log('Candidate login:  sumit@example.com / candidate123');
  console.log('Recruiter login:  hr@abctech.com / recruiter123');
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
