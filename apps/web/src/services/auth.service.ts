import { api } from "./api";
import type { User } from "../stores/auth.store";

/**
 * Authentication service
 *
 * Handles authentication API calls
 */
export const authService = {
  /**
   * Login with username and password
   */
  async login(username: string, password: string) {
    return api.post<{ accessToken: string; user: User }>("/auth/login", {
      username,
      password,
    });
  },

  /**
   * Get current user profile
   */
  async getProfile() {
    return api.get<User>("/auth/profile");
  },

  /**
   * Logout (client-side only, tokens are removed)
   */
  logout() {
    localStorage.removeItem("accessToken");
  },
};
