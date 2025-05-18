import { create } from "zustand";

interface Post {
  id: string;
  mediaUri: string;
  mediaType: string;
  description: string;
  commentsCount: number;
  likesCount: number;
  shareCount: number;
};

interface Profile {
  id: string;
  fullName: string;
  description: string;
  profilePicUri: string;
  followersCount: number;
  followingCount: number;
  posts: Post[];
}

interface ProfileStore {
  profiles: Profile[];
  fetchPosts: () => Promise<void>;
}

export const usePostStore = create<ProfileStore>((set) => ({
  profiles: [],
  loading: false,

  fetchPosts: async () => {
    const res = await fetch(`https://localhost:7014/api/appuser?page=1`); // Replace with your endpoint
    const data = await res.json();
    set({ profiles: data });
  },
}));

