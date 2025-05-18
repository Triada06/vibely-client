import { useEffect, useRef, useState } from "react";
import "../App.css";
import CardComponent from "../components/CardComponent";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function HomePage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
            {Array.from({ length: 26 }).map((_, i) => (
              <li key={i} className="shrink-0 snap-start hover:cursor-pointer">
                <div className="bg-gradient-to-r from-amber-500 to-pink-500 dark:from-indigo-900 dark:to-green-900 rounded-4xl size-14 flex items-center justify-center">
                  <img
                    className="rounded-3xl size-12 object-cover select-none "
                    src="./app-icon-2.jpg"
                    alt={`profile-${i}`}
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
        <CardComponent
          username={"nizami"}
          avatarUrl={
            "https://fitcheckstorage.blob.core.windows.net/fitflare/763870cd-b4cb-49db-9e2a-95ff8ac4efd6 - Levi.jpg?sv=2025-05-05&se=2025-05-12T07%3A28%3A59Z&sr=b&sp=r&sig=6ge9wPxPLz4GF4cO%2F80kzhNcj%2FXM62mqqBtPqwsre70%3D"
          }
          timestamp={"yesteryday nigga"}
          mediaType={"image"}
          mediaUrl={
            "https://fitcheckstorage.blob.core.windows.net/fitflare/763870cd-b4cb-49db-9e2a-95ff8ac4efd6 - Levi.jpg?sv=2025-05-05&se=2025-05-13T19%3A32%3A28Z&sr=b&sp=r&sig=KbQdYjTW5KcCLXnecXKELhaDBPVXfH8zb%2BxHgXx4%2BV4%3D"
          }
          description={"yo thats a test"}
          likeCount={0}
          commentCount={0}
          shareCount={0}
        ></CardComponent>
      </div>
    </div>
  );
}
