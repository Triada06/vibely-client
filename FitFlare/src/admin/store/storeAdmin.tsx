import { create } from "zustand";

interface User {
  id: string;
  userName: string;
  email: string;
  profilePictureUri: string;
  fullName: string;
  isBanned: boolean;
  posts: number;
}

interface UserStore {
  users: User[];
  fetchUsers: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  loading: false,

  fetchUsers: async () => {
    const res = await fetch(`https://localhost:7014/api/appuser?page=1`); // Replace with your endpoint
    const data = await res.json();
    set({ users: data });
  },
}));
