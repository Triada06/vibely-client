import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faXmark,
  faTrash,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import ReelPlayer from "./VideoPlayer";
import { useNavigate } from "react-router-dom";

export interface StoryItem {
  id: string;
  authorId: string;
  authorProfilePicture: string;
  mediaType: "image" | "video";
  mediaSasUrl: string;
  postedTime: string;
}

interface StoryModalProps {
  stories: StoryItem[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

const StoryModal: React.FC<StoryModalProps> = ({
  stories,
  initialIndex,
  isOpen,
  onClose,
  currentUserId,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [viewers, setViewers] = useState<any[]>([]);
  const [loadingViewers, setLoadingViewers] = useState(false);
  const [showViewersModal, setShowViewersModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setMediaLoading(true);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && !mediaLoading) handlePrev();
      if (e.key === "ArrowRight" && !mediaLoading) handleNext();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, mediaLoading]);

  // Fetch viewers when opening your own story (for count)
  useEffect(() => {
    if (!isOpen || stories.length === 0) return;
    const currentStory = stories[currentIndex];
    if (!currentUserId || currentStory.authorId !== currentUserId) {
      setViewers([]);
      return;
    }
    // Only fetch if not already loaded for this story
    setLoadingViewers(true);
    const token = localStorage.getItem("token");
    fetch(`${import.meta.env.VITE_API_URL}/story/${currentStory.id}/viewers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setViewers(data))
      .catch(() => setViewers([]))
      .finally(() => setLoadingViewers(false));
  }, [isOpen, currentIndex, currentUserId, stories]);

  // Mark as viewed if not your own story
  useEffect(() => {
    const markAsViewed = async () => {
      if (!isOpen || stories.length === 0) return;
      const currentStory = stories[currentIndex];
      if (!currentUserId || currentStory.authorId === currentUserId) return;
      const token = localStorage.getItem("token");
      await fetch(
        `${import.meta.env.VITE_API_URL}/story/${currentStory.id}/view`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    };
    markAsViewed();
  }, [isOpen, currentIndex, currentUserId, stories]);

  if (!isOpen || stories.length === 0) return null;

  const currentStory = stories[currentIndex];

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };
  const handleNext = () => {
    if (currentIndex < stories.length - 1) setCurrentIndex(currentIndex + 1);
  };
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === modalRef.current) onClose();
  };

  const handleDelete = async () => {
    if (!currentStory) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/story/${currentStory.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        // Remove the deleted story from the list
        const newStories = stories.filter((s) => s.id !== currentStory.id);
        if (newStories.length === 0) {
          onClose();
        } else {
          setCurrentIndex(Math.max(0, currentIndex - 1));
        }
      }
    } catch (e) {
      // Optionally show error
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center transition-colors duration-300 bg-white dark:bg-[#18181b]"
      onClick={handleBackdropClick}
    >
      {/* Floating controls outside the card */}
      <div className="fixed top-8 right-8 flex gap-3 z-50">
        {currentUserId && currentStory.authorId === currentUserId && (
          <>
            <button
              className="dark:text-white/80 text-black/80 hover:text-red-500 p-2 rounded-full transition-colors bg-black/70 dark:bg-zinc-800 shadow-lg border border-zinc-700"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete story"
              style={{ background: "none", border: "none" }}
            >
              <FontAwesomeIcon icon={faTrash} size="lg" />
            </button>
            {showDeleteConfirm && (
              <div className="absolute top-12 right-0 bg-black/90 border border-zinc-700 rounded-lg shadow-lg p-4 flex flex-col items-center z-30">
                <span className="text-white mb-2">Delete this story?</span>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 rounded bg-red-600 dark:text-white text-black hover:bg-red-700 text-sm"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-zinc-700 text-white hover:bg-zinc-600 text-sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        <button
          className="text-black/80 dark:text-white  p-2 rounded-full transition-colors bg-black/70 dark:bg-zinc-800 shadow-lg border border-zinc-700"
          onClick={onClose}
          style={{ background: "none", border: "none" }}
        >
          <FontAwesomeIcon icon={faXmark} size="lg" />
        </button>
      </div>
      {/* Centered story card */}
      <div className="relative w-full flex items-center justify-center">
        <div className="relative w-full max-w-lg mx-auto flex flex-col items-center">
          <div className="relative w-full h-[80vh] max-h-[700px] aspect-[9/16] flex items-center justify-center bg-zinc-900 dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden">
            {currentIndex > 0 && !mediaLoading && (
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full z-10"
                onClick={handlePrev}
              >
                <FontAwesomeIcon icon={faChevronLeft} size="lg" />
              </button>
            )}
            <div className="w-full h-full flex items-center justify-center">
              {mediaLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
                </div>
              )}
              {currentStory.mediaType === "image" ? (
                <img
                  src={currentStory.mediaSasUrl}
                  alt="story"
                  className="w-full h-full object-cover rounded-2xl"
                  style={{
                    objectPosition: "center",
                    display: mediaLoading ? "none" : undefined,
                  }}
                  onLoad={() => setMediaLoading(false)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {!mediaLoading && (
                    <ReelPlayer src={currentStory.mediaSasUrl} />
                  )}
                </div>
              )}
            </div>
            {currentIndex < stories.length - 1 && !mediaLoading && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full z-10"
                onClick={handleNext}
              >
                <FontAwesomeIcon icon={faChevronRight} size="lg" />
              </button>
            )}
          </div>
          {/* Viewers button for your own story */}
          {currentUserId && currentStory.authorId === currentUserId && (
            <div className="w-full mt-4 flex justify-end">
              <button
                className="flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm font-medium shadow border border-zinc-200 dark:border-zinc-700"
                onClick={() => setShowViewersModal(true)}
                disabled={showViewersModal}
              >
                <FontAwesomeIcon icon={faEye} />
                Viewers
                {viewers.length > 0 && (
                  <span className="ml-1 bg-zinc-300 dark:bg-zinc-700 rounded-full px-2 py-0.5 text-xs font-semibold">
                    {viewers.length}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Viewers Modal */}
      {showViewersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-[#262626] rounded-xl shadow-xl w-full max-w-sm max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Story Viewers
              </h3>
              <button
                onClick={() => setShowViewersModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-grow">
              {loadingViewers ? (
                <div className="flex justify-center items-center p-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
              ) : viewers.length > 0 ? (
                viewers.map((viewer) => (
                  <div
                    key={viewer.id}
                    className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#333333] transition-colors cursor-pointer"
                    onClick={() => {
                      setShowViewersModal(false);
                      navigate(`/user/${viewer.id}`);
                    }}
                  >
                    <img
                      src={
                        viewer.profilePictureUri ||
                        "/default-profile-picture.jpg"
                      }
                      alt={viewer.userName}
                      className="w-10 h-10 rounded-full object-cover mr-3"
                    />
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {viewer.userName}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  No viewers yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryModal;
