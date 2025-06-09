import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useNotificationStore,
  type NotificationData,
} from "../store/notificationStore";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faUserPlus,
  faComment,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from "../store/authStore";
import PostModal, { type Post, type Profile } from "../components/PostModal";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, fetchNotifications } =
    useNotificationStore();
  const { userId: currentAuthUserId, token } = useAuthStore();

  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [profileForModal, setProfileForModal] = useState<Profile | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = async (notification: NotificationData) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    if (notification.type === "FollowRequest") {
      // Do not navigate for follow requests, as they have action buttons
      return;
    }

    if (
      (notification.type === "Like" || notification.type === "Comment") &&
      notification.postId
    ) {
      // Fetch post data and open modal
      if (!token) {
        console.error("Authentication token is missing.");
        return;
      }
      try {
        const response = await fetch(
          `https://localhost:7014/api/post/${notification.postId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch post data.");
        }
        const postData: Post = await response.json();
        setSelectedPost(postData);
        // Construct a minimal profile object for PostModal based on the post's author
        setProfileForModal({
          profilePictureUri:
            postData.authorProfilePicUri ?? "/default-profile-picture.jpg",
          userName: postData.authorUserName,
          postsCount: 1, // We only have one post's context here
          bio: "", // Not available here
          posts: [postData], // PostModal expects an array of posts
        });
        setShowPostModal(true);
      } catch (error) {
        console.error("Error fetching post for modal:", error);
        alert("Failed to open post. Please try again.");
      }
    } else if (notification.type === "Follow" && notification.triggerUserId) {
      if (
        currentAuthUserId &&
        notification.triggerUserId === currentAuthUserId
      ) {
        navigate("/profile");
      } else {
        navigate(`/user/${notification.triggerUserId}`);
      }
    }
  };

  const handleClosePostModal = () => {
    setShowPostModal(false);
    setSelectedPost(null);
    setProfileForModal(null);
  };

  const handleAcceptRequest = async (
    notificationId: string,
    triggerUserId: string
  ) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // 1. Accept the follow request (use the existing follow API)
      const followResponse = await fetch(
        `https://localhost:7014/api/follow/${triggerUserId}/acceptfollowrequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!followResponse.ok) {
        const errorText = await followResponse.text();
        throw new Error(`Failed to accept follow request: ${errorText}`);
      }

      // 2. Delete the notification
      const deleteResponse = await fetch(
        `https://localhost:7014/api/notification/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text();
        throw new Error(
          `Failed to delete notification after accepting: ${errorText}`
        );
      }

      // Update state to remove the notification
      useNotificationStore.setState((state) => ({
        notifications: state.notifications.filter(
          (n) => n.id !== notificationId
        ),
      }));

      alert("Follow request accepted!");
    } catch (error) {
      console.error("Error accepting follow request:", error);
      alert("Error accepting follow request.");
    }
  };

  const handleRejectRequest = async (notificationId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `https://localhost:7014/api/notification/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to reject follow request: ${errorText}`);
      }

      // Update state to remove the notification
      useNotificationStore.setState((state) => ({
        notifications: state.notifications.filter(
          (n) => n.id !== notificationId
        ),
      }));

      alert("Follow request rejected.");
    } catch (error) {
      console.error("Error rejecting follow request:", error);
      alert("Error rejecting follow request.");
    }
  };

  const getNotificationIcon = (type: NotificationData["type"]) => {
    switch (type as NotificationData["type"]) {
      case "Like":
        return <FontAwesomeIcon icon={faHeart} className="text-red-500" />;
      case "Follow":
      case "FollowRequest":
        return <FontAwesomeIcon icon={faUserPlus} className="text-blue-500" />;
      case "Comment":
        return <FontAwesomeIcon icon={faComment} className="text-green-500" />;
      default:
        return <FontAwesomeIcon icon={faUser} className="text-gray-500" />;
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
    <section className="md:ml-72 min-h-screen p-10  bg-white dark:bg-[#1C1C1E]">
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
        {notifications.length > 0 ? (
          notifications.map((notification: NotificationData) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 cursor-pointer hover:bg-[#4B3F72]/5 dark:hover:bg-[#B794F4]/5 ${
                !notification.isRead
                  ? "bg-[#4B3F72]/10 dark:bg-[#B794F4]/10"
                  : ""
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <img
                    src={
                      notification.triggerUserProfilePicture ??
                      "/default-profile-picture.jpg"
                    }
                    alt={notification.triggerUserName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#1C1C1E] rounded-full p-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#2E2E2E] dark:text-[#EAEAEA]">
                    <span className="font-semibold">
                      {notification.triggerUserName}
                    </span>{" "}
                    {notification.message}
                  </p>
                  <p className="text-sm text-[#2E2E2E]/60 dark:text-[#EAEAEA]/60 mt-1">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>
                {(notification.type === "Like" ||
                  notification.type === "Comment") &&
                  notification.postMediaUri && (
                    <img
                      src={notification.postMediaUri}
                      alt="Post thumbnail"
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                {notification.type === "FollowRequest" && (
                  <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation
                        handleAcceptRequest(
                          notification.id,
                          notification.triggerUserId
                        );
                      }}
                      className="px-3 py-1 bg-[#E07A5F] dark:bg-[#4DD0E1] text-white rounded-md text-sm font-semibold hover:opacity-80 transition-opacity"
                    >
                      Accept
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation
                        handleRejectRequest(notification.id);
                      }}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md text-sm font-semibold hover:opacity-80 transition-opacity"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-4 text-center text-[#2E2E2E]/60 dark:text-[#EAEAEA]/60">
            No notifications yet.
          </div>
        )}
      </div>

      {/* Post Modal */}
      {showPostModal && selectedPost && profileForModal && (
        <PostModal
          profile={profileForModal}
          posts={[selectedPost]} // Pass the single selected post in an array
          initialPostIndex={0}
          isOpen={showPostModal}
          onClose={handleClosePostModal}
          savedPosts={[]} // Not relevant in this context for notifications
          setSavedPosts={() => {}} // Not relevant in this context for notifications
          isOwnProfile={currentAuthUserId === selectedPost.postedById} // Determine if it's the current user's post
          isSavedPostsTab={false} // Not a saved posts tab
        />
      )}
    </section>
  );
}
