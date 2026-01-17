/**
 * Jest test setup file
 *
 * This file runs before each test file and sets up the test environment
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DATABASE_URL = ':memory:';

// Export empty object to make this a module
export {};
