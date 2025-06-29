import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { storage } from "../storage.js";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    const user = await storage.getUser(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

export const authenticateWorker = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers["x-api-key"];
  
  if (!apiKey || apiKey !== config.worker.apiKey) {
    return res.status(401).json({ message: "Invalid API key" });
  }
  
  next();
};
