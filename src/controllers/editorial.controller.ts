import { Request, Response } from "express";

import { Editorial } from "../models/Editorial";
import { IEditorial } from "../interfaces";

class EditorialController {
  public getEditorial = async (req: Request, res: Response): Promise<void> => {
    try {
      const editoriales = await Editorial.find().select("-clave");
      res.json(editoriales);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener los editoriales", error });
    }
  };

  public createEditorial = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { ...editorialData } = req.body;

      const newEditorial = new Editorial({
        ...editorialData,
      });

      const editorial = await newEditorial.save();

      res.status(201).json(editorial);
    } catch (error) {
      res.status(500).json({ message: "Error al crear el editorial", error });
    }
  };

  public updateEditorial = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { ...updateData } = req.body;
      const update: Partial<IEditorial> = updateData;

      const editorialUpdated = await Editorial.findByIdAndUpdate(
        req.params.id,
        update,
        { new: true }
      ).select("-clave");

      if (!editorialUpdated) {
        res.status(404).json({ message: "Editorial no encontrado" });
        return;
      }

      res.json(editorialUpdated);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al actualizar el editorial", error });
    }
  };

  public deleteEditorial = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const editorial = await Editorial.findByIdAndDelete(req.params.id).select(
        "-clave"
      );

      if (!editorial) {
        res.status(404).json({ message: "Editorial no encontrado" });
        return;
      }

      res.json({ message: "Editorial eliminado correctamente" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al eliminar el editorial", error });
    }
  };
}

export { EditorialController };
