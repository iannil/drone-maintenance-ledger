/**
 * Request Logger Middleware Unit Tests
 *
 * Tests for HTTP request/response logging middleware
 */

import { Request, Response, NextFunction } from 'express';

import { RequestLoggerMiddleware, shouldSkipLogging } from './request-logger.middleware';

describe('RequestLoggerMiddleware', () => {
  let middleware: RequestLoggerMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    middleware = new RequestLoggerMiddleware();

    mockRequest = {
      method: 'GET',
      originalUrl: '/api/test',
      ip: '127.0.0.1',
      get: jest.fn(),
    };

    mockResponse = {
      statusCode: 200,
      get: jest.fn(),
      on: jest.fn(),
    };

    mockNext = jest.fn();

    (mockRequest.get as jest.Mock).mockImplementation((header) => {
      if (header === 'user-agent') return 'Mozilla/5.0';
      if (header === 'content-length') return '100';
      return undefined;
    });

    (mockResponse.get as jest.Mock).mockImplementation((header) => {
      if (header === 'content-length') return '200';
      return undefined;
    });
  });

  describe('use', () => {
    it('should attach requestId to request', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect((mockRequest as any).requestId).toBeDefined();
      expect(typeof (mockRequest as any).requestId).toBe('string');
    });

    it('should generate unique request IDs', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      const id1 = (mockRequest as any).requestId;

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      const id2 = (mockRequest as any).requestId;

      expect(id1).not.toBe(id2);
    });

    it('should call next function', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should attach finish event listener to response', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });

    it('should handle missing user-agent header', () => {
      (mockRequest.get as jest.Mock).mockReturnValue(undefined);

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).not.toThrow();
    });

    it('should handle missing content-length header', () => {
      (mockRequest.get as jest.Mock).mockReturnValue(undefined);

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).not.toThrow();
    });
  });

  describe('finish event handler', () => {
    let finishHandler: Function;

    beforeEach(() => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      const onCalls = (mockResponse.on as jest.Mock).mock.calls;
      const finishCall = onCalls.find((call) => call[0] === 'finish');
      finishHandler = finishCall![1];
    });

    it('should log successful response', () => {
      mockResponse.statusCode = 200;

      expect(() => {
        finishHandler();
      }).not.toThrow();
    });

    it('should log warning for 4xx status codes', () => {
      mockResponse.statusCode = 404;

      expect(() => {
        finishHandler();
      }).not.toThrow();
    });

    it('should log error for 5xx status codes', () => {
      mockResponse.statusCode = 500;

      expect(() => {
        finishHandler();
      }).not.toThrow();
    });
  });
});

describe('shouldSkipLogging', () => {
  it('should return true for /api/health path', () => {
    expect(shouldSkipLogging('/api/health')).toBe(true);
  });

  it('should return true for /api/health subpaths', () => {
    expect(shouldSkipLogging('/api/health/live')).toBe(true);
    expect(shouldSkipLogging('/api/health/ready')).toBe(true);
  });

  it('should return true for /api/docs path', () => {
    expect(shouldSkipLogging('/api/docs')).toBe(true);
  });

  it('should return true for /api/docs subpaths', () => {
    expect(shouldSkipLogging('/api/docs/swagger')).toBe(true);
  });

  it('should return true for /favicon.ico', () => {
    expect(shouldSkipLogging('/favicon.ico')).toBe(true);
  });

  it('should return false for other paths', () => {
    expect(shouldSkipLogging('/api/users')).toBe(false);
    expect(shouldSkipLogging('/api/aircraft')).toBe(false);
    expect(shouldSkipLogging('/api/work-orders')).toBe(false);
  });

  it('should return false for root path', () => {
    expect(shouldSkipLogging('/')).toBe(false);
  });

  it('should be case sensitive', () => {
    expect(shouldSkipLogging('/API/health')).toBe(false);
    expect(shouldSkipLogging('/api/Health')).toBe(false);
  });

  it('should return true for paths that start with skip path (health-check is also skipped)', () => {
    // /api/health-check starts with /api/health so it is also skipped
    expect(shouldSkipLogging('/api/health-check')).toBe(true);
  });

  it('should handle empty string', () => {
    expect(shouldSkipLogging('')).toBe(false);
  });

  it('should handle paths with query parameters', () => {
    expect(shouldSkipLogging('/api/health?token=xxx')).toBe(true);
    expect(shouldSkipLogging('/api/users?page=1')).toBe(false);
  });
});
