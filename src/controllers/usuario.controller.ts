import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import { Usuario } from "../models/Usuario";
import { IUsuario } from "../interfaces";

class UsuarioController {
  private saltRounds = 10;

  public getUsuarios = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarios = await Usuario.find().select("-clave");
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los usuarios", error });
    }
  };

  public getUsuarioById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const usuario = await Usuario.findById(req.params.id).select("-clave");
      if (!usuario) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el usuario", error });
    }
  };

  public createUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const { clave, ...usuarioData } = req.body;

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(clave, this.saltRounds);

      const newUsuario = new Usuario({
        ...usuarioData,
        clave: hashedPassword,
      });

      const usuarioSaved = await newUsuario.save();

      // No retornar la contraseña
      const usuarioToReturn = usuarioSaved.toObject();

      res.status(201).json(usuarioToReturn);
    } catch (error) {
      res.status(500).json({ message: "Error al crear el usuario", error });
    }
  };

  public updateUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const { clave, ...updateData } = req.body;
      const update: Partial<IUsuario> = updateData;

      if (clave) {
        update.clave = await bcrypt.hash(clave, this.saltRounds);
      }

      const usuarioUpdated = await Usuario.findByIdAndUpdate(
        req.params.id,
        update,
        { new: true }
      ).select("-clave");

      if (!usuarioUpdated) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }

      res.json(usuarioUpdated);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al actualizar el usuario", error });
    }
  };

  public deleteUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuario = await Usuario.findByIdAndDelete(req.params.id).select(
        "-clave"
      );

      if (!usuario) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }

      res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar el usuario", error });
    }
  };

  public getPrestamosByUsuario = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      // Implementar lógica para obtener préstamos de un usuario
      // Esto debería consultar la colección de préstamos
      res
        .status(501)
        .json({ message: `Por implementar, id de usuario ${req.params.id}` });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener préstamos del usuario", error });
    }
  };
  public clearDebt = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarioId = req.params.id;
      const usuario = await Usuario.findByIdAndUpdate(
        usuarioId,
        { multaAcumulada: 0 },
        { new: true }
      );
      if (!usuario) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }
      res.json({ message: "Deuda eliminada", multaAcumulada: usuario.multaAcumulada });
    } catch (error) {
      res.status(500).json({ message: "Error al limpiar deuda", error });
    }
  };

}



export { UsuarioController };
