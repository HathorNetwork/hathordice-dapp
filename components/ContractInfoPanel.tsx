'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContractState } from '@/types/hathor';
import { formatTokenAmount, formatNumber } from '@/lib/utils';

interface ContractInfoPanelProps {
  contractState: ContractState | null;
  loading?: boolean;
}

export function ContractInfoPanel({ contractState, loading }: ContractInfoPanelProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">ℹ️</span>
            Contract Information
          </CardTitle>
          <CardDescription>Loading contract state...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!contractState) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">ℹ️</span>
            Contract Information
          </CardTitle>
          <CardDescription>No contract data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const houseEdgePercent = contractState.house_edge_basis_points / 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">ℹ️</span>
          Contract Information
        </CardTitle>
        <CardDescription>Current state of the HathorDice contract</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-400">House Edge</p>
            <p className="text-lg font-semibold">{formatNumber(houseEdgePercent, 2)}%</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Max Bet</p>
            <p className="text-lg font-semibold">{formatTokenAmount(contractState.max_bet_amount)} HTR</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Available Liquidity</p>
            <p className="text-lg font-semibold">{formatTokenAmount(contractState.available_tokens)} HTR</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Liquidity</p>
            <p className="text-lg font-semibold">{formatTokenAmount(contractState.total_liquidity_provided)} HTR</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Random Bits</p>
            <p className="text-lg font-semibold">{contractState.random_bit_length}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Token UID</p>
            <p className="text-sm font-mono truncate">{contractState.token_uid}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
