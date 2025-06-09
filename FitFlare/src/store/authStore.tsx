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
    const decoded = jwtDecode<JwtPayload>(token);
    const role =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      decoded.role ??
      null;

    localStorage.setItem("token", token);

    set({ token, role, userId: decoded.sub });
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
      const role = Array.isArray(decoded.role) ? decoded.role[0] : decoded.role;

      if (Date.now() < exp) {
        set({
          token,
          isAuthenticated: true,
          isLoading: false,
          role,
          userId: decoded.sub,
        });
      } else {
        set({
          isAuthenticated: false,
          isLoading: false,
          role: null,
          userId: null,
        });
      }
    } catch {
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
