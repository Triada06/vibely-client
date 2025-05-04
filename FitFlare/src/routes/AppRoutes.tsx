import HomePage from "../pages/HomePage";
import BadRequestPage from "../pages/BadRequestPage";
import AppLayout from "../Layouts/AppLayout";
import ProfilePage from "../pages/ProfilePage";
export const AppRoutes = {
  path: "/",
  element: <AppLayout />,
  children: [
    { index: true, element: <HomePage /> },
    { path: "/profile", element: <ProfilePage /> },
  ],
  errorElement: <BadRequestPage />,
};
