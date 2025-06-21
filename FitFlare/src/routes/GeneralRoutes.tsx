// routes/UniversalRoutes.tsx
import { RouteObject } from "react-router-dom";
import { AppRoutes } from "./AppRoutes";
import { AdminRoutes } from "./AdminRoutes";
import LoginPage from "../pages/LoginPage";
import RedirectIfAuth from "../guards/RedirectIfAuth";
import NotFoundPage from "../pages/errorPages/NotFound";
import SignUpPage from "../pages/SignUpPage";
import EmailConfirmedPage from "../pages/EmailConfirmedPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import ConfirmOwnerTransferPage from "../pages/ConfirmOwnerTransferPage";

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
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/confirm-email",
    element: <EmailConfirmedPage />,
  },
  {
    path: "/confirm-owner",
    element: <ConfirmOwnerTransferPage />,
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
