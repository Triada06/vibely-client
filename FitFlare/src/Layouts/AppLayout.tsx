import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function AppLayout() {
  return (
    <div className="h-full bg-[#F5F7FA] dark:bg-[#1C1C1E]">
      <Sidebar />
      <Outlet />
      <Footer />
    </div>
  );
}
