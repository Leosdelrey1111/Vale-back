import { Request, Response } from "express";
import mongoose from "mongoose";
import { Prestamo } from "../models/Prestamo";
import { Material } from "../models/Material";
import { Usuario } from "../models/Usuario";

class PrestamoController {
  private MAX_PRESTAMOS = 2;
  private DIAS_PRESTAMO = 2;
  private MULTA_POR_DIA = 50;

  public getPrestamos = async (req: Request, res: Response): Promise<void> => {
    try {
      const { estado, usuarioId, materialId, clavePrestamo, usuarioNombre, fechaDesde, fechaHasta } = req.query;
      const filter: any = {};

      // Filtros básicos
      if (estado) filter.estado = estado;
      if (usuarioId) filter.usuarioId = usuarioId;
      if (materialId) filter.materialId = materialId;
      
      // Filtro por clave de préstamo
      if (clavePrestamo) filter.clavePrestamo = clavePrestamo;
      
      // Filtro por nombre de usuario (búsqueda parcial)
      if (usuarioNombre) {
        filter.$text = { $search: usuarioNombre.toString() };
      }
      
      // Filtro por rango de fechas de devolución esperada
      if (fechaDesde || fechaHasta) {
        filter.fechaDevolucionEsperada = {};
        if (fechaDesde) {
          filter.fechaDevolucionEsperada.$gte = new Date(fechaDesde.toString());
        }
        if (fechaHasta) {
          filter.fechaDevolucionEsperada.$lte = new Date(fechaHasta.toString());
        }
      }

      const prestamos = await Prestamo.find(filter)
        .populate("usuarioId", "nombre apellido")
        .populate("materialId", "titulo tipo autor edicion");
      
      res.json(prestamos);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener los préstamos", error });
    }
  };

  public getPrestamoById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const prestamo = await Prestamo.findById(req.params.id)
        .populate("usuarioId", "nombre apellido")
        .populate("materialId", "titulo tipo autor edicion");
      
      if (!prestamo) {
        res.status(404).json({ message: "Préstamo no encontrado" });
        return;
      }
      
      res.json(prestamo);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el préstamo", error });
    }
  };

  public getPrestamoByClave = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const prestamo = await Prestamo.findOne({ clavePrestamo: req.params.clave })
        .populate("usuarioId", "nombre apellido")
        .populate("materialId", "titulo tipo autor edicion");
      
      if (!prestamo) {
        res.status(404).json({ message: "Préstamo no encontrado" });
        return;
      }
      
      res.json(prestamo);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el préstamo", error });
    }
  };

  public createPrestamo = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { usuarioId, materialId, fechaDevolucionEsperada } = req.body;
  
      // 1. Verificar que el usuario existe y no supera el límite
      const usuario = await Usuario.findById(usuarioId);
      if (!usuario) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }
      if (usuario.prestamosActivos >= this.MAX_PRESTAMOS) {
        res.status(400).json({
          message: `El usuario ya tiene el máximo de ${this.MAX_PRESTAMOS} préstamos activos`,
        });
        return;
      }
  
      // 2. Verificar que el material existe y está disponible
      const material = await Material.findById(materialId);
      if (!material) {
        res.status(404).json({ message: "Material no encontrado" });
        return;
      }
      if (material.tipo === "revista") {
        res.status(400).json({ message: "Las revistas no se pueden prestar" });
        return;
      }
      if (material.ejemplaresDisponibles <= 0) {
        res
          .status(400)
          .json({ message: "No hay ejemplares disponibles de este material" });
        return;
      }
  
      // 3. Parsear y validar la fecha que viene del front
      const fechaEsperada = new Date(fechaDevolucionEsperada);
      if (isNaN(fechaEsperada.getTime())) {
        res.status(400).json({ message: "Fecha de devolución esperada inválida" });
        return;
      }
      if (fechaEsperada <= new Date()) {
        res
          .status(400)
          .json({ message: "La fecha de devolución esperada debe ser futura" });
        return;
      }
  
      // 4. Generar clave y crear el préstamo
      const clavePrestamo = Prestamo.generarClavePrestamo();
      const newPrestamo = new Prestamo({
        clavePrestamo,
        usuarioId,
        usuarioNombre: `${usuario.nombre} ${usuario.apellido}`,
        materialId,
        materialTitulo: material.titulo,
        materialAutor: material.autor,
        materialEdicion: material.edicion || "",
        materialTipo: material.tipo,
        fechaPrestamo: new Date(),
        fechaDevolucionEsperada: fechaEsperada,
        estado: "activo",
      });
      const prestamoSaved = await newPrestamo.save();
  
      // 5. Actualizar cantidades
      await Usuario.findByIdAndUpdate(usuarioId, {
        $inc: { prestamosActivos: 1 },
      });
      await Material.findByIdAndUpdate(materialId, {
        $inc: { ejemplaresDisponibles: -1 },
        $set: {
          estado:
            material.ejemplaresDisponibles - 1 <= 0 ? "prestado" : "disponible",
        },
      });
  
      res.status(201).json(prestamoSaved);
    } catch (error) {
      console.error("Error al crear el préstamo:", error);
      res.status(500).json({
        message: "Error al crear el préstamo",
        error: error instanceof Error ? error.message : error,
      });
    }
  };
  

  public registrarDevolucion = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { prestamoId, observaciones } = req.body;
      
      // 1. Obtener el préstamo
      const prestamo = await Prestamo.findById(prestamoId);
      if (!prestamo) {
        res.status(404).json({ message: "Préstamo no encontrado" });
        return;
      }
      
      if (prestamo.estado !== "activo" && prestamo.estado !== "retrasado") {
        res.status(400).json({ message: "El préstamo no está activo o retrasado" });
        return;
      }
      
      // 2. Calcular multa si hay retraso
      const fechaDevolucionReal = new Date();
      let diasRetraso = 0;
      let multa = 0;
      
      if (fechaDevolucionReal > prestamo.fechaDevolucionEsperada) {
        const diffTime = Math.abs(
          fechaDevolucionReal.getTime() -
            prestamo.fechaDevolucionEsperada.getTime()
        );
        diasRetraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        multa = diasRetraso * this.MULTA_POR_DIA;
      }
      
      // 3. Actualizar préstamo
      const prestamoUpdated = await Prestamo.findByIdAndUpdate(prestamoId, {
        fechaDevolucionReal,
        estado: "devuelto",
        diasRetraso,
        multa,
        observaciones,
      }, { new: true });
      
      // 4. Actualizar usuario (reducir préstamos activos y sumar multa)
      await Usuario.findByIdAndUpdate(prestamo.usuarioId, {
        $inc: {
          prestamosActivos: -1,
          multaAcumulada: multa,
        },
      });
      
      // 5. Actualizar material (aumentar disponibilidad)
      await Material.findByIdAndUpdate(prestamo.materialId, {
        $inc: { ejemplaresDisponibles: 1 },
        $set: { estado: "disponible" },
      });
      
      res.json(prestamoUpdated);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al registrar la devolución", error });
    }
  };

  public getPrestamosRetrasados = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const prestamos = await Prestamo.find({
        estado: "activo",
        fechaDevolucionEsperada: { $lt: new Date() },
      })
        .populate("usuarioId", "nombre apellido")
        .populate("materialId", "titulo autor edicion");
      
      res.json(prestamos);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener préstamos retrasados", error });
    }
  };
}

export { PrestamoController };