'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useHathor } from '@/contexts/HathorContext';
import { formatTokenAmount } from '@/lib/utils';
import { toast } from '@/lib/toast';
import HelpIcon from '@/components/HelpIcon';

interface RemoveLiquidityCardProps {
  selectedToken: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function RemoveLiquidityCard({ selectedToken, isExpanded, onToggle }: RemoveLiquidityCardProps) {
  const { address, removeLiquidity, balance, setBalance } = useWallet();
  const { isConnected, getContractStateForToken, getContractIdForToken, coreAPI, network } = useHathor();
  const [amount, setAmount] = useState(0);
  const [maxLiquidity, setMaxLiquidity] = useState<bigint>(0n);
  const [isLoadingMax, setIsLoadingMax] = useState(false);
  const [isRemovingLiquidity, setIsRemovingLiquidity] = useState(false);

  const contractState = getContractStateForToken(selectedToken);

  // Fetch maximum liquidity when panel is opened
  useEffect(() => {
    const fetchMaxLiquidity = async () => {
      if (!isExpanded || !isConnected || !address) {
        return;
      }

      const contractId = getContractIdForToken(selectedToken);
      if (!contractId) {
        return;
      }

      setIsLoadingMax(true);
      try {
        const max = await coreAPI.getMaximumLiquidityRemoval(contractId, address);
        setMaxLiquidity(max);
      } catch (error) {
        console.error('Failed to fetch maximum liquidity:', error);
        toast.error('Failed to fetch maximum removable liquidity');
        setMaxLiquidity(0n);
      } finally {
        setIsLoadingMax(false);
      }
    };

    fetchMaxLiquidity();
  }, [isExpanded, isConnected, address, selectedToken, getContractIdForToken, coreAPI]);

  const availableLiquidity = Number(maxLiquidity) / 100;

  const setMaxAmount = () => {
    setAmount(availableLiquidity);
  };

  const handleRemoveLiquidity = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (amount <= 0) {
      toast.error('Amount must be positive');
      return;
    }

    if (amount > availableLiquidity) {
      toast.error('Amount exceeds available liquidity');
      return;
    }

    const contractId = getContractIdForToken(selectedToken);
    if (!contractId) {
      toast.error('Contract not found for token');
      return;
    }

    const tokenUid = contractState?.token_uid || '00';

    setIsRemovingLiquidity(true);
    try {
      const result = await removeLiquidity(amount, selectedToken, contractId, tokenUid, network);
      toast.success(`Liquidity removed successfully! TX: ${result.response.hash?.slice(0, 10)}...`);

      // Update balances locally after successful remove liquidity
      const amountCents = Math.round(amount * 100);
      // Increase wallet balance
      setBalance(balance + BigInt(amountCents));
      // Decrease max liquidity locally
      setMaxLiquidity(maxLiquidity - BigInt(amountCents));

      setAmount(0);
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove liquidity');
    } finally {
      setIsRemovingLiquidity(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
      >
        <span className="text-white font-medium flex items-center gap-2">
          REMOVE LIQUIDITY
          <HelpIcon text="Withdraw your liquidity from the pool. The maximum removable amount is calculated to ensure the pool can pay out active bets. You cannot remove more than this amount." />
        </span>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>
      
      {isExpanded && (
        <div className="p-6 border-t border-slate-700 space-y-4">
          <>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Amount</label>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="flex-1 bg-transparent text-white outline-none"
                    min="0"
                    max={availableLiquidity}
                    step="0.01"
                    disabled={!isConnected || availableLiquidity === 0}
                  />
                  <span className="text-slate-400">{selectedToken}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <button
                    onClick={setMaxAmount}
                    disabled={!isConnected || availableLiquidity === 0}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
                  >
                    MAX
                  </button>
                  <div className="text-sm text-slate-400">
                    Available: {formatTokenAmount(Number(maxLiquidity))} {selectedToken}
                  </div>
                </div>
              </div>

              {availableLiquidity === 0 && isConnected && (
                <div className="text-sm text-amber-400 bg-amber-900/20 border border-amber-700 rounded-lg p-3">
                  No liquidity available to remove
                </div>
              )}

              <button
                onClick={handleRemoveLiquidity}
                disabled={!isConnected || isRemovingLiquidity || amount <= 0 || availableLiquidity === 0}
                className="w-full py-3 disabled:bg-slate-600 disabled:cursor-not-allowed font-medium rounded-lg transition-colors hover:opacity-90"
                style={!isConnected || isRemovingLiquidity || amount <= 0 || availableLiquidity === 0 ? { color: 'white' } : { background: 'linear-gradient(244deg, rgb(255, 166, 0) 0%, rgb(255, 115, 0) 100%)', color: '#1e293b' }}
              >
                {isRemovingLiquidity ? 'Removing Liquidity...' : 'Remove Liquidity'}
              </button>
            </>
        </div>
      )}
    </div>
  );
}
