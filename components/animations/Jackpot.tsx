'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { formatTokenAmount } from '@/lib/utils';

interface JackpotProps {
  payout: number;
  token: string;
  onComplete: () => void;
}

export function Jackpot({ payout, token, onComplete }: JackpotProps) {
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (hasPlayed) return;
    setHasPlayed(true);

    // Play epic jackpot fanfare
    const playJackpotFanfare = () => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Epic ascending scale: C4 D4 E4 G4 A4 C5
        const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];

        notes.forEach((freq, index) => {
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();

          osc.type = 'square';
          osc.frequency.value = freq;

          const startTime = audioCtx.currentTime + (index * 0.12);
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
          gainNode.gain.linearRampToValueAtTime(0, startTime + 0.4);

          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.4);
        });

        console.log('🎺 Playing jackpot fanfare');
      } catch (err) {
        console.log('Failed to play jackpot fanfare:', err);
      }
    };

    // Play "Jackpot!" announcement
    if ('speechSynthesis' in window) {
      const speakPhrase = () => {
        const utterance = new SpeechSynthesisUtterance('Jackpot! Incredible!');
        utterance.rate = 1.0;
        utterance.pitch = 1.6;
        utterance.volume = 1.0;

        const voices = speechSynthesis.getVoices();
        const excitedVoice = voices.find(v =>
          v.lang.startsWith('en') &&
          (v.name.includes('Female') || v.name.includes('Samantha'))
        );
        if (excitedVoice) {
          utterance.voice = excitedVoice;
        }

        speechSynthesis.speak(utterance);
        console.log('🎰 Playing jackpot announcement');
      };

      if (speechSynthesis.getVoices().length > 0) {
        speakPhrase();
      } else {
        speechSynthesis.addEventListener('voiceschanged', speakPhrase, { once: true });
      }
    }

    playJackpotFanfare();

    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(timer);
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, [onComplete, hasPlayed]);

  // Rainbow stars - minimal for performance
  const stars = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1,
    scale: 0.5 + Math.random() * 1.5,
  })), []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onComplete}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 cursor-pointer"
    >
      {/* Twinkling Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, star.scale, 0],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
          }}
          className="absolute"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
          }}
        >
          <span className="text-2xl">⭐</span>
        </motion.div>
      ))}

      {/* Main Content */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 12,
        }}
        className="text-center px-8 relative z-10"
      >
        {/* Slot Machine Emoji */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: 3,
          }}
          className="text-9xl mb-6"
        >
          🎰
        </motion.div>

        {/* Jackpot Text */}
        <motion.h1
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 0.5,
            repeat: 4,
          }}
          className="text-7xl md:text-9xl font-black mb-8 text-white"
          style={{
            textShadow: '0 0 50px rgba(255, 255, 255, 1), 0 0 100px rgba(255, 215, 0, 0.8)',
            WebkitTextStroke: '3px gold',
          }}
        >
          JACKPOT!
        </motion.h1>

        {/* Payout Amount */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 border-4 border-white rounded-2xl p-6 md:p-10 shadow-2xl"
        >
          <div className="text-base md:text-xl text-red-600 mb-2 font-black">🎊 JACKPOT WIN 🎊</div>
          <div className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-purple-600">
            {formatTokenAmount(payout * 100)} {token}
          </div>
        </motion.div>

        {/* Rotating Diamonds */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: 1,
            ease: 'linear',
          }}
          className="absolute -top-10 -right-10 text-6xl"
        >
          💎
        </motion.div>
        <motion.div
          animate={{
            rotate: [360, 0],
          }}
          transition={{
            duration: 2,
            repeat: 1,
            ease: 'linear',
          }}
          className="absolute -bottom-10 -left-10 text-6xl"
        >
          💎
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
