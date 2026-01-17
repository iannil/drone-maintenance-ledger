import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

/**
 * Request Logger Middleware
 *
 * Logs incoming requests and outgoing responses with timing information
 * Adds request ID to each request for tracing
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const requestId = randomUUID();

    // Attach request ID to request object
    (req as any).requestId = requestId;

    // Extract request info
    const { method, originalUrl, ip } = req;
    const userAgent = req.get("user-agent") || "-";
    const contentLength = req.get("content-length") || 0;

    // Log request start
    this.logger.log(`--> ${method} ${originalUrl} [${requestId.slice(0, 8)}]`);

    // Capture response finish
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      const resContentLength = res.get("content-length") || 0;

      const logMessage = `<-- ${method} ${originalUrl} ${statusCode} ${duration}ms`;
      const logContext = {
        requestId: requestId.slice(0, 8),
        ip,
        userAgent: userAgent.slice(0, 50),
        reqSize: contentLength,
        resSize: resContentLength,
        duration,
      };

      if (statusCode >= 500) {
        this.logger.error(logMessage, undefined, logContext);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage, logContext);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}

/**
 * Skip logging for certain paths
 */
export function shouldSkipLogging(path: string): boolean {
  const skipPaths = [
    "/api/health",
    "/api/docs",
    "/favicon.ico",
  ];

  return skipPaths.some((skipPath) => path.startsWith(skipPath));
}
