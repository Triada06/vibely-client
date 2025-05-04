import { useLocation, Routes } from "react-router-dom";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { appTheme } from "../constants/themes";
import { AppRoutes } from "../routes/AppRoutes";
import { AdminRoutes } from "../routes/AdminRoutes";
import { convertRouteObjectToJSX } from "../helpers/convertToRoutes";
import { ThemeProvider as AdminThemeProvider } from "../admin/context/ThemeContext";


export const ThemeWrapper = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

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
