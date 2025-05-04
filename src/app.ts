import express from "express";
import cors from "cors";
import morgan from "morgan";
import materialRoutes from "./routes/material.routes";
import usuarioRoutes from "./routes/usuario.routes";
import prestamoRoutes from "./routes/prestamo.routes";
import authRoutes from "./routes/auth.routes";
import autorRoutes from "./routes/autor.routes";
import categoriaRoutes from "./routes/categoria.routes";
import editorialRoutes from "./routes/editorial.routes";

class App {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
  }

  private config() {
    this.app.use(cors());
    this.app.use(morgan("dev"));
    this.app.use(express.json());
  }

  private routes() {
    this.app.use("/api/auth", authRoutes);
    this.app.use("/api/autores", autorRoutes);
    this.app.use("/api/categorias", categoriaRoutes);
    this.app.use("/api/editoriales", editorialRoutes);
    this.app.use("/api/materiales", materialRoutes);
    this.app.use("/api/usuarios", usuarioRoutes);
    this.app.use("/api/prestamos", prestamoRoutes);
  }

  public static getApp(): express.Application {
    return new App().app;
  }
}

export default App;
