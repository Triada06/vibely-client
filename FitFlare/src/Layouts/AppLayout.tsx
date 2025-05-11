import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function AppLayout() {
  return (
    <div className="h-dvh bg-[#F5F7FA] dark:bg-[#1C1C1E]">
      <Sidebar/>

      {/* This where your pages like Dashboard, Settings, etc. show up */}
      <Outlet />

      <Footer/>
    </div>
  );
}
