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

  // Generate falling particles (reduced count for better performance)
  const particles = useMemo(() => Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 4 + Math.random() * 2,
    size: 24 + Math.random() * 16,
  })), []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Auto-play the video
    video.play().catch(err => {
      console.log('Video autoplay blocked:', err);
    });

    const handleEnded = () => {
      setHasEnded(true);
      setTimeout(() => {
        onComplete();
      }, 500);
    };

    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [onComplete]);

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

          {/* Video */}
          <video
            ref={videoRef}
            src={videoPath}
            className="w-full rounded-xl shadow-2xl"
            playsInline
            muted={false}
          />

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
