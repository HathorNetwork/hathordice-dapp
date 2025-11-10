'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const { getContractIdForToken, coreAPI } = useHathor();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchOperations = useCallback(async () => {
    const contractId = getContractIdForToken(selectedToken);
    if (!contractId) {
      return;
    }

    setIsLoading(true);
    try {
      const history = await coreAPI.getContractHistory(contractId, 50);
      // Filter for claim_balance, remove_liquidity, and add_liquidity operations
      const relevantOps = history.transactions.filter(
        (tx: any) =>
          tx.nc_method === 'claim_balance' ||
          tx.nc_method === 'remove_liquidity' ||
          tx.nc_method === 'add_liquidity'
      );
      setOperations(relevantOps);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch operations:', error);
      setOperations([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedToken, getContractIdForToken, coreAPI]);

  useEffect(() => {
    fetchOperations();
    // Refresh every 10 seconds
    const interval = setInterval(fetchOperations, 10000);
    return () => clearInterval(interval);
  }, [fetchOperations]);

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
    if (!lastUpdated) return '';
    const date = lastUpdated.toLocaleDateString();
    const time = lastUpdated.toLocaleTimeString();
    return `${date} ${time}`;
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white">Recent Operations</h2>
          {lastUpdated && (
            <p className="text-xs text-slate-400 mt-1">
              Last updated at {formatLastUpdated()}
            </p>
          )}
        </div>
        <button
          onClick={fetchOperations}
          disabled={isLoading}
          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center gap-2"
        >
          <span className={isLoading ? 'animate-spin' : ''}>🔄</span>
          Refresh
        </button>
      </div>

      {operations.length === 0 ? (
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
                    <td className="py-3 text-slate-300 text-sm font-mono">
                      {formatAddress(op.nc_caller)}
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
