import express from "express";
import { PrestamoController } from "../controllers/prestamo.controller";

class PrestamoRoutes {
  private router: express.Router;
  private controller = new PrestamoController();

  constructor() {
    this.router = express.Router();
    this.routes();
  }

  private routes() {
    // Obtener préstamos con filtros
    this.router.get("/", this.controller.getPrestamos);
    
    // Obtener préstamos retrasados
    this.router.get("/retrasados", this.controller.getPrestamosRetrasados);
    
    // Obtener préstamo por clave
    this.router.get("/clave/:clave", this.controller.getPrestamoByClave);
    
    // Obtener préstamo por ID
    this.router.get("/:id", this.controller.getPrestamoById);
    
    // Crear nuevo préstamo
    this.router.post("/", this.controller.createPrestamo);
    
    // Registrar devolución
    this.router.post("/devolucion", this.controller.registrarDevolucion);
  }

  public getRouter(): express.Router {
    return this.router;
  }
}

export default new PrestamoRoutes().getRouter();