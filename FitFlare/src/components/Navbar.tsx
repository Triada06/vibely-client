import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faSearch,
  faPlusSquare,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import NotificationDropdown from "./NotificationDropdown";

export default function Navbar() {
  const { token, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!token) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:left-0 md:top-0 md:bottom-0 md:w-20 bg-white dark:bg-[#262626] border-t md:border-t-0 md:border-r border-gray-200 dark:border-gray-800 z-50">
      <div className="flex md:flex-col items-center justify-around md:justify-start md:gap-8 h-16 md:h-screen py-4 md:py-8">
        <Link
          to="/"
          className="text-2xl text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={faHome} />
        </Link>

        <Link
          to="/search"
          className="text-2xl text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={faSearch} />
        </Link>

        <Link
          to="/create"
          className="text-2xl text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={faPlusSquare} />
        </Link>

        <NotificationDropdown />

        <Link
          to="/profile"
          className="text-2xl text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={faUser} />
        </Link>
      </div>
    </nav>
  );
}
