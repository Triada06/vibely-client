// routes/AppRoutes.tsx
import AppLayout from "../Layouts/AppLayout";
import RequireAuth from "../guards/ReqiureAuth";
import HomePage from "../pages/HomePage";
import ProfileEditPage from "../pages/ProfileEditPage";
import ProfilePage from "../pages/ProfilePage";
import UploadpostPage from "../pages/UploadPostPage";

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
    { path: "uploadpost", element: <UploadpostPage /> },
    {path: "profile/edit", element: <ProfileEditPage />},
  ],
};
