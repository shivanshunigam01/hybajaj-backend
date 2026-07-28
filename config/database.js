const mongoose = require('mongoose');

let memoryServer;

const connectDB = async () => {
  let uri = process.env.MONGO_URI;

  if (process.env.USE_MEMORY_DB === 'true') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('hy_bajaj_drive');
    console.log('Using in-memory MongoDB (USE_MEMORY_DB=true)');
  }

  if (!uri) {
    throw new Error('MONGO_URI is not defined');
  }

  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    if (process.env.USE_MEMORY_DB === 'true') throw err;
    console.warn(`MongoDB connection failed (${err.message}). Falling back to in-memory DB.`);
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('hy_bajaj_drive');
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected (memory): ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  }
};

const stopMemoryDB = async () => {
  if (memoryServer) await memoryServer.stop();
};

module.exports = { connectDB, stopMemoryDB };
