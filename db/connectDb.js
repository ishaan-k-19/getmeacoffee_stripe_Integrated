import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

let cached = global.mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false, // Prevents buffering issues
    }).then((mongoose) => {
      console.log("✅ MongoDB Connected");
      return mongoose;
    }).catch((error) => {
      console.error("❌ MongoDB Connection Error:", error.message);
      process.exit(1);
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

global.mongoose = cached;
