import express from "express";
import { EditorialController } from "../controllers/editorial.controller";

class EditorialRoutes {
  private router: express.Router;
  private controller = new EditorialController();

  constructor() {
    this.router = express.Router();
    this.routes();
  }

  private routes() {
    this.router.get("/", this.controller.getEditorial);
    this.router.post("/", this.controller.createEditorial);
    this.router.put("/:id", this.controller.updateEditorial);
    this.router.delete("/:id", this.controller.deleteEditorial);
  }

  public getRouter(): express.Router {
    return this.router;
  }
}

export default new EditorialRoutes().getRouter();
