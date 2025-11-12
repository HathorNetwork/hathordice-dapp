'use client';

import { useState, useEffect, useRef } from 'react';
import { Bet } from '@/types';
import { formatNumber, formatAddress } from '@/lib/utils';
import { useHathor } from '@/contexts/HathorContext';
import HelpIcon from '@/components/HelpIcon';
import BetResultNotification from '@/components/BetResultNotification';

export default function RecentBetsTable() {
  const { allBets, isLoadingHistory, lastHistoryUpdate, refreshHistory } = useHathor();
  const [notificationBet, setNotificationBet] = useState<Bet | null>(null);
  const previousBetsRef = useRef<Map<string, Bet>>(new Map());

  // Check for automatic transitions when allBets changes
  useEffect(() => {
    allBets.forEach((bet) => {
      if (bet.isYourBet) {
        const previousBet = previousBetsRef.current.get(bet.id);

        // Detect transition from pending to win/lose
        if (previousBet && previousBet.result === 'pending' &&
            (bet.result === 'win' || bet.result === 'lose')) {
          // Show notification for this bet
          setNotificationBet(bet);
        }

        // Update the reference
        previousBetsRef.current.set(bet.id, bet);
      }
    });
  }, [allBets]);

  const handleResultClick = (bet: Bet) => {
    // Only show animation for win/lose results
    if (bet.result === 'win' || bet.result === 'lose') {
      setNotificationBet(bet);
    }
  };

  const formatLastUpdated = () => {
    if (!lastHistoryUpdate) return '';
    const date = lastHistoryUpdate.toLocaleDateString();
    const time = lastHistoryUpdate.toLocaleTimeString();
    return `${date} ${time}`;
  };

  const getResultDisplay = (bet: Bet) => {
    switch (bet.result) {
      case 'pending':
        return (
          <span className="text-yellow-400 flex items-center gap-1">
            <span className="animate-pulse">⏳</span> Waiting for confirmation
          </span>
        );
      case 'failed':
        return <span className="text-orange-400">⚠️ Failed</span>;
      case 'win':
        return <span className="text-green-400">✅ WIN</span>;
      case 'lose':
        return <span className="text-red-400">❌ LOSE</span>;
    }
  };

  const getPayoutDisplay = (bet: Bet) => {
    if (bet.result === 'pending' && bet.potentialPayout) {
      return (
        <span className="text-yellow-400">
          ~{formatNumber(bet.potentialPayout)} {bet.token}
        </span>
      );
    }
    if (bet.result === 'failed') {
      return <span className="text-slate-500">-</span>;
    }
    return (
      <span className={bet.result === 'win' ? 'text-green-400' : 'text-red-400'}>
        {formatNumber(bet.payout)} {bet.token}
      </span>
    );
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            📊 RECENT BETS
          </h2>
          {lastHistoryUpdate && (
            <p className="text-xs text-slate-400 mt-1">
              Last updated at {formatLastUpdated()}
            </p>
          )}
        </div>
        <button
          onClick={refreshHistory}
          disabled={isLoadingHistory}
          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center gap-2"
        >
          <span className={isLoadingHistory ? 'animate-spin' : ''}>🔄</span>
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        {isLoadingHistory && allBets.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
            <p className="text-slate-400">Loading recent bets...</p>
          </div>
        ) : allBets.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">🎲</div>
            <p className="text-slate-400">No bets yet. Place a bet to get started!</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Player</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Bet</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Threshold</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  <span className="flex items-center gap-1">
                    Lucky Number
                    <HelpIcon text="A random number generated for each bet. You win if this number is less than or equal to your threshold. The generation is provably fair and verifiable on-chain." />
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Result</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Payout</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">TX ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {allBets.map((bet) => (
                <tr
                  key={bet.id}
                  className={`hover:bg-slate-700/50 transition-colors ${
                    bet.result === 'pending' ? 'bg-yellow-500/5' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-sm">
                    {bet.isYourBet ? (
                      <span className="text-blue-400 font-medium flex items-center gap-2">
                        YOU
                        {bet.timestamp > Date.now() - 60000 && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">NEW</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-400">{formatAddress(bet.player)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {bet.error ? (
                      <span className="text-red-400 italic">{bet.error}</span>
                    ) : bet.result === 'pending' ? (
                      <span className="text-slate-600">-</span>
                    ) : (
                      `${formatNumber(bet.amount)} ${bet.token}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {bet.error ? (
                      <span className="text-red-400 italic">{bet.error}</span>
                    ) : bet.result === 'pending' ? (
                      <span className="text-slate-600">-</span>
                    ) : (
                      bet.threshold.toLocaleString()
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {bet.error ? (
                      <span className="text-red-400 italic">{bet.error}</span>
                    ) : bet.result === 'pending' ? (
                      <span className="text-slate-600">-</span>
                    ) : bet.luckyNumber !== undefined ? (
                      <span className="text-slate-300">{bet.luckyNumber.toLocaleString()}</span>
                    ) : (
                      <span className="text-slate-500 italic">Unknown</span>
                    )}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm ${
                      (bet.result === 'win' || bet.result === 'lose') && !bet.error
                        ? 'cursor-pointer hover:bg-slate-600/50 transition-colors'
                        : ''
                    }`}
                    onClick={() => !bet.error && handleResultClick(bet)}
                  >
                    {bet.error ? (
                      <span className="text-red-400 italic">{bet.error}</span>
                    ) : (
                      getResultDisplay(bet)
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {bet.error ? (
                      <span className="text-red-400 italic">{bet.error}</span>
                    ) : bet.result === 'pending' ? (
                      <span className="text-slate-600">-</span>
                    ) : (
                      getPayoutDisplay(bet)
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-400 font-mono">
                    <a
                      href={`https://explorer.testnet.hathor.network/transaction/${bet.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {formatAddress(bet.id)}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Notification for bet result changes */}
      {notificationBet && (
        <BetResultNotification
          bet={notificationBet}
          onComplete={() => setNotificationBet(null)}
        />
      )}
    </div>
  );
}
