'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

interface LossAnimationProps {
  onComplete: () => void;
}

export function LossAnimation({ onComplete }: LossAnimationProps) {
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (hasPlayed) return;
    setHasPlayed(true);

    // Play loss sound - descending notes
    const playLossSound = () => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Descending notes to convey loss
        const notes = [
          { freq: 392, time: 0, duration: 0.2 },    // G
          { freq: 330, time: 0.2, duration: 0.2 },  // E
          { freq: 262, time: 0.4, duration: 0.4 },  // C
        ];

        notes.forEach(({ freq, time, duration }) => {
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();

          osc.type = 'sine';
          osc.frequency.value = freq;

          const startTime = audioCtx.currentTime + time;
          gainNode.gain.setValueAtTime(0.2, startTime);
          gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          osc.start(startTime);
          osc.stop(startTime + duration);
        });

        console.log('Playing loss sound');
      } catch (err) {
        console.log('Failed to play loss sound:', err);
      }
    };

    playLossSound();

    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(timer);
    };
  }, [onComplete, hasPlayed]);

  // Falling symbols (representing missed symbols)
  const fallingSymbols = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 0.5,
    symbol: ['💰', '🎲', '🎰'][Math.floor(Math.random() * 3)],
  })), []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onComplete}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900/90 to-red-900/70 backdrop-blur-sm cursor-pointer"
    >
      {/* Falling symbols */}
      {fallingSymbols.map((item) => (
        <motion.div
          key={item.id}
          initial={{ y: '-10vh', x: `${item.x}vw`, opacity: 0.8, rotate: 0 }}
          animate={{
            y: '110vh',
            opacity: [0.8, 0.5, 0],
            rotate: 360,
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            ease: 'easeIn',
          }}
          className="absolute text-3xl"
        >
          {item.symbol}
        </motion.div>
      ))}

      <motion.div
        initial={{ scale: 0.5, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 18,
        }}
        className="text-center px-8 relative z-10"
      >
        {/* X mark or sad face */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{
            scale: 1,
            rotate: 0,
          }}
          transition={{
            duration: 0.5,
            type: 'spring',
            stiffness: 200,
          }}
          className="text-9xl mb-6"
        >
          ❌
        </motion.div>

        {/* You Lost Text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl font-black mb-4 text-red-400"
        >
          YOU LOST
        </motion.h1>

        {/* Encouraging Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg md:text-xl text-slate-300"
        >
          Try again!
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
