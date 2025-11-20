'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export type UIMode = 'classic' | 'fortune-tiger';

interface UIModeSwitcherProps {
  currentMode: UIMode;
  onModeChange: (mode: UIMode) => void;
}

export function UIModeSwitcher({ currentMode, onModeChange }: UIModeSwitcherProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleMode = () => {
    const newMode = currentMode === 'classic' ? 'fortune-tiger' : 'classic';
    onModeChange(newMode);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.button
        onClick={toggleMode}
        onHoverStart={() => setIsExpanded(true)}
        onHoverEnd={() => setIsExpanded(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          flex items-center gap-2 px-4 py-3 rounded-full shadow-lg
          transition-all duration-300 font-semibold
          ${currentMode === 'fortune-tiger'
            ? 'bg-gold-gradient text-slate-900'
            : 'bg-slate-700 text-white hover:bg-slate-600'}
        `}
      >
        <span className="text-2xl">
          {currentMode === 'classic' ? '🎲' : '🐯'}
        </span>
        <motion.span
          initial={{ width: 0, opacity: 0 }}
          animate={{
            width: isExpanded ? 'auto' : 0,
            opacity: isExpanded ? 1 : 0
          }}
          className="overflow-hidden whitespace-nowrap"
        >
          {currentMode === 'classic' ? 'Tiger Mode' : 'Classic Mode'}
        </motion.span>
      </motion.button>
    </div>
  );
}
