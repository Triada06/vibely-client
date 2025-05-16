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

interface FetchParams {
  page?: number;
  search?: string;
  sortBy?: string;
}

interface UserStore {
  users: User[];
  fetchUsers: (page :number, search : string, sortBy : string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  fetchUsers: async ({ page = 1, search = "", sortBy = "" }: FetchParams = {}) => {
    const token = localStorage.getItem("token"); 

    const query = new URLSearchParams({
      page: page.toString(),
      search,
      sortBy,
    });

    const res = await fetch(`https://localhost:7014/api/appuser?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    set({ users: data });
  },
}));