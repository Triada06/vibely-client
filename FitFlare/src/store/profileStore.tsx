import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

interface Post {
  id: number;
  mediaUri: string;
  mediaType: "image" | "video";
  likeCount: number;
  commentCount: number;
  description: string;
  postedWhen: string;
  hashTags: string[];
}
interface SavedPost {
  id: number;
  mediaUri: string;
  mediaType: "image" | "video";
  likeCount: number;
  commentCount: number;
  description: string;
  postedWhen: string;
  hashTags: string[];
}

interface Profile {
  id: string;
  userName: string;
  fullName: string;
  postsCount: number;
  bio: string;
  profilePictureUri: string;
  followersCount: number;
  followingCount: number;
  posts: Post[];
  savedPosts: SavedPost[];
}

interface ProfileStore {
  profile: Profile | null;
  fetchUser: () => Promise<void>;
}

function getUserIdFromToken(): string | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const decoded: any = jwtDecode(token);
  return decoded.sub;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile : null,

  fetchUser: async () => {
    const userId = getUserIdFromToken();
    if (!userId) return;

    const token = localStorage.getItem("token");

    const res = await fetch(`https://localhost:7014/api/appuser/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log(data);
    console.log(`profile picture uri - ${data.profilePictureUri} `);


    set({ profile: data });

  },
}));
