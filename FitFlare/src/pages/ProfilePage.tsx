import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  faBookmark,
  faClone,
  faComment,
  faGear,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useProfileStore } from "../store/profileStore";
import PostModal from "../components/PostModal";
import { useAuthStore } from "../store/authStore";
import type { Post, SavedPost } from "../components/PostModal";
import StoryModal, { StoryItem } from "../components/StoryModal";

interface ProfileData {
  isPrivate: boolean;
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

interface Follower {
  id: string;
  userName: string;
  profilePictureUri: string | null;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(
    null
  );
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [followings, setFollowings] = useState<Follower[]>([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingsModal, setShowFollowingsModal] = useState(false);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowings, setLoadingFollowings] = useState(false);
  const [profileStories, setProfileStories] = useState<StoryItem[]>([]);
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [storyModalInitialIndex, setStoryModalInitialIndex] = useState(0);

  const { profile, fetchUser } = useProfileStore();
  const { token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  // Fetch stories for this profile
  useEffect(() => {
    const fetchStories = async () => {
      if (!profile?.id || !token) return;
      const response = await fetch(
        `https://localhost:7014/api/appuser/${profile.id}/stories`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) return;
      const data = await response.json();
      setProfileStories(data);
    };
    fetchStories();
  }, [profile?.id, token]);

  const handlePostClick = (index: number) => {
    setSelectedPostIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedPostIndex(null);
  };

  const fetchFollowers = async () => {
    if (!profile?.id || !token) return;
    try {
      setLoadingFollowers(true);
      const response = await fetch(
        `https://localhost:7014/api/follow/${profile.id}/followers`,
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
      console.error("Error fetching followers:", err);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const fetchFollowings = async () => {
    if (!profile?.id || !token) return;
    try {
      setLoadingFollowings(true);
      const response = await fetch(
        `https://localhost:7014/api/follow/${profile.id}/followings`,
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
      console.error("Error fetching followings:", err);
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

  // Handler for profile picture click
  const handleProfilePicClick = () => {
    if (profile?.id === profile?.id && profileStories.length > 0) {
      setStoryModalOpen(true);
      setStoryModalInitialIndex(0);
    } else if (profile?.id === profile?.id) {
      navigate("/uploadpost?tab=story");
    }
  };

  return (
    <section className="relative max-w-5xl mx-auto md:ml-82 px-4 md:px-8  pb-20 h-full min-h-screen">
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
                    profile?.profilePictureUri ?? "/default-profile-picture.jpg"
                  }
                  alt="profile"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 flex-grow">
            <div className="flex flex-row sm:items-center gap-4">
              <h2 className="text-xl font-normal dark:text-[#EAEAEA]">
                {profile?.userName}
              </h2>
              <div className="flex gap-2">
                <Link
                  to="edit"
                  className="px-4 py-1.5 dark:text-[#EAEAEA] bg-gray-200 dark:bg-gray-800 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Edit Profile
                </Link>
                <Link
                  to="settings"
                  className="px-4 py-1.5 md:hidden dark:text-[#EAEAEA]   text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <FontAwesomeIcon className="mr-2" size="xl" icon={faGear} />
                </Link>
              </div>
            </div>

            <div className="flex gap-8 text-sm">
              <div className="dark:text-[#EAEAEA]">
                <span className="font-semibold">{profile?.postsCount}</span>{" "}
                posts
              </div>
              <div
                className="hover:opacity-80 dark:text-[#EAEAEA] cursor-pointer"
                onClick={handleFollowersClick}
              >
                <span className="font-semibold">{profile?.followersCount}</span>{" "}
                followers
              </div>
              <div
                className="hover:opacity-80 dark:text-[#EAEAEA] cursor-pointer"
                onClick={handleFollowingsClick}
              >
                <span className="font-semibold">{profile?.followingCount}</span>{" "}
                following
              </div>
            </div>

            <div className="text-sm leading-snug dark:text-[#EAEAEA]">
              <p className="font-semibold">
                {profile?.fullName ?? profile?.userName}
              </p>
              <p>{profile?.bio}</p>
            </div>
          </div>
        </div>
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
          </div>
        </div>
        {activeTab === "posts" && profile?.postsCount! > 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-6 mt-4 h-full">
            {profile?.posts.map((post, index) => (
              <div
                key={post.id}
                className="relative aspect-square group cursor-pointer"
                onClick={() => handlePostClick(index)}
              >
                {post.mediaType === "image" ? (
                  <img
                    src={post.mediaUri}
                    alt={`Post ${post.id}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={post.mediaUri}
                    className="w-full h-full object-cover relative"
                  ></video>
                )}
                <div className="absolute inset-0 dark:bg-[#EAF2EF]/70 bg-[#1C1C1E]/70 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-8 text-white font-semibold">
                    <div className="flex items-center gap-1 dark:text-[#2E2E2E] text-[#EAF2EF]">
                      <span>
                        <FontAwesomeIcon icon={faHeart} />
                      </span>{" "}
                      {post.likeCount}
                    </div>
                    <div className="flex items-center gap-1 dark:text-[#2E2E2E] text-[#EAF2EF]">
                      <span>
                        <FontAwesomeIcon icon={faComment} />
                      </span>{" "}
                      {post.commentCount}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "saved" && profile?.savedPosts?.length! > 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-6 mt-4 h-full">
            {profile!.savedPosts.map((post, index) => (
              <div
                key={post.id}
                className="relative aspect-square group cursor-pointer"
                onClick={() => handlePostClick(index)}
              >
                {post.mediaType === "image" ? (
                  <img
                    src={post.mediaUri}
                    alt={`Saved Post ${post.id}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={post.mediaUri}
                    className="w-full h-full object-cover relative"
                  ></video>
                )}
                <div className="absolute inset-0 dark:bg-[#EAF2EF]/70 bg-[#1C1C1E]/70 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-8 text-white font-semibold">
                    <div className="flex items-center gap-1 dark:text-[#2E2E2E] text-[#EAF2EF]">
                      <span>
                        <FontAwesomeIcon icon={faHeart} />
                      </span>{" "}
                      {post.likeCount}
                    </div>
                    <div className="flex items-center gap-1 dark:text-[#2E2E2E] text-[#EAF2EF]">
                      <span>
                        <FontAwesomeIcon icon={faComment} />
                      </span>{" "}
                      {post.commentCount}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            {activeTab === "posts" && (
              <>
                <div className="text-6xl mb-4">
                  <FontAwesomeIcon icon={faClone} />
                </div>
                <h3 className="font-semibold text-lg mb-2">Share Photos</h3>
                <p className="text-sm">
                  When you share photos, they will appear on your profile.
                </p>
              </>
            )}
            {activeTab === "saved" && (
              <>
                <div className="text-6xl mb-4">
                  <FontAwesomeIcon icon={faBookmark} />
                </div>
                <h3 className="font-semibold text-lg mb-2">Save</h3>
                <p className="text-sm">
                  Save photos and videos that you want to see again.
                </p>
              </>
            )}
          </div>
        )}
        {selectedPostIndex !== null && profile?.posts && (
          <PostModal
            profile={{
              profilePictureUri:
                profile.profilePictureUri ?? "/default-profile-picture.jpg",
              userName: profile.userName,
              postsCount: profile.postsCount,
              bio: profile.bio,
              posts: profile.posts,
            }}
            posts={activeTab === "posts" ? profile.posts : profile.savedPosts}
            savedPosts={profile.savedPosts as SavedPost[]}
            initialPostIndex={selectedPostIndex}
            isOpen={selectedPostIndex !== null}
            onClose={handleCloseModal}
            setSavedPosts={(posts) => {
              if (profile) {
                profile.savedPosts = posts;
              }
            }}
            isOwnProfile={true}
            isSavedPostsTab={activeTab === "saved"}
          />
        )}

        {/* Followers Modal */}
        {showFollowersModal && profile && (
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
                      className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#333333] transition-colors cursor-pointer"
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
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    You have no followers yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Followings Modal */}
        {showFollowingsModal && profile && (
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
                      className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#333333] transition-colors cursor-pointer"
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
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    You are not following anyone yet.
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
          currentUserId={profile?.id}
        />
      </div>
    </section>
  );
}
