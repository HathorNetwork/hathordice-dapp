'use client';

import { motion, useAnimate } from 'framer-motion';
import { useEffect, useMemo } from 'react';

interface SlotMachineReelProps {
  finalFruit: string;
  isSpinning: boolean;
  duration?: number;
  delay?: number;
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
      // Spin continuously with CSS-like animation
      animate(
        scope.current,
        { y: [0, -(FRUITS.length * FRUIT_HEIGHT), 0] },
        {
          duration: 0.4,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        }
      );
    } else if (finalFruit) {
      // Stop at final fruit with smooth deceleration
      const baseIndex = FRUITS.indexOf(finalFruit);

      // We want to stop at the instance in the MIDDLE set of fruits
      // to ensure we have prev/next items available for the 3-row view.
      // Target index in the triple array:
      // Set 1: 0 to N-1
      // Set 2: N to 2N-1 (We target here)
      // Set 3: 2N to 3N-1

      let targetIndex = FRUITS.length + baseIndex;

      // If we are in 'full-column' mode, we want the finalFruit to be in the MIDDLE row.
      // The container shows 3 items. The 'y' transforms the top of the strip.
      // To center the target, we need to shift UP by (targetIndex - 1).
      // This shows [target-1, target, target+1].
      if (size === 'full-column') {
        targetIndex = targetIndex - 1;
      }

      animate(
        scope.current,
        { y: -(targetIndex * FRUIT_HEIGHT) },
        {
          duration: duration + delay,
          ease: [0.22, 1, 0.36, 1],
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
  }, [isSpinning, finalFruit, duration, delay, animate, scope, sizeConfig.height]);

  return (
    <div className={`relative ${sizeConfig.width} ${sizeConfig.containerHeight} overflow-hidden rounded-none`}>
      {/* Reel content */}
      <motion.div
        ref={scope}
        className="flex flex-col items-center w-full"
      >
        {/* Render 3 sets of fruits for seamless looping and context */}
        {[...FRUITS, ...FRUITS, ...FRUITS].map((fruit, index) => (
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
