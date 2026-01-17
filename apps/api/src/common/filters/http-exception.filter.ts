import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

/**
 * Standard error response format
 */
export interface ErrorResponse {
  code: string;
  message: string;
  timestamp: string;
  path: string;
  statusCode: number;
  details?: unknown;
  stack?: string;
}

/**
 * Global Exception Filter
 *
 * Catches all exceptions and returns a standardized error response format:
 * {
 *   code: "ERROR_CODE",
 *   message: "Human readable message",
 *   timestamp: "2024-01-01T00:00:00.000Z",
 *   path: "/api/endpoint",
 *   statusCode: 400,
 *   details: { ... } // optional
 * }
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly isDevelopment = process.env.NODE_ENV !== "production";

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, errorResponse } = this.buildErrorResponse(exception, request);

    // Log the error
    this.logError(exception, errorResponse, request);

    response.status(statusCode).json(errorResponse);
  }

  private buildErrorResponse(
    exception: unknown,
    request: Request
  ): { statusCode: number; errorResponse: ErrorResponse } {
    const timestamp = new Date().toISOString();
    const path = request.url;

    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, timestamp, path);
    }

    // Handle non-HTTP exceptions (unexpected errors)
    return this.handleUnknownException(exception, timestamp, path);
  }

  private handleHttpException(
    exception: HttpException,
    timestamp: string,
    path: string
  ): { statusCode: number; errorResponse: ErrorResponse } {
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string;
    let code: string;
    let details: unknown;

    if (typeof exceptionResponse === "string") {
      message = exceptionResponse;
      code = this.getErrorCodeFromStatus(statusCode);
    } else if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
      const responseObj = exceptionResponse as Record<string, unknown>;
      message = (responseObj.message as string) || exception.message;
      code = (responseObj.code as string) || this.getErrorCodeFromStatus(statusCode);
      details = responseObj.details || responseObj.error;

      // Handle class-validator errors (array of messages)
      if (Array.isArray(responseObj.message)) {
        message = responseObj.message[0] || "Validation failed";
        details = responseObj.message;
        code = "VALIDATION_ERROR";
      }
    } else {
      message = exception.message;
      code = this.getErrorCodeFromStatus(statusCode);
    }

    const errorResponse: ErrorResponse = {
      code,
      message,
      timestamp,
      path,
      statusCode,
    };

    if (details) {
      errorResponse.details = details;
    }

    // Include stack trace in development
    if (this.isDevelopment && exception.stack) {
      errorResponse.stack = exception.stack;
    }

    return { statusCode, errorResponse };
  }

  private handleUnknownException(
    exception: unknown,
    timestamp: string,
    path: string
  ): { statusCode: number; errorResponse: ErrorResponse } {
    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse: ErrorResponse = {
      code: "INTERNAL_SERVER_ERROR",
      message: this.isDevelopment
        ? (exception instanceof Error ? exception.message : "An unexpected error occurred")
        : "Internal server error",
      timestamp,
      path,
      statusCode,
    };

    // Include stack trace in development
    if (this.isDevelopment && exception instanceof Error && exception.stack) {
      errorResponse.stack = exception.stack;
    }

    return { statusCode, errorResponse };
  }

  private getErrorCodeFromStatus(status: number): string {
    const statusCodeMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: "BAD_REQUEST",
      [HttpStatus.UNAUTHORIZED]: "UNAUTHORIZED",
      [HttpStatus.FORBIDDEN]: "FORBIDDEN",
      [HttpStatus.NOT_FOUND]: "NOT_FOUND",
      [HttpStatus.METHOD_NOT_ALLOWED]: "METHOD_NOT_ALLOWED",
      [HttpStatus.CONFLICT]: "CONFLICT",
      [HttpStatus.UNPROCESSABLE_ENTITY]: "UNPROCESSABLE_ENTITY",
      [HttpStatus.TOO_MANY_REQUESTS]: "TOO_MANY_REQUESTS",
      [HttpStatus.INTERNAL_SERVER_ERROR]: "INTERNAL_SERVER_ERROR",
      [HttpStatus.BAD_GATEWAY]: "BAD_GATEWAY",
      [HttpStatus.SERVICE_UNAVAILABLE]: "SERVICE_UNAVAILABLE",
    };

    return statusCodeMap[status] || `HTTP_ERROR_${status}`;
  }

  private logError(exception: unknown, errorResponse: ErrorResponse, request: Request): void {
    const { method, url, ip } = request;
    const userAgent = request.get("user-agent") || "";
    const userId = (request as any).user?.id || "anonymous";

    const logMessage = `[${method}] ${url} - ${errorResponse.code}: ${errorResponse.message}`;
    const logContext = {
      statusCode: errorResponse.statusCode,
      ip,
      userAgent,
      userId,
      path: errorResponse.path,
    };

    if (errorResponse.statusCode >= 500) {
      this.logger.error(logMessage, exception instanceof Error ? exception.stack : undefined, logContext);
    } else if (errorResponse.statusCode >= 400) {
      this.logger.warn(logMessage, logContext);
    }
  }
}

// Re-export for backward compatibility
export { GlobalExceptionFilter as HttpExceptionFilter };
