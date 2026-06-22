const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  try {
    if (!uri) {
      throw new Error("No MongoDB URI configured.");
    }
    console.log(`Attempting to connect to MongoDB: ${uri}`);
    await mongoose.connect(uri);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.log(`Failed to connect to primary MongoDB (${error.message}). Spinning up an in-memory MongoDB server fallback...`);
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      console.log(`In-memory MongoDB server started at: ${mongoUri}`);
      await mongoose.connect(mongoUri);
      console.log("MongoDB Connected (In-Memory Fallback)");
    } catch (fallbackError) {
      console.error("Critical: Failed to spin up/connect to in-memory MongoDB:", fallbackError.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;