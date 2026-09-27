import { PORT } from './config/env.js';
import app from './app.js';
import { connectDB } from './config/db.js';
import { seedAll } from './seedData.js';
import User from './models/User.js';

connectDB()
  .then(async () => {
    // Auto-seed demo data when the database is empty (great for first run)
    const hasUsers = await User.countDocuments();
    if (!hasUsers) {
      console.log('Empty database detected — seeding demo data…');
      await seedAll();
      console.log('Demo data ready. Login with admin@braintech.com / admin123');
    }
    app.listen(PORT, () => {
      console.log(`Braintech API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
