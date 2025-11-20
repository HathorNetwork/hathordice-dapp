'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export type UIMode = 'classic' | 'fortune-tiger';

interface UIModeSwitcherProps {
  currentMode: UIMode;
  onModeChange: (mode: UIMode) => void;
}

export function UIModeSwitcher({ currentMode, onModeChange }: UIModeSwitcherProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-xl flex gap-1">
      <button
        onClick={() => onModeChange('classic')}
        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${currentMode === 'classic'
          ? 'bg-white text-slate-900 shadow-lg'
          : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
      >
        Classic
      </button>
      <button
        onClick={() => onModeChange('fortune-tiger')}
        className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${currentMode === 'fortune-tiger'
          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
          : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
      >
        <img src="/images/cartoon_anubis.png" alt="icon" className="w-5 h-5" /> Playful
      </button>
    </div>
  );
}
