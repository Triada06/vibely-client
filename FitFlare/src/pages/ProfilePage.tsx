import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  faBookmark,
  faClone,
  faComment,
  faHeart,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useProfileStore } from "../store/profileStore";
import PostModal from "../components/PostModal";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(
    null
  );

  const { profile, fetchUser } = useProfileStore();

  useEffect(() => {
    fetchUser();
  }, []);

  const handlePostClick = (index: number) => {
    setSelectedPostIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedPostIndex(null);
  };

  return (
    <section className="relative max-w-5xl mx-auto md:ml-82 px-4 md:px-8 h-full min-h-screen">
      <div className="flex flex-col h-full">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 py-8">
          <div className="md:flex-shrink-0">
            <img
              className="rounded-full w-32 h-32 md:w-40 md:h-40 object-cover"
              src={profile?.profilePictureUri}
              alt="profile"
            />
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
              </div>
            </div>

            <div className="flex gap-8 text-sm">
              <div className="dark:text-[#EAEAEA]">
                <span className="font-semibold">{profile?.postsCount}</span>{" "}
                posts
              </div>
              <div className="hover:opacity-80 dark:text-[#EAEAEA]">
                <span className="font-semibold">{profile?.followersCount}</span>{" "}
                followers
              </div>
              <div className="hover:opacity-80 dark:text-[#EAEAEA]">
                <span className="font-semibold">{profile?.followingCount}</span>{" "}
                following
              </div>
            </div>

            <div className="text-sm leading-snug dark:text-[#EAEAEA]">
              <p className="font-semibold">{profile?.fullName}</p>
              <p>{profile?.description}</p>
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
            profile={profile}
            posts={profile.posts}
            initialPostIndex={selectedPostIndex}
            isOpen={selectedPostIndex !== null}
            onClose={handleCloseModal}
            user
          />
        )}
      </div>
    </section>
  );
}
