import HomePage from "../pages/HomePage";
import NotFoundPage from "../pages/NotFound";
import AppLayout from "../Layouts/AppLayout";
import ProfilePage from "../pages/ProfilePage";
export const AppRoutes = {
  path: "/",
  element: <AppLayout />,
  children: [
    { index: true, element: <HomePage /> },
    { path: "/profile", element: <ProfilePage /> },
    { path: "*", element: <NotFoundPage /> }
  ],
  errorElement: <NotFoundPage />,
};
