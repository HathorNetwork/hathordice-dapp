'use client';

import { motion } from 'framer-motion';
import { SlotMachineReel } from './SlotMachineReel';
import { useEffect, useState } from 'react';

interface SlotMachineAnimationProps {
  isSpinning: boolean;
  finalNumber: number;
  result?: 'win' | 'lose' | null;
  onComplete?: () => void;
}

export function SlotMachineAnimation({
  isSpinning,
  finalNumber,
  result,
  onComplete
}: SlotMachineAnimationProps) {
  const [showResult, setShowResult] = useState(false);

  // Define fruit symbols
  const fruits = ['🍒', '🍋', '🍊', '🍇', '🍉', '🍓', '🍌', '🥝', '🍑', '🍍'];

  // For winning: all same fruit. For losing: different fruits
  // Use finalNumber to determine the fruits
  let reelFruits: string[];
  if (result === 'win') {
    // All same fruit - use finalNumber to pick which fruit
    const fruitIndex = finalNumber % fruits.length;
    reelFruits = [fruits[fruitIndex], fruits[fruitIndex], fruits[fruitIndex]];
  } else {
    // Different fruits - use finalNumber to seed the selection
    const fruit1 = fruits[finalNumber % fruits.length];
    const fruit2 = fruits[(finalNumber + 3) % fruits.length];
    const fruit3 = fruits[(finalNumber + 7) % fruits.length];
    reelFruits = [fruit1, fruit2, fruit3];
  }

  useEffect(() => {
    if (isSpinning) {
      setShowResult(false);
      // Show result after animation completes (longest reel duration + delays)
      const timer = setTimeout(() => {
        setShowResult(true);
        onComplete?.();
      }, 3500); // 2s duration + 1s for last reel + 0.5s buffer

      return () => clearTimeout(timer);
    }
  }, [isSpinning, onComplete]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Casino Slot Machine Frame */}
      <motion.div
        animate={isSpinning ? {
          boxShadow: [
            '0 0 20px rgba(255, 215, 0, 0.5)',
            '0 0 40px rgba(255, 165, 0, 0.8)',
            '0 0 20px rgba(255, 215, 0, 0.5)',
          ]
        } : {}}
        transition={{ duration: 1, repeat: isSpinning ? Infinity : 0 }}
        className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-6 rounded-3xl border-8 border-yellow-300 shadow-2xl"
      >
        {/* Casino-style 3-row display with center row larger */}
        <div className="relative bg-slate-900/50 rounded-2xl p-4">
          {/* Top row - smaller */}
          <div className="flex justify-center gap-4 mb-2 opacity-60">
            {reelFruits.map((fruit, index) => (
              <div key={`top-${index}`} className="w-20 h-16 flex items-center justify-center text-4xl">
                {fruits[(fruits.indexOf(fruit) - 1 + fruits.length) % fruits.length]}
              </div>
            ))}
          </div>

          {/* Center row - MAIN (larger and highlighted) */}
          <div className="relative">
            {/* Highlight bar for center row */}
            <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
              result === 'win' ? 'bg-green-500/30 ring-4 ring-green-400' :
              result === 'lose' ? 'bg-red-500/30 ring-4 ring-red-400' :
              'bg-yellow-400/20 ring-2 ring-yellow-300'
            }`} />

            <div className="relative flex justify-center gap-4 py-2">
              {reelFruits.map((fruit, index) => (
                <SlotMachineReel
                  key={index}
                  finalFruit={fruit}
                  isSpinning={isSpinning}
                  duration={2}
                  delay={index * 0.4}
                  size="large"
                />
              ))}
            </div>
          </div>

          {/* Bottom row - smaller */}
          <div className="flex justify-center gap-4 mt-2 opacity-60">
            {reelFruits.map((fruit, index) => (
              <div key={`bottom-${index}`} className="w-20 h-16 flex items-center justify-center text-4xl">
                {fruits[(fruits.indexOf(fruit) + 1) % fruits.length]}
              </div>
            ))}
          </div>
        </div>

        {/* Result Indicator */}
        {showResult && !isSpinning && result && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className={`
              mt-4 p-3 rounded-xl text-center font-black text-2xl border-4
              ${result === 'win'
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-300'
                : 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-orange-300'}
            `}
          >
            {result === 'win' ? '🎊 YOU WIN! 🎊' : '🔄 TRY AGAIN! 🔄'}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
