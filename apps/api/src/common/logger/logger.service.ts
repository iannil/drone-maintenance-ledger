import { Injectable, LoggerService as NestLoggerService, LogLevel } from "@nestjs/common";

/**
 * Custom Logger Service
 *
 * Provides structured logging with request context
 * Can be extended to integrate with Winston, Pino, or other logging libraries
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private context?: string;
  private readonly isDevelopment = process.env.NODE_ENV !== "production";

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, ...optionalParams: any[]) {
    this.printMessage("log", message, optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.printMessage("error", message, optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.printMessage("warn", message, optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    if (this.isDevelopment) {
      this.printMessage("debug", message, optionalParams);
    }
  }

  verbose(message: any, ...optionalParams: any[]) {
    if (this.isDevelopment) {
      this.printMessage("verbose", message, optionalParams);
    }
  }

  fatal(message: any, ...optionalParams: any[]) {
    this.printMessage("fatal", message, optionalParams);
  }

  private printMessage(level: string, message: any, optionalParams: any[]) {
    const timestamp = new Date().toISOString();
    const context = this.extractContext(optionalParams);
    const formattedMessage = this.formatMessage(message);

    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      context: context || this.context || "Application",
      message: formattedMessage,
      ...(optionalParams.length > 0 && this.isObject(optionalParams[0])
        ? { metadata: optionalParams[0] }
        : {}),
    };

    if (this.isDevelopment) {
      // Pretty print in development
      const coloredLevel = this.getColoredLevel(level);
      const contextStr = `[${logEntry.context}]`;
      console.log(`${timestamp} ${coloredLevel} ${contextStr} ${formattedMessage}`);
      if (logEntry.metadata) {
        console.log("  Metadata:", JSON.stringify(logEntry.metadata, null, 2));
      }
    } else {
      // JSON output in production (for log aggregators)
      console.log(JSON.stringify(logEntry));
    }
  }

  private extractContext(optionalParams: any[]): string | undefined {
    if (optionalParams.length > 0 && typeof optionalParams[optionalParams.length - 1] === "string") {
      return optionalParams.pop();
    }
    return undefined;
  }

  private formatMessage(message: any): string {
    if (typeof message === "string") {
      return message;
    }
    if (message instanceof Error) {
      return `${message.message}${message.stack ? `\n${message.stack}` : ""}`;
    }
    return JSON.stringify(message);
  }

  private isObject(value: any): boolean {
    return typeof value === "object" && value !== null && !(value instanceof Error);
  }

  private getColoredLevel(level: string): string {
    const colors: Record<string, string> = {
      log: "\x1b[32m", // green
      error: "\x1b[31m", // red
      warn: "\x1b[33m", // yellow
      debug: "\x1b[34m", // blue
      verbose: "\x1b[36m", // cyan
      fatal: "\x1b[35m", // magenta
    };
    const reset = "\x1b[0m";
    const color = colors[level] || "";
    return `${color}[${level.toUpperCase()}]${reset}`;
  }
}

/**
 * Request context for logging
 */
export interface RequestContext {
  requestId: string;
  userId?: string;
  method: string;
  path: string;
  ip: string;
  userAgent: string;
}

/**
 * Create a child logger with request context
 */
export function createRequestLogger(logger: LoggerService, context: RequestContext): LoggerService {
  const childLogger = new LoggerService();
  childLogger.setContext(`Request:${context.requestId.slice(0, 8)}`);
  return childLogger;
}
