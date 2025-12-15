'use client';

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useHathor } from '@/contexts/HathorContext';
import { formatNumber } from '@/lib/utils';
import { toast } from '@/lib/toast';
import HelpIcon from '@/components/HelpIcon';

interface AddLiquidityCardProps {
  selectedToken: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function AddLiquidityCard({ selectedToken, isExpanded, onToggle }: AddLiquidityCardProps) {
  const { walletBalance, contractBalance, addLiquidity } = useWallet();
  const { isConnected, getContractStateForToken, getContractIdForToken } = useHathor();
  const contractBalanceInTokens = Number(contractBalance) / 100;
  const totalBalance = walletBalance + contractBalanceInTokens;
  const [amount, setAmount] = useState(500);
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);

  const contractState = getContractStateForToken(selectedToken);

  const setQuickAmount = (percentage: number) => {
    setAmount(totalBalance * percentage);
  };

  const handleAddLiquidity = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (amount <= 0) {
      toast.error('Amount must be positive');
      return;
    }

    if (amount > totalBalance) {
      toast.error('Insufficient balance');
      return;
    }

    const contractId = getContractIdForToken(selectedToken);
    if (!contractId) {
      toast.error('Contract not found for token');
      return;
    }

    const tokenUid = contractState?.token_uid || '00';

    setIsAddingLiquidity(true);
    try {
      const result = await addLiquidity(amount, selectedToken, contractId, tokenUid);
      toast.success(`Liquidity added successfully! TX: ${result.response.hash?.slice(0, 10)}...`);
      setAmount(0);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add liquidity');
    } finally {
      setIsAddingLiquidity(false);
    }
  };

  const houseEdgeBasisPoints = contractState?.house_edge_basis_points || 190;
  const houseEdgePercent = (houseEdgeBasisPoints / 100).toFixed(2);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
      >
        <span className="text-white font-medium flex items-center gap-2">
          ADD LIQUIDITY
          <HelpIcon text="Provide liquidity to the pool and earn a share of the house edge from all bets. Your liquidity helps pay out winners and you share in the profits when players lose." />
        </span>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>
      
      {isExpanded && (
        <div className="p-6 border-t border-slate-700 space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Amount</label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="flex-1 bg-transparent text-white outline-none"
                min="0"
                step="0.01"
              />
              <span className="text-slate-400">{selectedToken}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setQuickAmount(0.25)} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors">25%</button>
              <button onClick={() => setQuickAmount(0.5)} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors">50%</button>
              <button onClick={() => setQuickAmount(0.75)} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors">75%</button>
              <button onClick={() => setQuickAmount(1)} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors">MAX</button>
            </div>
          </div>

          <div className="text-sm text-slate-400">
            <span>Earn fees from house edge ({houseEdgePercent}%)</span>
          </div>

          <button
            onClick={handleAddLiquidity}
            disabled={!isConnected || isAddingLiquidity || amount <= 0}
            className="w-full py-3 disabled:bg-slate-600 disabled:cursor-not-allowed font-medium rounded-lg transition-colors hover:opacity-90"
            style={!isConnected || isAddingLiquidity || amount <= 0 ? { color: 'white' } : { background: 'linear-gradient(244deg, rgb(255, 166, 0) 0%, rgb(255, 115, 0) 100%)', color: '#1e293b' }}
          >
            {isAddingLiquidity ? 'Adding Liquidity...' : 'Add Liquidity'}
          </button>
        </div>
      )}
    </div>
  );
}
