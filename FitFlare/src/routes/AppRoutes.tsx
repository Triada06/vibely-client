// routes/AppRoutes.tsx
import AppLayout from "../Layouts/AppLayout";
import RequireAuth from "../guards/ReqiureAuth";
import ExplorePage from "../pages/ExplorePage";
import HomePage from "../pages/HomePage";
import MessagesPage from "../pages/MessagesPage";
import NotificationsPage from "../pages/NotificationsPage";
import ProfileEditPage from "../pages/ProfileEditPage";
import ProfilePage from "../pages/ProfilePage";
import SearchPage from "../pages/SearchPage";
import SettingsPage from "../pages/SettingsPage";
import UploadpostPage from "../pages/UploadPostPage";
import UserProfilePage from "../pages/UserProfilePage";

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
    { path: "profile/settings", element: <SettingsPage /> },
    { path: "uploadpost", element: <UploadpostPage /> },
    { path: "profile/edit", element: <ProfileEditPage /> },
    { path: "explore", element: <ExplorePage /> },
    { path: "messages", element: <MessagesPage /> },
    { path: "search", element: <SearchPage /> },
    {path: "notifications", element: <NotificationsPage />},
    { path: "user/:id", element: <UserProfilePage /> },
  ],
};
