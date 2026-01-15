import { makeAutoObservable } from "mobx";

/**
 * User roles enum (matches backend)
 */
export enum UserRole {
  PILOT = "PILOT",
  MECHANIC = "MECHANIC",
  INSPECTOR = "INSPECTOR",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
}

/**
 * User interface
 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName: string | null;
}

/**
 * Authentication store
 *
 * Manages user authentication state using MobX
 */
export class AuthStore {
  accessToken: string | null = localStorage.getItem("accessToken");
  user: User | null = null;
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  }

  setUser(user: User | null) {
    this.user = user;
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  logout() {
    this.setAccessToken(null);
    this.setUser(null);
  }

  get isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  get hasRole(): (role: UserRole) => boolean {
    return (role: UserRole) => this.user?.role === role;
  }

  get hasAnyRole(): (...roles: UserRole[]) => boolean {
    return (...roles: UserRole[]) => !!this.user && roles.includes(this.user.role);
  }
}

/**
 * Auth store instance
 */
export const authStore = new AuthStore();
