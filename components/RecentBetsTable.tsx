'use client';

import { Bet } from '@/types';
import { formatNumber, formatAddress } from '@/lib/utils';

interface RecentBetsTableProps {
  bets: Bet[];
}

export default function RecentBetsTable({ bets }: RecentBetsTableProps) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          📊 RECENT BETS
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Player</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Bet</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Threshold</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Result</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Payout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {bets.map((bet) => (
              <tr key={bet.id} className="hover:bg-slate-700/50 transition-colors">
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
                  {bet.result === 'win' ? (
                    <span className="text-green-400">✅ WIN</span>
                  ) : (
                    <span className="text-red-400">❌ LOSE</span>
                  )}
                </td>
                <td className={`px-4 py-3 text-sm font-medium ${bet.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                  {formatNumber(bet.payout)} {bet.token}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
