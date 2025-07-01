import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MoreDotIcon } from "../admin/icons";
import { useEffect, useRef, useState } from "react";
import {
  faSun,
  faMoon,
  faGear,
  faRightFromBracket,
  faHouseChimney,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCompass,
  faMessage,
  faSquarePlus,
} from "@fortawesome/free-regular-svg-icons";
import NotificationDropdown from "../components/NotificationDropdown";

import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";

export default function Sidebar({ profilePicUri }: { profilePicUri?: string }) {
  const [visible, setVisible] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState("light");
  const { notifications, fetchNotifications } = useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const location = useLocation();
  const isMessagesPage = location.pathname.startsWith("/messages");
  const [isHovered, setIsHovered] = useState(false);

  const sidebarWidth = isMessagesPage && !isHovered ? 80 : 288;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored) setTheme(stored);
    document.documentElement.classList.toggle("dark", stored === "dark");
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleLogOut = () => {
    useAuthStore.getState().logout();
  };

  return (
    <>
      <motion.aside
        className="hidden md:flex fixed h-full flex-col bg-[#F5F7FA] dark:bg-[#2A2A2D] shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-r-2xl z-30"
        style={{ width: sidebarWidth }}
        initial={{ width: 288 }}
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`icon size-10 flex items-center ${
            isMessagesPage && !isHovered
              ? "justify-center w-full"
              : "justify-start w-10/12 m-4"
          }`}
        >
          <Link
            to="/"
            className={`size-10 flex items-center ${
              isMessagesPage && !isHovered
                ? "justify-center w-full"
                : "justify-start w-10/12"
            }`}
          >
            {!(isMessagesPage && !isHovered) && (
              <>
                <img
                  className="size-14"
                  src="/icon.svg"
                  alt="logo"
                  draggable="false"
                />
                <span className="prevent-select text-[#2E2E2E] dark:text-[#EAEAEA] text-2xl ml-2">
                  Vibely
                </span>
              </>
            )}
          </Link>
        </div>
        {!(isMessagesPage && !isHovered) && (
          <div className="flex items-start m-3 border-b border-[#D3D3D3] text-xl text-[#2E2E2E] dark:border-[#3C3C3F] dark:text-[#EAEAEA]">
            <h6>Menu</h6>
          </div>
        )}
        <nav className="flex-grow prevent-select">
          <ul className="flex flex-col justify-start w-full">
            {/* Sidebar Items */}
            {[
              { to: "/", icon: faHouseChimney, label: "Home" },
              { to: "/explore", icon: faCompass, label: "Explore" },
              { to: "/search", icon: faMagnifyingGlass, label: "Search" },
              { to: "/messages", icon: faMessage, label: "Messages" },
              {
                to: "/notifications",
                icon: faBell,
                label: "Notifications",
                badge: unreadCount,
              },
              { to: "/uploadpost", icon: faSquarePlus, label: "Create" },
              { to: "/profile", icon: null, label: "Profile", isProfile: true },
            ].map((item, idx) => (
              <li className="m-2" key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive, isPending }) =>
                    `transition-all flex items-center h-10 text-xl rounded-xl duration-300 ease-in-out ${
                      isActive
                        ? "dark:text-[#4DD0E1] hover:bg-[#4B3F72] dark:hover:bg-[#B794F4] text-[#E07A5F] dark:hover:text-[#2A2A2D] hover:text-[#EAF2EF]"
                        : "dark:text-[#EAEAEA] hover:bg-[#4B3F72] dark:hover:bg-[#B794F4] hover:text-[#EAF2EF] dark:hover:text-[#2A2A2D] text-[#2E2E2E]"
                    } ${
                      isMessagesPage && !isHovered
                        ? "justify-center"
                        : "text-start"
                    }`
                  }
                  title={isMessagesPage && !isHovered ? item.label : undefined}
                  style={{ position: "relative" }}
                >
                  {item.isProfile ? (
                    <img
                      className={`size-7 rounded-full mr-2 ml-2 transition-all duration-300 ${
                        isMessagesPage && !isHovered ? "mx-auto" : ""
                      }`}
                      src={profilePicUri ?? "/default-profile-picture.jpg"}
                      alt="profilePic"
                    />
                  ) : (
                    <span className="relative">
                      {item.icon && (
                        <FontAwesomeIcon
                          icon={item.icon}
                          className="mr-2 ml-2"
                          size="lg"
                        />
                      )}
                      {/* Notification badge in collapsed mode */}
                      {item.label === "Notifications" &&
                        typeof item.badge === "number" &&
                        item.badge > 0 &&
                        isMessagesPage &&
                        !isHovered && (
                          <span
                            className="absolute -top-1 -right-1 w-4 h-4 bg-[#E07A5F] dark:bg-[#4DD0E1] text-white text-xs flex items-center justify-center rounded-full border-2 border-none"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {item.badge}
                          </span>
                        )}
                    </span>
                  )}
                  {/* Only show label and badge if expanded */}
                  {!(isMessagesPage && !isHovered) && (
                    <>
                      {item.label}
                      {/* Only show badge if badge > 0 and label is Notifications */}
                      {item.label === "Notifications" &&
                        typeof item.badge === "number" &&
                        item.badge > 0 && (
                          <span className="ml-2 w-5 h-5 bg-[#E07A5F] dark:bg-[#4DD0E1] rounded-full text-white text-xs flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        {/* More/Settings Section */}
        <section
          className={`relative prevent-select w-full mt-auto mb-4 p-2 ${
            isMessagesPage && !isHovered ? "flex justify-center" : ""
          }`}
        >
          <div
            ref={buttonRef}
            onClick={() => setVisible(!visible)}
            className={`w-full hover:cursor-pointer dark:text-[#EAEAEA] h-10 flex items-center ${
              isMessagesPage && !isHovered ? "justify-center" : "justify-start"
            } dark:hover:bg-[#B794F4] dark:hover:text-[#2A2A2D] text-[#2E2E2E] transition-all hover:rounded-xl duration-300 ease-in-out hover:bg-[#4B3F72] hover:text-[#EAF2EF]`}
            title={isMessagesPage && !isHovered ? "More" : undefined}
          >
            <MoreDotIcon className="text-2xl mr-2 size-7" />
            {!(isMessagesPage && !isHovered) && (
              <h6 className="text-xl">More</h6>
            )}
          </div>
          <AnimatePresence>
            {visible && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="absolute left-0 bottom-full ml-2 mb-2 z-50 rounded-xl w-[110%] dark:shadow-[0_4px_20px_rgba(255,255,255,0.1)] shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-white dark:bg-[#1C1C1E] text-[#2E2E2E] dark:text-[#EAEAEA]"
              >
                <ul className="m-4">
                  <li>
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center px-4 py-2 text-lg transition-all duration-300 rounded-xl hover:bg-[#4B3F72] hover:text-[#EAF2EF] dark:hover:bg-[#B794F4] dark:hover:text-[#2A2A2D]"
                    >
                      <FontAwesomeIcon
                        className="mr-2"
                        icon={theme === "dark" ? faSun : faMoon}
                      />
                      Switch appearance
                    </button>
                  </li>
                  <li>
                    <NavLink
                      to="profile/settings"
                      onClick={() => setVisible(false)}
                      className="flex items-center px-4 py-2 text-lg transition-all duration-300 rounded-xl w-full hover:bg-[#4B3F72] hover:text-[#EAF2EF] dark:hover:bg-[#B794F4] dark:hover:text-[#2A2A2D]"
                    >
                      <FontAwesomeIcon className="mr-2" icon={faGear} />
                      Settings
                    </NavLink>
                  </li>
                  <li className="border-t mt-2 border-[#D3D3D3] text-xl text-[#2E2E2E] dark:border-[#3C3C3F] dark:text-[#EAEAEA]">
                    <button
                      onClick={handleLogOut}
                      className="w-full flex items-center px-4 py-2 text-lg transition-all duration-300 rounded-xl hover:bg-[#4B3F72] hover:text-[#EAF2EF] dark:hover:bg-[#B794F4] dark:hover:text-[#2A2A2D]"
                    >
                      <FontAwesomeIcon
                        className="mr-2 prevent-select"
                        icon={faRightFromBracket}
                      />
                      Log out
                    </button>
                  </li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </motion.aside>
    </>
  );
}
