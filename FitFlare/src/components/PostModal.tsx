import { useState, useRef, MouseEvent } from "react";
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

interface CommentUser{
  userName : string;
  profilePictureUri: string;
  userId: string;
}

interface Comment{
  postedBy: CommentUser;
  likesCount: number;
  replyCount: number;
  replies: CommentUser[];
}


interface Profile {
  profilePictureUri:string;
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
}

interface PostModalProps {
  profile : Profile;
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
  const modalRef = useRef<HTMLDivElement>(null);

  const currentPost = posts[currentIndex];

  const handleBackdropClick = (e: MouseEvent) => {
    // Check if the click is on the backdrop (not on the modal content)
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

  if (!isOpen) return null;



  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm dark:bg-[#1C1C1E]/30"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-6xl h-[90vh] bg-white/95 dark:bg-[#1C1C1E] rounded-lg overflow-hidden shadow-xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white z-10 hover:opacity-80"
        >
          <FontAwesomeIcon icon={faXmark} size="lg" />
        </button>

        <div className="flex h-full">
          <div className="relative flex-1 bg-black flex items-center justify-center">
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

          <div className="w-96 flex flex-col border-l border-gray-200 dark:bg-[#1C1C1E]">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <img
                  src={profile.profilePictureUri}
                  alt="User avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-semibold dark:text-white">{profile.userName}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/*TODO: change the design idk */}
            </div>

            <div className="p-4 border-t border-gray-200 dark:bg-[#1C1C1E]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
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
      </div>

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
