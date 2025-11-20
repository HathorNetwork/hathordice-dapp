'use client';

import { motion } from 'framer-motion';
import { FORTUNE_TIGER_MULTIPLIERS, type FortuneTigerMultiplier } from '@/lib/utils';

interface MultiplierSelectorProps {
  selectedMultiplier: number;
  onSelect: (multiplier: number) => void;
  disabled?: boolean;
}

const colorClasses = {
  green: 'bg-tiger-green hover:bg-emerald-600',
  blue: 'bg-blue-600 hover:bg-blue-700',
  purple: 'bg-purple-600 hover:bg-purple-700',
  orange: 'bg-orange-600 hover:bg-orange-700',
  red: 'bg-tiger-red hover:bg-tiger-red-dark',
};

export function MultiplierSelector({ selectedMultiplier, onSelect, disabled }: MultiplierSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {FORTUNE_TIGER_MULTIPLIERS.map((option: FortuneTigerMultiplier) => {
        const isSelected = selectedMultiplier === option.multiplier;
        const colorClass = colorClasses[option.color as keyof typeof colorClasses] || colorClasses.blue;

        return (
          <motion.button
            key={option.multiplier}
            onClick={() => !disabled && onSelect(option.multiplier)}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            className={`
              relative p-4 rounded-lg font-bold text-white
              transition-all duration-200
              ${isSelected ? 'ring-4 ring-tiger-gold animate-pulse-glow' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${colorClass}
            `}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl md:text-3xl">
                {option.label}
              </span>
              <span className="text-xs md:text-sm opacity-90">
                {option.winChance.toFixed(1)}% win
              </span>
            </div>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-tiger-gold text-slate-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
              >
                ✓
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
