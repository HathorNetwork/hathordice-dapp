'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useHathor } from '@/contexts/HathorContext';
import { formatTokenAmount } from '@/lib/utils';
import { toast } from '@/lib/toast';

interface RemoveLiquidityCardProps {
  selectedToken: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function RemoveLiquidityCard({ selectedToken, isExpanded, onToggle }: RemoveLiquidityCardProps) {
  const { address, removeLiquidity } = useWallet();
  const { isConnected, getContractStateForToken, getContractIdForToken, coreAPI } = useHathor();
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
      const result = await removeLiquidity(amount, selectedToken, contractId, tokenUid);
      toast.success(`Liquidity removed successfully! TX: ${result.response.hash?.slice(0, 10)}...`);
      setAmount(0);
      // Refresh max liquidity after successful removal
      const max = await coreAPI.getMaximumLiquidityRemoval(contractId, address!);
      setMaxLiquidity(max);
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
        <span className="text-white font-medium">💸 REMOVE LIQUIDITY</span>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>
      
      {isExpanded && (
        <div className="p-6 border-t border-slate-700 space-y-4">
          {isLoadingMax ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-slate-400">Loading maximum liquidity...</span>
            </div>
          ) : (
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
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={setMaxAmount}
                    disabled={!isConnected || availableLiquidity === 0}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
                  >
                    MAX
                  </button>
                </div>
                <div className="text-sm text-slate-400 mt-2">
                  Available: {formatTokenAmount(Number(maxLiquidity))} {selectedToken}
                </div>
              </div>

              {availableLiquidity === 0 && isConnected && (
                <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-900/20 border border-amber-700 rounded-lg p-3">
                  <span>ℹ️</span>
                  <span>No liquidity available to remove</span>
                </div>
              )}

              <button
                onClick={handleRemoveLiquidity}
                disabled={!isConnected || isRemovingLiquidity || amount <= 0 || availableLiquidity === 0}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isRemovingLiquidity ? '⏳ Removing Liquidity...' : '💸 Remove Liquidity'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
