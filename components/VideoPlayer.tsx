'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState, useMemo } from 'react';
import { formatTokenAmount } from '@/lib/utils';

interface VideoPlayerProps {
  videoPath: string;
  result: 'win' | 'lose';
  payout?: number;
  token?: string;
  onComplete: () => void;
}

export function VideoPlayer({ videoPath, result, payout, token, onComplete }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasEnded, setHasEnded] = useState(false);
  const [autoplayFailed, setAutoplayFailed] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Generate falling particles (minimal count for performance)
  const particles = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 4 + Math.random() * 2,
    size: 28 + Math.random() * 16,
  })), []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    console.log('VideoPlayer mounted with path:', videoPath);

    const handleEnded = () => {
      console.log('Video ended');
      setHasEnded(true);
      setTimeout(() => {
        onComplete();
      }, 500);
    };

    const handleError = (e: Event) => {
      console.error('Video error:', video.error, video.error?.code);
      setAutoplayFailed(true);
    };

    const handlePlay = () => {
      console.log('Video started playing, unmuting');
      // Unmute once video starts playing
      video.muted = false;
      setVideoLoaded(true);
      setAutoplayFailed(false);
    };

    const handleCanPlayThrough = () => {
      console.log('Video ready to play');
      setVideoLoaded(true);
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('canplaythrough', handleCanPlayThrough);

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, [videoPath, onComplete]);

  const isWin = result === 'win';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-hidden"
    >
      {/* Animated Background Particles */}
      {isWin ? (
        // Diamond Shower for Wins
        particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ y: '-10vh', x: `${particle.x}vw`, rotate: 0, opacity: 1 }}
            animate={{
              y: '110vh',
              rotate: 360,
              opacity: [1, 0.8, 0],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: 'linear',
              repeat: 1,
            }}
            className="absolute pointer-events-none"
            style={{
              fontSize: `${particle.size}px`,
              left: `${particle.x}vw`,
            }}
          >
            💎
          </motion.div>
        ))
      ) : (
        // Sad Elements for Losses
        <>
          {particles.map((particle) => (
            <motion.div
              key={`tear-${particle.id}`}
              initial={{ y: '-10vh', x: `${particle.x}vw`, opacity: 0.8 }}
              animate={{
                y: '110vh',
                opacity: [0.8, 1, 0],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: 'easeIn',
                repeat: 1,
              }}
              className="absolute pointer-events-none"
              style={{
                fontSize: `${particle.size}px`,
                left: `${particle.x}vw`,
              }}
            >
              💧
            </motion.div>
          ))}
          {/* Sad Cloud */}
          <motion.div
            animate={{
              x: ['-10%', '110%'],
            }}
            transition={{
              duration: 25,
              repeat: 1,
              ease: 'linear',
            }}
            className="absolute top-10 text-4xl opacity-30 pointer-events-none"
          >
            ☁️
          </motion.div>
        </>
      )}

      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20,
        }}
        className="relative max-w-4xl w-full z-10"
      >
        {/* Decorative Frame */}
        <div className={`
          relative p-6 rounded-3xl
          ${isWin
            ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600'
            : 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900'
          }
        `}>
          {/* Top Banner */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`
              absolute -top-8 left-1/2 transform -translate-x-1/2 z-10
              px-8 py-3 rounded-full text-center font-black text-2xl shadow-2xl
              ${isWin
                ? 'bg-gradient-to-r from-green-400 to-green-600 text-white border-4 border-yellow-300'
                : 'bg-gradient-to-r from-red-600 to-red-800 text-white border-4 border-slate-500'
              }
            `}
          >
            {isWin ? '🎉 YOU WON! 🎉' : '😔 TRY AGAIN'}
          </motion.div>

          {/* Video Container */}
          <div className="relative w-full bg-black rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              src={videoPath}
              className="w-full h-auto rounded-xl shadow-2xl bg-black block"
              playsInline
              autoPlay
              muted
            />

            {/* Play Button Overlay (shows only if video fails to load) */}
            {autoplayFailed && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Play button clicked');
                  const video = videoRef.current;
                  if (video) {
                    video.muted = false;
                    video.play().catch(err => console.error('Play failed:', err));
                  }
                }}
                className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 hover:bg-black/60 transition-colors cursor-pointer"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center justify-center w-24 h-24 rounded-full bg-yellow-500 hover:bg-yellow-400 shadow-2xl transform transition-transform">
                    <div className="text-6xl ml-1">▶</div>
                  </div>
                  <div className="text-white text-lg font-bold">Click to Play</div>
                </div>
              </motion.button>
            )}
          </div>

          {/* Bottom Payout Banner (only for wins) */}
          {isWin && payout && token && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-10 bg-gradient-to-r from-yellow-300 to-yellow-500 px-8 py-3 rounded-full shadow-2xl border-4 border-white"
            >
              <div className="text-center">
                <div className="text-sm font-bold text-yellow-900">PAYOUT</div>
                <div className="text-2xl font-black text-yellow-900">
                  {formatTokenAmount(payout * 100)} {token}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Corner Decorations */}
        <motion.div
          animate={{
            rotate: [0, 180, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: 1,
            ease: 'easeInOut',
          }}
          className="absolute -top-4 -right-4 text-6xl z-20"
        >
          {isWin ? '⭐' : '💭'}
        </motion.div>
        <motion.div
          animate={{
            rotate: [360, 180, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: 1,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-4 -left-4 text-6xl z-20"
        >
          {isWin ? '💎' : '🍀'}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
