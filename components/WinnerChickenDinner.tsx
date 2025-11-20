'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { formatTokenAmount } from '@/lib/utils';

interface WinnerChickenDinnerProps {
  payout: number;
  token: string;
  onComplete: () => void;
}

export function WinnerChickenDinner({ payout, token, onComplete }: WinnerChickenDinnerProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Generate random confetti pieces
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 1,
    rotation: Math.random() * 360,
    color: ['#FFD700', '#FFA500', '#FF6347', '#DC2626', '#059669'][Math.floor(Math.random() * 5)],
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      {/* Confetti */}
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ y: -20, x: `${piece.x}vw`, rotate: 0, opacity: 1 }}
          animate={{
            y: '110vh',
            rotate: piece.rotation,
            opacity: 0,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'linear',
          }}
          className="absolute w-3 h-3 rounded-sm"
          style={{ backgroundColor: piece.color }}
        />
      ))}

      {/* Main Content */}
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
        className="text-center px-8"
      >
        {/* Chicken Emoji */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
          className="text-8xl md:text-9xl mb-6"
        >
          🍗
        </motion.div>

        {/* Winner Text */}
        <motion.h1
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
          className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 bg-gold-gradient bg-clip-text text-transparent"
          style={{
            textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
          }}
        >
          WINNER WINNER
        </motion.h1>

        <motion.h2
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: 0.2,
          }}
          className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 bg-gold-gradient bg-clip-text text-transparent"
          style={{
            textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
          }}
        >
          CHICKEN DINNER
        </motion.h2>

        {/* Payout Amount */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-casino-gradient border-4 border-tiger-gold rounded-2xl p-6 md:p-8 shadow-2xl"
        >
          <div className="text-sm md:text-lg text-slate-300 mb-2">YOU WON</div>
          <div className="text-5xl md:text-7xl font-black text-tiger-gold">
            {formatTokenAmount(payout * 100)} {token}
          </div>
        </motion.div>

        {/* Sparkle Effects */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-20"
        >
          ✨
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
