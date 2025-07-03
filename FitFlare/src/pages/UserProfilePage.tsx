import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useProfileStore } from "../store/profileStore";
import PostModal from "../components/PostModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faComment,
  faLock,
  faClone,
  faBookmark,
} from "@fortawesome/free-solid-svg-icons";
import StoryModal, { StoryItem } from "../components/StoryModal";

interface CommentUser {
  commenterName: string;
  commenterProfilePicture: string;
  commenterId: string;
}

interface Comment {
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

interface Post {
  id: string;
  mediaUri: string;
  description: string;
  likeCount: number;
  mediaType: "image" | "video";
  postedById: string;
  commentCount: number;
  authorProfilePicUri: string | null;
  authorUserName: string;
  isLikedByUser: boolean;
  postedWhen: string;
  hashTags: string[];
  comments: Comment[];
}

interface SavedPost {
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

interface Follower {
  id: string;
  userName: string;
  profilePictureUri: string | null;
}

interface UserProfile {
  id: string;
  userName: string;
  email: string;
  fullName: string | null;
  bio: string | null;
  postsCount: number;
  isBanned: boolean;
  isPrivate: boolean;
  profilePictureUri: string | null;
  followersCount: number;
  followingCount: number;
  posts: Post[];
  savedPosts: SavedPost[];
}

interface ProfileForModal {
  profilePictureUri: string;
  userName: string;
  postsCount: number;
  bio: string;
  posts: Post[];
}

export default function UserProfilePage() {
  const { id } = useParams();
  const { token } = useAuthStore();
  const { profile: currentUserProfile } = useProfileStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(
    null
  );
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasSentRequest, setHasSentRequest] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [followings, setFollowings] = useState<Follower[]>([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingsModal, setShowFollowingsModal] = useState(false);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowings, setLoadingFollowings] = useState(false);
  const [profileStories, setProfileStories] = useState<StoryItem[]>([]);
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [storyModalInitialIndex, setStoryModalInitialIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://localhost:7014/api/appuser/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchUserProfile();
    }
  }, [id, token]);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!id || !token || !currentUserProfile?.id) return;
      try {
        const response = await fetch(
          `https://localhost:7014/api/follow/${id}/followers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch followers");
        }

        const text = await response.text();
        if (!text) {
          setIsFollowing(false);
          setHasSentRequest(false);
          return;
        }
        const data = JSON.parse(text);
        const isFollowed = data.some(
          (follower: Follower) => follower.id === currentUserProfile.id
        );
        setIsFollowing(isFollowed);

        const requestResponse = await fetch(
          `https://localhost:7014/api/notification/pending-follow-request/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (requestResponse.ok) {
          const requestData = await requestResponse.json();
          setHasSentRequest(requestData.hasPendingRequest);
        } else {
          console.error("Failed to check pending follow request");
          setHasSentRequest(false);
        }
      } catch (err) {
        console.error("Error checking follow status:", err);
      }
    };

    checkFollowStatus();
  }, [id, token, currentUserProfile?.id]);

  // Fetch stories for this profile
  useEffect(() => {
    const fetchStories = async () => {
      if (!profile?.id || !token) return;
      try {
        const response = await fetch(
          `https://localhost:7014/api/appuser/${profile.id}/stories`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) return;
        const data = await response.json();
        setProfileStories(data);
      } catch {
        console.log("Error fetching stories");
        
      }
    };
    fetchStories();
  }, [profile?.id, token]);

  const handlePostClick = (index: number) => {
    setSelectedPostIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedPostIndex(null);
  };

  const handleFollow = async () => {
    if (!id || !token || !profile || !currentUserProfile?.id) return;

    if (profile.isPrivate && !isFollowing && !hasSentRequest) {
      const notificationData = {
        notificationType: "FollowRequest",
        addressedUserId: id,
        triggeredUserId: currentUserProfile.id,
        message: `${currentUserProfile.userName} requested to follow you.`,
      };

      try {
        const response = await fetch(
          "https://localhost:7014/api/notification",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(notificationData),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to send follow request: ${errorText}`);
        }

        setHasSentRequest(true);
        alert("Follow request sent!");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error sending follow request:", err);
      }
    } else {
      const method = isFollowing ? "DELETE" : "POST";
      const endpoint = `https://localhost:7014/api/follow/${id}`;

      try {
        const response = await fetch(endpoint, {
          method: method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to ${
              isFollowing ? "unfollow" : "follow"
            } user: ${errorText}`
          );
        }

        setIsFollowing(!isFollowing);
        setProfile((prevProfile) => {
          if (!prevProfile) return null;
          return {
            ...prevProfile,
            followersCount: isFollowing
              ? prevProfile.followersCount - 1
              : prevProfile.followersCount + 1,
          };
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error following/unfollowing:", err);
      }
    }
  };

  const fetchFollowers = async () => {
    if (!id || !token) return;
    try {
      setLoadingFollowers(true);
      const response = await fetch(
        `https://localhost:7014/api/follow/${id}/followers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch followers");
      }

      const text = await response.text();
      if (!text) {
        setFollowers([]);
        return;
      }
      const data = JSON.parse(text);
      setFollowers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingFollowers(false);
    }
  };

  const fetchFollowings = async () => {
    if (!id || !token) return;
    try {
      setLoadingFollowings(true);
      const response = await fetch(
        `https://localhost:7014/api/follow/${id}/followings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch followings");
      }

      const text = await response.text();
      if (!text) {
        setFollowings([]);
        return;
      }
      const data = JSON.parse(text);
      setFollowings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingFollowings(false);
    }
  };

  const handleFollowersClick = async () => {
    setShowFollowersModal(true);
    await fetchFollowers();
  };

  const handleFollowingsClick = async () => {
    setShowFollowingsModal(true);
    await fetchFollowings();
  };

  const handleRemoveFollower = async (followerId: string) => {
    if (!id || !token) return;
    try {
      const response = await fetch(
        `https://localhost:7014/api/follow/${id}/followers/${followerId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove follower");
      }

      setProfile((prevProfile) => {
        if (!prevProfile) return null;
        return {
          ...prevProfile,
          followersCount: prevProfile.followersCount - 1,
        };
      });

      setFollowers((prevFollowers) =>
        prevFollowers.filter((follower) => follower.id !== followerId)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error removing follower:", err);
    }
  };

  const handleRemoveFollowing = async (followingId: string) => {
    if (!id || !token) return;
    try {
      const response = await fetch(
        `https://localhost:7014/api/follow/${id}/followings/${followingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove following");
      }

      setProfile((prevProfile) => {
        if (!prevProfile) return null;
        return {
          ...prevProfile,
          followingCount: prevProfile.followingCount - 1,
        };
      });

      setFollowings((prevFollowings) =>
        prevFollowings.filter((following) => following.id !== followingId)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error removing following:", err);
    }
  };

  // Handler for profile picture click
  const handleProfilePicClick = () => {
    if (profile && profileStories.length > 0) {
      setStoryModalOpen(true);
      setStoryModalInitialIndex(0);
    } else if (profile && currentUserProfile?.id === profile.id) {
      navigate("/uploadpost?tab=story");
    }
  };

  if (loading) {
    return (
      <section className="relative max-w-5xl mx-auto md:ml-82 px-4 md:px-8 pb-20 h-full min-h-screen">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative max-w-5xl mx-auto md:ml-82 px-4 md:px-8 pb-20 h-full min-h-screen">
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="relative max-w-5xl mx-auto md:ml-82 px-4 md:px-8 pb-20 h-full min-h-screen">
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            User not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The user you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </section>
    );
  }

  const isOwnProfile = currentUserProfile?.id === profile.id;

  return (
    <section className="relative max-w-5xl mx-auto md:ml-82 px-4 md:px-8 pb-20 h-full min-h-screen">
      <div className="flex flex-col h-full">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 py-8">
          <div className="md:flex-shrink-0">
            <div
              className={`size-40 flex items-center justify-center relative`}
              style={{ cursor: "pointer" }}
              onClick={handleProfilePicClick}
            >
              {profileStories.length > 0 ? (
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 dark:from-indigo-900 dark:to-green-900"></span>
              ) : null}
              <div
                className={`rounded-full size-36 flex items-center justify-center bg-white dark:bg-[#1C1C1E] z-10 ${
                  profileStories.length > 0 ? "relative" : ""
                }`}
              >
                <img
                  className="rounded-full size-36 object-cover"
                  src={
                    profile.profilePictureUri ?? "/default-profile-picture.jpg"
                  }
                  alt="profile"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 flex-grow">
            <div className="flex flex-row sm:items-center gap-4">
              <h2 className="text-xl font-normal dark:text-[#EAEAEA]">
                {profile.userName}
              </h2>
              {!isOwnProfile && (
                <div className="flex gap-2">
                  {profile.isPrivate ? (
                    <button
                      onClick={handleFollow}
                      className="px-4 py-1.5 dark:text-[#EAEAEA] bg-gray-200 dark:bg-gray-800 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      {isFollowing
                        ? "Following"
                        : hasSentRequest
                        ? "Requested"
                        : "Follow"}
                    </button>
                  ) : (
                    <button
                      onClick={handleFollow}
                      className="px-4 py-1.5 dark:text-[#EAEAEA] bg-gray-200 dark:bg-gray-800 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-8 text-sm">
              <div className="dark:text-[#EAEAEA]">
                <span className="font-semibold">{profile.postsCount}</span>{" "}
                posts
              </div>
              <div
                className={`hover:opacity-80 dark:text-[#EAEAEA] ${
                  profile.isPrivate && !isFollowing
                    ? "cursor-default"
                    : "cursor-pointer"
                }`}
                onClick={
                  profile.isPrivate && !isFollowing
                    ? undefined
                    : handleFollowersClick
                }
              >
                <span className="font-semibold">{profile.followersCount}</span>{" "}
                followers
              </div>
              <div
                className={`hover:opacity-80 dark:text-[#EAEAEA] ${
                  profile.isPrivate && !isFollowing
                    ? "cursor-default"
                    : "cursor-pointer"
                }`}
                onClick={
                  profile.isPrivate && !isFollowing
                    ? undefined
                    : handleFollowingsClick
                }
              >
                <span className="font-semibold">{profile.followingCount}</span>{" "}
                following
              </div>
            </div>

            <div className="text-sm leading-snug dark:text-[#EAEAEA]">
              <p className="font-semibold">
                {profile.fullName ?? profile.userName}
              </p>
              <p>{profile.bio}</p>
            </div>
          </div>
        </div>

        {(!profile.isPrivate || isFollowing) && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-800 h-full">
              <div className="flex justify-center">
                <button
                  className={`flex items-center gap-1.5 px-6 py-4 text-xs font-semibold tracking-wider uppercase ${
                    activeTab === "posts"
                      ? "border-t border-black dark:border-white text-black dark:text-white"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("posts")}
                >
                  <span className="text-base">
                    <FontAwesomeIcon icon={faClone} />
                  </span>{" "}
                  Posts
                </button>
                {isOwnProfile && (
                  <button
                    className={`flex items-center gap-1.5 px-6 py-4 text-xs font-semibold tracking-wider uppercase ${
                      activeTab === "saved"
                        ? "border-t border-black dark:border-white text-black dark:text-white"
                        : "text-gray-500"
                    }`}
                    onClick={() => setActiveTab("saved")}
                  >
                    <span className="text-base">
                      <FontAwesomeIcon icon={faBookmark} />
                    </span>{" "}
                    Saved
                  </button>
                )}
              </div>
            </div>

            {activeTab === "posts" && profile.postsCount > 0 ? (
              <div className="grid grid-cols-3 gap-1 md:gap-6 mt-4 h-full">
                {profile.posts.map((post, index) => (
                  <div
                    key={post.id}
                    className="relative aspect-square group cursor-pointer"
                    onClick={() => handlePostClick(index)}
                  >
                    {post.mediaType === "image" ? (
                      <img
                        src={post.mediaUri}
                        alt={post.description}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={post.mediaUri}
                        className="w-full h-full object-cover relative"
                      />
                    )}
                    <div className="absolute inset-0 dark:bg-[#EAF2EF]/70 bg-[#1C1C1E]/70 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-8 text-white font-semibold">
                        <div className="flex items-center gap-1 dark:text-[#2E2E2E] text-[#EAF2EF]">
                          <FontAwesomeIcon icon={faHeart} /> {post.likeCount}
                        </div>
                        <div className="flex items-center gap-1 dark:text-[#2E2E2E] text-[#EAF2EF]">
                          <FontAwesomeIcon icon={faComment} />{" "}
                          {post.commentCount}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeTab === "saved" && profile.savedPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 md:gap-6 mt-4 h-full">
                {profile.savedPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="relative aspect-square group cursor-pointer"
                    onClick={() => handlePostClick(index)}
                  >
                    {post.mediaType === "image" ? (
                      <img
                        src={post.mediaUri}
                        alt={post.description}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={post.mediaUri}
                        className="w-full h-full object-cover relative"
                      />
                    )}
                    <div className="absolute inset-0 dark:bg-[#EAF2EF]/70 bg-[#1C1C1E]/70 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-8 text-white font-semibold">
                        <div className="flex items-center gap-1 dark:text-[#2E2E2E] text-[#EAF2EF]">
                          <FontAwesomeIcon icon={faHeart} /> {post.likeCount}
                        </div>
                        <div className="flex items-center gap-1 dark:text-[#2E2E2E] text-[#EAF2EF]">
                          <FontAwesomeIcon icon={faComment} />{" "}
                          {post.commentCount}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                {activeTab === "posts" ? (
                  <>
                    <div className="text-6xl mb-4">
                      <FontAwesomeIcon icon={faClone} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">No Posts Yet</h3>
                    <p className="text-sm">
                      When they share photos, they will appear here.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">
                      <FontAwesomeIcon icon={faBookmark} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      No Saved Posts
                    </h3>
                    <p className="text-sm">
                      Save photos and videos that you want to see again.
                    </p>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {profile.isPrivate && !isFollowing && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <FontAwesomeIcon icon={faLock} className="text-6xl mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              This Account is Private
            </h3>
            <p className="text-sm">
              Follow this account to see their photos and videos.
            </p>
          </div>
        )}

        {selectedPostIndex !== null && (
          <PostModal
            profile={
              {
                ...profile,
                profilePictureUri:
                  profile.profilePictureUri ?? "/default-profile-picture.jpg",
              } as ProfileForModal
            }
            posts={activeTab === "posts" ? profile.posts : profile.savedPosts}
            savedPosts={profile.savedPosts as SavedPost[]}
            initialPostIndex={selectedPostIndex}
            isOpen={selectedPostIndex !== null}
            onClose={handleCloseModal}
            setSavedPosts={() => {}}
            isOwnProfile={isOwnProfile}
            isSavedPostsTab={activeTab === "saved"}
          />
        )}

        {/* Followers Modal */}
        {showFollowersModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-[#262626] rounded-xl shadow-xl w-full max-w-sm max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Followers
                </h3>
                <button
                  onClick={() => setShowFollowersModal(false)}
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
                {loadingFollowers ? (
                  <div className="flex justify-center items-center p-6">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                  </div>
                ) : followers.length > 0 ? (
                  followers.map((follower) => (
                    <div
                      key={follower.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#333333] transition-colors"
                    >
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => {
                          setShowFollowersModal(false);
                          navigate(`/user/${follower.id}`);
                        }}
                      >
                        <img
                          src={
                            follower.profilePictureUri ??
                            "/default-profile-picture.jpg"
                          }
                          alt={follower.userName}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                        <div>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">
                            {follower.userName}
                          </p>
                        </div>
                      </div>
                      {isOwnProfile && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent modal closing
                            handleRemoveFollower(follower.id);
                          }}
                          className="px-3 py-1 bg-red-500 text-white rounded-md text-sm font-semibold hover:bg-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    No followers yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Followings Modal */}
        {showFollowingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-[#262626] rounded-xl shadow-xl w-full max-w-sm max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Following
                </h3>
                <button
                  onClick={() => setShowFollowingsModal(false)}
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
                {loadingFollowings ? (
                  <div className="flex justify-center items-center p-6">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                  </div>
                ) : followings.length > 0 ? (
                  followings.map((following) => (
                    <div
                      key={following.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#333333] transition-colors"
                    >
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => {
                          setShowFollowingsModal(false);
                          navigate(`/user/${following.id}`);
                        }}
                      >
                        <img
                          src={
                            following.profilePictureUri ??
                            "/default-profile-picture.jpg"
                          }
                          alt={following.userName}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                        <div>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">
                            {following.userName}
                          </p>
                        </div>
                      </div>
                      {isOwnProfile && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent modal closing
                            handleRemoveFollowing(following.id);
                          }}
                          className="px-3 py-1 bg-red-500 text-white rounded-md text-sm font-semibold hover:bg-red-600 transition-colors"
                        >
                          Unfollow
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    Not following anyone yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Story Modal for profile */}
        <StoryModal
          stories={profileStories}
          initialIndex={storyModalInitialIndex}
          isOpen={storyModalOpen}
          onClose={() => setStoryModalOpen(false)}
          currentUserId={currentUserProfile?.id}
        />
      </div>
    </section>
  );
}
