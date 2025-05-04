// Actualizando la interfaz IPrestamo
import mongoose, { Document } from "mongoose";

export interface IUsuario extends Document {
  nombre: string;
  apellido: string;
  identificacion: string;
  clave: string;
  correo: string;
  telefono: string;
  prestamosActivos: number;
  fechaRegistro: Date;
  estado: "activo" | "inactivo" | "suspendido";
  multaAcumulada: number;
}

export interface IMaterial extends Document {
  tipo: "libro" | "revista";
  titulo: string;
  autor: string;
  codigo: string;
  categoria: string;
  ejemplaresTotal: number;
  ejemplaresDisponibles: number;
  fechaPublicacion: Date;
  editorial: string;
  ubicacion: string;
  estado: "disponible" | "prestado" | "reparacion" | "perdido";
  imagenPortada?: string;
  edicion?: string; // Solo para libros
  paginas?: number; // Solo para libros
  volumen?: number; // Solo para revistas
  numero?: number; // Solo para revistas
  periodicidad?: string; // Solo para revistas
}

export interface IPrestamo extends Document {
  clavePrestamo: string;
  usuarioId: mongoose.Types.ObjectId;
  usuarioNombre: string;
  materialId: mongoose.Types.ObjectId;
  materialTitulo: string;
  materialAutor?: string;
  materialEdicion?: string;
  materialTipo: "libro" | "revista";
  fechaPrestamo: Date;
  fechaDevolucionEsperada: Date;
  fechaDevolucionReal?: Date;
  estado: "activo" | "devuelto" | "retrasado" | "perdido";
  multa?: number;
  diasRetraso?: number;
  observaciones?: string;
  condicionDevolucion?: "excelente" | "buena" | "regular" | "mala" | "perdido";
  createdAt?: Date;
  updatedAt?: Date;
  // Virtuals
  estaRetrasado?: boolean;
  // Métodos
  registrarDevolucion: (
    condicion: string,
    observaciones?: string
  ) => Promise<IPrestamo>;
}

// Extender el modelo con métodos estáticos
export interface IPrestamoModel extends mongoose.Model<IPrestamo> {
  calcularMulta: (
    fechaDevolucionEsperada: Date,
    fechaDevolucionReal: Date,
    multaPorDia?: number
  ) => { diasRetraso: number; multa: number };
  generarClavePrestamo: () => string;
}

export interface IAutor extends Document {
  nombre: string;
  biografia: string;
  foto?: string; 
}

export interface ICategoria extends Document {
  nombre: string;
  descripcion: string;
}

export interface IEditorial extends Document {
  nombre: string;
  pais: string;
  fundacion: Date;
}