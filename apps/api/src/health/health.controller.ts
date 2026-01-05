import { Controller, Get, HttpStatus, Res } from "@nestjs/common";
import { Response } from "express";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Health Controller
 *
 * GET /health      - Liveness probe: returns { ok: true } if the process is running
 * GET /health/ready - Readiness probe: checks DB connectivity
 */
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Liveness probe - always returns ok if the server is running
   */
  @Get()
  getHealth(): { ok: true } {
    return { ok: true };
  }

  /**
   * Readiness probe - checks database connectivity
   * Returns 200 if DB is reachable, 503 if not
   */
  @Get("ready")
  async getReady(@Res() res: Response): Promise<void> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      res.status(HttpStatus.OK).json({ ok: true });
    } catch {
      res
        .status(HttpStatus.SERVICE_UNAVAILABLE)
        .json({ ok: false, reason: "db" });
    }
  }
}
