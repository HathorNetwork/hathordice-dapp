'use client';

import { useState, useEffect, useRef } from 'react';
import { Bet } from '@/types';
import { formatBalanceWithCommas, formatAddress } from '@/lib/utils';
import { useHathor } from '@/contexts/HathorContext';
import HelpIcon from '@/components/HelpIcon';
import BetResultNotification from '@/components/BetResultNotification';

interface RecentBetsTableProps {
  selectedToken: string;
}

export default function RecentBetsTable({ selectedToken }: RecentBetsTableProps) {
  const { allBets, isLoadingHistory, lastHistoryUpdate, refreshHistory } = useHathor();

  // Filter bets by selected token
  const filteredBets = allBets.filter(bet => bet.token === selectedToken);
  const [notificationBet, setNotificationBet] = useState<Bet | null>(null);
  const previousBetsRef = useRef<Map<string, Bet>>(new Map());

  // Check for automatic transitions when filteredBets changes
  useEffect(() => {
    filteredBets.forEach((bet) => {
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
  }, [filteredBets]);

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
          <span className="text-yellow-400">
            Waiting for confirmation
          </span>
        );
      case 'failed':
        return <span className="text-orange-400">Failed</span>;
      case 'win':
        return <span className="text-green-400">WIN</span>;
      case 'lose':
        return <span className="text-red-400">LOSE</span>;
    }
  };

  const getPayoutDisplay = (bet: Bet) => {
    if (bet.result === 'pending' && bet.potentialPayout) {
      return (
        <span className="text-yellow-400">
          ~{formatBalanceWithCommas(bet.potentialPayout)} {bet.token}
        </span>
      );
    }
    if (bet.result === 'failed') {
      return <span className="text-slate-500">-</span>;
    }
    return (
      <span className={bet.result === 'win' ? 'text-green-400' : 'text-red-400'}>
        {formatBalanceWithCommas(bet.payout)} {bet.token}
      </span>
    );
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">
          RECENT BETS
        </h2>
        {lastHistoryUpdate && (
          <p className="text-xs text-slate-400 mt-1">
            Last updated at {formatLastUpdated()}
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        {filteredBets.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400">No bets yet. Place a bet to get started!</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-4 text-left text-sm font-medium text-slate-400 pb-3">Player</th>
                <th className="px-4 text-left text-sm font-medium text-slate-400 pb-3">Bet</th>
                <th className="px-4 text-left text-sm font-medium text-slate-400 pb-3">Threshold</th>
                <th className="px-4 text-left text-sm font-medium text-slate-400 pb-3">Lucky Number</th>
                <th className="px-4 text-left text-sm font-medium text-slate-400 pb-3">Result</th>
                <th className="px-4 text-left text-sm font-medium text-slate-400 pb-3">Payout</th>
                <th className="px-4 text-left text-sm font-medium text-slate-400 pb-3">TX ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredBets.slice(0, 20).map((bet) => (
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
                      `${formatBalanceWithCommas(bet.amount)} ${bet.token}`
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
