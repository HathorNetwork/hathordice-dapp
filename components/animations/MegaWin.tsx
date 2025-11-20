'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { formatTokenAmount } from '@/lib/utils';

interface MegaWinProps {
  payout: number;
  token: string;
  onComplete: () => void;
}

export function MegaWin({ payout, token, onComplete }: MegaWinProps) {
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (hasPlayed) return;
    setHasPlayed(true);

    // Play fireworks sound with Web Audio API
    const playFireworks = () => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Create multiple "boom" sounds
        const booms = [0, 0.4, 0.8, 1.2];

        booms.forEach((time) => {
          // White noise for explosion
          const bufferSize = audioCtx.sampleRate * 0.3;
          const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
          const data = buffer.getChannelData(0);

          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }

          const noise = audioCtx.createBufferSource();
          noise.buffer = buffer;

          const filter = audioCtx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 200;
          filter.Q.value = 0.5;

          const gainNode = audioCtx.createGain();
          const startTime = audioCtx.currentTime + time;
          gainNode.gain.setValueAtTime(0.3, startTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

          noise.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          noise.start(startTime);
          noise.stop(startTime + 0.3);
        });

        console.log('🎆 Playing fireworks sound');
      } catch (err) {
        console.log('Failed to play fireworks:', err);
      }
    };

    // Play celebration speech
    if ('speechSynthesis' in window) {
      const speakPhrase = () => {
        const utterance = new SpeechSynthesisUtterance('Mega win! Congratulations!');
        utterance.rate = 1.2;
        utterance.pitch = 1.5;
        utterance.volume = 1.0;
        speechSynthesis.speak(utterance);
        console.log('🎉 Playing mega win announcement');
      };

      if (speechSynthesis.getVoices().length > 0) {
        speakPhrase();
      } else {
        speechSynthesis.addEventListener('voiceschanged', speakPhrase, { once: true });
      }
    }

    playFireworks();

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

  // Generate firework particles - reduced for performance
  const fireworks = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: 20 + Math.random() * 60,
    y: 20 + Math.random() * 60,
    angle: (i * 360) / 20,
    color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'][Math.floor(Math.random() * 6)],
  })), []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
    >
      {/* Firework Bursts */}
      {fireworks.map((fw) => (
        <motion.div
          key={fw.id}
          initial={{
            x: `${fw.x}vw`,
            y: `${fw.y}vh`,
            scale: 0,
            opacity: 1,
          }}
          animate={{
            x: `${fw.x + Math.cos((fw.angle * Math.PI) / 180) * 20}vw`,
            y: `${fw.y + Math.sin((fw.angle * Math.PI) / 180) * 20}vh`,
            scale: 1.5,
            opacity: 0,
          }}
          transition={{
            duration: 1.5,
            delay: Math.random() * 0.5,
            ease: 'easeOut',
          }}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: fw.color }}
        />
      ))}

      {/* Main Content */}
      <motion.div
        initial={{ scale: 0.3, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 10,
        }}
        className="text-center px-8 relative z-10"
      >
        {/* Trophy Emoji */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: 3,
          }}
          className="text-9xl mb-6"
        >
          🏆
        </motion.div>

        {/* Mega Win Text */}
        <motion.h1
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 0.6,
            repeat: 4,
          }}
          className="text-6xl md:text-9xl font-black mb-8"
          style={{
            background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1, #FFA07A, #FF6B6B)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(255, 107, 107, 0.8)',
          }}
        >
          MEGA WIN!
        </motion.h1>

        {/* Payout Amount */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-600 to-pink-600 border-4 border-yellow-300 rounded-2xl p-6 md:p-8 shadow-2xl"
        >
          <div className="text-sm md:text-lg text-yellow-200 mb-2 font-bold">AMAZING WIN</div>
          <div className="text-5xl md:text-7xl font-black text-white">
            {formatTokenAmount(payout * 100)} {token}
          </div>
        </motion.div>

        {/* Sparkles */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 2,
            repeat: 1,
          }}
          className="absolute top-0 left-1/2 transform -translate-x-1/2 text-6xl opacity-50"
        >
          ✨
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
