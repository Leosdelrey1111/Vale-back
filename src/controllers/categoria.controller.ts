import { Request, Response } from "express";

import { Categoria } from "../models/Catergoria";
import { ICategoria } from "../interfaces";

class CategoriaController {
  public getCategoria = async (req: Request, res: Response): Promise<void> => {
    try {
      const categorias = await Categoria.find().select("-clave");
      res.json(categorias);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los categorias", error });
    }
  };

  public createCategoria = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ...categoriaData } = req.body;


      const newCategoria = new Categoria({
        ...categoriaData,
      });

      const categoria = await newCategoria.save();

      res.status(201).json(categoria);
    } catch (error) {
      res.status(500).json({ message: "Error al crear el categoria", error });
    }
  };

  public updateCategoria = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ...updateData } = req.body;
      const update: Partial<ICategoria> = updateData;

      const categoriaUpdated = await Categoria.findByIdAndUpdate(
        req.params.id,
        update,
        { new: true }
      ).select("-clave");

      if (!categoriaUpdated) {
        res.status(404).json({ message: "Categoria no encontrado" });
        return;
      }

      res.json(categoriaUpdated);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al actualizar el categoria", error });
    }
  };

  public deleteCategoria = async (req: Request, res: Response): Promise<void> => {
    try {
      const categoria = await Categoria.findByIdAndDelete(req.params.id).select(
        "-clave"
      );

      if (!categoria) {
        res.status(404).json({ message: "Categoria no encontrado" });
        return;
      }

      res.json({ message: "Categoria eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar el categoria", error });
    }
  };
}

export { CategoriaController };
