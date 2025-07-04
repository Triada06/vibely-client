import { create } from "zustand";

interface Post {
  id: string;
  fullName: string;
  postedWhen: string;
  description: string;
  profilePicUri: string;
  postTybe: string;
  mediaUri: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
}

interface PostStore {
  posts: Post[];
  fetchPosts: () => Promise<void>;
}

export const usePostStore = create<PostStore>((set) => ({
  posts: [],
  loading: false,

  fetchPosts: async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/appuser?page=1`); // Replace with your endpoint
    const data = await res.json();
    set({ posts: data });
  },
}));
