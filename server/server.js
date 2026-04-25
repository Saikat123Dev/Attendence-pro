require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config');

// MongoDB connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Connect to MongoDB
async function connectDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri, mongoOptions);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Start server
async function startServer() {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Smart Attendance System API                              ║
║   Server running on port ${config.port}                            ║
║                                                           ║
║   Health check: http://localhost:${config.port}/api/health      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
