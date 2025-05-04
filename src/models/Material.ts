import { Schema, model } from "mongoose";
import { IMaterial } from "../interfaces";

const MaterialSchema = new Schema<IMaterial>({
  tipo: { type: String, enum: ["libro", "revista"], required: true },
  titulo: { type: String, required: true },
  autor: { type: String, required: true },
  codigo: { type: String, required: true, unique: true },
  categoria: { type: String, required: true },
  ejemplaresTotal: { type: Number, required: true, min: 0 },
  ejemplaresDisponibles: { type: Number, required: true, min: 0 },
  fechaPublicacion: { type: Date },
  editorial: { type: String },
  ubicacion: { type: String },
  estado: {
    type: String,
    enum: ["disponible", "prestado", "reparacion", "perdido"],
    default: "disponible",
  },
  imagenPortada: { type: String },
  // Campos específicos para libros
  edicion: { type: String },
  paginas: { type: Number },
  // Campos específicos para revistas
  volumen: { type: Number },
  numero: { type: Number },
  periodicidad: { type: String },
});

export const Material = model<IMaterial>("Material", MaterialSchema);
