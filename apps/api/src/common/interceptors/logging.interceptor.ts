import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { Response } from "express";
import { RequestWithId } from "../middleware/request-id.middleware";

/**
 * Logging Interceptor
 *
 * Logs incoming requests and their responses with timing information.
 * Format: [METHOD] /path - statusCode durationMs (requestId)
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<RequestWithId>();
    const response = ctx.getResponse<Response>();

    const { method, url, requestId } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - startTime;
          const statusCode = response.statusCode;
          this.logger.log(
            `${method} ${url} - ${statusCode} ${durationMs}ms (${requestId})`,
          );
        },
        error: () => {
          const durationMs = Date.now() - startTime;
          const statusCode = response.statusCode;
          this.logger.warn(
            `${method} ${url} - ${statusCode} ${durationMs}ms (${requestId})`,
          );
        },
      }),
    );
  }
}
