import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import "../App.css";
import CardComponent from "../components/CardComponent";
import PostModal, {
  Post,
  Profile as ModalProfile,
} from "../components/PostModal";
import { useAuthStore } from "../store/authStore";
import { useProfileStore } from "../store/profileStore";
import {
  faChevronLeft,
  faChevronRight,
  faHeart,
  faBookmark,
  faComment,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StoryModal, { StoryItem } from "../components/StoryModal";
import { useNavigate } from "react-router-dom";

// Move videoRefs outside component to prevent re-creation on re-renders
const videoRefs = new Map<string, HTMLVideoElement>();

interface FeedPost {
  id: string;
  mediaUri: string;
  description: string;
  likeCount: number;
  mediaType: "image" | "video";
  postedById: string;
  commentCount: number;
  authorProfilePicUri: string;
  authorUserName: string;
  isLikedByUser: boolean;
  isSavedByUSer: boolean;
  postedWhen: string;
  hashTags: string[];
}

interface Story {
  id: string;
  authorId: string;
  authorProfilePicture: string;
}

export default function HomePage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(
    null
  );
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const { token } = useAuthStore();
  const { profile } = useProfileStore();
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
  const [stories, setStories] = useState<Story[]>([]);
  const [hasMyStory, setHasMyStory] = useState(false);
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [storyModalStories, setStoryModalStories] = useState<StoryItem[]>([]);
  const [storyModalInitialIndex, setStoryModalInitialIndex] = useState(0);
  const navigate = useNavigate();

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth);
  };

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScroll);
    return () => el.removeEventListener("scroll", checkScroll);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("https://localhost:7014/api/post/feed", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    if (token) {
      fetchPosts();
    }
  }, [token]);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch("https://localhost:7014/api/story", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch stories");
        }
        const data: { stories: Story[] }[] = await response.json();
        if (data && data.length > 0 && data[0].stories) {
          setStories(data[0].stories);
        }
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    };

    if (token) {
      fetchStories();
    }
  }, [token]);

  useEffect(() => {
    const fetchMyStories = async () => {
      if (!profile?.id || !token) {
        console.log("Skipping fetchMyStories: profile.id or token missing", {
          profileId: profile?.id,
          token: token ? "present" : "missing",
        });
        return;
      }
      console.log("Fetching my stories for profile ID:", profile.id);
      try {
        const response = await fetch(
          `https://localhost:7014/api/appuser/${profile.id}/stories`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch my stories");
        }
        const data: Story[] = await response.json();
        setHasMyStory(data.length > 0);
      } catch (error) {
        console.error("Error fetching my stories:", error);
        setHasMyStory(false);
      }
    };

    if (token && profile?.id) {
      fetchMyStories();
    }
  }, [token, profile?.id]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current?.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current?.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const handlePostClick = (index: number) => {
    const post = posts[index];
    if (post.mediaType === "video") {
      const video = videoRefs.get(post.id);
      if (video) {
        console.log(
          `[handlePostClick] Video ${video.id} before pause: muted=${video.muted}, paused=${video.paused}`
        );
        setCurrentVideoTime(video.currentTime);
        video.pause();
        console.log(
          `[handlePostClick] Video ${video.id} after pause: muted=${video.muted}, paused=${video.paused}`
        );
      }
    }
    setSelectedPostIndex(index);
    setIsPostModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPostModalOpen(false);
    const previouslySelectedPostIndex = selectedPostIndex;
    setSelectedPostIndex(null);
    setCurrentVideoTime(0);

    if (previouslySelectedPostIndex !== null) {
      const closedPost = posts[previouslySelectedPostIndex];
      if (closedPost && closedPost.mediaType === "video") {
        const video = videoRefs.get(closedPost.id);
        if (video) {
          console.log(
            `[handleCloseModal] Video ${video.id} after modal close: muted=${video.muted}, paused=${video.paused}`
          );
        }
      }
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!token) return;

    try {
      const response = await fetch(
        `https://localhost:7014/api/post/${postId}/${
          isLiked ? "unlike" : "like"
        }`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLikedByUser: !isLiked,
                  likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1,
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleSave = async (postId: string, isSaved: boolean) => {
    if (!token) return;

    try {
      const response = await fetch(
        `https://localhost:7014/api/post/${postId}/${
          isSaved ? "unsave" : "save"
        }`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isSavedByUSer: !isSaved,
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  const formatPostedWhen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // diff in seconds

    const MINUTE = 60;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;
    const WEEK = 7 * DAY;
    const MONTH = 30 * DAY; // Approximate month
    const YEAR = 365 * DAY; // Approximate year

    if (diff < MINUTE) {
      return `${diff}s ago`;
    } else if (diff < HOUR) {
      return `${Math.floor(diff / MINUTE)}m ago`;
    } else if (diff < DAY) {
      return `${Math.floor(diff / HOUR)}h ago`;
    } else if (diff < WEEK) {
      return `${Math.floor(diff / DAY)}d ago`;
    } else if (diff < MONTH) {
      return `${Math.floor(diff / WEEK)}w ago`;
    } else if (diff < YEAR) {
      return `${Math.floor(diff / MONTH)}mo ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Convert FeedPost to Post type for PostModal
  const convertToPost = (feedPost: FeedPost): Post => ({
    ...feedPost,
    comments: [], // Initialize with empty comments array
  });

  // Convert profile to ModalProfile type
  const convertToModalProfile = (profile: any): ModalProfile => ({
    profilePictureUri: profile.profilePictureUri,
    userName: profile.userName,
    postsCount: profile.postsCount,
    bio: profile.bio,
    posts: profile.posts.map((post: any) => ({
      ...post,
      comments: [],
      isLikedByUser: false,
      postedById: post.id.toString(),
      authorProfilePicUri: profile.profilePictureUri,
      authorUserName: profile.userName,
    })),
  });

  // Handler to open story modal for a user
  const handleStoryClick = async (
    authorId: string,
    initialIndex: number = 0
  ) => {
    try {
      let userStories: StoryItem[] = [];
      if (profile && authorId === profile.id) {
        // Fetch my own stories using the user-specific API
        const response = await fetch(
          `https://localhost:7014/api/appuser/${profile.id}/stories`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch my stories");
        userStories = await response.json();
      } else {
        // Fetch all stories and filter by authorId
        const response = await fetch("https://localhost:7014/api/story", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch stories");
        const data: { stories: StoryItem[] }[] = await response.json();
        // Flatten all stories
        const allStories = data.flatMap((group) => group.stories);
        userStories = allStories.filter((s) => s.authorId === authorId);
      }
      setStoryModalStories(userStories);
      setStoryModalInitialIndex(initialIndex);
      setStoryModalOpen(true);
    } catch (error) {
      console.error("Error opening story modal:", error);
    }
  };

  // Group stories by authorId for rendering story circles
  const groupedStories = useMemo(() => {
    const map = new Map();
    for (const story of stories) {
      if (!map.has(story.authorId)) {
        map.set(story.authorId, {
          authorId: story.authorId,
          authorProfilePicture: story.authorProfilePicture,
          stories: [story],
        });
      } else {
        map.get(story.authorId).stories.push(story);
      }
    }
    return Array.from(map.values());
  }, [stories]);

  return (
    <div className="min-h-screen flex flex-col">
      <section
        id="statuses"
        className="relative overflow-hidden md:ml-72 pt-3 mb-10"
        draggable="false"
      >
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="hidden opacity-60 md:flex absolute left-3 top-1/2 -translate-y-1/3 dark:bg-white bg-black/40 hover:bg-black/70 dark:text-black text-white p-2  rounded-full"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        )}

        <nav ref={scrollContainerRef} className="overflow-x-auto no-scrollbar">
          <ul className="flex gap-4 w-max px-8">
            {profile && (
              <li
                key="my-story"
                className="shrink-0 snap-start hover:cursor-pointer"
                onClick={() => {
                  if (hasMyStory) {
                    handleStoryClick(profile.id);
                  } else {
                    navigate("/uploadpost?tab=story");
                  }
                }}
              >
                <div
                  className={`rounded-4xl size-14 flex items-center justify-center ${
                    hasMyStory
                      ? "bg-gradient-to-r from-amber-500 to-pink-500 dark:from-indigo-900 dark:to-green-900"
                      : ""
                  }`}
                >
                  <img
                    className="rounded-3xl size-12 object-cover select-none "
                    src={
                      profile.profilePictureUri ??
                      ".default-profile-picture.jpg"
                    }
                    alt=""
                    draggable="false"
                  />
                </div>
              </li>
            )}
            {/* Render grouped story circles */}
            {groupedStories.map((group) => (
              <li
                key={group.authorId}
                className="shrink-0 snap-start hover:cursor-pointer"
                onClick={() => handleStoryClick(group.authorId)}
              >
                <div className="bg-gradient-to-r from-amber-500 to-pink-500 dark:from-indigo-900 dark:to-green-900 rounded-4xl size-14 flex items-center justify-center">
                  <img
                    className="rounded-3xl size-12 object-cover select-none "
                    src={group.authorProfilePicture}
                    alt={`story-profile-${group.authorId}`}
                    draggable="false"
                  />
                </div>
              </li>
            ))}
          </ul>
        </nav>

        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="hidden opacity-60 md:flex absolute right-3 top-1/2 -translate-y-1/3 dark:bg-white bg-black/40 hover:bg-black/70 dark:text-black text-white p-2  rounded-full"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        )}
      </section>

      <div className="md:ml-72 md:p-4 text-[var(--text)] flex-1">
        {posts.map((post, index) => (
          <div key={post.id} className="mb-6">
            <div className="bg-[#F5F7FA] dark:bg-[#2A2A2D] rounded-2xl shadow-md overflow-hidden w-full max-w-xl mx-auto">
              <div className="flex items-center gap-3 p-4">
                <img
                  src={post.authorProfilePicUri}
                  alt="avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-[#EAEAEA]">
                    {post.authorUserName}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {formatPostedWhen(post.postedWhen)}
                  </p>
                </div>
              </div>

              <div className="w-full max-h-[500px] overflow-hidden bg-black">
                {post.mediaType === "image" ? (
                  <img
                    src={post.mediaUri}
                    alt="post"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    id={post.id}
                    ref={(el: HTMLVideoElement | null) => {
                      if (el) {
                        videoRefs.set(post.id, el);
                        el.muted = true;
                      } else {
                        videoRefs.delete(post.id);
                      }
                    }}
                    src={post.mediaUri}
                    className="w-full h-full object-contain"
                    controls
                    loop
                    playsInline
                    muted={true}
                  />
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(post.id, post.isLikedByUser);
                      }}
                      className={`hover:opacity-80 transition ${
                        post.isLikedByUser
                          ? "text-red-500"
                          : "text-[#2E2E2E] dark:text-[#EAEAEA]"
                      }`}
                    >
                      <FontAwesomeIcon icon={faHeart} size="lg" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePostClick(index);
                      }}
                      className="hover:opacity-80 text-[#2E2E2E] dark:text-[#EAEAEA]"
                    >
                      <FontAwesomeIcon icon={faComment} size="lg" />
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave(post.id, post.isSavedByUSer);
                    }}
                    className={`hover:opacity-80 transition ${
                      post.isSavedByUSer
                        ? "text-yellow-500"
                        : "text-[#2E2E2E] dark:text-[#EAEAEA]"
                    }`}
                  >
                    <FontAwesomeIcon icon={faBookmark} size="lg" />
                  </button>
                </div>

                <div className="text-sm font-semibold mb-1 text-[#2E2E2E] dark:text-[#EAEAEA]">
                  {post.likeCount} likes
                </div>

                <div className="text-sm text-[#2E2E2E] dark:text-[#EAEAEA]">
                  <span className="font-semibold mr-2">
                    {post.authorUserName}
                  </span>
                  {post.description}
                </div>

                {post.commentCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePostClick(index);
                    }}
                    className="text-sm text-zinc-500 mt-1 hover:text-[#2E2E2E] dark:hover:text-[#EAEAEA] transition"
                  >
                    View all {post.commentCount} comments
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPostIndex !== null && profile && (
        <PostModal
          posts={posts.map(convertToPost)}
          initialPostIndex={selectedPostIndex}
          isOpen={isPostModalOpen}
          onClose={handleCloseModal}
          profile={convertToModalProfile(profile)}
          savedPosts={[]}
          setSavedPosts={() => {}}
          initialVideoTime={
            posts[selectedPostIndex]?.mediaType === "video"
              ? currentVideoTime
              : undefined
          }
        />
      )}

      {/* Story Modal */}
      <StoryModal
        stories={storyModalStories}
        initialIndex={storyModalInitialIndex}
        isOpen={storyModalOpen}
        onClose={() => setStoryModalOpen(false)}
        currentUserId={profile?.id}
      />
    </div>
  );
}
