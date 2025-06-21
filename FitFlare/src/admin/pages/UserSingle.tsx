import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import PostAdminModal from "../components/PostAdminModal";
import Button from "../components/ui/button/Button";
import BanModal from "../components/common/BanModal";

interface Post {
  id: string;
  mediaUri: string;
  description: string;
  likeCount: number;
  mediaType: string;
  postedById: string;
  commentCount: number;
  authorProfilePicUri: string;
  authorUserName: string;
  isLikedByUser: boolean;
  isSavedByUSer: boolean;
  postedWhen: string;
  hashTags: string[];
  comments?: any[];
}

interface Ban {
  id: string;
  reason: string;
  bannedAt: string;
  expiresAt: string | null;
}

interface User {
  id: string;
  fullName: string;
  profilePictureUri: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  isPrivate: boolean;
  createdAt: string;
  posts: Post[];
  bans: Ban[];
}

export default function UserSinglePage() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedPostWithComments, setSelectedPostWithComments] =
    useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [selectedBan, setSelectedBan] = useState<Ban | null>(null);
  const [banLoading, setBanLoading] = useState(false);
  const [banError, setBanError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `https://localhost:7014/api/admin/appuser/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setPosts(data.posts || []);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // When a post is selected, fetch its comments
  useEffect(() => {
    const fetchComments = async () => {
      if (selectedPost) {
        const token = localStorage.getItem("token");
        try {
          const res = await fetch(
            `https://localhost:7014/api/comment/post/${selectedPost.id}?page=1`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.ok) {
            const comments = await res.json();
            setSelectedPostWithComments({ ...selectedPost, comments });
          } else {
            setSelectedPostWithComments({ ...selectedPost, comments: [] });
          }
        } catch {
          setSelectedPostWithComments({ ...selectedPost, comments: [] });
        }
      } else {
        setSelectedPostWithComments(null);
      }
    };
    fetchComments();
  }, [selectedPost]);

  // Admin: Delete post from grid
  const handleDeletePost = async (postId: string) => {
    setDeletingPostId(postId);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://localhost:7014/api/post/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (err) {
      // Optionally show error
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleOpenUpdateModal = (ban: Ban) => {
    setSelectedBan(ban);
    setIsBanModalOpen(true);
    setBanError(null);
  };

  const handleUnban = async (banId: string) => {
    if (!window.confirm("Are you sure you want to remove this ban record?"))
      return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://localhost:7014/api/admin/ban/${banId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchUser(); // Refresh user data
      } else {
        const errorText = await res.text();
        alert(`Failed to unban: ${errorText}`);
      }
    } catch (err) {
      alert("An error occurred while unbanning.");
    }
  };

  const handleUpdateBanSubmit = async ({
    reason,
    expiresAt,
  }: {
    reason: string;
    expiresAt: string | null;
  }) => {
    if (!selectedBan) return;
    setBanLoading(true);
    setBanError(null);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `https://localhost:7014/api/admin/ban/${selectedBan.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason, expiresAt }),
        }
      );

      if (res.ok) {
        setIsBanModalOpen(false);
        setSelectedBan(null);
        fetchUser(); // Refresh user data
      } else {
        const errText = await res.text();
        try {
          const errJson = JSON.parse(errText);
          setBanError(
            errJson.detail ||
              errJson.title ||
              errText ||
              "Failed to update ban."
          );
        } catch (e) {
          setBanError(errText || "Failed to update ban.");
        }
      }
    } catch (e) {
      setBanError("Network error.");
    } finally {
      setBanLoading(false);
    }
  };

  // When a post is taken down from modal, remove from grid
  const handlePostTakenDown = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setSelectedPost(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 text-gray-400 dark:text-gray-500 text-lg">
        Loading user...
      </div>
    );
  }
  if (!user) {
    return (
      <div className="flex justify-center items-center h-96 text-red-400 dark:text-red-500 text-lg">
        User not found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-lg">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-8">
        <img
          src={user.profilePictureUri || "/default-profile-picture.jpg"}
          alt={user.fullName}
          className="w-32 h-32 rounded-full border-4 border-gray-200 dark:border-gray-700 object-cover"
        />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {user.fullName}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-2">{user.bio}</p>
          <div className="flex flex-wrap gap-4 mb-2">
            <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm">
              {user.isPrivate ? "Private Account" : "Public Account"}
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm">
              Followers: {user.followersCount}
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm">
              Following: {user.followingCount}
            </span>
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            Joined: {new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Posts
        </h3>
        {posts.length === 0 ? (
          <div className="text-gray-400 dark:text-gray-500">No posts yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 flex flex-col gap-2 cursor-pointer hover:shadow-lg transition"
                onClick={() => setSelectedPost(post)}
              >
                {post.mediaType === "video" ? (
                  <video
                    src={post.mediaUri}
                    controls
                    className="w-full h-40 rounded-lg object-cover bg-black"
                  />
                ) : (
                  <img
                    src={post.mediaUri}
                    alt={post.description}
                    className="w-full h-40 rounded-lg object-cover bg-black"
                  />
                )}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src={post.authorProfilePicUri}
                        alt={post.authorUserName}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {post.authorUserName}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                        {new Date(post.postedWhen).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-200 mb-2 truncate">
                      {post.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {post.hashTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                    <span>Likes: {post.likeCount}</span>
                    <span>Comments: {post.commentCount}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => handleDeletePost(post.id)}
                  disabled={deletingPostId === post.id}
                >
                  {deletingPostId === post.id ? "Deleting..." : "Delete Post"}
                </Button>
              </div>
            ))}
          </div>
        )}
        {/* Post Admin Modal */}
        {selectedPostWithComments && (
          <PostAdminModal
            post={selectedPostWithComments as any}
            isOpen={!!selectedPostWithComments}
            onClose={() => setSelectedPost(null)}
            onPostTakenDown={handlePostTakenDown}
          />
        )}
      </div>
      {/* Bans Section */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Ban History
        </h3>
        {user.bans.length === 0 ? (
          <div className="text-gray-400 dark:text-gray-500">
            No bans recorded for this user.
          </div>
        ) : (
          <div className="space-y-4">
            {user.bans.map((ban) => (
              <div
                key={ban.id}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {ban.reason}
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span>
                      Banned on: {new Date(ban.bannedAt).toLocaleDateString()}
                    </span>
                    <span className="mx-2">|</span>
                    <span>
                      Expires:{" "}
                      {ban.expiresAt
                        ? new Date(ban.expiresAt).toLocaleDateString()
                        : "Permanent"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenUpdateModal(ban)}
                  >
                    Update
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleUnban(ban.id)}
                    className="bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                  >
                    Unban
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BanModal
        isOpen={isBanModalOpen}
        onClose={() => setIsBanModalOpen(false)}
        onSubmit={handleUpdateBanSubmit}
        loading={banLoading}
        error={banError}
        initialReason={selectedBan?.reason}
        initialExpiresAt={selectedBan?.expiresAt}
      />
    </div>
  );
}
