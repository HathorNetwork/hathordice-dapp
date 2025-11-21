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

import { GoldFrame } from './GoldFrame';

export function SlotMachineAnimation({
  isSpinning,
  finalNumber,
  result,
  onComplete
}: SlotMachineAnimationProps) {
  // Define fruit symbols (Must match SlotMachineReel.tsx)
  const fruits = [
    '/images/cartoon_pharaoh.png',
    '/images/cartoon_eye_of_horus.png',
    '/images/cartoon_scarab.png',
    '/images/ankh.png',
    '/images/cartoon_anubis.png',
    '/images/cartoon_pyramid.png',
    '/images/lotus.png'
  ];

  // For winning: all same fruit. For losing: different fruits
  // Use finalNumber to determine the fruits
  // UPDATED FOR 5 REELS
  let reelFruits: string[];
  if (result === 'win') {
    // All same fruit - use finalNumber to pick which fruit
    const fruitIndex = finalNumber % fruits.length;
    const f = fruits[fruitIndex];
    reelFruits = [f, f, f, f, f];
  } else {
    // Different fruits - use finalNumber to seed the selection
    reelFruits = [
      fruits[finalNumber % fruits.length],
      fruits[(finalNumber + 1) % fruits.length],
      fruits[(finalNumber + 2) % fruits.length],
      fruits[(finalNumber + 3) % fruits.length],
      fruits[(finalNumber + 4) % fruits.length],
    ];
  }

  useEffect(() => {
    if (!isSpinning && result) {
      // Wait for reel animation to finish before calling onComplete
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isSpinning, result, onComplete]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Gold Frame Container */}
      <GoldFrame className="mb-8">
        {/* 5x3 Grid - Connected Columns */}
        <div className="grid grid-cols-5 gap-0 p-1 bg-white relative overflow-hidden rounded-2xl border-4 border-white">
          {/* Render 5 Columns - Each with different spin speed */}
          {reelFruits.map((targetFruit, colIndex) => (
            <div key={colIndex} className="relative border-r-2 border-yellow-500 last:border-0">
              <SlotMachineReel
                finalFruit={targetFruit}
                isSpinning={isSpinning}
                duration={1.5 + (colIndex * 0.3)}
                delay={colIndex * 0.15}
                spinSpeed={0.3 + (colIndex * 0.05)}
                size="full-column"
              />

              {/* Winning Highlight Overlay */}
              {result === 'win' && !isSpinning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-1/3 left-0 right-0 h-1/3 border-4 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.5)_inset] pointer-events-none z-10"
                />
              )}
            </div>
          ))}

          {/* Payline Indicator (Center Line) */}
          <div className="absolute top-1/3 left-0 right-0 h-1/3 border-t border-b border-yellow-600/20 pointer-events-none" />
        </div>
      </GoldFrame>
    </div>
  );
}
