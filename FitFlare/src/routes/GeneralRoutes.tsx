// routes/UniversalRoutes.tsx
import { Navigate, RouteObject } from "react-router-dom";
import { AppRoutes } from "./AppRoutes";
import { AdminRoutes } from "./AdminRoutes";
import LoginPage from "../pages/AuthPage";
import NotFound from "../pages/errorPages/NotFound";
import RedirectIfAuth from "../guards/RedirectIfAuth";
import { convertRouteObjectToJSX } from "../helpers/convertToRoutes";
import NotFoundPage from "../pages/errorPages/NotFound";

export const GeneralRoutes: RouteObject[] = [
  //login page first since it's a raw page 
  {
    path: "/login",
    element: (
      <RedirectIfAuth>
        <LoginPage />
      </RedirectIfAuth>
    ),
  },
  // main app routes
  AppRoutes,
  AdminRoutes,
  //for any other routes
  {
    path: "*",
    element: <NotFoundPage/>
  },
];
