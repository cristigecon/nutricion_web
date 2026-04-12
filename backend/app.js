import express from "express";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import dataRoutes from "./routes/data.js";

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/", (req, res) => {
    res.send("API funcionando");
  });

  app.use("/api/auth", authRoutes);
  app.use("/api", dataRoutes);

  app.use((req, res) => {
    res.status(404).json({ message: "Ruta no encontrada" });
  });

  app.use(errorHandler);

  return app;
};

export default createApp;
