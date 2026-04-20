import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { JwtPayload } from "../middleware/auth";

let io: SocketServer | null = null;

export function initSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    path: config.socket.path,
    cors: {
      origin: config.cors.origin,
      credentials: true,
    },
  });

  // Auth on connect — client must send token in handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Missing auth token"));

    try {
      const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
      socket.data.auth = payload;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    // All clients join the global room for ref/sound broadcasts
    socket.join("campaign:global");

    socket.on("campaign:join", (campaignId: string) => {
      socket.join(`campaign:${campaignId}`);
    });

    socket.on("campaign:leave", (campaignId: string) => {
      socket.leave(`campaign:${campaignId}`);
    });

    socket.on("disconnect", () => {
      // cleanup handled by Socket.IO automatically
    });
  });

  return io;
}

/**
 * Broadcast an event to all clients in a campaign room.
 * Called from route handlers after a successful DB write.
 */
export function broadcast(campaignId: string, event: string, payload: unknown): void {
  if (!io) return;
  io.to(`campaign:${campaignId}`).emit(event, {
    ...((typeof payload === "object" && payload !== null) ? payload : { data: payload }),
    _ts: Date.now(),
  });
}

export function getIO(): SocketServer | null {
  return io;
}
