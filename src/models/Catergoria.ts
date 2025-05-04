import { Schema, model } from "mongoose";
import { ICategoria } from "../interfaces/index";

const CategoriaSchema = new Schema<ICategoria>({
  nombre: {
    type: String,
    required: [true, "El nombre del autor es obligatorio"],
    trim: true,
    maxlength: [100, "El nombre no puede exceder los 100 caracteres"],
  },
  descripcion: {
    type: String,
    required: [true, "La descripcion es obligatoria"],
    maxlength: [10000, "La descripcion no puede exceder los 100 caracteres"],
  }
});

export const Categoria = model<ICategoria>("Categoria", CategoriaSchema);
