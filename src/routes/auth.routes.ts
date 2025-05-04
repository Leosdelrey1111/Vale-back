import express from "express";
import { AuthController } from "../controllers/auth.controller";

class MaterialRoutes {
  private router: express.Router;
  private controller = new AuthController();

  constructor() {
    this.router = express.Router();
    this.routes();
  }

  private routes() {
    this.router.post("/", this.controller.login);
  }

  public getRouter(): express.Router {
    return this.router;
  }
}

export default new MaterialRoutes().getRouter();
