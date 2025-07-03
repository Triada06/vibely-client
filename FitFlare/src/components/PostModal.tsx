import { useState, useRef, MouseEvent, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faComment,
  faBookmark,
  faChevronLeft,
  faChevronRight,
  faXmark,
  faPenToSquare,
  faPlus,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import ReelPlayer from "./VideoPlayer";
import EditPostModal from "./EditPostModal";
import { useAuthStore } from "../store/authStore";
import { useProfileStore } from "../store/profileStore";

export interface CommentUser {
  commenterName: string;
  commenterProfilePicture: string;
  commenterId: string;
}

export interface Comment {
  id: string;
  content: string;
  commentLikeCount: number;
  replyCount: number;
  commentedWhen: string;
  replies?: Comment[];
  postedBy: CommentUser;
  isOwnComment?: boolean;
  isLikedByUser?: boolean;
}

export interface Profile {
  profilePictureUri: string;
  userName: string;
  postsCount: number;
  bio: string;
  posts: Post[];
}

export interface Post {
  id: string;
  mediaUri: string;
  mediaType: "image" | "video";
  likeCount: number;
  commentCount: number;
  description: string;
  comments: Comment[];
  postedWhen: string;
  hashTags: string[];
  isLikedByUser: boolean;
  postedById: string;
  authorProfilePicUri: string | null;
  authorUserName: string;
}

export interface SavedPost {
  id: string;
  mediaUri: string;
  mediaType: "image" | "video";
  likeCount: number;
  commentCount: number;
  description: string;
  comments: Comment[];
  postedWhen: string;
  hashTags: string[];
  isLikedByUser: boolean;
  postedById: string;
  authorProfilePicUri: string | null;
  authorUserName: string;
}

interface PostModalProps {
  profile: Profile;
  posts: Post[];
  savedPosts: SavedPost[];
  initialPostIndex: number;
  isOpen: boolean;
  onClose: () => void;
  setSavedPosts: (posts: SavedPost[]) => void;
  isOwnProfile?: boolean;
  isSavedPostsTab?: boolean;
  initialVideoTime?: number;
}

export default function PostModal({
  posts,
  initialPostIndex,
  isOpen,
  profile,
  onClose,
  savedPosts,
  setSavedPosts,
  isOwnProfile = false,
  isSavedPostsTab = false,
  initialVideoTime,
}: PostModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialPostIndex);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMobileComments, setShowMobileComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );
  const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set());
  const [replyPages, setReplyPages] = useState<Record<string, number>>({});
  const [hasMoreReplies, setHasMoreReplies] = useState<Record<string, boolean>>(
    {}
  );
  const [comments, setComments] = useState<Comment[]>([]);
  const navigate = useNavigate();

  const currentPost = posts[currentIndex];

  useEffect(() => {
    if (currentPost) {
      setIsLiked(currentPost.isLikedByUser || false);
      setIsSaved(savedPosts.some((post) => post.id === currentPost.id));
      // Reset pagination and comments when post changes
      setCurrentPage(1);
      setHasMoreComments(true);
      setExpandedReplies(new Set());
      setReplyPages({});
      setHasMoreReplies({});
      setComments([]);
      // Load initial comments
      loadComments(1);
    }
  }, [currentPost?.id]);

  const loadComments = async (page: number) => {
    if (!currentPost || isLoadingComments || !hasMoreComments) return;

    setIsLoadingComments(true);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Authorization token is missing");
      return;
    }

    try {
      const res = await fetch(
        `https://localhost:7014/api/comment/post/${currentPost.id}?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        console.log(data);

        // Get userId from the authStore
        const userId = useAuthStore.getState().userId;

        // Transform the data to match our Comment interface
        const transformedData = data.map((comment: any) => ({
          ...comment,
          postedBy: {
            commenterName: comment.commenterName,
            commenterProfilePicture: comment.commenterProfilePicture,
            commenterId: comment.commenterId || comment.id,
          },
          // Calculate isOwnComment based on commenterId and userId from authStore
          isOwnComment: userId === comment.commenterId,
          isLikedByUser: comment.isLikedByUser || false,
          commentLikeCount: comment.commentLikeCount || 0,
        }));

        if (page === 1) {
          setComments(transformedData);
        } else {
          setComments((prev) => [...prev, ...transformedData]);
        }

        // If we get less than 20 comments, we've reached the end
        setHasMoreComments(data.length === 20);
        setCurrentPage(page);

        // If we have more comments and this is the first page, load the next page
        if (page === 1 && data.length === 20) {
          loadComments(2);
        }
      } else {
        console.error("Failed to load comments");
      }
    } catch (err) {
      console.error("Error loading comments:", err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentPost?.id) return; // Ensure post ID exists

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Authorization token is missing");
      return;
    }

    try {
      const res = await fetch(
        `https://localhost:7014/api/comment`, // Updated API endpoint
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: newComment,
            postId: currentPost.id, // Include post ID in the body
          }),
        }
      );

      if (res.ok) {
        const addedComment = await res.json(); // Assuming the backend returns the added comment
        console.log("Comment added successfully:", addedComment);

        // Add the new comment to the local state
        // Make sure to structure the addedComment to match the Comment interface.
        const formattedAddedComment: Comment = {
          id: addedComment.id,
          content: addedComment.content,
          commentedWhen: addedComment.commentedWhen,
          commentLikeCount: addedComment.commentLikeCount,
          replyCount: addedComment.replyCount,
          postedBy: {
            commenterId:
              addedComment.commenterId ||
              "current-user-id-gottaga-get-from-the-token", // Use commenterId if available, otherwise use placeholder
            commenterName: addedComment.commenterName,
            commenterProfilePicture:
              addedComment.commenterProfilePicture ||
              "/default-profile-picture.jpg",
          },
          replies: addedComment.replies || [], // Ensure replies array exists
          isLikedByUser: addedComment.isLikedByUser || false,
        };

        setComments((prev) => [...prev, formattedAddedComment]);
        currentPost.commentCount += 1;

        // Clear the input
        setNewComment("");
        console.log("Comment added successfully");
      } else {
        console.error("Failed to add comment", res.status);
        // Handle specific error statuses if needed
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

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

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Authorization token is missing");
      return;
    }

    try {
      const res = await fetch(
        `https://localhost:7014/api/post/${currentPost.id}/save`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setIsSaved(true);
        setSavedPosts([...savedPosts, currentPost]);
        console.log("Post saved successfully");
      } else {
        console.error("Failed to save the post");
      }
    } catch (err) {
      console.error("Error saving the post:", err);
    }
  };

  const handleUnsave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Authorization token is missing");
      return;
    }

    try {
      const res = await fetch(
        `https://localhost:7014/api/post/${currentPost.id}/unsave`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setIsSaved(false);
        setSavedPosts(savedPosts.filter((post) => post.id !== currentPost.id));
        console.log("Post unsaved successfully");
      } else {
        console.error("Failed to unsave the post");
      }
    } catch (err) {
      console.error("Error unsaving the post:", err);
    }
  };

  const handleEditPost = async (description: string, tags: string[]) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Authorization token is missing");
      return;
    }

    try {
      const res = await fetch(
        `https://localhost:7014/api/post/${currentPost.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            description,
            Tags: tags,
          }),
        }
      );

      if (res.ok) {
        currentPost.description = description;
        currentPost.hashTags = tags;
        console.log("Post updated successfully");
      } else {
        console.error("Failed to update the post");
      }
    } catch (err) {
      console.error("Error updating the post:", err);
    }
  };

  const handleDeletePost = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Authorization token is missing");
      return;
    }

    try {
      const res = await fetch(
        `https://localhost:7014/api/post/${currentPost.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const updatedPosts = posts.filter((post) => post.id !== currentPost.id);
        if (updatedPosts.length === 0) {
          onClose();
        } else {
          setCurrentIndex(0);
        }
        console.log("Post deleted successfully");
      } else {
        console.error("Failed to delete the post");
      }
    } catch (err) {
      console.error("Error deleting the post:", err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Authorization token is missing");
      return;
    }

    try {
      const res = await fetch(
        `https://localhost:7014/api/comment/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        // Remove the comment from the current post's comments
        setComments((prev) =>
          prev.filter((comment) => comment.id !== commentId)
        );
        currentPost.commentCount -= 1;
        console.log("Comment deleted successfully");
      } else {
        console.error("Failed to delete comment");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!replyContent.trim() || !currentPost?.id) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Authorization token is missing");
      return;
    }

    try {
      const res = await fetch(
        `https://localhost:7014/api/comment/${commentId}/addreply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: replyContent,
            postId: currentPost.id,
          }),
        }
      );

      if (res.ok) {
        const addedReply = await res.json();
        const formattedReply: Comment = {
          id: addedReply.id,
          content: addedReply.content,
          commentedWhen: addedReply.commentedWhen,
          commentLikeCount: addedReply.commentLikeCount,
          replyCount: addedReply.replyCount,
          postedBy: {
            commenterId: addedReply.commenterId,
            commenterName: addedReply.commenterName,
            commenterProfilePicture: addedReply.commenterProfilePicture,
          },
          replies: [],
          isOwnComment: true,
          isLikedByUser: addedReply.isLikedByUser || false,
        };

        // Find the parent comment and add the reply
        const parentComment = comments.find(
          (comment) => comment.id === commentId
        );
        if (parentComment) {
          if (!parentComment.replies) {
            parentComment.replies = [];
          }
          parentComment.replies.push(formattedReply);
          parentComment.replyCount += 1;
        }

        setReplyContent("");
        setReplyingTo(null);
        console.log("Reply added successfully");
      } else {
        console.error("Failed to add reply");
      }
    } catch (err) {
      console.error("Error adding reply:", err);
    }
  };

  const loadReplies = async (commentId: string, page: number) => {
    if (!currentPost?.id || loadingReplies.has(commentId)) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Authorization token is missing");
      return;
    }

    setLoadingReplies((prev) => new Set(prev).add(commentId));

    try {
      const res = await fetch(
        `https://localhost:7014/api/comment/${commentId}/replies?postId=${currentPost.id}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        const transformedReplies = data.map((reply: any) => ({
          ...reply,
          postedBy: {
            commenterName: reply.commenterName,
            commenterProfilePicture: reply.commenterProfilePicture,
            commenterId: reply.id,
          },
          isOwnComment: reply.isOwnComment,
        }));

        const parentComment = comments.find(
          (comment) => comment.id === commentId
        );
        if (parentComment) {
          if (page === 1) {
            parentComment.replies = transformedReplies;
          } else {
            parentComment.replies = [
              ...(parentComment.replies || []),
              ...transformedReplies,
            ];
          }
        }

        setHasMoreReplies((prev) => ({
          ...prev,
          [commentId]: data.length === 20,
        }));
        setReplyPages((prev) => ({
          ...prev,
          [commentId]: page,
        }));
      } else {
        console.error("Failed to load replies");
      }
    } catch (err) {
      console.error("Error loading replies:", err);
    } finally {
      setLoadingReplies((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
        // Load replies if not already loaded
        if (!replyPages[commentId]) {
          loadReplies(commentId, 1);
        }
      }
      return newSet;
    });
  };

  const handleLikeComment = async (commentId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Authorization token is missing");
      return;
    }

    // Find the comment first to check its current like status
    const findComment = (comments: Comment[]): Comment | null => {
      for (const comment of comments) {
        if (comment.id === commentId) {
          return comment;
        }
        if (comment.replies) {
          const found = findComment(comment.replies);
          if (found) return found;
        }
      }
      return null;
    };

    const comment = findComment(comments);
    if (!comment) return;

    // Optimistically update the UI
    const previousLikeState = comment.isLikedByUser;
    const previousLikeCount = comment.commentLikeCount;

    // Create a new array to trigger re-render
    const updateCommentInArray = (comments: Comment[]): Comment[] => {
      return comments.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            isLikedByUser: !previousLikeState,
            commentLikeCount:
              c.commentLikeCount + (!previousLikeState ? 1 : -1),
          };
        }
        if (c.replies) {
          return {
            ...c,
            replies: updateCommentInArray(c.replies),
          };
        }
        return c;
      });
    };

    // Update the state immediately
    setComments((prev) => updateCommentInArray(prev));

    try {
      // Use the appropriate endpoint based on the current like state
      const endpoint = previousLikeState ? "unlike" : "like";
      const res = await fetch(
        `https://localhost:7014/api/comment/${commentId}/${endpoint}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        // Revert the optimistic update if the request fails
        setComments((prev) => updateCommentInArray(prev));
        console.error(`Failed to ${endpoint} comment`);
      }
    } catch (err) {
      // Revert the optimistic update if there's an error
      setComments((prev) => updateCommentInArray(prev));
      console.error(
        `Error ${previousLikeState ? "unliking" : "liking"} comment:`,
        err
      );
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

  const isPostEditable = () => {
    if (!isOwnProfile || isSavedPostsTab) return false;
    return profile.posts.some((post) => post.id === currentPost.id);
  };

  const handleUserClick = (authorId: string) => {
    const authUserId = useAuthStore.getState().userId;
    if (authorId === authUserId) {
      navigate("/profile");
    } else {
      navigate(`/user/${authorId}`);
    }
    onClose(); // Close the modal after navigation
  };

  const renderComment = (comment: Comment, isReply = false) => {
    // Get the userId from profileStore
    const userId = useProfileStore.getState().profile?.id;

    return (
      <div key={comment.id} className={`mb-4 ${isReply ? "ml-10" : ""}`}>
        <div className="flex items-start gap-2">
          <img
            src={
              comment.postedBy.commenterProfilePicture ??
              "/default-profile-picture.jpg"
            }
            alt={comment.postedBy.commenterName}
            className={`${
              isReply ? "w-6 h-6" : "w-8 h-8"
            } rounded-full object-cover`}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm dark:text-white">
                {comment.postedBy.commenterName}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatPostedWhen(comment.commentedWhen)}
              </span>
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
              {comment.content}
            </p>
            <div className="flex items-center gap-4 mt-1">
              <button
                onClick={() => handleLikeComment(comment.id)}
                className={`flex items-center gap-1 ${
                  comment.isLikedByUser
                    ? "text-red-500"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <FontAwesomeIcon
                  icon={faHeart}
                  className={`text-xs ${
                    comment.isLikedByUser ? "text-red-500" : ""
                  }`}
                />
                <span className="text-xs">{comment.commentLikeCount}</span>
              </button>
              {!isReply && (
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Reply
                </button>
              )}
              {/* Directly check if commenterId matches userId from profileStore */}
              {comment.postedBy.commenterId === userId && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              )}
            </div>
            {!isReply && comment.replyCount > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => toggleReplies(comment.id)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {expandedReplies.has(comment.id)
                    ? "Hide replies"
                    : `View ${comment.replyCount} replies`}
                </button>
                {expandedReplies.has(comment.id) && (
                  <div className="mt-2">
                    {comment.replies?.map((reply) =>
                      renderComment(reply, true)
                    )}
                    {hasMoreReplies[comment.id] && (
                      <button
                        onClick={() =>
                          loadReplies(
                            comment.id,
                            (replyPages[comment.id] || 1) + 1
                          )
                        }
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs"
                        disabled={loadingReplies.has(comment.id)}
                      >
                        {loadingReplies.has(comment.id) ? (
                          <FontAwesomeIcon
                            icon={faSpinner}
                            className="animate-spin"
                          />
                        ) : (
                          <>
                            <FontAwesomeIcon
                              icon={faPlus}
                              className="text-xs"
                            />
                            <span className="text-gray-600 dark:text-gray-300">
                              Load more replies
                            </span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            {!isReply && replyingTo === comment.id && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-md border-none outline-none dark:text-white text-sm"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddReply(comment.id);
                    }
                  }}
                />
                <button
                  onClick={() => handleAddReply(comment.id)}
                  disabled={!replyContent.trim()}
                  className={`px-4 py-2 rounded-md font-semibold text-sm ${
                    replyContent.trim()
                      ? "text-blue-500 hover:text-blue-600"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Reply
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCommentsSection = () => (
    <>
      {comments && comments.length > 0 ? (
        <>
          {comments.map((comment) => renderComment(comment))}
          {hasMoreComments && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => loadComments(currentPage + 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                disabled={isLoadingComments}
              >
                <FontAwesomeIcon icon={faPlus} className="text-sm" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-400 text-sm mt-4">
          No comments yet.
        </div>
      )}
    </>
  );

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
        <div className="flex absolute top-4 right-4 gap-2 z-10">
          {isPostEditable() && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="dark:text-white text-black hover:opacity-80"
            >
              <FontAwesomeIcon icon={faPenToSquare} size="lg" />
            </button>
          )}
          <button
            onClick={onClose}
            className="dark:text-white text-black hover:opacity-80"
          >
            <FontAwesomeIcon icon={faXmark} size="lg" />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center  min-h-[250px] relative">
          {currentPost.mediaType === "image" ? (
            <img
              src={currentPost.mediaUri}
              alt={`Post ${currentPost.id}`}
              className="max-h-full max-w-full object-contain"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ReelPlayer
                src={currentPost.mediaUri}
                initialTime={initialVideoTime}
              />
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
                className="absolute left-4 top-1/2 -translate-y-1/2 dark:text-white text-black hover:opacity-80"
              >
                <FontAwesomeIcon icon={faChevronLeft} size="2x" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 dark:text-white text-black hover:opacity-80"
              >
                <FontAwesomeIcon icon={faChevronRight} size="2x" />
              </button>
            </>
          )}
        </div>

        <div className="hidden md:flex w-96 flex-col border-l border-gray-200 dark:bg-[#1C1C1E] max-h-[90vh]">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div
              className="flex gap-3 items-center cursor-pointer"
              onClick={() => handleUserClick(currentPost.postedById)}
            >
              <img
                src={
                  currentPost.authorProfilePicUri ??
                  "/default-profile-picture.jpg"
                }
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="font-semibold dark:text-white">
                  {currentPost.authorUserName}
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

          <div className="flex-1 overflow-y-auto p-4 min-h-[100px] custom-scrollbar">
            {renderCommentsSection()}
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
              </div>
              <button
                onClick={isSaved ? handleUnsave : handleSave}
                className={`hover:opacity-80 ${
                  isSaved ? "text-yellow-500" : "dark:text-white"
                }`}
              >
                <FontAwesomeIcon icon={faBookmark} size="lg" />
              </button>
            </div>
            <div className="dark:text-white mb-4">
              <p className="font-semibold">{currentPost.likeCount} likes</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-md border-none outline-none dark:text-white text-sm"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddComment();
                  }
                }}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className={`px-4 py-2 rounded-md font-semibold text-sm ${
                  newComment.trim()
                    ? "text-blue-500 hover:text-blue-600"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                Post
              </button>
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
              <div
                className="flex flex-1 items-center cursor-pointer"
                onClick={() => handleUserClick(currentPost.postedById)}
              >
                <img
                  src={
                    currentPost.authorProfilePicUri ??
                    "/default-profile-picture.jpg"
                  }
                  alt="User avatar"
                  className="w-8 h-8 rounded-full object-cover mr-3"
                />
                <div className="flex flex-col">
                  <span className="font-semibold dark:text-white">
                    {currentPost.authorUserName}
                  </span>
                  {currentPost.postedWhen && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatPostedWhen(currentPost.postedWhen)}
                    </span>
                  )}
                </div>
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

            <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
              {renderCommentsSection()}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-[#1C1C1E]">
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={isLiked ? handleUnlike : handleLike}
                  className={`hover:opacity-80 ${
                    isLiked ? "text-red-500" : "dark:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faHeart} size="lg" />
                </button>
                <button
                  onClick={isSaved ? handleUnsave : handleSave}
                  className={`hover:opacity-80 ${
                    isSaved ? "text-yellow-500" : "dark:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faBookmark} size="lg" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-md border-none outline-none dark:text-white text-sm"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddComment();
                    }
                  }}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className={`px-4 py-2 rounded-md font-semibold text-sm ${
                    newComment.trim()
                      ? "text-blue-500 hover:text-blue-600"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
          <div
            className="flex-1"
            onClick={() => setShowMobileComments(false)}
          />
        </div>
      )}

      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        post={currentPost}
        onSave={handleEditPost}
        onDelete={handleDeletePost}
      />
    </div>
  );
}
