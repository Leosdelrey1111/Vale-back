import { Schema, model } from "mongoose";
import { IEditorial } from "../interfaces/index";

const EditorialSchema = new Schema<IEditorial>({
  nombre: {
    type: String,
    required: [true, "El nombre del autor es obligatorio"],
    trim: true,
    maxlength: [100, "El nombre no puede exceder los 100 caracteres"],
  },
  pais: {
    type: String,
    required: [true, "El pais es obligatoria"],
    maxlength: [50, "El pais no puede exceder los 50 caracteres"],
  },
  fundacion: {
    type: Date,
  },
});

export const Editorial = model<IEditorial>("Editorial", EditorialSchema);
