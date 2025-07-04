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
  fetchUsers: (
    page: number,
    searchText: string,
    sort: string,
    pageSize: number
  ) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  fetchUsers: async (
    page = 1,
    searchText = "",
    sort = "asc",
    pageSize = 10
  ) => {
    const token = localStorage.getItem("token");
    const query = new URLSearchParams({
      page: page.toString(),
      searchText,
      sort,
      pageSize: pageSize.toString(),
    });
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/appuser?${query}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();
    set({ users: data });
  },
}));
