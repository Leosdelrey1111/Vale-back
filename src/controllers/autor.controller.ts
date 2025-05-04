import { Request, Response } from "express";

import { Autor } from "../models/Autor";
import { IAutor } from "../interfaces";

class AutorController {
  public getAutor = async (req: Request, res: Response): Promise<void> => {
    try {
      const autores = await Autor.find().select("-clave");
      res.json(autores);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los autores", error });
    }
  };

  public createAutor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ...autorData } = req.body;


      const newAutor = new Autor({
        ...autorData,
      });

      const autor = await newAutor.save();

      res.status(201).json(autor);
    } catch (error) {
      res.status(500).json({ message: "Error al crear el autor", error });
    }
  };

  public updateAutor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ...updateData } = req.body;
      const update: Partial<IAutor> = updateData;

      const autorUpdated = await Autor.findByIdAndUpdate(
        req.params.id,
        update,
        { new: true }
      ).select("-clave");

      if (!autorUpdated) {
        res.status(404).json({ message: "Autor no encontrado" });
        return;
      }

      res.json(autorUpdated);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al actualizar el autor", error });
    }
  };

  public deleteAutor = async (req: Request, res: Response): Promise<void> => {
    try {
      const autor = await Autor.findByIdAndDelete(req.params.id).select(
        "-clave"
      );

      if (!autor) {
        res.status(404).json({ message: "Autor no encontrado" });
        return;
      }

      res.json({ message: "Autor eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar el autor", error });
    }
  };
}

export { AutorController };
