'use client';

import { motion } from 'framer-motion';
import { GoldFrame } from './GoldFrame';

export type AnimationType =
  | 'winner-chicken-dinner'
  | 'big-win'
  | 'mega-win'
  | 'jackpot'
  | 'try-again'
  | 'almost-there'
  | 'better-luck'
  | 'video-win-1'
  | 'video-lose-1'
  | 'video-lose-2'
  | 'video-lose-3'
  | 'video-lose-4'
  | 'video-lose-5'
  | 'video-lose-6';

interface Animation {
  id: AnimationType;
  name: string;
  emoji: string;
  description: string;
  type: 'win' | 'lose';
  isVideo?: boolean;
  videoPath?: string;
}

const ANIMATIONS: Animation[] = [
  {
    id: 'winner-chicken-dinner',
    name: 'Winner Chicken Dinner',
    emoji: '🍗',
    description: 'Classic winner with chicken dinner celebration',
    type: 'win',
  },
  {
    id: 'big-win',
    name: 'Big Win',
    emoji: '💰',
    description: 'Falling coins and cash register sound',
    type: 'win',
  },
  {
    id: 'mega-win',
    name: 'Mega Win',
    emoji: '🏆',
    description: 'Fireworks and epic celebration',
    type: 'win',
  },
  {
    id: 'jackpot',
    name: 'Jackpot',
    emoji: '🎰',
    description: 'Ultimate jackpot with rainbow effects',
    type: 'win',
  },
  {
    id: 'video-win-1',
    name: 'Win Video',
    emoji: '🎬',
    description: 'Play a winning video celebration',
    type: 'win',
    isVideo: true,
    videoPath: '/videos/win/b0386440-e311-447f-9ad9-66fcae177139.mp4',
  },
  {
    id: 'try-again',
    name: 'Try Again',
    emoji: '😔',
    description: 'Sad trombone, simple try again',
    type: 'lose',
  },
  {
    id: 'almost-there',
    name: 'Almost There',
    emoji: '😬',
    description: 'So close! Tension and encouragement',
    type: 'lose',
  },
  {
    id: 'better-luck',
    name: 'Better Luck',
    emoji: '🍀',
    description: 'Hopeful message with lucky clovers',
    type: 'lose',
  },
  {
    id: 'video-lose-1',
    name: 'Lose Video 1',
    emoji: '🎬',
    description: 'Play a losing video',
    type: 'lose',
    isVideo: true,
    videoPath: '/videos/lose/4a51eae1-9047-41d8-8a99-2d03cb543766.mp4',
  },
  {
    id: 'video-lose-2',
    name: 'Lose Video 2',
    emoji: '🎬',
    description: 'Play another losing video',
    type: 'lose',
    isVideo: true,
    videoPath: '/videos/lose/51b786d4-3f76-4881-9aa6-95f6f106c4cc.mp4',
  },
  {
    id: 'video-lose-3',
    name: 'Lose Video 3',
    emoji: '🎬',
    description: 'Play a third losing video',
    type: 'lose',
    isVideo: true,
    videoPath: '/videos/lose/e8029c41-709d-4dd6-85ef-fa15357ce592.mp4',
  },
  {
    id: 'video-lose-4',
    name: 'Fracasso Baiano 1',
    emoji: '🎬',
    description: 'Fracasso Baiano video 1',
    type: 'lose',
    isVideo: true,
    videoPath: '/videos/lose/fracasso-baiano-1.mp4',
  },
  {
    id: 'video-lose-5',
    name: 'Fracasso Baiano 2',
    emoji: '🎬',
    description: 'Fracasso Baiano video 2',
    type: 'lose',
    isVideo: true,
    videoPath: '/videos/lose/fracasso-baiano-2.mp4',
  },
  {
    id: 'video-lose-6',
    name: 'Fracasso Baiano 3',
    emoji: '🎬',
    description: 'Fracasso Baiano video 3',
    type: 'lose',
    isVideo: true,
    videoPath: '/videos/lose/fracasso-baiano-3.mp4',
  },
];

interface AnimationSelectorProps {
  onSelect: (animationId: AnimationType) => void;
  onClose: () => void;
}

// Export animations array for use in other components
export { ANIMATIONS };

export function AnimationSelector({ onSelect, onClose }: AnimationSelectorProps) {
  const winAnimations = ANIMATIONS.filter(a => a.type === 'win');
  const loseAnimations = ANIMATIONS.filter(a => a.type === 'lose');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <GoldFrame>
          <div className="bg-[#1a0b2e] p-6 rounded-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-serif text-yellow-400">
                🎬 Select Animation
              </h2>
              <button
                onClick={onClose}
                className="text-yellow-400 hover:text-yellow-300 text-3xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-yellow-400/10 transition-colors"
              >
                ×
              </button>
            </div>

            <p className="text-yellow-100/70 mb-6 text-sm">
              Choose an animation to preview. This will simulate the full spin sequence with your selected animation.
            </p>

            {/* Win Animations */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                Win Animations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {winAnimations.map((animation) => (
                  <button
                    key={animation.id}
                    onClick={() => onSelect(animation.id)}
                    className="bg-gradient-to-br from-green-900/40 to-green-800/40 hover:from-green-800/60 hover:to-green-700/60 border-2 border-green-600/50 hover:border-green-500 rounded-xl p-4 text-left transition-all hover:scale-105 active:scale-95"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-4xl">{animation.emoji}</span>
                      <div className="flex-1">
                        <div className="text-lg font-bold text-green-300">
                          {animation.name}
                        </div>
                        <div className="text-sm text-green-200/70 mt-1">
                          {animation.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Lose Animations */}
            <div>
              <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                <span className="text-2xl">😢</span>
                Lose Animations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {loseAnimations.map((animation) => (
                  <button
                    key={animation.id}
                    onClick={() => onSelect(animation.id)}
                    className="bg-gradient-to-br from-red-900/40 to-red-800/40 hover:from-red-800/60 hover:to-red-700/60 border-2 border-red-600/50 hover:border-red-500 rounded-xl p-4 text-left transition-all hover:scale-105 active:scale-95"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-4xl">{animation.emoji}</span>
                      <div className="flex-1">
                        <div className="text-lg font-bold text-red-300">
                          {animation.name}
                        </div>
                        <div className="text-sm text-red-200/70 mt-1">
                          {animation.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GoldFrame>
      </motion.div>
    </motion.div>
  );
}
