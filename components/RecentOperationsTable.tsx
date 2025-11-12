'use client';

import { useHathor } from '@/contexts/HathorContext';
import { formatAddress } from '@/lib/utils';

interface Operation {
  tx_id: string;
  timestamp: number;
  nc_method: string;
  nc_caller: string;
  first_block: string | null;
  is_voided: boolean;
}

interface RecentOperationsTableProps {
  selectedToken: string;
}

export default function RecentOperationsTable({ selectedToken }: RecentOperationsTableProps) {
  const { allTransactions, address, isLoadingHistory, lastHistoryUpdate, refreshHistory, getContractIdForToken } = useHathor();

  const contractId = getContractIdForToken(selectedToken);

  // Filter operations from centralized data
  const operations = allTransactions.filter(
    (tx) =>
      tx.contractId === contractId &&
      (tx.nc_method === 'claim_balance' ||
       tx.nc_method === 'remove_liquidity' ||
       tx.nc_method === 'add_liquidity')
  );

  const getOperationStatus = (op: Operation) => {
    if (op.is_voided) {
      return { text: 'Failed', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-700' };
    }
    if (!op.first_block) {
      return { text: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-700' };
    }
    return { text: 'Executed', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-700' };
  };

  const getOperationLabel = (method: string) => {
    if (method === 'claim_balance') return '💸 Withdraw';
    if (method === 'remove_liquidity') return '💸 Remove Liquidity';
    if (method === 'add_liquidity') return '💰 Add Liquidity';
    return method;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const formatLastUpdated = () => {
    if (!lastHistoryUpdate) return '';
    const date = lastHistoryUpdate.toLocaleDateString();
    const time = lastHistoryUpdate.toLocaleTimeString();
    return `${date} ${time}`;
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white">Recent Operations</h2>
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

      {isLoadingHistory && operations.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p className="text-slate-400">Loading operations...</p>
        </div>
      ) : operations.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          No recent operations found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-sm font-medium text-slate-400 pb-3">Operation</th>
                <th className="text-left text-sm font-medium text-slate-400 pb-3">Status</th>
                <th className="text-left text-sm font-medium text-slate-400 pb-3">Time</th>
                <th className="text-left text-sm font-medium text-slate-400 pb-3">Address</th>
                <th className="text-left text-sm font-medium text-slate-400 pb-3">TX ID</th>
              </tr>
            </thead>
            <tbody>
              {operations.map((op) => {
                const status = getOperationStatus(op);
                return (
                  <tr key={op.tx_id} className="border-b border-slate-700/50">
                    <td className="py-3 text-white text-sm">
                      {getOperationLabel(op.nc_method)}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${status.color} ${status.bg} border ${status.border}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300 text-sm">
                      {formatTimestamp(op.timestamp)}
                    </td>
                    <td className="py-3 text-sm">
                      {address && op.nc_caller.toLowerCase() === address.toLowerCase() ? (
                        <span className="text-blue-400 font-medium">YOU</span>
                      ) : (
                        <span className="text-slate-300 font-mono">{formatAddress(op.nc_caller)}</span>
                      )}
                    </td>
                    <td className="py-3 text-blue-400 text-sm font-mono">
                      <a
                        href={`https://explorer.testnet.hathor.network/transaction/${op.tx_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {formatAddress(op.tx_id)}
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
