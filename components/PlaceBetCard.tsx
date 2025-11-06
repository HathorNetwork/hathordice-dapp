'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { calculateMultiplier, calculatePayout, thresholdToWinChance, winChanceToThreshold, formatNumber } from '@/lib/utils';

interface PlaceBetCardProps {
  selectedToken: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function PlaceBetCard({ selectedToken, isExpanded, onToggle }: PlaceBetCardProps) {
  const { walletBalance, contractBalance } = useWallet();
  const totalBalance = walletBalance + contractBalance;
  
  const [betAmount, setBetAmount] = useState(100);
  const [betMode, setBetMode] = useState<'threshold' | 'chance'>('chance');
  const [winChance, setWinChance] = useState(50);
  const [threshold, setThreshold] = useState(32768);
  const [multiplier, setMultiplier] = useState(1.96);
  const [potentialPayout, setPotentialPayout] = useState(196);

  useEffect(() => {
    const mult = calculateMultiplier(threshold);
    const payout = calculatePayout(betAmount, threshold);
    setMultiplier(mult);
    setPotentialPayout(payout);
  }, [betAmount, threshold]);

  const handleWinChanceChange = (value: number) => {
    setWinChance(value);
    const newThreshold = winChanceToThreshold(value);
    setThreshold(newThreshold);
  };

  const handleThresholdChange = (value: number) => {
    setThreshold(value);
    const newWinChance = thresholdToWinChance(value);
    setWinChance(newWinChance);
  };

  const setQuickAmount = (percentage: number) => {
    setBetAmount(totalBalance * percentage);
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
      >
        <span className="text-white font-medium">🎲 PLACE A BET</span>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>
      
      {isExpanded && (
        <div className="p-6 border-t border-slate-700 space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Bet Amount</label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                className="flex-1 bg-transparent text-white outline-none"
                min="0"
                step="0.01"
              />
              <span className="text-slate-400">{selectedToken}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setQuickAmount(0.25)} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors">25%</button>
              <button onClick={() => setQuickAmount(0.5)} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors">50%</button>
              <button onClick={() => setQuickAmount(0.75)} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors">75%</button>
              <button onClick={() => setQuickAmount(1)} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors">MAX</button>
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="betMode"
                checked={betMode === 'chance'}
                onChange={() => setBetMode('chance')}
                className="text-blue-600"
              />
              <span className="text-sm text-slate-300">Set Win Chance</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="betMode"
                checked={betMode === 'threshold'}
                onChange={() => setBetMode('threshold')}
                className="text-blue-600"
              />
              <span className="text-sm text-slate-300">Set Threshold</span>
            </label>
          </div>

          {betMode === 'chance' ? (
            <div>
              <label className="block text-sm text-slate-400 mb-2">Win Chance (%)</label>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2">
                <input
                  type="number"
                  value={winChance.toFixed(0)}
                  onChange={(e) => handleWinChanceChange(parseFloat(e.target.value) || 0)}
                  className="flex-1 bg-transparent text-white outline-none"
                  min="1"
                  max="99"
                  step="1"
                />
                <span className="text-slate-400">%</span>
              </div>
              <div className="mt-3">
                <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden cursor-pointer"
                     onClick={(e) => {
                       const rect = e.currentTarget.getBoundingClientRect();
                       const x = e.clientX - rect.left;
                       const percentage = (x / rect.width) * 100;
                       handleWinChanceChange(Math.max(0.001, Math.min(99.999, percentage)));
                     }}>
                  <div
                    className="absolute h-full bg-blue-500 transition-all"
                    style={{ width: `${winChance}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm text-slate-400 mb-2">Threshold (1-65,535)</label>
              <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2">
                <input
                  type="number"
                  value={threshold}
                  onChange={(e) => handleThresholdChange(parseInt(e.target.value) || 1)}
                  className="w-full bg-transparent text-white outline-none"
                  min="1"
                  max="65535"
                  step="1"
                />
              </div>
            </div>
          )}

          <div className="bg-slate-900 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">📊 Threshold:</span>
              <span className="text-white font-medium">{threshold.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">💰 Multiplier:</span>
              <span className="text-white font-medium">{formatNumber(multiplier)}x</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">🎯 Potential Payout:</span>
              <span className="text-green-400 font-bold">{formatNumber(potentialPayout)} {selectedToken}</span>
            </div>
          </div>

          <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            🎲 Place Bet
          </button>
        </div>
      )}
    </div>
  );
}
