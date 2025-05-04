// Actualización del esquema Prestamo para incluir clavePrestamo y el método estático
import { Schema, model, Types } from "mongoose";
import { IPrestamo, IPrestamoModel } from "../interfaces";
import { Usuario } from "./Usuario";
import { Material } from "./Material";

const PrestamoSchema = new Schema<IPrestamo, IPrestamoModel>(
  {
    clavePrestamo: {
      type: String,
      required: [true, "La clave de préstamo es obligatoria"],
      unique: true,
      trim: true,
    },
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: [true, "El ID de usuario es obligatorio"],
      validate: {
        validator: async (value: Types.ObjectId) => {
          const usuario = await Usuario.findById(value);
          return usuario !== null;
        },
        message: "El usuario especificado no existe",
      },
    },
    usuarioNombre: {
      type: String,
      required: [true, "El nombre de usuario es obligatorio"],
      trim: true,
    },
    materialId: {
      type: Schema.Types.ObjectId,
      ref: "Material",
      required: [true, "El ID de material es obligatorio"],
      validate: {
        validator: async (value: Types.ObjectId) => {
          const material = await Material.findById(value);
          return material !== null;
        },
        message: "El material especificado no existe",
      },
    },
    materialTitulo: {
      type: String,
      required: [true, "El título del material es obligatorio"],
      trim: true,
    },
    materialAutor: {
      type: String,
      required: [true, "El autor del material es obligatorio"],
      trim: true,
    },
    materialEdicion: {
      type: String,
      trim: true,
    },
    materialTipo: {
      type: String,
      enum: {
        values: ["libro", "revista"],
        message: 'El tipo de material debe ser "libro" o "revista"',
      },
      required: [true, "El tipo de material es obligatorio"],
    },
    fechaPrestamo: {
      type: Date,
      default: Date.now,
      immutable: true, // No se puede modificar después de creado
    },
    fechaDevolucionEsperada: {
      type: Date,
      required: [true, "La fecha de devolución esperada es obligatoria"],
      validate: {
        validator: function (this: IPrestamo, value: Date) {
          // La fecha de devolución debe ser posterior a la fecha de préstamo
          return value > this.fechaPrestamo;
        },
        message:
          "La fecha de devolución debe ser posterior a la fecha de préstamo",
      },
    },
    fechaDevolucionReal: {
      type: Date,
      validate: {
        validator: function (this: IPrestamo, value: Date) {
          if (!value) return true; // Opcional
          return value >= this.fechaPrestamo;
        },
        message:
          "La fecha de devolución real no puede ser anterior a la fecha de préstamo",
      },
    },
    estado: {
      type: String,
      enum: {
        values: ["activo", "devuelto", "retrasado", "perdido"],
        message: "Estado no válido",
      },
      default: "activo",
    },
    multa: {
      type: Number,
      min: [0, "La multa no puede ser negativa"],
      default: 0,
    },
    diasRetraso: {
      type: Number,
      min: [0, "Los días de retraso no pueden ser negativos"],
      default: 0,
    },
    observaciones: {
      type: String,
      trim: true,
      maxlength: [
        500,
        "Las observaciones no pueden exceder los 500 caracteres",
      ],
    },
    condicionDevolucion: {
      type: String,
      enum: {
        values: ["excelente", "buena", "regular", "mala", "perdido"],
        message: "Condición de devolución no válida",
      },
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    toJSON: { virtuals: true }, // Incluye virtuals al convertir a JSON
    toObject: { virtuals: true }, // Incluye virtuals al convertir a objeto
  }
);

// Índices para mejorar el rendimiento de las consultas frecuentes
PrestamoSchema.index({ usuarioId: 1, estado: 1 });
PrestamoSchema.index({ materialId: 1, estado: 1 });
PrestamoSchema.index({ fechaDevolucionEsperada: 1 });
PrestamoSchema.index({ estado: 1 });
PrestamoSchema.index({ clavePrestamo: 1 }, { unique: true });
PrestamoSchema.index({ usuarioNombre: 'text' });

// Virtual para calcular si el préstamo está retrasado
PrestamoSchema.virtual("estaRetrasado").get(function (this: IPrestamo) {
  if (this.estado === "devuelto") return false;
  return this.fechaDevolucionEsperada < new Date();
});

// Middleware para actualizar el estado a "retrasado" si corresponde
PrestamoSchema.pre("save", function (next) {
  if (
    this.isModified("estado") &&
    this.estado === "activo" &&
    this.fechaDevolucionEsperada < new Date()
  ) {
    this.estado = "retrasado";
  }
  next();
});

// Método estático para calcular la multa
PrestamoSchema.statics.calcularMulta = function (
  fechaDevolucionEsperada: Date,
  fechaDevolucionReal: Date,
  multaPorDia = 50
) {
  if (fechaDevolucionReal <= fechaDevolucionEsperada) {
    return { diasRetraso: 0, multa: 0 };
  }
  const diffTime =
    fechaDevolucionReal.getTime() - fechaDevolucionEsperada.getTime();
  const diasRetraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const multa = diasRetraso * multaPorDia;
  return { diasRetraso, multa };
};

// Método estático para generar una clave única de préstamo
PrestamoSchema.statics.generarClavePrestamo = function() {
  const fecha = new Date();
  const año = fecha.getFullYear().toString().slice(-2);
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dia = fecha.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `P${año}${mes}${dia}-${random}`;
};

// Método de instancia para registrar devolución
PrestamoSchema.methods.registrarDevolucion = async function (
  condicion: string,
  observaciones?: string
) {
  this.fechaDevolucionReal = new Date();
  this.condicionDevolucion = condicion;
  this.observaciones = observaciones || this.observaciones;
  if (this.fechaDevolucionReal > this.fechaDevolucionEsperada) {
    const { diasRetraso, multa } = (this.constructor as any).calcularMulta(
      this.fechaDevolucionEsperada,
      this.fechaDevolucionReal
    );
    this.diasRetraso = diasRetraso;
    this.multa = multa;
  }
  this.estado = "devuelto";
  return this.save();
};

// Actualizar la interfaz en interfaces.ts para incluir clavePrestamo
// export interface IPrestamo extends Document {
//   clavePrestamo: string;
//   ...

export const Prestamo = model<IPrestamo, IPrestamoModel>("Prestamo", PrestamoSchema);