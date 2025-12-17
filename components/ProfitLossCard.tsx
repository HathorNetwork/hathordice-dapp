'use client';

import { useMemo, useState } from 'react';
import { useHathor } from '@/contexts/HathorContext';
import { formatBalanceWithCommas } from '@/lib/utils';

interface ProfitLossCardProps {
  selectedToken?: string;
}

export default function ProfitLossCard({ selectedToken = 'HTR' }: ProfitLossCardProps) {
  const { allBets, address, isLoadingHistory } = useHathor();
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate stats from centralized data
  const stats = useMemo(() => {
    if (!address) {
      return {
        totalBets: 0,
        totalWagered: 0,
        totalPayout: 0,
        profitLoss: 0,
        winCount: 0,
        loseCount: 0,
      };
    }

    // Filter for user's completed bets only for selected token
    const userBets = allBets.filter(
      bet => bet.isYourBet && bet.result !== 'pending' && bet.result !== 'failed' && bet.token === selectedToken
    );

    const wagered = userBets.reduce((sum, bet) => sum + bet.amount, 0);
    const payout = userBets.reduce((sum, bet) => sum + bet.payout, 0);
    const wins = userBets.filter(bet => bet.result === 'win').length;
    const losses = userBets.filter(bet => bet.result === 'lose').length;

    return {
      totalBets: userBets.length,
      totalWagered: wagered,
      totalPayout: payout,
      profitLoss: payout - wagered,
      winCount: wins,
      loseCount: losses,
    };
  }, [allBets, address, selectedToken]);

  const { totalBets, totalWagered, totalPayout, profitLoss, winCount, loseCount } = stats;

  const winRate = totalBets > 0 ? (winCount / totalBets) * 100 : 0;
  const isProfit = profitLoss >= 0;

  // Creative title based on state
  const getTitle = () => {
    if (!address) return "Connect to Track Stats";
    if (totalBets === 0) return "You gotta play to profit!";
    if (totalBets === 1) return `Your First Bet Result`;
    return `Profit/Loss after ${totalBets} bets`;
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <h2 className="text-lg font-bold text-white mb-4">{getTitle()}</h2>

      {!address ? (
        <div className="text-center py-8">
          <p className="text-slate-400">Connect your wallet to view your stats</p>
        </div>
      ) : totalBets === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400 mb-2">No bets yet!</p>
          <p className="text-slate-500 text-sm">Place your first bet to start tracking your profit!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Profit/Loss - Collapsible */}
          <div
            className={`rounded-lg p-3 cursor-pointer transition-all ${
              isProfit ? 'bg-green-500/20 border border-green-500/50 hover:bg-green-500/30' : 'bg-red-500/20 border border-red-500/50 hover:bg-red-500/30'
            }`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className={`text-2xl font-bold ${
                  isProfit ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isProfit ? '+' : ''}{formatBalanceWithCommas(profitLoss)} {selectedToken}
                </div>
                <div className="text-slate-400 text-xs mt-1">
                  {winCount}W / {loseCount}L • {winRate.toFixed(0)}% win rate
                </div>
              </div>
              <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                <span className="text-slate-400">▼</span>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="space-y-2 animate-fadeIn">
              {/* Compact Grid Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <div className="text-slate-400 text-xs mb-1">Total Bets</div>
                  <div className="text-white text-lg font-bold">{totalBets}</div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-2">
                  <div className="text-slate-400 text-xs mb-1">Wins</div>
                  <div className="text-green-400 text-lg font-bold">{winCount}</div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-2">
                  <div className="text-slate-400 text-xs mb-1">Losses</div>
                  <div className="text-red-400 text-lg font-bold">{loseCount}</div>
                </div>
              </div>

              {/* Wagered and Payout */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <div className="text-slate-400 text-xs mb-1">Total Wagered</div>
                  <div className="text-white text-sm font-bold">{formatBalanceWithCommas(totalWagered)} {selectedToken}</div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-2">
                  <div className="text-slate-400 text-xs mb-1">Total Payout</div>
                  <div className="text-white text-sm font-bold">{formatBalanceWithCommas(totalPayout)} {selectedToken}</div>
                </div>
              </div>

              {/* Fun fact */}
              <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                <p className="text-slate-400 text-xs">
                  {isProfit
                    ? `You're up ${formatBalanceWithCommas(profitLoss)} ${selectedToken}! Keep it going!`
                    : `Down ${formatBalanceWithCommas(Math.abs(profitLoss))} ${selectedToken} - time to turn it around!`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
