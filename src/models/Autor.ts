import { Schema, model } from "mongoose";
import { IAutor } from "../interfaces/index";

const AutorSchema = new Schema<IAutor>({
  nombre: {
    type: String,
    required: [true, "El nombre del autor es obligatorio"],
    trim: true,
    maxlength: [100, "El nombre no puede exceder los 100 caracteres"],
  },
  biografia: {
    type: String,
    required: [true, "La biografía es obligatoria"],
    maxlength: [20000, "La biografía no puede exceder los 2000 caracteres"],
  },
  foto: {
    type: String,
    default: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
  },
});

export const Autor = model<IAutor>("Autor", AutorSchema);
