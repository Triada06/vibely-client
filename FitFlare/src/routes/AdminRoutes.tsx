import AdminLayout from "../admin/layout/AdminLayout";
import AdminsPage from "../admin/pages/AdminsPage";
import AppUsers from "../admin/pages/AppUsers";
import DashBoard from "../admin/pages/DashBoard";
import UserSinglePage from "../admin/pages/UserSingle";
import RequireAuth from "../guards/ReqiureAuth";

export const AdminRoutes = {
  path: "/admin",
  element: (
    <RequireAuth adminOnly={true}>
      <AdminLayout />
    </RequireAuth>
  ),

  children: [
    { index: true, element: <DashBoard /> },
    {
      path: "appusers",
      element: <AppUsers />,
    },
    {
      path: "appusers/:id",
      element: <UserSinglePage />,
    },
    {
      path: "admins",
      element: (
        <RequireAuth ownerOnly={true}>
          <AdminsPage />
        </RequireAuth>
      ),
    },
  ],
};
