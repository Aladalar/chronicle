import "reflect-metadata";
import express from "express";
import cors from "cors";
import http from "http";
import { config } from "./config";
import { AppDataSource } from "./data-source";
import { errorHandler } from "./middleware";
import { initSocket } from "./socket/emitter";

// Routes
import authRoutes from "./routes/auth";
import campaignRoutes from "./routes/campaigns";
import characterRoutes from "./routes/characters";
import refRoutes from "./routes/refs";
import contentRoutes from "./routes/content";
import soundRoutes from "./routes/sounds";
import proposalRoutes from "./routes/proposals";

async function bootstrap() {
  // ─── Database ───
  await AppDataSource.initialize();
  console.log(`[DB] Connected to ${config.db.name}@${config.db.host}`);

  // ─── Express ───
  const app = express();
  app.use(cors({ origin: config.cors.origin, credentials: true }));
  app.use(express.json({ limit: "2mb" }));

  // Health check
  app.get("/api/v1/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ─── Route mounts ───
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/campaigns", campaignRoutes);
  app.use("/api/v1/campaigns/:campaignId/characters", characterRoutes);
  app.use("/api/v1/campaigns/:campaignId", contentRoutes);
  app.use("/api/v1/refs", refRoutes);
  app.use("/api/v1/sounds", soundRoutes);
  app.use("/api/v1/proposals", proposalRoutes);

  // Error handler (must be last)
  app.use(errorHandler);

  // ─── HTTP + Socket.IO ───
  const server = http.createServer(app);
  initSocket(server);

  server.listen(config.port, () => {
    console.log(`[SERVER] Chronicle running on :${config.port} (${config.nodeEnv})`);
  });
}

bootstrap().catch((err) => {
  console.error("[FATAL]", err);
  process.exit(1);
});
