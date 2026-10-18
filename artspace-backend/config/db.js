
const mongoose = require("mongoose");

async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in .env");
  }

  try {
    const connection = await mongoose.connect(
      process.env.MONGO_URI,
      { serverSelectionTimeoutMS: 15000 }
    );

    console.log(
      `MongoDB Atlas connected: ${connection.connection.name}`
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}

module.exports = connectDB;
