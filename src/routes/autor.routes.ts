import express from "express";
import { AutorController } from "../controllers/autor.controller";

class AutorRoutes {
  private router: express.Router;
  private controller = new AutorController();

  constructor() {
    this.router = express.Router();
    this.routes();
  }

  private routes() {
    this.router.get("/", this.controller.getAutor);
    this.router.post("/", this.controller.createAutor);
    this.router.put("/:id", this.controller.updateAutor);
    this.router.delete("/:id", this.controller.deleteAutor);
  }

  public getRouter(): express.Router {
    return this.router;
  }
}

export default new AutorRoutes().getRouter();
