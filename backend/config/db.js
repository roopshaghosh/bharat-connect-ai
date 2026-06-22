const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  try {
    if (!uri) {
      throw new Error("No MongoDB URI configured. Please add MONGO_URI to your environment variables.");
    }
    console.log(`Attempting to connect to MongoDB...`);
    await mongoose.connect(uri);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;