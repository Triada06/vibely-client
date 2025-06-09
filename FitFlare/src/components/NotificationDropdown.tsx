import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-regular-svg-icons";
import {
  useNotificationStore,
  type Notification,
} from "../store/notificationStore";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Mock data for development
const mockNotifications = [
  {
    id: "1",
    type: "LIKE" as const,
    message: "liked your post",
    userId: "user1",
    userName: "johndoe",
    userProfilePicture: "https://i.pravatar.cc/150?img=1",
    postId: "post1",
    postMediaUri: "https://picsum.photos/200/200?random=1",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    isRead: false,
  },
  {
    id: "2",
    type: "FOLLOW" as const,
    message: "started following you",
    userId: "user2",
    userName: "janedoe",
    userProfilePicture: "https://i.pravatar.cc/150?img=2",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    isRead: false,
  },
  {
    id: "3",
    type: "FOLLOW_REQUEST" as const,
    message: "requested to follow you",
    userId: "user3",
    userName: "mikebrown",
    userProfilePicture: "https://i.pravatar.cc/150?img=3",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isRead: true,
  },
  {
    id: "4",
    type: "LIKE" as const,
    message: "liked your post",
    userId: "user4",
    userName: "sarahsmith",
    userProfilePicture: "https://i.pravatar.cc/150?img=4",
    postId: "post2",
    postMediaUri: "https://picsum.photos/200/200?random=2",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isRead: true,
  },
];

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (
    notification: (typeof mockNotifications)[0]
  ) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    if (notification.type === "LIKE" && notification.postId) {
      navigate(`/post/${notification.postId}`);
    } else if (
      (notification.type === "FOLLOW" ||
        notification.type === "FOLLOW_REQUEST") &&
      notification.userId
    ) {
      navigate(`/user/${notification.userId}`);
    }

    setIsOpen(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center text-xl transition-all dark:text-[#EAEAEA] hover:rounded-xl duration-300 ease-in-out dark:hover:bg-[#B794F4] dark:hover:text-[#2A2A2D] hover:bg-[#4B3F72] hover:text-[#EAF2EF] text-[#2E2E2E]"
      >
        <FontAwesomeIcon icon={faBell} className="mr-2 ml-2" size="lg" />
        <span>Notifications</span>
        {unreadCount > 0 && (
          <span className="ml-2 w-5 h-5 bg-[#E07A5F] dark:bg-[#4DD0E1] rounded-full text-white text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute left-full ml-2 mt-0 w-80 dark:shadow-[0_4px_20px_rgba(255,255,255,0.1)] shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-[#D3D3D3] dark:border-[#3C3C3F]">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-[#2E2E2E] dark:text-[#EAEAEA]">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-[#E07A5F] dark:text-[#4DD0E1] hover:opacity-80"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E07A5F] dark:border-[#4DD0E1]"></div>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-4 border-b border-[#D3D3D3] dark:border-[#3C3C3F] cursor-pointer hover:bg-[#4B3F72] hover:text-[#EAF2EF] dark:hover:bg-[#B794F4] dark:hover:text-[#2A2A2D] ${
                      !notification.isRead
                        ? "bg-[#4B3F72]/10 dark:bg-[#B794F4]/10"
                        : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={
                          notification.userProfilePicture ??
                          "/default-profile-picture.jpg"
                        }
                        alt={notification.userName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#2E2E2E] dark:text-[#EAEAEA]">
                          <span className="font-semibold">
                            {notification.userName}
                          </span>{" "}
                          {notification.message}
                        </p>
                        <p className="text-xs text-[#2E2E2E]/60 dark:text-[#EAEAEA]/60 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      {notification.postMediaUri && (
                        <img
                          src={notification.postMediaUri}
                          alt="Post thumbnail"
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-4 text-center text-[#2E2E2E]/60 dark:text-[#EAEAEA]/60">
                  No notifications yet
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
