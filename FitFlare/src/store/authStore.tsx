import { create } from "zustand";

interface AuthStore {
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
  checkAuth: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const token = localStorage.getItem("token");
    set((state) => {
      if (state.token !== token || !state.isAuthenticated) {
        return { token, isAuthenticated: !!token };
      }
      return {};
    });
  },
  initAuth: () => {
    const stored = localStorage.getItem("token");
    set({ token: stored, isLoading: false });
  },
}));
