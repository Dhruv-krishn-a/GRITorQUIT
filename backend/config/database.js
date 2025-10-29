import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      console.error("MONGODB_URI environment variable is not set");
      process.exit(1);
    }

    const conn = await mongoose.connect(uri);
    
    console.log(`MongoDB Cloud Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

export default connectDB;