'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TryAgainProps {
  onComplete: () => void;
}

export function TryAgain({ onComplete }: TryAgainProps) {
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (hasPlayed) return;
    setHasPlayed(true);

    // Play sad trombone sound
    const playSadTrombone = () => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Descending "wah wah" notes
        const notes = [
          { freq: 220, time: 0, duration: 0.5 },
          { freq: 196, time: 0.5, duration: 0.5 },
          { freq: 175, time: 1.0, duration: 0.8 },
        ];

        notes.forEach(({ freq, time, duration }) => {
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.value = freq;

          const startTime = audioCtx.currentTime + time;
          gainNode.gain.setValueAtTime(0.2, startTime);
          gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          osc.start(startTime);
          osc.stop(startTime + duration);
        });

        console.log('📉 Playing sad trombone');
      } catch (err) {
        console.log('Failed to play sad trombone:', err);
      }
    };

    playSadTrombone();

    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete, hasPlayed]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onComplete}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm cursor-pointer"
    >
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 20,
        }}
        className="text-center px-8"
      >
        {/* Sad Face */}
        <motion.div
          animate={{
            rotate: [0, -10, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="text-9xl mb-6"
        >
          😔
        </motion.div>

        {/* Try Again Text */}
        <motion.h1
          className="text-5xl md:text-7xl font-black mb-6 text-slate-300"
        >
          TRY AGAIN
        </motion.h1>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl md:text-2xl text-slate-400"
        >
          Better luck next time!
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
