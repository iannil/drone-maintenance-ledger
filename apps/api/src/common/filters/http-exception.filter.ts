import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from "@nestjs/common";
import { Response } from "express";

/**
 * HTTP Exception Filter
 *
 * Standardizes error response format
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const error =
      typeof exceptionResponse === "string"
        ? { message: exceptionResponse }
        : (exceptionResponse as object);

    this.logger.error(`HTTP Exception: ${status}`, JSON.stringify(error));

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      ...error,
    });
  }
}
