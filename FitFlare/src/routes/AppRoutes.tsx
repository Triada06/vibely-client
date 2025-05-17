// routes/AppRoutes.tsx
import AppLayout from "../Layouts/AppLayout";
import RequireAuth from "../guards/ReqiureAuth";
import HomePage from "../pages/HomePage";
import ProfilePage from "../pages/ProfilePage";

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
  ],
};
