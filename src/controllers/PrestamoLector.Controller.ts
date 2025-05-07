// PrestamoLectorController.ts
import { Request, Response } from "express";
import { Prestamo } from "../models/Prestamo";
import { Usuario } from "../models/Usuario";

class PrestamoLectorController {
  public getPrestamosLector = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarioId = req.params.usuarioId;
      
      const prestamos = await Prestamo.find({ usuarioId })
        .populate("materialId", "titulo tipo autor edicion")
        .sort({ fechaPrestamo: -1 });

      res.json({
        activos: prestamos.filter(p => ["activo", "retrasado"].includes(p.estado)),
        historial: prestamos.filter(p => p.estado === "devuelto"),
        adeudo: (await Usuario.findById(usuarioId))?.multaAcumulada || 0
      });
      
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los préstamos", error });
    }
  };
}

export { PrestamoLectorController };
