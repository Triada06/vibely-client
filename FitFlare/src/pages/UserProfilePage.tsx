import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  isSavedByUSer: boolean;
  postedWhen: string;
  hashTags: string[];
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
  savedPosts: Post[];
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
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");

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

  const handlePostClick = (index: number) => {
    setSelectedPostIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedPostIndex(null);
  };

  const handleFollow = async () => {
    // TODO: Implement follow functionality
    setIsFollowing(!isFollowing);
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
            <img
              className="rounded-full w-32 h-32 md:w-40 md:h-40 object-cover"
              src={profile.profilePictureUri ?? "/default-profile-picture.jpg"}
              alt="profile"
            />
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
                      {isFollowing ? "Following" : "Follow Request"}
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
              <div className="hover:opacity-80 dark:text-[#EAEAEA]">
                <span className="font-semibold">{profile.followersCount}</span>{" "}
                followers
              </div>
              <div className="hover:opacity-80 dark:text-[#EAEAEA]">
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
            profile={profile}
            posts={activeTab === "posts" ? profile.posts : profile.savedPosts}
            savedPosts={profile.savedPosts}
            initialPostIndex={selectedPostIndex}
            isOpen={selectedPostIndex !== null}
            onClose={handleCloseModal}
            setSavedPosts={() => {}}
            isOwnProfile={isOwnProfile}
            isSavedPostsTab={activeTab === "saved"}
          />
        )}
      </div>
    </section>
  );
}
