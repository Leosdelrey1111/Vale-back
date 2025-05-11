import express from "express";
import { UsuarioController } from "../controllers/usuario.controller";

class UsuarioRoutes {
  private router: express.Router;
  private controller = new UsuarioController();

  constructor() {
    this.router = express.Router();
    this.routes();
  }

  private routes() {
    this.router.get("/", this.controller.getUsuarios);
    this.router.get("/:id", this.controller.getUsuarioById);
    this.router.get("/prestamos/:id", this.controller.getPrestamosByUsuario);
    this.router.post("/", this.controller.createUsuario);
    this.router.put("/:id", this.controller.updateUsuario);
    this.router.delete("/:id", this.controller.deleteUsuario);
    this.router.patch("/usuarios/:id/clear-debt", this.controller.clearDebt);
  }

  public getRouter(): express.Router {
    return this.router;
  }
}

export default new UsuarioRoutes().getRouter();
