import { useState, useEffect } from "react";
import { Modal } from "./ui/modal";
import Button from "./ui/button/Button";
import Badge from "./ui/badge/Badge";
import Alert from "./ui/alert/Alert";
import { Dropdown } from "./ui/dropdown/Dropdown";
import { DropdownItem } from "./ui/dropdown/DropdownItem";
import { useAuthStore } from "../../store/authStore";

// Types (copy from PostModal for compatibility)
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

interface PostAdminModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onPostTakenDown?: (postId: string) => void;
}

const PostAdminModal: React.FC<PostAdminModalProps> = ({
  post,
  isOpen,
  onClose,
  onPostTakenDown,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  );
  const [takingDown, setTakingDown] = useState(false);

  // State for paginated comments and replies
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [loadingReplies, setLoadingReplies] = useState<{
    [key: string]: boolean;
  }>({});
  const [replyPages, setReplyPages] = useState<{ [key: string]: number }>({});
  const [hasMoreReplies, setHasMoreReplies] = useState<{
    [key: string]: boolean;
  }>({});

  // Load paginated comments
  const loadComments = async (page: number) => {
    if (isLoadingComments || !hasMoreComments) return;
    setIsLoadingComments(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `https://localhost:7014/api/comment/post/${post.id}?page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        const userId = useAuthStore.getState().userId;
        const transformedData = data.map((comment: any) => ({
          ...comment,
          postedBy: {
            commenterName: comment.commenterName,
            commenterProfilePicture: comment.commenterProfilePicture,
            commenterId: comment.commenterId || comment.id,
          },
          isOwnComment: userId === comment.commenterId,
          isLikedByUser: comment.isLikedByUser || false,
          commentLikeCount: comment.commentLikeCount || 0,
        }));
        if (page === 1) {
          setComments(transformedData);
        } else {
          setComments((prev) => [...prev, ...transformedData]);
        }
        setHasMoreComments(data.length === 20);
        setCurrentPage(page);
      }
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Load paginated replies for a comment
  const loadReplies = async (commentId: string, page: number) => {
    if (loadingReplies[commentId] || !hasMoreReplies[commentId]) return;
    setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `https://localhost:7014/api/comment/${commentId}/replies?postId=${post.id}&page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        const transformedReplies = data.map((reply: any) => ({
          ...reply,
          postedBy: {
            commenterName: reply.commenterName,
            commenterProfilePicture: reply.commenterProfilePicture,
            commenterId: reply.commenterId || reply.id,
          },
        }));
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  replies:
                    page === 1
                      ? transformedReplies
                      : [...(c.replies || []), ...transformedReplies],
                }
              : c
          )
        );
        setHasMoreReplies((prev) => ({
          ...prev,
          [commentId]: data.length === 20,
        }));
        setReplyPages((prev) => ({
          ...prev,
          [commentId]: page,
        }));
      }
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  // On open, load first page of comments
  useEffect(() => {
    if (isOpen) {
      setComments([]);
      setCurrentPage(1);
      setHasMoreComments(true);
      setReplyPages({});
      setHasMoreReplies({});
      loadComments(1);
      setError(null);
      setSuccess(null);
    }
    // eslint-disable-next-line
  }, [isOpen, post.id]);

  // Admin: Take down post
  const handleTakeDownPost = async () => {
    setTakingDown(true);
    setError(null);
    setSuccess(null);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://localhost:7014/api/post/${post.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSuccess("Post taken down successfully.");
        if (onPostTakenDown) onPostTakenDown(post.id);
        setTimeout(() => onClose(), 1200);
      } else {
        setError("Failed to take down post.");
      }
    } catch {
      setError("Error taking down post.");
    } finally {
      setTakingDown(false);
    }
  };

  // Admin: Delete any comment
  const handleDeleteComment = async (commentId: string) => {
    setDeletingCommentId(commentId);
    setError(null);
    setSuccess(null);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `https://localhost:7014/api/comment/${commentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setSuccess("Comment deleted.");
      } else {
        setError("Failed to delete comment.");
      }
    } catch  {
      setError("Error deleting comment.");
    } finally {
      setDeletingCommentId(null);
    }
  };

  // UI: Render post media
  const renderMedia = () => {
    if (post.mediaType === "video") {
      return (
        <div className="w-full flex justify-center items-center">
          <video
            src={post.mediaUri}
            controls
            className="w-full max-h-[60vh] rounded-xl object-contain bg-black"
            style={{ background: "#000" }}
          />
        </div>
      );
    }
    return (
      <img
        src={post.mediaUri}
        alt={post.description}
        className="w-full max-h-[60vh] object-contain rounded-xl bg-black"
      />
    );
  };

  // Helper to format time
  function formatTime(dateString?: string) {
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

  // State for expanded replies
  const [expandedReplies, setExpandedReplies] = useState<{
    [key: string]: boolean;
  }>({});
  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  // Update renderCommentThread to add Load More Replies button
  const renderCommentThread = (
    comment: Comment,
    isReply = false,
    parentUserName?: string
  ) => (
    <div
      key={comment.id}
      className={`flex gap-3 mb-6 ${
        isReply
          ? "ml-10 border-l-2 border-blue-200 dark:border-blue-900 pl-4"
          : ""
      }`}
    >
      <img
        src={comment.postedBy.commenterProfilePicture}
        alt={comment.postedBy.commenterName}
        className={`w-8 h-8 rounded-full object-cover mt-1 ${
          isReply ? "opacity-90" : ""
        }`}
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800 dark:text-white">
            {comment.postedBy.commenterName}
          </span>
          <span className="text-xs text-gray-400">
            {formatTime(comment.commentedWhen)}
          </span>
          {isReply && parentUserName && (
            <span className="ml-2 text-xs text-blue-500">
              Replying to @{parentUserName}
            </span>
          )}
        </div>
        <div className="text-gray-700 dark:text-gray-200 mt-1">
          {comment.content}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteComment(comment.id)}
            disabled={deletingCommentId === comment.id}
          >
            {deletingCommentId === comment.id ? "Deleting..." : "Delete"}
          </Button>
        </div>
        {/* Render replies if expanded */}
        {!isReply && comment.replyCount > 0 && (
          <div className="mt-2">
            <button
              onClick={() => toggleReplies(comment.id)}
              className="text-xs text-blue-500 hover:underline"
            >
              {expandedReplies[comment.id]
                ? "Hide replies"
                : `View ${comment.replyCount} replies`}
            </button>
            {expandedReplies[comment.id] && (
              <div className="mt-4">
                {comment.replies &&
                  comment.replies.map((reply) =>
                    renderCommentThread(
                      reply,
                      true,
                      comment.postedBy.commenterName
                    )
                  )}
                {hasMoreReplies[comment.id] && (
                  <button
                    onClick={() =>
                      loadReplies(comment.id, (replyPages[comment.id] || 1) + 1)
                    }
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs mt-2"
                    disabled={loadingReplies[comment.id]}
                  >
                    {loadingReplies[comment.id]
                      ? "Loading..."
                      : "Load more replies"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Render all top-level comments
  const renderCommentsThread = () => (
    <div className="overflow-y-auto max-h-96 pr-2">
      {comments.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No comments.
        </div>
      ) : (
        <>
          {comments.map((comment) => renderCommentThread(comment))}
          {hasMoreComments && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => loadComments(currentPage + 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs"
                disabled={isLoadingComments}
              >
                {isLoadingComments ? "Loading..." : "Load more comments"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl w-full p-0">
      <div className="flex flex-col md:flex-row gap-6 p-6">
        <div className="flex-1 flex flex-col gap-4">
          {renderMedia()}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img
                src={post.authorProfilePicUri || "/default-profile-picture.jpg"}
                alt={post.authorUserName}
                className="w-10 h-10 rounded-full border"
              />
              <span className="font-semibold text-gray-800 dark:text-white">
                {post.authorUserName}
              </span>
              <Badge color="info" size="sm">
                {new Date(post.postedWhen).toLocaleString()}
              </Badge>
            </div>
            <div className="mb-2 text-gray-700 dark:text-gray-200 break-words whitespace-pre-line max-h-32 overflow-y-auto">
              {post.description}
            </div>
            <div className="flex flex-wrap gap-2 mb-2 break-words">
              {post.hashTags.map((tag) => (
                <Badge key={tag} color="primary" size="sm">
                  #{tag}
                </Badge>
              ))}
            </div>
            <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
              <span>Likes: {post.likeCount}</span>
              <span>Comments: {comments.length}</span>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant="primary"
              onClick={handleTakeDownPost}
              disabled={takingDown}
            >
              {takingDown ? "Taking Down..." : "Take Down Post"}
            </Button>
            <Dropdown
              isOpen={showDropdown}
              onClose={() => setShowDropdown(false)}
            >
              <DropdownItem onClick={handleTakeDownPost}>
                Take Down
              </DropdownItem>
            </Dropdown>
          </div>
          {error && <Alert variant="error" title="Error" message={error} />}
          {success && (
            <Alert variant="success" title="Success" message={success} />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            Comments
          </h3>
          {renderCommentsThread()}
        </div>
      </div>
    </Modal>
  );
};

export default PostAdminModal;
