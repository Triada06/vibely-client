import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
}
