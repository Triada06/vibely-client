import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useNotificationStore,
  type Notification as NotificationType,
} from "../store/notificationStore";
import { motion } from "framer-motion";

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

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();

  useEffect(() => {
    // For development, use mock data
    // In production, this would be handled by the store
    useNotificationStore.setState({ notifications: mockNotifications });
  }, []);

  const handleNotificationClick = async (notification: NotificationType) => {
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
    <section className="md:ml-72 min-h-screen p-10 bg-white dark:bg-[#1C1C1E]">
      <div className="sticky top-0 z-10 bg-white dark:bg-[#1C1C1E] border-b border-[#D3D3D3] dark:border-[#3C3C3F]">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-semibold text-[#2E2E2E] dark:text-[#EAEAEA]">
            Notifications
          </h1>
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-[#E07A5F] dark:text-[#4DD0E1] hover:opacity-80"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-[#D3D3D3] dark:divide-[#3C3C3F]">
        {notifications.map((notification: NotificationType) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 cursor-pointer hover:bg-[#4B3F72]/5 dark:hover:bg-[#B794F4]/5 ${
              !notification.isRead ? "bg-[#4B3F72]/10 dark:bg-[#B794F4]/10" : ""
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
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[#2E2E2E] dark:text-[#EAEAEA]">
                  <span className="font-semibold">{notification.userName}</span>{" "}
                  {notification.message}
                </p>
                <p className="text-sm text-[#2E2E2E]/60 dark:text-[#EAEAEA]/60 mt-1">
                  {formatTimeAgo(notification.createdAt)}
                </p>
              </div>
              {notification.postMediaUri && (
                <img
                  src={notification.postMediaUri}
                  alt="Post thumbnail"
                  className="w-12 h-12 object-cover rounded"
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
