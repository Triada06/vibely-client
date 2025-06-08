import { create } from "zustand";

export type NotificationType = "LIKE" | "FOLLOW" | "FOLLOW_REQUEST";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  userId: string;
  userName: string;
  userProfilePicture: string | null;
  postId?: string;
  postMediaUri?: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const response = await fetch("https://localhost:7014/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      const unreadCount = data.filter((n: Notification) => !n.isRead).length;
      set({ notifications: data, unreadCount });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "An error occurred" });
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (notificationId: string) => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    try {
      const response = await fetch(
        `https://localhost:7014/api/notifications/${notificationId}/read`,
        {
          method: "POST",
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
        unreadCount: state.unreadCount - 1,
      }));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  },

  markAllAsRead: async () => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    try {
      const response = await fetch(
        "https://localhost:7014/api/notifications/read-all",
        {
          method: "POST",
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
        unreadCount: 0,
      }));
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
