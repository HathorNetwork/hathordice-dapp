'use client';

import { motion, useAnimate } from 'framer-motion';
import { useEffect, useMemo } from 'react';

interface SlotMachineReelProps {
  finalFruit: string;
  isSpinning: boolean;
  duration?: number;
  delay?: number;
  spinSpeed?: number;
  size?: 'normal' | 'large' | 'small' | 'full-column';
}

const FRUITS = [
  '/images/cartoon_pharaoh.png',
  '/images/cartoon_eye_of_horus.png',
  '/images/cartoon_scarab.png',
  '/images/ankh.png', // Keeping Ankh as is for now if no cartoon version, or use existing
  '/images/cartoon_anubis.png',
  '/images/cartoon_pyramid.png',
  '/images/lotus.png' // Keeping Lotus as is
];

export function SlotMachineReel({
  finalFruit,
  isSpinning,
  duration = 2,
  delay = 0,
  spinSpeed = 0.4,
  size = 'normal'
}: SlotMachineReelProps) {
  const [scope, animate] = useAnimate();

  // Size configurations wrapped in useMemo to prevent recreation on every render
  const sizeConfig = useMemo(() => {
    if (size === 'large') {
      return { height: 112, width: 'w-24', containerHeight: 'h-28' }; // Single large
    } else if (size === 'small') {
      return { height: 64, width: 'w-20', containerHeight: 'h-16' }; // Single small
    } else if (size === 'full-column') {
      // 3 rows visible. Each row ~96px (h-24). Total height ~288px (h-72).
      // We use a slightly smaller height for the items to fit nicely.
      return { height: 96, width: 'w-full', containerHeight: 'h-72' };
    } else {
      return { height: 96, width: 'w-20', containerHeight: 'h-24' }; // Normal single
    }
  }, [size]);

  useEffect(() => {
    const FRUIT_HEIGHT = sizeConfig.height;
    let isMounted = true;

    if (isSpinning) {
      // Spin continuously at the specified speed (all in same direction - downward)
      animate(
        scope.current,
        { y: [0, -(FRUITS.length * FRUIT_HEIGHT), 0] },
        {
          duration: spinSpeed,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        }
      );
    } else if (finalFruit) {
      // Stop at final fruit with realistic deceleration
      const baseIndex = FRUITS.indexOf(finalFruit);

      // Target index in the 4th set of fruits (middle of 6 sets) to ensure plenty of buffer
      // This gives us room for the extra spin cycles
      let targetIndex = (FRUITS.length * 3) + baseIndex;

      // For full-column mode, center the target in the middle row
      if (size === 'full-column') {
        targetIndex = targetIndex - 1;
      }

      const finalY = -(targetIndex * FRUIT_HEIGHT);

      // Animate with deceleration curve
      animate(
        scope.current,
        { y: finalY },
        {
          duration: duration,
          ease: [0.25, 0.1, 0.25, 1], // Custom cubic-bezier for smooth deceleration
          delay: delay,
        }
      );
    } else {
      // Static position when idle
      animate(scope.current, { y: 0 }, { duration: 0 });
    }

    return () => {
      isMounted = false;
    };
  }, [isSpinning, finalFruit, duration, delay, spinSpeed, animate, scope, sizeConfig.height, size]);

  return (
    <div className={`relative ${sizeConfig.width} ${sizeConfig.containerHeight} overflow-hidden rounded-none`}>
      {/* Reel content */}
      <motion.div
        ref={scope}
        className="flex flex-col items-center w-full"
      >
        {/* Render 6 sets of fruits for seamless looping during extended spins */}
        {[...FRUITS, ...FRUITS, ...FRUITS, ...FRUITS, ...FRUITS, ...FRUITS].map((fruit, index) => (
          <div
            key={index}
            className={`flex items-center justify-center w-full last:border-0`}
            style={{
              height: sizeConfig.height,
            }}
          >
            <img
              src={fruit}
              alt="symbol"
              className="w-[80%] h-[80%] object-contain drop-shadow-md p-2"
            />
          </div>
        ))}
      </motion.div>
      {/* Gradient overlay for depth effect (cylinder look) - Lighter for white bg */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-gray-300/40 via-transparent to-gray-300/40" />

      {/* Vertical separator lines (optional, handled by parent grid usually, but added here for self-containment if needed) */}
    </div>
  );
}
