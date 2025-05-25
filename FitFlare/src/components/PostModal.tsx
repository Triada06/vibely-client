import { useState, useRef, MouseEvent, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faComment,
  faPaperPlane,
  faBookmark,
  faChevronLeft,
  faChevronRight,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import ReelPlayer from "./VideoPlayer";
import { faCommentAlt } from "@fortawesome/free-regular-svg-icons";

interface CommentUser {
  userName: string;
  profilePictureUri: string;
  userId: string;
}

interface Comment {
  postedBy: CommentUser;
  likesCount: number;
  replyCount: number;
  replies: CommentUser[];
}

interface Profile {
  profilePictureUri: string;
  userName: string;
  postsCount: number;
  description: string;
}

interface Post {
  id: number;
  mediaUri: string;
  mediaType: "image" | "video";
  likeCount: number;
  commentCount: number;
  description: string;
  comments: Comment[];
  postedWhen: string;
  hashTags: string[];
  isLikedByUser : boolean; 
}

interface PostModalProps {
  profile: Profile;
  posts: Post[];
  initialPostIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function PostModal({
  posts,
  initialPostIndex,
  isOpen,
  profile,
  onClose,
}: PostModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialPostIndex);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMobileComments, setShowMobileComments] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const currentPost = posts[currentIndex];

  useEffect(() => {
    if (currentPost) {
      setIsLiked(currentPost.isLikedByUser || false);
    }
  }, [currentPost]);

  const handleBackdropClick = (e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : posts.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < posts.length - 1 ? prev + 1 : 0));
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Authorization token is missing");
      return;
    }

    const previousLikeCount = currentPost.likeCount;
    currentPost.likeCount += 1;
    setIsLiked(true);

    try {
      const res = await fetch(
        `https://localhost:7014/api/post/${currentPost.id}/like`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        currentPost.likeCount = previousLikeCount;
        setIsLiked(false);
        console.error("Failed to like the post");
      } else {
        console.log("Post liked successfully");
      }
    } catch (err) {
      currentPost.likeCount = previousLikeCount;
      setIsLiked(false);
      console.error("Error liking the post:", err);
    }
  };

  const handleUnlike = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Authorization token is missing");
      return;
    }

    const previousLikeCount = currentPost.likeCount;
    currentPost.likeCount -= 1;
    setIsLiked(false);

    try {
      const res = await fetch(
        `https://localhost:7014/api/post/${currentPost.id}/unlike`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        currentPost.likeCount = previousLikeCount;
        setIsLiked(true);
        console.error("Failed to unlike the post");
      } else {
        console.log("Post unliked successfully");
      }
    } catch (err) {
      currentPost.likeCount = previousLikeCount;
      setIsLiked(true);
      console.error("Error unliking the post:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function formatPostedWhen(dateString?: string) {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm dark:bg-[#1C1C1E]/30"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-6xl h-[90vh] bg-white/95 dark:bg-[#1C1C1E] rounded-lg overflow-hidden shadow-xl flex flex-col md:flex-row"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white z-10 hover:opacity-80"
        >
          <FontAwesomeIcon icon={faXmark} size="lg" />
        </button>

        <div className="flex-1 flex items-center justify-center  min-h-[250px] relative">
          {currentPost.mediaType === "image" ? (
            <img
              src={currentPost.mediaUri}
              alt={`Post ${currentPost.id}`}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ReelPlayer src={currentPost.mediaUri} />
            </div>
          )}

          {/* Show comment button on mobile */}
          <button
            className="md:hidden absolute bottom-4 right-4 dark:bg-[#2E2E2E] bg-white/80 rounded-full p-3 shadow-lg"
            onClick={() => setShowMobileComments(true)}
          >
            <FontAwesomeIcon
              icon={faComment}
              className="text-xl dark:text-[#EAF2EF] text-[#2E2E2E]"
            />
          </button>

          {posts.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:opacity-80"
              >
                <FontAwesomeIcon icon={faChevronLeft} size="2x" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:opacity-80"
              >
                <FontAwesomeIcon icon={faChevronRight} size="2x" />
              </button>
            </>
          )}
        </div>

        <div className="hidden md:flex w-96 flex-col border-l border-gray-200 dark:bg-[#1C1C1E] max-h-[90vh]">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-3 items-center">
              <img
                src={profile.profilePictureUri}
                alt="User avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="font-semibold dark:text-white">
                  {profile.userName}
                </span>
                {currentPost.postedWhen && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatPostedWhen(currentPost.postedWhen)}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-800 dark:text-gray-200 break-words">
              {currentPost.description}
              {currentPost.hashTags && currentPost.hashTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {currentPost.hashTags.map((tag: string, idx: number) => (
                    <span key={idx} className="text-[#B794F4] font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 min-h-[100px]">
            {/* Comments go here */}
          </div>

          <div className="p-4 border-t border-gray-200 dark:bg-[#1C1C1E]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={isLiked ? handleUnlike : handleLike}
                  className={`hover:opacity-80 ${
                    isLiked ? "text-red-500" : "dark:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faHeart} size="lg" />
                </button>
                <button
                  onClick={handleShare}
                  className="hover:opacity-80 dark:text-white"
                >
                  <FontAwesomeIcon icon={faPaperPlane} size="lg" />
                </button>
              </div>
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`hover:opacity-80 ${
                  isSaved ? "text-yellow-500" : "dark:text-white"
                }`}
              >
                <FontAwesomeIcon icon={faBookmark} size="lg" />
              </button>
            </div>
            <div className="dark:text-white">
              <p className="font-semibold">{currentPost.likeCount} likes</p>
            </div>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Add a comment..."
                className="w-full p-2 bg-transparent border-none outline-none dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile comments/details bottom sheet */}
      {showMobileComments && (
        <div
          className="fixed inset-0 z-[60] flex items-end md:hidden"
          onClick={() => setShowMobileComments(false)}
        >
          <div
            className="bg-white dark:bg-[#1C1C1E] w-full rounded-t-2xl shadow-2xl flex flex-col resize-y overflow-auto"
            style={{ height: "60vh", minHeight: "40vh", maxHeight: "80vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative border-b border-gray-200 dark:border-gray-700 p-4 flex items-center">
              <img
                src={profile.profilePictureUri}
                alt="User avatar"
                className="w-8 h-8 rounded-full object-cover mr-3"
              />
              <div className="flex flex-col flex-1">
                <span className="font-semibold dark:text-white">
                  {profile.userName}
                </span>
                {currentPost.postedWhen && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatPostedWhen(currentPost.postedWhen)}
                  </span>
                )}
              </div>
              <button
                className="absolute top-4 right-4 text-gray-500 dark:text-gray-400"
                onClick={() => setShowMobileComments(false)}
              >
                <FontAwesomeIcon icon={faXmark} size="lg" />
              </button>
            </div>

            {/* Description */}
            <div className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 break-words border-b border-gray-200 dark:border-gray-700">
              {currentPost.description}
              {currentPost.hashTags && currentPost.hashTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {currentPost.hashTags.map((tag: string, idx: number) => (
                    <span key={idx} className="text-[#B794F4] font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2">
              {currentPost.comments && currentPost.comments.length > 0 ? (
                currentPost.comments.map((comment, idx) => (
                  <div key={idx} className="mb-3 flex items-start gap-2">
                    <img
                      src={comment.postedBy.profilePictureUri}
                      alt={comment.postedBy.userName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <span className="font-semibold text-xs dark:text-white">
                        {comment.postedBy.userName}
                      </span>
                      <span className="ml-2 text-xs text-gray-700 dark:text-gray-300">
                        {comment.likesCount} likes
                      </span>
                      <div className="text-xs text-gray-800 dark:text-gray-200">
                        Comment text here
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 text-sm mt-4">
                  No comments yet.
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-[#1C1C1E]">
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`hover:opacity-80 ${
                    isLiked ? "text-red-500" : "dark:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faHeart} size="lg" />
                </button>
                <button
                  onClick={handleShare}
                  className="hover:opacity-80 dark:text-white"
                >
                  <FontAwesomeIcon icon={faPaperPlane} size="lg" />
                </button>
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className={`hover:opacity-80 ${
                    isSaved ? "text-yellow-500" : "dark:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faBookmark} size="lg" />
                </button>
                <span className="ml-auto font-semibold text-xs dark:text-white">
                  {currentPost.likeCount} likes
                </span>
              </div>
              <input
                type="text"
                placeholder="Add a comment..."
                className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md border-none outline-none dark:text-white text-sm"
              />
            </div>
          </div>
          <div
            className="flex-1"
            onClick={() => setShowMobileComments(false)}
          />
        </div>
      )}

      {isShareModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-sm dark:bg-[#1C1C1E]"
          onClick={(e) => {
            e.stopPropagation();
            if (e.target === e.currentTarget) {
              setIsShareModalOpen(false);
            }
          }}
        >
          <div
            className="bg-white/95 dark:bg-gray-900/95 rounded-xl w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold dark:text-white">Share</h2>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="p-4">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="max-h-60 overflow-y-auto"></div>

              <button
                onClick={() => setIsShareModalOpen(false)}
                className="w-full mt-4 py-2 px-4 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
