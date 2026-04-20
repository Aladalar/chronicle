const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql2/promise");
const cors = require("cors");

const PORT = process.env.PORT || 3001;
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "chronicle";
const DB_PASS = process.env.DB_PASS || "";
const DB_NAME = process.env.DB_NAME || "chronicle";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  path: "/socket.io/",
});

// --- Health / Diagnostics ---
app.get("/api/health", async (req, res) => {
  const result = { api: "ok", db: "unknown", ws: "ok", ts: Date.now() };
  try {
    const conn = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME,
    });
    await conn.execute("SELECT 1");
    await conn.end();
    result.db = "ok";
  } catch (err) {
    result.db = "error: " + err.message;
  }
  res.json(result);
});

// --- Placeholder API route ---
app.get("/api/v1/campaigns", (req, res) => {
  res.json([]);
});

// --- Socket.IO ---
io.on("connection", (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);
  socket.on("ping", (cb) => {
    if (typeof cb === "function") cb("pong");
  });
  socket.on("disconnect", () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);
  });
});

// --- Start ---
server.listen(PORT, () => {
  console.log(`[Chronicle API] Listening on port ${PORT}`);
});