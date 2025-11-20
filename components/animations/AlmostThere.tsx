'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AlmostThereProps {
  onComplete: () => void;
}

export function AlmostThere({ onComplete }: AlmostThereProps) {
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (hasPlayed) return;
    setHasPlayed(true);

    // Play "so close" sound - rising tension then drop
    const playAlmostSound = () => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Rising then falling
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = 'sine';

        const startTime = audioCtx.currentTime;

        // Rising frequency (tension)
        osc.frequency.setValueAtTime(200, startTime);
        osc.frequency.linearRampToValueAtTime(800, startTime + 0.8);

        // Sudden drop (disappointment)
        osc.frequency.linearRampToValueAtTime(150, startTime + 1.0);

        gainNode.gain.setValueAtTime(0.25, startTime);
        gainNode.gain.linearRampToValueAtTime(0, startTime + 1.2);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.2);

        console.log('😬 Playing almost there sound');
      } catch (err) {
        console.log('Failed to play almost sound:', err);
      }
    };

    // Play speech
    if ('speechSynthesis' in window) {
      const speakPhrase = () => {
        const utterance = new SpeechSynthesisUtterance('So close!');
        utterance.rate = 1.0;
        utterance.pitch = 1.3;
        utterance.volume = 1.0;
        speechSynthesis.speak(utterance);
        console.log('🎤 Playing almost there announcement');
      };

      setTimeout(() => {
        if (speechSynthesis.getVoices().length > 0) {
          speakPhrase();
        } else {
          speechSynthesis.addEventListener('voiceschanged', speakPhrase, { once: true });
        }
      }, 500);
    }

    playAlmostSound();

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-orange-900/80 to-red-900/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.3 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
        className="text-center px-8"
      >
        {/* Grimacing Face */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 0.3,
          }}
          className="text-9xl mb-6"
        >
          😬
        </motion.div>

        {/* Almost There Text */}
        <motion.h1
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
          className="text-5xl md:text-7xl font-black mb-6 text-orange-300"
        >
          SO CLOSE!
        </motion.h1>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl md:text-2xl text-orange-200"
        >
          Just a bit off... Try again!
        </motion.p>

        {/* Pulsing Circle */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border-4 border-orange-400 pointer-events-none"
        />
      </motion.div>
    </motion.div>
  );
}
