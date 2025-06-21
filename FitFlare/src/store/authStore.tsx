import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

interface AuthStore {
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: string | null;
  userId: string | null;
  setToken: (token: string) => void;
  logout: () => void;
  checkAuth: () => void;
  initAuth: () => void;
}

type JwtPayload = {
  sub: string;
  email?: string;
  role?: string | string[];
  exp: number;
  [key: string]: any;
};

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  isAuthenticated: false,
  isLoading: true,
  role: null,
  userId: null,

  setToken: (token: string) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode<JwtPayload>(token);

    const decodedRole =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      decoded.role;

    let role: string | null = null;
    if (Array.isArray(decodedRole)) {
      if (decodedRole.includes("Owner")) {
        role = "Owner";
      } else if (decodedRole.includes("Admin")) {
        role = "Admin";
      } else {
        role = decodedRole[0] ?? null;
      }
    } else if (typeof decodedRole === "string") {
      role = decodedRole;
    }
    set({ token, role, userId: decoded.sub, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, isAuthenticated: false, role: null, userId: null });
  },

  checkAuth: () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({
        isAuthenticated: false,
        isLoading: false,
        role: null,
        userId: null,
      });
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const exp = decoded.exp * 1000;
      const decodedRole =
        decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] ?? decoded.role;
      let role: string | null = null;
      if (Array.isArray(decodedRole)) {
        if (decodedRole.includes("Owner")) {
          role = "Owner";
        } else if (decodedRole.includes("Admin")) {
          role = "Admin";
        } else {
          role = decodedRole[0] ?? null;
        }
      } else if (typeof decodedRole === "string") {
        role = decodedRole;
      }
      if (Date.now() < exp) {
        set({
          token,
          isAuthenticated: true,
          isLoading: false,
          role,
          userId: decoded.sub,
        });
      } else {
        localStorage.removeItem("token");
        set({
          isAuthenticated: false,
          isLoading: false,
          role: null,
          userId: null,
        });
      }
    } catch {
      localStorage.removeItem("token");
      set({
        isAuthenticated: false,
        isLoading: false,
        role: null,
        userId: null,
      });
    }
  },
  initAuth: () => {
    const stored = localStorage.getItem("token");
    set({ token: stored, isLoading: false });
  },
}));
