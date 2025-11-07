'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useHathor } from '@/contexts/HathorContext';
import Header from '@/components/Header';
import BalanceCard from '@/components/BalanceCard';
import RecentBetsTable from '@/components/RecentBetsTable';
import TokenSelector from '@/components/TokenSelector';
import PlaceBetCard from '@/components/PlaceBetCard';
import AddLiquidityCard from '@/components/AddLiquidityCard';
import RemoveLiquidityCard from '@/components/RemoveLiquidityCard';
import WithdrawCard from '@/components/WithdrawCard';
import { ContractInfoCompact } from '@/components/ContractInfoCompact';
import { NetworkSelector } from '@/components/NetworkSelector';
import { formatBalance } from '@/lib/utils';
import { toast } from '@/lib/toast';

export default function Home() {
  const { connected, balance, address, claimBalance } = useWallet();
  const { network, getContractStateForToken, getContractIdForToken, switchNetwork, isConnected, coreAPI } = useHathor();
  const [selectedToken, setSelectedToken] = useState('HTR');
  const [expandedCard, setExpandedCard] = useState<string | null>('placeBet');
  const [claimableBalance, setClaimableBalance] = useState<bigint>(0n);
  const [isLoadingClaimable, setIsLoadingClaimable] = useState(false);
  const [claimableError, setClaimableError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const handleCardToggle = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  // Fetch claimable balance when connected or token changes
  useEffect(() => {
    const fetchClaimableBalance = async () => {
      if (!isConnected || !address) {
        setClaimableBalance(0n);
        setClaimableError(null);
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
  }, [isConnected, address, selectedToken, getContractIdForToken, coreAPI]);

  const handleClaimBalance = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    const contractId = getContractIdForToken(selectedToken);
    if (!contractId) {
      toast.error('Contract not found for token');
      return;
    }

    const contractState = getContractStateForToken(selectedToken);
    const tokenUid = contractState?.token_uid || '00';

    setIsClaiming(true);
    try {
      const result = await claimBalance(selectedToken, contractId, tokenUid);
      toast.success(`Balance claimed successfully! TX: ${result.response.hash?.slice(0, 10)}...`);
      // Refresh claimable balance
      const claimable = await coreAPI.getClaimableBalance(contractId, address!);
      setClaimableBalance(claimable);
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim balance');
    } finally {
      setIsClaiming(false);
    }
  };

  const contractState = getContractStateForToken(selectedToken);

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">HathorDice DApp</h1>
          <NetworkSelector value={network} onChange={switchNetwork} disabled={isConnected} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {connected && <BalanceCard selectedToken={selectedToken} />}
            <RecentBetsTable />
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">🎮 GAME ACTIONS</h2>
                <TokenSelector selectedToken={selectedToken} onTokenChange={setSelectedToken} />
              </div>

              <ContractInfoCompact contractState={contractState} token={selectedToken} />

              {isConnected && (
                <div className="mb-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm font-medium">Wallet Balance:</span>
                    <span className="text-white font-bold">
                      {balance > 0n ? (
                        `${formatBalance(balance)} ${selectedToken}`
                      ) : (
                        <span className="text-slate-400 text-xs">Authorize to view balance</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-600 pt-3">
                    <span className="text-slate-300 text-sm font-medium">Contract Balance:</span>
                    <div className="flex items-center gap-2">
                      {isLoadingClaimable ? (
                        <span className="text-slate-400 text-xs">Loading...</span>
                      ) : claimableError ? (
                        <span className="text-red-400 text-xs">❌ {claimableError}</span>
                      ) : (
                        <>
                          <span className="text-green-400 font-bold">
                            {formatBalance(claimableBalance)} {selectedToken}
                          </span>
                          {claimableBalance > 0n && (
                            <button
                              onClick={handleClaimBalance}
                              disabled={isClaiming}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
                            >
                              {isClaiming ? '⏳' : '💸 Withdraw'}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {claimableBalance > 0n && !isLoadingClaimable && !claimableError && (
                    <div className="text-xs text-slate-400 italic">
                      * Can be used for betting without deposits
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <PlaceBetCard
                  selectedToken={selectedToken}
                  isExpanded={expandedCard === 'placeBet'}
                  onToggle={() => handleCardToggle('placeBet')}
                />
                <AddLiquidityCard
                  selectedToken={selectedToken}
                  isExpanded={expandedCard === 'addLiquidity'}
                  onToggle={() => handleCardToggle('addLiquidity')}
                />
                <RemoveLiquidityCard
                  selectedToken={selectedToken}
                  isExpanded={expandedCard === 'removeLiquidity'}
                  onToggle={() => handleCardToggle('removeLiquidity')}
                />
                <WithdrawCard
                  selectedToken={selectedToken}
                  isExpanded={expandedCard === 'withdraw'}
                  onToggle={() => handleCardToggle('withdraw')}
                />
              </div>
            </div>

            <footer className="text-center text-sm text-slate-400 py-4 border-t border-slate-700">
              Built on Hathor Network • Powered by Nano Contracts
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}