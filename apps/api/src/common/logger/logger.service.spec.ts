/**
 * LoggerService Unit Tests
 *
 * Tests for structured logging service
 */

import { Test, TestingModule } from '@nestjs/testing';

import { LoggerService, createRequestLogger, RequestContext } from './logger.service';

// Mock console methods to avoid cluttering test output
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(() => {
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  describe('log levels', () => {
    it('should log messages', () => {
      service.log('Test log message');

      expect(console.log).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      service.error('Test error message');

      expect(console.log).toHaveBeenCalled();
    });

    it('should log warning messages', () => {
      service.warn('Test warning message');

      expect(console.log).toHaveBeenCalled();
    });

    it('should log fatal messages', () => {
      service.fatal('Test fatal message');

      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('debug and verbose', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should log debug messages in development', () => {
      process.env.NODE_ENV = 'development';
      const debugService = new LoggerService();

      debugService.debug('Debug message');

      expect(console.log).toHaveBeenCalled();
    });

    it('should not log debug messages in production', () => {
      process.env.NODE_ENV = 'production';
      const prodService = new LoggerService();

      prodService.debug('Debug message');

      expect(console.log).not.toHaveBeenCalled();
    });

    it('should log verbose messages in development', () => {
      process.env.NODE_ENV = 'development';
      const verboseService = new LoggerService();

      verboseService.verbose('Verbose message');

      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('context', () => {
    it('should set and use context', () => {
      service.setContext('TestContext');

      service.log('Message with context');

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[TestContext]')
      );
    });
  });

  describe('message formatting', () => {
    it('should log string messages as-is', () => {
      service.log('String message');

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('String message')
      );
    });

    it('should format error messages', () => {
      const error = new Error('Test error');
      service.error(error);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Test error')
      );
    });

    it('should format objects as JSON', () => {
      const obj = { key: 'value' };
      service.log(obj);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('{"key":"value"}')
      );
    });
  });

  describe('optional parameters', () => {
    it('should extract context from last param', () => {
      service.log('Message', {}, 'ExtractedContext');

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[ExtractedContext]')
      );
    });

    it('should include metadata when provided', () => {
      const metadata = { userId: 'user-123', requestId: 'req-123' };
      service.log('Message', metadata);

      // Metadata should trigger a second console.log call
      expect(console.log).toHaveBeenCalledTimes(2);
    });
  });

  describe('createRequestLogger', () => {
    it('should create child logger with request context', () => {
      const context: RequestContext = {
        requestId: 'req-123456789',
        userId: 'user-123',
        method: 'GET',
        path: '/api/test',
        ip: '127.0.0.1',
        userAgent: 'TestAgent',
      };

      const requestLogger = createRequestLogger(service, context);

      expect(requestLogger).toBeInstanceOf(LoggerService);
    });
  });
});
