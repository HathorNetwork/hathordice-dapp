'use client';

import { useEffect, useState } from 'react';
import { Bet } from '@/types';

interface BetResultNotificationProps {
  bet: Bet;
  onComplete: () => void;
}

export default function BetResultNotification({ bet, onComplete }: BetResultNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const isWin = bet.result === 'win';

  useEffect(() => {
    // Play sound effect
    if (isWin) {
      playWinSound();
    } else {
      playLoseSound();
    }

    // Hide notification after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [isWin, onComplete]);

  const playWinSound = () => {
    try {
      // Create a simple coin sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Play multiple coin sounds in sequence
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = 800 + (i * 200);
          oscillator.type = 'sine';

          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        }, i * 100);
      }
    } catch (error) {
      console.warn('Could not play win sound:', error);
    }
  };

  const playLoseSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
      oscillator.type = 'sawtooth';

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('Could not play lose sound:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className={`
          pointer-events-auto max-w-md w-full mx-4 p-8 rounded-2xl shadow-2xl
          ${isWin ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600' : 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900'}
          border-4 ${isWin ? 'border-yellow-300' : 'border-slate-600'}
          transform transition-all duration-500
          ${isVisible ? 'scale-100 opacity-100 animate-bounce-once' : 'scale-0 opacity-0'}
        `}
      >
        <div className="text-center">
          {isWin ? (
            <>
              <div className="text-6xl mb-4 animate-spin-slow">💰</div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2 animate-pulse">
                WINNER WINNER
              </h2>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                CHICKEN DINNER! 🍗
              </h3>
              <div className="text-5xl font-bold text-slate-900 mb-2">
                +{bet.payout.toFixed(2)} {bet.token}
              </div>
              <div className="text-sm text-slate-800 mt-4">
                You won with lucky number {bet.luckyNumber} ≤ {bet.threshold}!
              </div>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-3xl font-bold text-red-400 mb-2">
                Not This Time!
              </h2>
              <div className="text-xl text-slate-300 mb-4">
                Lucky number {bet.luckyNumber} {'>'} {bet.threshold}
              </div>
              <div className="text-lg text-slate-400 mb-4">
                Lost {bet.amount.toFixed(2)} {bet.token}
              </div>
              <div className="bg-slate-700 rounded-lg p-4 mt-4">
                <p className="text-yellow-400 font-semibold mb-2">
                  💪 Don&apos;t give up!
                </p>
                <p className="text-slate-300 text-sm">
                  Every loss brings you closer to your next big win. Try again and turn it around!
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confetti effect for wins */}
      {isWin && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              {['💎', '💰', '🎉', '⭐', '🏆'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
