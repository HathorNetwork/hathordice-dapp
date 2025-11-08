'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useHathor } from '@/contexts/HathorContext';
import { formatBalance } from '@/lib/utils';
import { toast } from '@/lib/toast';

interface WithdrawCardProps {
  selectedToken: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function WithdrawCard({ selectedToken, isExpanded, onToggle }: WithdrawCardProps) {
  const { address, claimBalance } = useWallet();
  const { isConnected, getContractStateForToken, getContractIdForToken, coreAPI } = useHathor();
  const [claimableBalance, setClaimableBalance] = useState<bigint>(0n);
  const [isLoadingClaimable, setIsLoadingClaimable] = useState(false);
  const [claimableError, setClaimableError] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const contractState = getContractStateForToken(selectedToken);

  // Fetch claimable balance when panel is opened
  useEffect(() => {
    const fetchClaimableBalance = async () => {
      if (!isExpanded || !isConnected || !address) {
        return;
      }

      const contractId = getContractIdForToken(selectedToken);
      if (!contractId) {
        return;
      }

      setIsLoadingClaimable(true);
      setClaimableError(null);
      try {
        const claimable = await coreAPI.getClaimableBalance(contractId, address);
        setClaimableBalance(claimable);
        setClaimableError(null);
      } catch (error: any) {
        console.error('Failed to fetch claimable balance:', error);
        setClaimableBalance(0n);
        setClaimableError('Load failed');
      } finally {
        setIsLoadingClaimable(false);
      }
    };

    fetchClaimableBalance();
  }, [isExpanded, isConnected, address, selectedToken, getContractIdForToken, coreAPI]);

  const handleWithdraw = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (claimableBalance === 0n) {
      toast.error('No balance available to withdraw');
      return;
    }

    const contractId = getContractIdForToken(selectedToken);
    if (!contractId) {
      toast.error('Contract not found for token');
      return;
    }

    const tokenUid = contractState?.token_uid || '00';
    const amountToWithdraw = Number(claimableBalance) / 100;

    setIsWithdrawing(true);
    try {
      const result = await claimBalance(amountToWithdraw, selectedToken, contractId, tokenUid);
      toast.success(`Balance withdrawn successfully! TX: ${result.response.hash?.slice(0, 10)}...`);
      // Refresh claimable balance
      const claimable = await coreAPI.getClaimableBalance(contractId, address!);
      setClaimableBalance(claimable);
    } catch (error: any) {
      toast.error(error.message || 'Failed to withdraw balance');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
      >
        <span className="text-white font-medium">🏦 WITHDRAW BALANCE</span>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>
      
      {isExpanded && (
        <div className="p-6 border-t border-slate-700 space-y-4">
          {isLoadingClaimable ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-slate-400">Loading available balance...</span>
            </div>
          ) : claimableError ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-red-400">❌ {claimableError}</span>
            </div>
          ) : (
            <>
              <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm font-medium">Available Balance:</span>
                  <span className="text-green-400 font-bold text-lg">
                    {formatBalance(claimableBalance)} {selectedToken}
                  </span>
                </div>
              </div>

              {claimableBalance === 0n && (
                <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-900/20 border border-amber-700 rounded-lg p-3">
                  <span>ℹ️</span>
                  <span>No balance available to withdraw</span>
                </div>
              )}

              {claimableBalance > 0n && (
                <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-700/30 border border-slate-600 rounded-lg p-3">
                  <span>ℹ️</span>
                  <span>This balance can be used for betting without deposits</span>
                </div>
              )}

              <button
                onClick={handleWithdraw}
                disabled={!isConnected || isWithdrawing || claimableBalance === 0n}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isWithdrawing ? '⏳ Withdrawing...' : '💸 Withdraw to Wallet'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
