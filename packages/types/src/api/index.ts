/**
 * API types
 *
 * Request/response types for API communication
 */

/**
 * Login request
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  accessToken: string;
  user: UserDto;
}

/**
 * User DTO (Data Transfer Object)
 */
export interface UserDto {
  id: string;
  username: string;
  email: string;
  role: string;
  fullName: string | null;
}

/**
 * API error response
 */
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
