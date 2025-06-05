import { useState, useEffect, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faComment,
  faSpinner,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import PostModal from "../components/PostModal";

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

export default function ExplorePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(
    null
  );
  const observer = useRef<IntersectionObserver | null>(null);

  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchPosts = async (pageNum: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `https://localhost:7014/api/post?page=${pageNum}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch posts");

      const data = await response.json();
      if (data.length === 0) {
        setHasMore(false);
        return;
      }

      // Transform the data to match our Post interface
      const transformedData = data.map((post: any) => ({
        id: post.id,
        mediaUri: post.mediaUri,
        mediaType: post.mediaType || "image",
        likeCount: post.likeCount || 0,
        commentCount: post.commentCount || 0,
        description: post.description || "",
        comments: post.comments || [],
        postedWhen: post.postedWhen || new Date().toISOString(),
        hashTags: post.hashTags || [],
        isLikedByUser: post.isLikedByUser || false,
        postedById: post.postedById || "",
        authorProfilePicUri: post.authorProfilePicUri || null,
        authorUserName: post.authorUserName || "",
      }));

      setPosts((prevPosts) => {
        if (pageNum === 1) return transformedData;
        return [...prevPosts, ...transformedData];
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const handlePostClick = (index: number) => {
    setSelectedPostIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedPostIndex(null);
  };

  // Create a minimal profile object for the PostModal
  const minimalProfile = {
    profilePictureUri: "",
    userName: "",
    postsCount: 0,
    bio: "",
    posts: [],
    savedPosts: [],
  };

  return (
    <section className="min-h-screen bg-[#F5F7FA] dark:bg-[#1C1C1E] pt-12 pb-24 md:ml-72 md:pt-8 md:pb-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-4">
          {posts.map((post, index) => (
            <div
              key={post.id}
              ref={index === posts.length - 1 ? lastPostElementRef : null}
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

        {loading && (
          <div className="flex justify-center items-center py-8">
            <FontAwesomeIcon
              icon={faSpinner}
              className="text-2xl text-[#B794F4] animate-spin"
            />
          </div>
        )}
      </div>

      {selectedPostIndex !== null && (
        <PostModal
          profile={minimalProfile}
          posts={posts}
          savedPosts={[]}
          initialPostIndex={selectedPostIndex}
          isOpen={selectedPostIndex !== null}
          onClose={handleCloseModal}
          setSavedPosts={() => {}}
          isOwnProfile={false}
          isSavedPostsTab={false}
        />
      )}
    </section>
  );
}
