import { Request, Response } from "express";
import { Material } from "../models/Material";
import { IMaterial } from "../interfaces";
import mongoose from "mongoose";

class MaterialController {
  public async getMateriales(req: Request, res: Response): Promise<void> {
    try {
      // Filtros opcionales
      const { tipo, categoria, disponibilidad, titulo } = req.query;

      const filter: any = {};

      if (tipo) filter.tipo = tipo;
      if (categoria) filter.categoria = categoria;
      if (titulo) filter.titulo = { $regex: titulo, $options: "i" };

      if (disponibilidad === "disponible") {
        filter.ejemplaresDisponibles = { $gt: 0 };
      } else if (disponibilidad === "agotado") {
        filter.ejemplaresDisponibles = 0;
      }

      const materiales = await Material.find(filter);
      res.json(materiales);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener los materiales", error });
    }
  }

// En material.controller.ts
public async createMaterial(req: Request, res: Response): Promise<void> {
  try {
    const materialData: IMaterial = req.body;

    // Validar ejemplares
    if (materialData.ejemplaresDisponibles > materialData.ejemplaresTotal) {
      res.status(400).json({
        message: "Ejemplares disponibles no pueden superar los totales"
      });
      return;
    }

    const newMaterial = new Material(materialData);
    const materialSaved = await newMaterial.save();
    res.status(201).json(materialSaved);

  } catch (error) {
    // Manejar errores de validación
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ message: error.message });
    }
   
    // Otros errores
    else {
      console.error("Error creating material:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}

  public async getMaterialById(req: Request, res: Response): Promise<void> {
    try {
      const material = await Material.findById(req.params.id);

      if (!material) {
        res.status(404).json({ message: "Material no encontrado" });
        return;
      }

      res.json(material);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el material", error });
    }
  }

  public async updateMaterial(req: Request, res: Response): Promise<void> {
    try {
      const updateData: Partial<IMaterial> = req.body;

      // Validar ejemplares si vienen en el update
      if (
        updateData.ejemplaresDisponibles !== undefined &&
        updateData.ejemplaresTotal !== undefined &&
        updateData.ejemplaresDisponibles > updateData.ejemplaresTotal
      ) {
        res.status(400).json({
          message:
            "Los ejemplares disponibles no pueden ser mayores que los totales",
        });
        return;
      }

      const materialUpdated = await Material.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!materialUpdated) {
        res.status(404).json({ message: "Material no encontrado" });
        return;
      }

      res.json(materialUpdated);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al actualizar el material", error });
    }
  }

  public async deleteMaterial(req: Request, res: Response): Promise<void> {
    try {
      const material = await Material.findByIdAndDelete(req.params.id);

      if (!material) {
        res.status(404).json({ message: "Material no encontrado" });
        return;
      }

      res.json({ message: "Material eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar el material", error });
    }
  }

  public async getMaterialesMasPrestados(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      // Esta lógica debería consultar la colección de préstamos
      // Por ahora devolvemos materiales con más ejemplares prestados
      const materiales = await Material.find()
        .sort({ ejemplaresPrestados: -1 })
        .limit(10);

      res.json(materiales);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener materiales más prestados", error });
    }
  }
}

export { MaterialController };
