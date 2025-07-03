import { useState, useEffect, useRef } from "react";
import { FiSearch, FiUser, FiHash } from "react-icons/fi";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { useProfileStore } from "../store/profileStore";
import PostModal from "../components/PostModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faHeart, faComment } from "@fortawesome/free-solid-svg-icons";

interface UserResult {
  id: string;
  userName: string;
  profilePictureUri: string | null;
  isPrivate: boolean;
}

interface TagResult {
  id: string;
  name: string;
  usedCount: number;
}

interface SearchResult {
  id: string;
  type: "profile" | "hashtag";
  name: string;
  image?: string | null;
  postsCount?: number;
  isPrivate?: boolean;
}

interface Post {
  id: string;
  mediaUri: string;
  mediaType: "image" | "video";
  likeCount: number;
  commentCount: number;
  description: string;
  postedWhen: string;
  hashTags: string[];
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(
    null
  );
  const [userProfile] = useState<any>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { token } = useAuthStore();
  const { profile } = useProfileStore();
  const navigate = useNavigate();

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search API calls
  useEffect(() => {
    const searchUsers = async (query: string) => {
      try {
        const response = await fetch(
          `https://localhost:7014/api/appuser/search?searchText=${encodeURIComponent(
            query
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data: UserResult[] = await response.json();
        return data.map((user) => ({
          id: user.id,
          type: "profile" as const,
          name: user.userName,
          image: user.profilePictureUri,
          isPrivate: user.isPrivate,
        }));
      } catch (error) {
        console.error("Error searching users:", error);
        return [];
      }
    };

    const searchTags = async (query: string) => {
      try {
        const response = await fetch(
          `https://localhost:7014/api/tag/search?searchText=${encodeURIComponent(
            query
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data: TagResult[] = await response.json();
        return data.map((tag) => ({
          id: tag.id,
          type: "hashtag" as const,
          name: tag.name.replace("#", ""),
          postsCount: tag.usedCount,
        }));
      } catch (error) {
        console.error("Error searching tags:", error);
        return [];
      }
    };

    const performSearch = async () => {
      if (searchQuery.length > 0 && token) {
        setIsLoading(true);
        try {
          const isHashtagSearch = searchQuery.startsWith("#");
          const searchTerm = isHashtagSearch
            ? searchQuery.slice(1)
            : searchQuery;

          const results = isHashtagSearch
            ? await searchTags(searchTerm)
            : await searchUsers(searchTerm);

          setSuggestions(results);
        } catch (error) {
          console.error("Search error:", error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, token]);

  const fetchTagPosts = async (tagId: string) => {
    try {
      const response = await fetch(
        `https://localhost:7014/api/post/bytag/${tagId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching tag posts:", error);
      setPosts([]);
    }
  };

  const handleResultSelect = async (result: SearchResult) => {
    setSelectedResult(result);
    setShowSuggestions(false);
    setSearchQuery(result.type === "hashtag" ? `#${result.name}` : result.name);

    if (result.type === "profile") {
      if (profile?.userName === result.name) {
        navigate("/profile");
      } else {
        navigate(`/user/${result.id}`);
      }
    } else {
      await fetchTagPosts(result.id);
    }
  };

  const handlePostClick = (index: number) => {
    setSelectedPostIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedPostIndex(null);
  };

  return (
    <section className="min-h-screen bg-[#F5F7FA] dark:bg-[#1C1C1E] pt-20 pb-24 md:ml-72 md:pt-12 md:pb-0">
      <div className="container mx-auto px-4">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8" ref={searchContainerRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search accounts or #hashtags..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full px-4 py-3 pl-12 rounded-lg bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            <FiSearch
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full max-w-2xl mt-2 bg-white dark:bg-[#2C2C2E] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  onClick={() => handleResultSelect(suggestion)}
                  className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#3A3A3C] cursor-pointer"
                >
                  {suggestion.type === "profile" ? (
                    <>
                      <FiUser className="text-gray-400 mr-3" size={20} />
                      <img
                        src={suggestion.image ?? "/default-profile-picture.jpg"}
                        alt={suggestion.name}
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {suggestion.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Profile
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <FiHash className="text-gray-400 mr-3" size={20} />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          #{suggestion.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {suggestion.postsCount?.toLocaleString()} posts
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Result Content */}
        {selectedResult && selectedResult.type === "hashtag" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-[#2C2C2E] rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                #{selectedResult.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedResult.postsCount?.toLocaleString()} posts
              </p>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  onClick={() => handlePostClick(index)}
                  className="relative aspect-square group cursor-pointer"
                >
                  {post.mediaType === "image" ? (
                    <img
                      src={post.mediaUri}
                      alt={post.description}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        src={post.mediaUri}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <FontAwesomeIcon
                          icon={faPlay}
                          className="text-white text-2xl opacity-80"
                        />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 dark:bg-[#EAF2EF]/70 bg-[#1C1C1E]/70 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-8 text-white font-semibold">
                      <div className="flex items-center gap-1 dark:text-[#2E2E2E] text-[#EAF2EF]">
                        <FontAwesomeIcon icon={faHeart} /> {post.likeCount}
                      </div>
                      <div className="flex items-center gap-1 dark:text-[#2E2E2E] text-[#EAF2EF]">
                        <FontAwesomeIcon icon={faComment} /> {post.commentCount}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Profile Content */}
        {userProfile && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-[#2C2C2E] rounded-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Picture */}
                <div className="md:flex-shrink-0">
                  <img
                    src={
                      userProfile.profilePictureUri ??
                      "/default-profile-picture.jpg"
                    }
                    alt={userProfile.userName}
                    className="w-24 h-24 md:w-40 md:h-40 rounded-full object-cover"
                  />
                </div>

                {/* Profile Info */}
                <div className="flex flex-col gap-6 flex-grow">
                  {/* Username and Follow Button */}
                  <div className="flex flex-row sm:items-center gap-4">
                    <h2 className="text-xl font-normal dark:text-[#EAEAEA]">
                      {userProfile.userName}
                    </h2>
                    <div className="flex gap-2">
                      {userProfile.isPrivate ? (
                        <button
                          onClick={() => {
                            /* Handle follow request */
                          }}
                          className="px-4 py-1.5 dark:text-[#EAEAEA] bg-gray-200 dark:bg-gray-800 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          Follow Request
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            /* Handle follow */
                          }}
                          className="px-4 py-1.5 dark:text-[#EAEAEA] bg-gray-200 dark:bg-gray-800 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          Follow
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-8 text-sm">
                    <div className="dark:text-[#EAEAEA]">
                      <span className="font-semibold">
                        {userProfile.postsCount}
                      </span>{" "}
                      posts
                    </div>
                    <div className="hover:opacity-80 dark:text-[#EAEAEA]">
                      <span className="font-semibold">
                        {userProfile.followersCount}
                      </span>{" "}
                      followers
                    </div>
                    <div className="hover:opacity-80 dark:text-[#EAEAEA]">
                      <span className="font-semibold">
                        {userProfile.followingCount}
                      </span>{" "}
                      following
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="text-sm leading-snug dark:text-[#EAEAEA]">
                    <p className="font-semibold">
                      {userProfile.fullName ?? userProfile.userName}
                    </p>
                    <p>{userProfile.bio}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Grid */}
            {!userProfile.isPrivate && (
              <div className="grid grid-cols-3 gap-1 md:gap-6 mt-4">
                {userProfile.posts.map((post: Post, index: number) => (
                  <div
                    key={post.id}
                    onClick={() => handlePostClick(index)}
                    className="relative aspect-square group cursor-pointer"
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
                          <span>❤️</span> {post.likeCount}
                        </div>
                        <div className="flex items-center gap-1 dark:text-[#2E2E2E] text-[#EAF2EF]">
                          <span>💬</span> {post.commentCount}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Private Account Message */}
            {userProfile.isPrivate && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="font-semibold text-lg mb-2">
                  This Account is Private
                </h3>
                <p className="text-sm">
                  Follow this account to see their photos and videos.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Post Modal */}
        {selectedPostIndex !== null && (
          <PostModal
            profile={
              selectedResult?.type === "profile" ? userProfile : undefined
            }
            posts={
              selectedResult?.type === "profile" ? userProfile?.posts : posts
            }
            savedPosts={[]}
            initialPostIndex={selectedPostIndex}
            isOpen={selectedPostIndex !== null}
            onClose={handleCloseModal}
            setSavedPosts={() => {}}
            isOwnProfile={false}
            isSavedPostsTab={false}
          />
        )}
      </div>
    </section>
  );
}
