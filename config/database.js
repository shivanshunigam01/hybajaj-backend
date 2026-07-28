const mongoose = require('mongoose');

let memoryServer;

const connectDB = async () => {
  let uri = process.env.MONGO_URI;
  const isProd = process.env.NODE_ENV === 'production';

  if (process.env.USE_MEMORY_DB === 'true') {
    if (isProd) {
      throw new Error('USE_MEMORY_DB is not allowed in production');
    }
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('hy_bajaj_drive');
    console.log('Using in-memory MongoDB (USE_MEMORY_DB=true)');
  }

  if (!uri) {
    throw new Error('MONGO_URI is not defined');
  }

  mongoose.set('strictQuery', true);
  mongoose.set('bufferCommands', false);

  const options = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: Number(process.env.MONGO_MAX_POOL || 20),
    minPoolSize: Number(process.env.MONGO_MIN_POOL || 2),
    maxIdleTimeMS: 30000,
  };

  try {
    const conn = await mongoose.connect(uri, options);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    if (isProd || process.env.USE_MEMORY_DB === 'true') throw err;
    console.warn(`MongoDB connection failed (${err.message}). Falling back to in-memory DB (dev only).`);
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('hy_bajaj_drive');
    const conn = await mongoose.connect(uri, options);
    console.log(`MongoDB connected (memory): ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  }
};

const stopMemoryDB = async () => {
  if (memoryServer) await memoryServer.stop();
};

module.exports = { connectDB, stopMemoryDB };
