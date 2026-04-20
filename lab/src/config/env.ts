import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const config = {
  port: parseInt(optional("PORT", "3001"), 10),
  nodeEnv: optional("NODE_ENV", "development"),

  db: {
    host: optional("DB_HOST", "localhost"),
    port: parseInt(optional("DB_PORT", "3306"), 10),
    name: required("DB_NAME"),
    user: required("DB_USER"),
    pass: required("DB_PASS"),
  },

  jwt: {
    secret: required("JWT_SECRET"),
    expiresIn: parseInt(optional("JWT_EXPIRES_IN", "604800"), 10),
  },

  cors: {
    origin: optional("CORS_ORIGIN", "http://localhost:5173"),
  },

  socket: {
    path: optional("SOCKET_PATH", "/socket.io"),
  },
};
