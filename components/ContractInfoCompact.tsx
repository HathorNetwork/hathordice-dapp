'use client';

import { ContractState } from '@/types/hathor';
import { formatTokenAmount, formatNumber } from '@/lib/utils';

interface ContractInfoCompactProps {
  contractState: ContractState | null;
  token: string;
}

export function ContractInfoCompact({ contractState, token }: ContractInfoCompactProps) {
  if (!contractState) {
    return (
      <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">ℹ️</span>
          <h3 className="text-sm font-semibold text-white">Contract Information</h3>
        </div>
        <p className="text-xs text-slate-400">No contract data available for {token}</p>
      </div>
    );
  }

  const houseEdgePercent = contractState.house_edge_basis_points / 100;

  return (
    <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">ℹ️</span>
        <h3 className="text-sm font-semibold text-white">Contract Information ({token})</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-slate-400">House Edge</p>
          <p className="font-semibold text-white">{formatNumber(houseEdgePercent, 2)}%</p>
        </div>
        <div>
          <p className="text-slate-400">Max Bet</p>
          <p className="font-semibold text-white">{formatTokenAmount(contractState.max_bet_amount)} {token}</p>
        </div>
        <div>
          <p className="text-slate-400">Liquidity</p>
          <p className="font-semibold text-white">{formatTokenAmount(contractState.available_tokens)} {token}</p>
        </div>
        <div>
          <p className="text-slate-400">Random Bits</p>
          <p className="font-semibold text-white">{contractState.random_bit_length}</p>
        </div>
      </div>
    </div>
  );
}
