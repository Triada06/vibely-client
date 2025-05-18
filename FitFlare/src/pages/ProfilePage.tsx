import { Link } from "react-router-dom";
import { useState } from "react";
import {
  faBookmark,
  faClone,
  faComment,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Post {
  id: number;
  imageUrl: string;
  likes: number;
  comments: number;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");

  const posts: Post[] = [
    {
      id: 1,
      imageUrl: "/src/assets/imgs/Orenstein.jpg",
      likes: 100,
      comments: 20,
    },
    {
      id: 2,
      imageUrl: "/src/assets/imgs/Orenstein.jpg",
      likes: 150,
      comments: 30,
    },
    {
      id: 3,
      imageUrl: "/src/assets/imgs/Orenstein.jpg",
      likes: 200,
      comments: 40,
    },
    {
      id: 4,
      imageUrl: "/src/assets/imgs/Orenstein.jpg",
      likes: 200,
      comments: 40,
    },
  ];

  return (
    <section className="relative max-w-5xl mx-auto md:ml-82 px-4 md:px-8 h-full min-h-screen">
      <div className="flex flex-col h-full">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 py-8">
          <div className="md:flex-shrink-0">
            <img
              className="rounded-full w-32 h-32 md:w-40 md:h-40 object-cover "
              src="/src/assets/imgs/Orenstein.jpg"
              alt="profile"
            />
          </div>

          <div className="flex flex-col gap-6 flex-grow">
            <div className="flex flex-row sm:items-center gap-4">
              <h2 className="text-xl font-normal dark:text-[#EAEAEA]">
                tri1ada
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
                <span className="font-semibold ">{posts.length}</span> posts
              </div>
              <button className="hover:opacity-80 dark:text-[#EAEAEA]">
                <span className="font-semibold">1,200</span> followers
              </button>
              <button className="hover:opacity-80 dark:text-[#EAEAEA]">
                <span className="font-semibold dark:text-gray">300 </span>
                following
              </button>
            </div>

            <div className="text-sm leading-snug  dark:text-[#EAEAEA]">
              <p className="font-semibold">
                Nizami THE GREATEST DEVELOPER EVER
              </p>
              <p>Ts nigga goons to lebron</p>
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

        {activeTab === "posts" && posts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-6 mt-4 h-full">
            {posts.map((post) => (
              <div
                key={post.id}
                className="relative aspect-square group cursor-pointer"
              >
                <img
                  src={post.imageUrl}
                  alt={`Post ${post.id}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-8 text-white font-semibold">
                    <div className="flex items-center gap-1">
                      <span>
                        <FontAwesomeIcon icon={faHeart} />
                      </span>{" "}
                      {post.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <span>
                        <FontAwesomeIcon icon={faComment} />
                      </span>{" "}
                      {post.comments}
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
      </div>
    </section>
  );
}
