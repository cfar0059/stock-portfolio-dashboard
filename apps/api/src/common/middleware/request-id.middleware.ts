import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

/**
 * Request ID Middleware
 *
 * Generates a unique request ID for each incoming request using crypto.randomUUID().
 * - Stores the ID on req.requestId for downstream access
 * - Sets X-Request-Id response header for client correlation
 */

// Extend Express Request to include requestId
export interface RequestWithId extends Request {
  requestId: string;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithId, res: Response, next: NextFunction): void {
    const requestId = randomUUID();
    req.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);
    next();
  }
}
