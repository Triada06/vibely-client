import { create } from "zustand";

export type NotificationType = "FollowRequest" | "Follow" | "Like" | "Comment";

export interface NotificationData {
  id: string;
  type: NotificationType;
  addressedUserId: string;
  message: string;
  triggerUserName: string;
  triggerUserProfilePicture: string | null;
  triggerUserId: string;
  postId?: string;
  postMediaUri?: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationStore {
  notifications: NotificationData[];
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  fetchNotifications: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/notification`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      set({ notifications: data });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/notification/${notificationId}/markasread`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
      }));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/notification/markallasread`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      }));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  },
}));
