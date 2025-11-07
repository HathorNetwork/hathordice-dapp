'use client';

import { useState, useEffect } from 'react';
import { Bet } from '@/types';
import { formatNumber, formatAddress } from '@/lib/utils';
import { useHathor } from '@/contexts/HathorContext';

export default function RecentBetsTable() {
  const { fetchRecentBets } = useHathor();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadBets = async () => {
    setLoading(true);
    setError(null);
    try {
      const recentBets = await fetchRecentBets();
      setBets(recentBets);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Failed to load recent bets:', err);
      setError(err.message || 'Failed to load recent bets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBets();
    const interval = setInterval(loadBets, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const date = lastUpdated.toLocaleDateString();
    const time = lastUpdated.toLocaleTimeString();
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
          {lastUpdated && !error && (
            <p className="text-xs text-slate-400 mt-1">
              Last updated at {formatLastUpdated()}
            </p>
          )}
          {error && (
            <p className="text-xs text-red-400 mt-1">
              ⚠️ {error}
            </p>
          )}
        </div>
        <button
          onClick={loadBets}
          disabled={loading}
          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center gap-2"
        >
          <span className={loading ? 'animate-spin' : ''}>🔄</span>
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        {loading && bets.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
            <p className="text-slate-400">Loading recent bets...</p>
          </div>
        ) : error && bets.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={loadBets}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : bets.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400">No bets yet. Be the first to play!</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Player</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Bet</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Threshold</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Lucky Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Result</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Payout</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">TX ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {bets.map((bet) => (
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
                    {formatNumber(bet.amount)} {bet.token}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {bet.threshold.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {bet.luckyNumber !== undefined ? (
                      <span className="text-slate-300">{bet.luckyNumber.toLocaleString()}</span>
                    ) : (
                      <span className="text-slate-500 italic">Unknown</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {getResultDisplay(bet)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {getPayoutDisplay(bet)}
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
    </div>
  );
}
