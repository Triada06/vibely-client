import AdminLayout from "../admin/layout/AdminLayout";
import AppUsers from "../admin/pages/AppUsers";
import DashBoard from "../admin/pages/DashBoard";
import BadRequestPage from "../pages/BadRequestPage";

export const AdminRoutes = {
  path: "/admin",
  element: <AdminLayout />,
  children: [
    { index: true, element: <DashBoard /> },
    {
      path: "/admin/appusers",
      element: <AppUsers />,
    },
  ],
  errorElement: <BadRequestPage />,
};
