'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useHathor } from '@/contexts/HathorContext';
import Header from '@/components/Header';
import BalanceCard from '@/components/BalanceCard';
import RecentBetsTable from '@/components/RecentBetsTable';
import RecentOperationsTable from '@/components/RecentOperationsTable';
import TokenSelector from '@/components/TokenSelector';
import PlaceBetCard from '@/components/PlaceBetCard';
import AddLiquidityCard from '@/components/AddLiquidityCard';
import RemoveLiquidityCard from '@/components/RemoveLiquidityCard';
import { ContractInfoCompact } from '@/components/ContractInfoCompact';
import { NetworkSelector } from '@/components/NetworkSelector';
import HelpIcon from '@/components/HelpIcon';
import { formatBalance } from '@/lib/utils';
import { toast } from '@/lib/toast';

export default function Home() {
  const { connected, balance, address, claimBalance, refreshBalance } = useWallet();
  const { network, getContractStateForToken, getContractIdForToken, switchNetwork, isConnected, coreAPI } = useHathor();
  const [selectedToken, setSelectedToken] = useState('HTR');
  const [expandedCard, setExpandedCard] = useState<string | null>('placeBet');
  const [claimableBalance, setClaimableBalance] = useState<bigint>(0n);
  const [isLoadingClaimable, setIsLoadingClaimable] = useState(false);
  const [claimableError, setClaimableError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isRefreshingWallet, setIsRefreshingWallet] = useState(false);
  const [isRefreshingContract, setIsRefreshingContract] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

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

  const handleWithdrawClick = () => {
    setShowWithdrawModal(true);
    setWithdrawAmount('');
  };

  const handleWithdrawSubmit = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const availableBalance = Number(claimableBalance) / 100;
    if (amount > availableBalance) {
      toast.error('Amount exceeds available balance');
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
      const result = await claimBalance(amount, selectedToken, contractId, tokenUid);
      toast.success(`Balance withdrawn successfully! TX: ${result.response.hash?.slice(0, 10)}...`);
      // Refresh claimable balance
      const claimable = await coreAPI.getClaimableBalance(contractId, address!);
      setClaimableBalance(claimable);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to withdraw balance');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleSetMaxWithdraw = () => {
    const maxAmount = Number(claimableBalance) / 100;
    setWithdrawAmount(maxAmount.toString());
  };

  const handleRefreshWalletBalance = async () => {
    setIsRefreshingWallet(true);
    try {
      await refreshBalance();
      toast.success('Wallet balance refreshed');
    } catch (error: any) {
      toast.error('Failed to refresh wallet balance');
    } finally {
      setIsRefreshingWallet(false);
    }
  };

  const handleRefreshContractBalance = async () => {
    if (!isConnected || !address) {
      return;
    }

    const contractId = getContractIdForToken(selectedToken);
    if (!contractId) {
      return;
    }

    setIsRefreshingContract(true);
    try {
      const claimable = await coreAPI.getClaimableBalance(contractId, address);
      setClaimableBalance(claimable);
      setClaimableError(null);
      toast.success('Contract balance refreshed');
    } catch (error: any) {
      console.error('Failed to fetch claimable balance:', error);
      setClaimableError('Load failed');
      toast.error('Failed to refresh contract balance');
    } finally {
      setIsRefreshingContract(false);
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
            <RecentOperationsTable selectedToken={selectedToken} />
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
                    <span className="text-slate-300 text-sm font-medium flex items-center gap-1">
                      Wallet Balance:
                      <HelpIcon text="Your wallet's token balance. This is stored in your personal wallet and can be used for betting or adding liquidity." />
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">
                        {balance > 0n ? (
                          `${formatBalance(balance)} ${selectedToken}`
                        ) : (
                          <span className="text-slate-400 text-xs">Authorize to view balance</span>
                        )}
                      </span>
                      <button
                        onClick={handleRefreshWalletBalance}
                        disabled={isRefreshingWallet}
                        className="px-2 py-1 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
                        title="Refresh wallet balance"
                      >
                        {isRefreshingWallet ? '⏳' : '🔄'}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-600 pt-3">
                    <span className="text-slate-300 text-sm font-medium flex items-center gap-1">
                      Contract Balance:
                      <HelpIcon text="Your claimable balance held in the contract from previous bet winnings. Can be used for betting, or withdrawn to your wallet." />
                    </span>
                    <div className="flex items-center gap-2">
                      {isLoadingClaimable || isRefreshingContract ? (
                        <span className="text-slate-400 text-xs">Loading...</span>
                      ) : claimableError ? (
                        <>
                          <span className="text-red-400 text-xs">❌ {claimableError}</span>
                          <button
                            onClick={handleRefreshContractBalance}
                            className="px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs font-medium rounded transition-colors"
                            title="Refresh contract balance"
                          >
                            🔄
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-green-400 font-bold">
                            {formatBalance(claimableBalance)} {selectedToken}
                          </span>
                          <button
                            onClick={handleRefreshContractBalance}
                            disabled={isRefreshingContract}
                            className="px-2 py-1 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
                            title="Refresh contract balance"
                          >
                            🔄
                          </button>
                          {claimableBalance > 0n && (
                            <button
                              onClick={handleWithdrawClick}
                              disabled={isClaiming}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
                            >
                              💸 Withdraw
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
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
              </div>
            </div>

            <footer className="text-center text-sm text-slate-400 py-4 border-t border-slate-700">
              Built on Hathor Network • Powered by Nano Contracts
            </footer>
          </div>
        </div>
      </main>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowWithdrawModal(false)}>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">💸 Withdraw Balance</h2>

            <div className="mb-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm font-medium">Available Balance:</span>
                <span className="text-green-400 font-bold">
                  {formatBalance(claimableBalance)} {selectedToken}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Amount to Withdraw</label>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="flex-1 bg-transparent text-white outline-none"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={isClaiming}
                />
                <span className="text-slate-400">{selectedToken}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSetMaxWithdraw}
                  disabled={isClaiming}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                disabled={isClaiming}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawSubmit}
                disabled={isClaiming || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isClaiming ? '⏳ Withdrawing...' : 'Confirm Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
