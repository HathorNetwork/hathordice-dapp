'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

interface BetterLuckProps {
  onComplete: () => void;
}

export function BetterLuck({ onComplete }: BetterLuckProps) {
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (hasPlayed) return;
    setHasPlayed(true);

    // Play encouraging/hopeful sound
    const playHopefulSound = () => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Gentle upward progression
        const notes = [
          { freq: 262, time: 0, duration: 0.3 },    // C
          { freq: 330, time: 0.3, duration: 0.3 },  // E
          { freq: 392, time: 0.6, duration: 0.5 },  // G
        ];

        notes.forEach(({ freq, time, duration }) => {
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();

          osc.type = 'sine';
          osc.frequency.value = freq;

          const startTime = audioCtx.currentTime + time;
          gainNode.gain.setValueAtTime(0.15, startTime);
          gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          osc.start(startTime);
          osc.stop(startTime + duration);
        });

        console.log('🍀 Playing hopeful sound');
      } catch (err) {
        console.log('Failed to play hopeful sound:', err);
      }
    };

    // Play encouraging speech
    if ('speechSynthesis' in window) {
      const speakPhrase = () => {
        const utterance = new SpeechSynthesisUtterance('Better luck next time!');
        utterance.rate = 1.0;
        utterance.pitch = 1.2;
        utterance.volume = 1.0;
        speechSynthesis.speak(utterance);
        console.log('🎤 Playing better luck announcement');
      };

      setTimeout(() => {
        if (speechSynthesis.getVoices().length > 0) {
          speakPhrase();
        } else {
          speechSynthesis.addEventListener('voiceschanged', speakPhrase, { once: true });
        }
      }, 300);
    }

    playHopefulSound();

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

  // Floating clovers
  const clovers = useMemo(() => Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1,
    duration: 2 + Math.random() * 1,
  })), []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-900/70 to-blue-900/70 backdrop-blur-sm"
    >
      {/* Floating Clovers */}
      {clovers.map((clover) => (
        <motion.div
          key={clover.id}
          initial={{ y: '110vh', x: `${clover.x}vw`, opacity: 0.7 }}
          animate={{
            y: '-10vh',
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: clover.duration,
            delay: clover.delay,
            ease: 'linear',
          }}
          className="absolute text-4xl"
        >
          🍀
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
        {/* Four Leaf Clover */}
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
          className="text-9xl mb-6"
        >
          🍀
        </motion.div>

        {/* Better Luck Text */}
        <motion.h1
          animate={{
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
          }}
          className="text-4xl md:text-6xl font-black mb-6 text-green-300"
        >
          BETTER LUCK
        </motion.h1>

        <motion.h2
          animate={{
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: 0.2,
          }}
          className="text-4xl md:text-6xl font-black mb-6 text-green-300"
        >
          NEXT TIME!
        </motion.h2>

        {/* Encouraging Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg md:text-xl text-green-200"
        >
          Keep spinning! Your luck is coming!
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
