import AdminLayout from "../admin/layout/AdminLayout";
import AppUsers from "../admin/pages/AppUsers";
import DashBoard from "../admin/pages/DashBoard";
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
  ],
};
