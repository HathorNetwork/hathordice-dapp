'use client';

import { ContractState } from '@/types/hathor';
import { formatTokenAmount, formatNumber } from '@/lib/utils';
import HelpIcon from '@/components/HelpIcon';

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
          <p className="text-slate-400 flex items-center gap-1">
            House Edge
            <HelpIcon text="The percentage advantage the house has on each bet. Liquidity providers earn this edge over time. A 2% house edge means on average, players lose 2% of their bet." />
          </p>
          <p className="font-semibold text-white">{formatNumber(houseEdgePercent, 2)}%</p>
        </div>
        <div>
          <p className="text-slate-400 flex items-center gap-1">
            Max Bet
            <HelpIcon text="The maximum amount you can bet in a single transaction. This is set to ensure the pool has enough liquidity to pay out potential winnings." />
          </p>
          <p className="font-semibold text-white">{formatTokenAmount(contractState.max_bet_amount)} {token}</p>
        </div>
        <div>
          <p className="text-slate-400">Liquidity</p>
          <p className="font-semibold text-white">{formatTokenAmount(contractState.available_tokens)} {token}</p>
        </div>
        <div>
          <p className="text-slate-400 flex items-center gap-1">
            Random Bits
            <HelpIcon text="The number of random bits used to generate the lucky number. 16 bits means numbers from 0 to 65,535. More bits = wider range of possible outcomes." />
          </p>
          <p className="font-semibold text-white">{contractState.random_bit_length}</p>
        </div>
      </div>
    </div>
  );
}
