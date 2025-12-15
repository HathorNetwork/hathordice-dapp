'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { formatTokenAmount } from '@/lib/utils';

interface BigWinProps {
  payout: number;
  token: string;
  onComplete: () => void;
}

export function BigWin({ payout, token, onComplete }: BigWinProps) {
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (hasPlayed) return;
    setHasPlayed(true);

    // Play cash register sound with Web Audio API
    const playCashRegister = () => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Cash register "cha-ching" sound
        const notes = [
          { freq: 800, time: 0, duration: 0.1 },
          { freq: 1000, time: 0.1, duration: 0.15 },
        ];

        notes.forEach(({ freq, time, duration }) => {
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();

          osc.type = 'sine';
          osc.frequency.value = freq;

          const startTime = audioCtx.currentTime + time;
          gainNode.gain.setValueAtTime(0.4, startTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          osc.start(startTime);
          osc.stop(startTime + duration);
        });

        console.log('💰 Playing cash register sound');
      } catch (err) {
        console.log('Failed to play cash register:', err);
      }
    };

    playCashRegister();

    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete, hasPlayed]);

  // Generate falling coins - minimal for performance
  const coins = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 1.5 + Math.random() * 1,
    rotation: Math.random() * 720,
    size: 20 + Math.random() * 20,
  })), []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onComplete}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer"
    >
      {/* Falling Coins */}
      {coins.map((coin) => (
        <motion.div
          key={coin.id}
          initial={{ y: -50, x: `${coin.x}vw`, rotate: 0, opacity: 1 }}
          animate={{
            y: '110vh',
            rotate: coin.rotation,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: coin.duration,
            delay: coin.delay,
            ease: 'easeIn',
          }}
          className="absolute text-yellow-400"
          style={{ fontSize: `${coin.size}px` }}
        >
          💰
        </motion.div>
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
        {/* Money Bag Emoji */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -15, 15, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: 2,
            repeatDelay: 0.3,
          }}
          className="text-9xl mb-6"
        >
          💰
        </motion.div>

        {/* Big Win Text */}
        <motion.h1
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: 3,
          }}
          className="text-6xl md:text-8xl font-black mb-8 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 bg-clip-text text-transparent"
          style={{
            textShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
          }}
        >
          BIG WIN!
        </motion.h1>

        {/* Payout Amount */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-b from-yellow-400 to-yellow-600 border-4 border-yellow-300 rounded-2xl p-6 md:p-8 shadow-2xl"
        >
          <div className="text-sm md:text-lg text-yellow-900 mb-2 font-bold">YOU WON</div>
          <div className="text-5xl md:text-7xl font-black text-yellow-900">
            {formatTokenAmount(payout * 100)} {token}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
