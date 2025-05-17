import { useEffect } from "react";
import { useLocation, useRoutes } from "react-router-dom";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { appTheme } from "../constants/themes";
import { GeneralRoutes } from "../routes/GeneralRoutes";
import { ThemeProvider as AdminThemeProvider } from "../admin/context/ThemeContext";
import { useAuthStore } from "../store/authStore";

export const ThemeWrapper = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  useEffect(() => {
    useAuthStore.getState().initAuth();
  }, []);

  const routing = useRoutes(GeneralRoutes);

  return isAdmin ? (
    <AdminThemeProvider>{routing}</AdminThemeProvider>
  ) : (
    <StyledThemeProvider theme={appTheme}>{routing}</StyledThemeProvider>
  );
};
