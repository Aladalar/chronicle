import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export interface JwtPayload {
  userId: string;
  role: "dm" | "player";
}

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload;
    }
  }
}

/**
 * Verify JWT from Authorization: Bearer <token>
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.auth = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Require specific role(s). Must be used AFTER authenticate.
 */
export function requireRole(...roles: Array<"dm" | "player">) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    if (!roles.includes(req.auth.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}

/**
 * Generate JWT for a user.
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(
    payload as object,
    config.jwt.secret as jwt.Secret,
    { expiresIn: `${config.jwt.expiresIn}s` } as jwt.SignOptions,
  );
}
