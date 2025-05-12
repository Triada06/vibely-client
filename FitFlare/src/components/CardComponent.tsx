import React from "react";
import VideoPlayer from "./VideoPlayer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
  faHeart,
  faShareFromSquare,
} from "@fortawesome/free-regular-svg-icons";

type PostType = "image" | "video";

interface PostCardProps {
  username: string;
  avatarUrl: string;
  timestamp: string;
  mediaType: PostType;
  mediaUrl: string;
  description: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
}

const PostCard: React.FC<PostCardProps> = ({
  username,
  avatarUrl,
  timestamp,
  mediaType,
  mediaUrl,
  description,
  likeCount,
  commentCount,
  shareCount,
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
          <VideoPlayer src={mediaUrl}></VideoPlayer>
        )}
      </div>

      <div className="p-4 text-zinc-700 dark:text-zinc-200 text-sm">
        {description}
      </div>

      <div className="px-4 pb-4 flex gap-6 text-zinc-500 dark:text-zinc-400 text-sm">
        <div className="flex items-center justify-between">
          <button className="hover:text-[#2E2E2E] dark:hover:text-[#EAEAEA] transition">
            <FontAwesomeIcon icon={faHeart} size="xl" />
          </button>
          {likeCount != 0 ? (
            <span className="text-lg ml-2">{likeCount}</span>
          ) : (
            " "
          )}
        </div>
        <div className="flex items-center justify-between">
          <button className="hover:text-[#2E2E2E] dark:hover:text-[#EAEAEA] transition">
            <FontAwesomeIcon icon={faComment} size="xl" />
          </button>
          {commentCount != 0 ? (
            <span className="text-lg ml-2">{commentCount}</span>
          ) : (
            " "
          )}
        </div>
        <div className="flex items-center justify-between transition">
          <button className=" hover:text-[#2E2E2E] dark:hover:text-[#EAEAEA] transition">
            <FontAwesomeIcon icon={faShareFromSquare} size="xl" />
          </button>
          {shareCount != 0 ? (
            <span className="text-lg ml-2">{shareCount}</span>
          ) : (
            " "
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
