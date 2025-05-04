import express from "express";

import dotenv from "dotenv";
import App from "./app";

import { Database } from "./config/db";

dotenv.config();

class Server {
  private app: express.Application;
  private port: string | number;
  private db: Database;

  constructor() {
    this.app = App.getApp();
    this.port = process.env.PORT || 5000;
    this.db = new Database();
  }

  public async start() {
    try {
      await this.db.connect(); // Conectar a MongoDB

      this.app.listen(this.port, () => {
        console.log(`🚀 Server running on http://localhost:${this.port}`);
      });
    } catch (error) {
      console.error("❌ Error initializing the server:", error);
      process.exit(1);
    }
  }
}

const server = new Server();
server.start();
