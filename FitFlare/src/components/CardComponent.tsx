import React from "react";
import VideoPlayer from "./VideoPlayer";

type PostType = "image" | "video";

interface PostCardProps {
  username: string;
  avatarUrl: string;
  timestamp: string;
  mediaType: PostType;
  mediaUrl: string;
  description: string;
}

const PostCard: React.FC<PostCardProps> = ({
  username,
  avatarUrl,
  timestamp,
  mediaType,
  mediaUrl,
  description,
}) => {
  return (
    <div className=" bg-[#F5F7FA]   dark:bg-[#2A2A2D] rounded-2xl shadow-md overflow-hidden w-full max-w-xl mx-auto mb-6">
      <div className="flex items-center gap-3 p-4">
        <img src={avatarUrl} alt="avatar" className="w-10 h-10 rounded-full" />
        <div>
          <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-[#EAEAEA]">
            {username}
          </h3>
          <p className="text-xs text-zinc-500">{timestamp}</p>
        </div>
      </div>

      <div className="w-full max-h-[500px] overflow-hidden">
        {mediaType === "image" ? (
          <img src={mediaUrl} alt="post" className="w-full object-cover" />
        ) : (
          <VideoPlayer
            src={
              mediaUrl
            }
          ></VideoPlayer>
        )}
      </div>

      <div className="p-4 text-zinc-700 dark:text-zinc-200 text-sm">
        {description}
      </div>

      <div className="px-4 pb-4 flex gap-6 text-zinc-500 dark:text-zinc-400 text-sm">
        <button className="hover:text-pink-500 transition">❤️ Like</button>
        <button className="hover:text-blue-500 transition">💬 Comment</button>
        <button className="hover:text-green-500 transition">🔁 Share</button>
      </div>
    </div>
  );
};

export default PostCard;
