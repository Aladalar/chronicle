import { Request, Response, NextFunction } from "express";
import { config } from "../config";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error("[ERROR]", err);
  const message =
    config.nodeEnv === "development" ? err.message : "Internal server error";
  res.status(500).json({ error: message });
}
