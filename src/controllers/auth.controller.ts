import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Usuario } from "../models/Usuario";
import { IUsuario } from "../interfaces";

class AuthController {
  private JWT_SECRET = process.env.JWT_SECRET || "9gufib9ufb9oub3fwouqa";

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { correo, clave } = req.body;

      if (!correo || !clave) {
        res.status(400).json({ message: "Correo y clave son obligatorios." });
        return;
      }

      const usuario = await Usuario.findOne({ correo });
      if (!usuario) {
        res.status(401).json({ message: "Correo o clave incorrectos." });
        return;
      }

      const isMatch = await bcrypt.compare(clave, usuario.clave);
      if (!isMatch) {
        res.status(401).json({ message: "Correo o clave incorrectos." });
        return;
      }

      // Crear payload (solo info necesaria)
      const payload = {
        id: usuario._id,
        correo: usuario.correo,
        nombre: usuario.nombre,
        estado: usuario.estado,
        rol: usuario.rol
      };

      // Generar el token (expira en 7 días)
      const token = jwt.sign(payload, this.JWT_SECRET, { expiresIn: "7d" });

      const usuarioToReturn = usuario.toObject();

      res.status(200).json({
        message: "Inicio de sesión exitoso",
        usuario: usuarioToReturn,
        token,
      });
    } catch (error) {
      console.error("Error al crear el préstamo:", error);
      res.status(500).json({
        message: "Error al crear el préstamo",
        error: error instanceof Error ? error.message : error,
      });
    }
  };
}

export { AuthController };
