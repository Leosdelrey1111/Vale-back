import express from "express";
import { MaterialController } from "../controllers/material.controller";

class MaterialRoutes {
  private router: express.Router;
  private controller = new MaterialController();

  constructor() {
    this.router = express.Router();
    this.routes();
  }

  private routes() {
    this.router.get("/", this.controller.getMateriales);
    this.router.get("/mas-prestados", this.controller.getMaterialesMasPrestados);
    this.router.get("/:id", this.controller.getMaterialById);
    this.router.post("/", this.controller.createMaterial);
    this.router.put("/:id", this.controller.updateMaterial);
    this.router.delete("/:id", this.controller.deleteMaterial);
  }

  public getRouter(): express.Router {
    return this.router;
  }
}

export default new MaterialRoutes().getRouter();
