/**
 * Global Exception Filter Unit Tests
 *
 * Tests for standardized error response formatting
 */

import { HttpException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';

import { GlobalExceptionFilter, ErrorResponse } from './http-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();

    mockRequest = {
      url: '/api/test',
      method: 'GET',
      ip: '127.0.0.1',
      get: jest.fn((header) => {
        if (header === 'user-agent') return 'Mozilla/5.0';
        return undefined;
      }),
      user: { id: 'user-123' },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockArgumentsHost = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
        getNext: () => ({}) as any,
      }),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as any;
  });

  describe('catch', () => {
    it('should handle HttpException with string response', () => {
      const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'NOT_FOUND',
          message: 'Not found',
          statusCode: 404,
          path: '/api/test',
        })
      );
    });

    it('should handle HttpException with object response', () => {
      const exception = new HttpException(
        {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: ['Email is required', 'Password is too short'],
        },
        HttpStatus.BAD_REQUEST
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          statusCode: 400,
          details: ['Email is required', 'Password is too short'],
        })
      );
    });

    it('should handle HttpException with array message (class-validator errors)', () => {
      const exception = new HttpException(
        {
          message: ['Email is required', 'Password is too short'],
        },
        HttpStatus.BAD_REQUEST
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'VALIDATION_ERROR',
          message: 'Email is required',
          details: ['Email is required', 'Password is too short'],
        })
      );
    });

    it('should handle generic HttpException without custom response', () => {
      const exception = new HttpException('An error occurred', HttpStatus.INTERNAL_SERVER_ERROR);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred',
          statusCode: 500,
        })
      );
    });

    it('should handle non-HTTP exceptions (unknown errors)', () => {
      const exception = new Error('Database connection failed');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR',
          statusCode: 500,
        })
      );
    });

    it('should handle unknown non-Error exceptions', () => {
      const exception = 'Something went wrong';

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        })
      );
    });

    it('should include timestamp in all error responses', () => {
      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);
      filter.catch(exception, mockArgumentsHost);

      const responseArg = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseArg).toHaveProperty('timestamp');
      expect(responseArg.timestamp).toBeDefined();
    });

    it('should include path in all error responses', () => {
      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);
      filter.catch(exception, mockArgumentsHost);

      const responseArg = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseArg).toHaveProperty('path');
      expect(responseArg.path).toBe('/api/test');
    });

    it('should include details when provided in exception', () => {
      const exception = new HttpException(
        {
          message: 'Error',
          details: { field: 'email', error: 'invalid' },
        },
        HttpStatus.BAD_REQUEST
      );

      filter.catch(exception, mockArgumentsHost);

      const responseArg = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseArg).toHaveProperty('details');
      expect(responseArg.details).toEqual({ field: 'email', error: 'invalid' });
    });
  });

  describe('ErrorResponse interface', () => {
    it('should have correct structure', () => {
      const errorResponse: ErrorResponse = {
        code: 'TEST_ERROR',
        message: 'Test error message',
        timestamp: new Date().toISOString(),
        path: '/api/test',
        statusCode: 400,
      };

      expect(errorResponse.code).toBeDefined();
      expect(errorResponse.message).toBeDefined();
      expect(errorResponse.timestamp).toBeDefined();
      expect(errorResponse.path).toBeDefined();
      expect(errorResponse.statusCode).toBeDefined();
    });

    it('should allow optional details', () => {
      const errorResponse: ErrorResponse = {
        code: 'TEST_ERROR',
        message: 'Test error message',
        timestamp: new Date().toISOString(),
        path: '/api/test',
        statusCode: 400,
        details: { field: 'email', error: 'invalid' },
      };

      expect(errorResponse.details).toBeDefined();
      expect(errorResponse.details).toEqual({ field: 'email', error: 'invalid' });
    });

    it('should allow optional stack', () => {
      const errorResponse: ErrorResponse = {
        code: 'TEST_ERROR',
        message: 'Test error message',
        timestamp: new Date().toISOString(),
        path: '/api/test',
        statusCode: 400,
        stack: 'Error: Test\n    at test.js:10:15',
      };

      expect(errorResponse.stack).toBeDefined();
    });
  });

  describe('backward compatibility export', () => {
    it('should export HttpExceptionFilter as alias for GlobalExceptionFilter', () => {
      const importStatement = require('./http-exception.filter');
      expect(importStatement.HttpExceptionFilter).toBeDefined();
    });
  });
});
