'use client';

import { motion, useAnimate } from 'framer-motion';
import { useEffect } from 'react';

interface SlotMachineReelProps {
  finalFruit: string;
  isSpinning: boolean;
  duration?: number;
  delay?: number;
  size?: 'normal' | 'large';
}

export function SlotMachineReel({
  finalFruit,
  isSpinning,
  duration = 2,
  delay = 0,
  size = 'normal'
}: SlotMachineReelProps) {
  const [scope, animate] = useAnimate();
  const fruits = ['🍒', '🍋', '🍊', '🍇', '🍉', '🍓', '🍌', '🥝', '🍑', '🍍'];

  // Size configurations
  const sizeConfig = size === 'large'
    ? { height: 112, textSize: 'text-7xl', containerHeight: 'h-28', width: 'w-24' } // 7rem = 112px
    : { height: 96, textSize: 'text-5xl', containerHeight: 'h-24', width: 'w-20' }; // 6rem = 96px

  useEffect(() => {
    const FRUIT_HEIGHT = sizeConfig.height;
    let isMounted = true;

    if (isSpinning) {
      // Spin continuously in a loop until stopped
      const spinContinuously = async () => {
        // Reset to start position first
        await animate(scope.current, { y: 0 }, { duration: 0 });

        while (isMounted && isSpinning) {
          // Spin through all fruits
          await animate(
            scope.current,
            { y: -(fruits.length * FRUIT_HEIGHT) },
            {
              duration: 0.5,
              ease: 'linear',
            }
          );
          // Only reset if still spinning
          if (isMounted && isSpinning) {
            await animate(
              scope.current,
              { y: 0 },
              { duration: 0 }
            );
          }
        }
      };
      spinContinuously();
    } else if (finalFruit) {
      // Stop at final fruit with smooth deceleration
      const finalFruitIndex = fruits.indexOf(finalFruit);

      animate(
        scope.current,
        { y: -(finalFruitIndex * FRUIT_HEIGHT) },
        {
          duration: duration + delay,
          ease: [0.22, 1, 0.36, 1],
          delay: delay,
        }
      );
    } else {
      // Idle slow animation
      const idleAnimation = async () => {
        await animate(scope.current, { y: 0 }, { duration: 0 });
        while (isMounted && !isSpinning) {
          await animate(
            scope.current,
            { y: -(fruits.length * FRUIT_HEIGHT) },
            {
              duration: 20, // Very slow 20 seconds per full cycle
              ease: 'linear',
            }
          );
          if (isMounted && !isSpinning) {
            await animate(scope.current, { y: 0 }, { duration: 0 });
          }
        }
      };
      idleAnimation();
    }

    return () => {
      isMounted = false;
    };
  }, [isSpinning, finalFruit, duration, delay, animate, scope, fruits, sizeConfig]);

  return (
    <div className={`relative ${sizeConfig.width} ${sizeConfig.containerHeight} overflow-hidden bg-white rounded-xl border-3 border-yellow-400 shadow-lg`}>
      <motion.div
        ref={scope}
        className="absolute top-0 left-0 w-full"
      >
        {/* Render fruits multiple times for smooth looping */}
        {[...Array(8)].map((_, cycleIndex) => (
          <div key={cycleIndex}>
            {fruits.map((fruit, fruitIndex) => (
              <div
                key={`${cycleIndex}-${fruitIndex}`}
                className={`${sizeConfig.containerHeight} flex items-center justify-center ${sizeConfig.textSize}`}
              >
                {fruit}
              </div>
            ))}
          </div>
        ))}
      </motion.div>
      {/* Gradient overlay for depth effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/80 via-transparent to-white/80" />
    </div>
  );
}
