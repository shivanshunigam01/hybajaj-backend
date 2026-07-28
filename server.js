require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./config/database');
const { seedIfEmpty } = require('./scripts/bootstrap');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_SECRET and JWT_REFRESH_SECRET are required');
    }
    await connectDB();
    await seedIfEmpty();
    app.listen(PORT, () => {
      console.log(`HY Bajaj API running on http://localhost:${PORT}`);
      console.log(`Swagger docs: http://localhost:${PORT}/api/docs`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
