import express from "express";
import { CategoriaController } from "../controllers/categoria.controller";

class CategoriaRoutes {
  private router: express.Router;
  private controller = new CategoriaController();

  constructor() {
    this.router = express.Router();
    this.routes();
  }

  private routes() {
    this.router.get("/", this.controller.getCategoria);
    this.router.post("/", this.controller.createCategoria);
    this.router.put("/:id", this.controller.updateCategoria);
    this.router.delete("/:id", this.controller.deleteCategoria);
  }

  public getRouter(): express.Router {
    return this.router;
  }
}

export default new CategoriaRoutes().getRouter();
