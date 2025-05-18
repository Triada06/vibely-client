// routes/UniversalRoutes.tsx
import { RouteObject } from "react-router-dom";
import { AppRoutes } from "./AppRoutes";
import { AdminRoutes } from "./AdminRoutes";
import LoginPage from "../pages/LoginPage";
import RedirectIfAuth from "../guards/RedirectIfAuth";
import NotFoundPage from "../pages/errorPages/NotFound";
import SignUpPage from "../pages/SignUpPage";

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
  {
    path: "/signup",
    element: (
      <RedirectIfAuth>
        <SignUpPage />
      </RedirectIfAuth>
    ),
  },
  //main app routes
  AppRoutes,
  AdminRoutes,
  //for any other routes
  {
    path: "*",
    element: <NotFoundPage />,
  },
];
