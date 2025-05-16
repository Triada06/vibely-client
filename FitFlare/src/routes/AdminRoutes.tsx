import AdminLayout from "../admin/layout/AdminLayout";
import AppUsers from "../admin/pages/AppUsers";
import DashBoard from "../admin/pages/DashBoard";
import RequireAuth from "../guards/ReqiureAuth";
import NotFoundPage from "../pages/NotFound";

export const AdminRoutes = {
  path: "/",
  element: (
    <RequireAuth>
      <AdminLayout />
    </RequireAuth>
  ),

  children: [
    { path: "/admin", index: true, element: <DashBoard /> },
    {
      path: "/admin/appusers",
      element: <AppUsers />,
    },
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ],
};
