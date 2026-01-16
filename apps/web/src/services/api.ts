/**
 * API service
 *
 * Handles HTTP requests to the backend API
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/**
 * API request options
 */
interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
  skipAuthRedirect?: boolean;
}

/**
 * API Error class with status code
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Error event listeners for global error handling
 */
type ErrorListener = (error: ApiError) => void;
const errorListeners: ErrorListener[] = [];

export function onApiError(listener: ErrorListener): () => void {
  errorListeners.push(listener);
  return () => {
    const index = errorListeners.indexOf(listener);
    if (index > -1) errorListeners.splice(index, 1);
  };
}

function notifyError(error: ApiError): void {
  errorListeners.forEach((listener) => listener(error));
}

/**
 * Base API client
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, skipAuthRedirect, ...restOptions } = options;

  // Build URL with query params
  let url = `${API_URL}${endpoint}`;
  if (params) {
    const filteredParams = Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== "",
    );
    if (filteredParams.length > 0) {
      const searchParams = new URLSearchParams(
        filteredParams.map(([k, v]) => [k, String(v)]),
      );
      url += `?${searchParams}`;
    }
  }

  // Get auth token
  const token = localStorage.getItem("accessToken");

  // Make request
  const response = await fetch(url, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...restOptions.headers,
    },
  });

  // Handle errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Network error" }));
    const error = new ApiError(
      errorData.message || "Request failed",
      response.status,
      errorData.code,
    );

    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401 && !skipAuthRedirect) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
      throw error;
    }

    // Notify global error listeners
    notifyError(error);
    throw error;
  }

  // Handle empty response (204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * API service object
 */
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};
