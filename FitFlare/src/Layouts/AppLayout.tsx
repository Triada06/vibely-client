import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useProfileStore } from "../store/profileStore";
import { useEffect } from "react";

export default function AppLayout() {
  const { profile, fetchUser } = useProfileStore();

  useEffect(() => {
    fetchUser();
  }, []);

  const profilePictureUri: string | undefined = profile?.profilePictureUri;

  return (
    <div className="h-full bg-[#F5F7FA] dark:bg-[#1C1C1E]">
      <Sidebar profilePicUri={profilePictureUri} />
      <Outlet />
      <Footer profilePicUri={profilePictureUri} />
    </div>
  );
}
