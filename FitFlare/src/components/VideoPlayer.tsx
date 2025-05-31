import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useRef, useState } from "react";

interface ReelPlayerProps {
  src: string;
}

const ReelPlayer: React.FC<ReelPlayerProps> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      className="relative w-full h-full max-h-[600px] overflow-hidden rounded-2xl bg-black"
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        playsInline
        className="w-full h-full object-cover cursor-pointer"
        draggable={false}
      />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <FontAwesomeIcon icon={faPlay} size="2xl" />
        </div>
      )}
    </div>
  );
};

export default ReelPlayer;
