import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB with URI:", process.env.MONGO_URI); // Debug log
    await mongoose.connect(process.env.MONGO_URI); // No need for additional options
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1); // Exit the process with failure
  }
};

export default connectDB;
