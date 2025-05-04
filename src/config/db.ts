// src/config/db.ts
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/biblioteca";

export class Database {
  private uri: string;

  constructor(uri: string = MONGO_URI) {
    this.uri = uri;
  }

  public async connect(): Promise<void> {
    try {
      await mongoose.connect(this.uri);
      console.log("✅ MongoDB connected");
    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      throw error;
    }
  }
}
