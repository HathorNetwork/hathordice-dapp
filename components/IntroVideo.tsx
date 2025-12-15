'use client';

import { useState, useRef, useEffect } from 'react';

interface IntroVideoProps {
  onComplete: () => void;
}

export function IntroVideo({ onComplete }: IntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const onCompleteRef = useRef(onComplete);

  // Keep ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    video.play();
    setShowPlayButton(false);
  };

  const handleVideoEnd = () => {
    onCompleteRef.current();
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCompleteRef.current();
  };

  const handleError = () => {
    console.error('Video failed to load');
    onCompleteRef.current();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-pointer"
      onClick={handleSkip}
    >
      {/* Video container - centered and sized to video content */}
      <div
        className="relative max-w-[80%] max-h-[80%] bg-black rounded-2xl overflow-hidden shadow-2xl cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          ref={videoRef}
          src="/videos/intro.mp4"
          className="max-w-full max-h-[80vh] object-contain"
          onEnded={handleVideoEnd}
          onError={handleError}
          playsInline
        />

        {/* Play button - click to start with audio */}
        {showPlayButton && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlay}
              className="w-20 h-20 bg-black/80 hover:bg-black rounded-full flex items-center justify-center transition-all hover:scale-110 border-2 border-white/30"
            >
              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
