import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response } from "express";
import { ZodError } from "zod";
import { RequestWithId } from "../middleware/request-id.middleware";

/**
 * Global HTTP Exception Filter
 *
 * Catches all exceptions and returns a consistent JSON response shape:
 * {
 *   error: { code: string, message: string, requestId?: string },
 *   meta: { path: string, timestamp: string }
 * }
 */

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    requestId?: string;
  };
  meta: {
    path: string;
    timestamp: string;
  };
}

const ERROR_CODE_MAP: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: "BAD_REQUEST",
  [HttpStatus.UNAUTHORIZED]: "UNAUTHORIZED",
  [HttpStatus.FORBIDDEN]: "FORBIDDEN",
  [HttpStatus.NOT_FOUND]: "NOT_FOUND",
  [HttpStatus.CONFLICT]: "CONFLICT",
  [HttpStatus.UNPROCESSABLE_ENTITY]: "VALIDATION_ERROR",
  [HttpStatus.TOO_MANY_REQUESTS]: "RATE_LIMIT_EXCEEDED",
  [HttpStatus.SERVICE_UNAVAILABLE]: "SERVICE_UNAVAILABLE",
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<RequestWithId>();
    const response = ctx.getResponse<Response>();

    const requestId = request.requestId;
    const path = request.url;
    const timestamp = new Date().toISOString();

    const { status, message, code } = this.extractErrorDetails(exception);

    const errorResponse: ErrorResponse = {
      error: {
        code,
        message,
        ...(requestId && { requestId }),
      },
      meta: {
        path,
        timestamp,
      },
    };

    response.status(status).json(errorResponse);
  }

  private extractErrorDetails(exception: unknown): {
    status: number;
    message: string;
    code: string;
  } {
    // Handle ZodError validation errors
    if (exception instanceof ZodError) {
      const message = exception.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");
      return {
        status: HttpStatus.BAD_REQUEST,
        message,
        code: "VALIDATION_ERROR",
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = this.extractMessage(exception);
      const code = ERROR_CODE_MAP[status] || "INTERNAL_ERROR";
      return { status, message, code };
    }

    // Unknown/unhandled exceptions
    this.logger.error(
      `Unhandled exception: ${exception instanceof Error ? exception.message : String(exception)}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    };
  }

  private extractMessage(exception: HttpException): string {
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === "string") {
      return exceptionResponse;
    }

    if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
      const resp = exceptionResponse as Record<string, unknown>;
      if (typeof resp.message === "string") {
        return resp.message;
      }
      if (Array.isArray(resp.message)) {
        return resp.message.join(", ");
      }
    }

    return exception.message;
  }
}
