// routes/AppRoutes.tsx
import AppLayout from "../Layouts/AppLayout";
import RequireAuth from "../guards/ReqiureAuth";
import HomePage from "../pages/HomePage";
import ProfilePage from "../pages/ProfilePage";
import NotFound from "../pages/NotFound";

export const AppRoutes = {
  path: "/",
  element: (
    <RequireAuth>
      <AppLayout />
    </RequireAuth>
  ),
  children: [
    { index: true, element: <HomePage /> },
    { path: "profile", element: <ProfilePage /> },
    { path: "*", element: <NotFound /> },
  ],
};
