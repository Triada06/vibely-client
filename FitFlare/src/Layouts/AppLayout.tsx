import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function AppLayout() {
  return (
    <div className="dark:bg-[#893168]">
      <Header />
      <Sidebar/>

      {/* This where your pages like Dashboard, Settings, etc. show up */}
      <Outlet />

      <Footer/>
    </div>
  );
}
