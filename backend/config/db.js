const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/college_lost_found';
  
  try {
    // First try connecting to the provided MongoDB URI with a short timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] Connected to MongoDB at: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[Database] Could not connect to external MongoDB (${err.message}). Initializing embedded in-memory MongoDB engine...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Connected successfully to embedded MongoDB instance at: ${memoryUri}`);
    } catch (memErr) {
      console.error('[Database] Failed to start embedded MongoDB instance:', memErr.message);
      process.exit(1);
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('[Database] MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('[Database] MongoDB disconnected');
  });
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('[Database] Disconnected from DB');
  } catch (error) {
    console.error('[Database] Error disconnecting DB:', error);
  }
};

module.exports = { connectDB, disconnectDB };
