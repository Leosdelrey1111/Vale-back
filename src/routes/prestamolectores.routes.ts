// routes/prestamolector.routes.ts
import { Router } from "express";
import { PrestamoController } from "../controllers/prestamo.controller";
import { PrestamoLectorController } from "../controllers/PrestamoLector.Controller"; // Asegúrate de que el nombre del archivo no tenga mayúscula en .ts

const router = Router();

const prestamoController = new PrestamoController();
const prestamoLectorController = new PrestamoLectorController();

// Nueva ruta: préstamos de un lector
router.get("/mis-prestamos/:usuarioId", prestamoLectorController.getPrestamosLector);

// Rutas ya existentes (opcional, si no están en otro archivo)
router.get("/", prestamoController.getPrestamos);
router.get("/:id", prestamoController.getPrestamoById);
router.get("/clave/:clave", prestamoController.getPrestamoByClave);
router.post("/", prestamoController.createPrestamo);
router.put("/devolucion", prestamoController.registrarDevolucion);
router.get("/retrasados", prestamoController.getPrestamosRetrasados);

export default router;
