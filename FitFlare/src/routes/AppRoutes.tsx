import HomePage from "../pages/HomePage";
import BadRequestPage from "../pages/BadRequestPage";
import AppLayout from "../Layouts/AppLayout";
export const AppRoutes = {
  path: "/",
  element: <AppLayout />,
  children: [
    { index: true, element: <HomePage /> },
  ],
  errorElement: <BadRequestPage />,
};
