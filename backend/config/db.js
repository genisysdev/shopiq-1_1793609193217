const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb://localhost:27017/shopiq");
    console.log(`MongoDB connected: ${conn.connection.host}`.cyan.bold);
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

module.exports = connectDB;
