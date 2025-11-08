'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useHathor } from '@/contexts/HathorContext';
import { calculateMultiplier, calculatePayout, thresholdToWinChance, winChanceToThreshold, formatNumber, formatTokenAmount } from '@/lib/utils';
import { toast } from '@/lib/toast';
import HelpIcon from '@/components/HelpIcon';

interface PlaceBetCardProps {
  selectedToken: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function PlaceBetCard({ selectedToken, isExpanded, onToggle }: PlaceBetCardProps) {
  const { walletBalance, contractBalance, placeBet } = useWallet();
  const { isConnected, getContractStateForToken, getContractIdForToken } = useHathor();
  const totalBalance = walletBalance + contractBalance;

  const [betAmount, setBetAmount] = useState(100);
  const [betMode, setBetMode] = useState<'threshold' | 'chance'>('chance');
  const [winChance, setWinChance] = useState(50);
  const [threshold, setThreshold] = useState(32768);
  const [multiplier, setMultiplier] = useState(1.96);
  const [potentialPayout, setPotentialPayout] = useState(196);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const contractState = getContractStateForToken(selectedToken);
  const randomBitLength = contractState?.random_bit_length || 16;
  const houseEdgeBasisPoints = contractState?.house_edge_basis_points || 200;
  const maxBetAmount = contractState?.max_bet_amount || 1000000;

  useEffect(() => {
    const mult = calculateMultiplier(threshold, randomBitLength, houseEdgeBasisPoints);
    const payout = calculatePayout(betAmount, threshold, randomBitLength, houseEdgeBasisPoints);
    setMultiplier(mult);
    setPotentialPayout(payout);
  }, [betAmount, threshold, randomBitLength, houseEdgeBasisPoints]);

  useEffect(() => {
    const newThreshold = winChanceToThreshold(winChance, randomBitLength);
    setThreshold(newThreshold);
  }, [randomBitLength, winChance]);

  const handleWinChanceChange = (value: number) => {
    setWinChance(value);
    const newThreshold = winChanceToThreshold(value, randomBitLength);
    setThreshold(newThreshold);
  };

  const handleThresholdChange = (value: number) => {
    setThreshold(value);
    const newWinChance = thresholdToWinChance(value, randomBitLength);
    setWinChance(newWinChance);
  };

  const setQuickAmount = (percentage: number) => {
    const amount = totalBalance * percentage;
    const maxAllowed = Number(maxBetAmount) / 100;
    setBetAmount(Math.min(amount, maxAllowed));
  };

  const handlePlaceBet = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (betAmount <= 0) {
      toast.error('Bet amount must be positive');
      return;
    }

    const maxAllowed = Number(maxBetAmount) / 100;
    if (betAmount > maxAllowed) {
      toast.error(`Bet amount exceeds maximum of ${formatTokenAmount(Number(maxBetAmount))} ${selectedToken}`);
      return;
    }

    if (betAmount > totalBalance) {
      toast.error('Insufficient balance');
      return;
    }

    const contractId = getContractIdForToken(selectedToken);
    if (!contractId) {
      toast.error('Contract not found for token');
      return;
    }

    const tokenUid = contractState?.token_uid || '00';

    setIsPlacingBet(true);
    try {
      const result = await placeBet(betAmount, threshold, selectedToken, contractId, tokenUid);
      toast.success(`Bet placed successfully! TX: ${result.response.hash?.slice(0, 10)}...`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to place bet');
    } finally {
      setIsPlacingBet(false);
    }
  };

  const maxThreshold = Math.pow(2, randomBitLength) - 1;

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
            <label className="block text-sm text-slate-400 mb-2">
              Bet Amount (Max: {formatTokenAmount(Number(maxBetAmount))} {selectedToken})
            </label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                className="flex-1 bg-transparent text-white outline-none"
                min="0"
                max={Number(maxBetAmount) / 100}
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
              <label className="block text-sm text-slate-400 mb-2">Threshold (1-{maxThreshold.toLocaleString()})</label>
              <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2">
                <input
                  type="number"
                  value={threshold}
                  onChange={(e) => handleThresholdChange(parseInt(e.target.value) || 1)}
                  className="w-full bg-transparent text-white outline-none"
                  min="1"
                  max={maxThreshold}
                  step="1"
                />
              </div>
            </div>
          )}

          <div className="bg-slate-900 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400 flex items-center gap-1">
                📊 Threshold:
                <HelpIcon text="The lucky number must be less than or equal to this threshold for you to win. Higher threshold = higher win chance but lower multiplier." />
              </span>
              <span className="text-white font-medium">{threshold.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400 flex items-center gap-1">
                💰 Multiplier:
                <HelpIcon text="Your bet amount will be multiplied by this number if you win. Lower win chance = higher multiplier." />
              </span>
              <span className="text-white font-medium">{formatNumber(multiplier)}x</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">🎯 Potential Payout:</span>
              <span className="text-green-400 font-bold">{formatNumber(potentialPayout)} {selectedToken}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceBet}
            disabled={!isConnected || isPlacingBet}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isPlacingBet ? '⏳ Placing Bet...' : '🎲 Place Bet'}
          </button>
        </div>
      )}
    </div>
  );
}
