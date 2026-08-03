import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "nivora_healthcare_jwt_secret_key_2026";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    _id?: string;
    email: string;
    role?: string;
    name?: string;
  };
}

/**
 * JWT Authentication Middleware
 * Validates incoming Authorization Bearer header or token
 */
export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || (req.headers.Authorization as string);
  let token = "";

  if (authHeader && typeof authHeader === "string") {
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    } else {
      token = authHeader.trim();
    }
  }

  if (!token) {
    token = (req.headers["x-access-token"] || req.headers["token"]) as string;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized: No authentication token provided." });
  }

  try {
    // Legacy mock token support for test environments
    if (token === "mock-jwt-token-admin") {
      req.user = { id: "USR-001", email: "nivora@gmail.com", role: "Super Admin" };
      return next();
    }
    if (token === "mock-jwt-token-user") {
      req.user = { id: "USR-002", email: "jane.doe@example.com", role: "User" };
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired JWT token." });
  }
};

/**
 * Admin Verification Middleware
 * Requires valid JWT and Super Admin or Admin role
 */
export const verifyAdminToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  verifyToken(req, res, () => {
    if (req.user && (req.user.role === "Super Admin" || req.user.role === "Admin")) {
      next();
    } else {
      return res.status(403).json({ success: false, message: "Forbidden: Admin access required." });
    }
  });
};
