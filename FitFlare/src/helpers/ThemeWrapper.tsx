// ThemeWrapper.tsx
import { useLocation, Routes, Route } from "react-router-dom";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { appTheme } from "../constants/themes";
import { AppRoutes } from "../routes/AppRoutes";
import { AdminRoutes } from "../routes/AdminRoutes";
import { convertRouteObjectToJSX } from "../helpers/convertToRoutes";
import { ThemeProvider as AdminThemeProvider } from "../admin/context/ThemeContext";
import LoginPage from "../pages/AuthPage";
import RedirectIfAuth from "../guards/RedirectIfAuth";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export const ThemeWrapper = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  useEffect(() => {
    useAuthStore.getState().initAuth();
  }, []);

  // if it's /login, show login page raw
  if (location.pathname === "/login") {
    return (
      <RedirectIfAuth>
        <LoginPage />
      </RedirectIfAuth>
    );
  }

  const adminRoutes = convertRouteObjectToJSX(AdminRoutes);
  const appRoutes = convertRouteObjectToJSX(AppRoutes);

  return isAdmin ? (
    <AdminThemeProvider>
      <Routes>{adminRoutes}</Routes>
    </AdminThemeProvider>
  ) : (
    <StyledThemeProvider theme={appTheme}>
      <Routes>{appRoutes}</Routes>
    </StyledThemeProvider>
  );
};
