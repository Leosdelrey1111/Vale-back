import { Schema, model } from "mongoose";
import { IUsuario } from "../interfaces";

const UsuarioSchema = new Schema<IUsuario>({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  identificacion: { type: String, required: true, unique: true },
  clave: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  telefono: { type: String },
  prestamosActivos: { type: Number, default: 0 },
  fechaRegistro: { type: Date, default: Date.now },
  estado: {
    type: String,
    enum: ["activo", "inactivo", "suspendido"],
    default: "activo",
  },
  multaAcumulada: {
    type: Number,
    min: [0, "La multa no puede ser negativa"],
    default: 0,
  },
  rol: {
    type: String,
    enum: ["lector", "bibliotecario"],
    default: "lector",
    required: true
  }
});

export const Usuario = model<IUsuario>("Usuario", UsuarioSchema);
