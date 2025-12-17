'use client';

import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useHathor } from '@/contexts/HathorContext';
import { useUnifiedWallet } from '@/contexts/UnifiedWalletContext';
import Header from '@/components/Header';
import BalanceCard from '@/components/BalanceCard';
import RecentBetsTable from '@/components/RecentBetsTable';
import RecentOperationsTable from '@/components/RecentOperationsTable';
import ProfitLossCard from '@/components/ProfitLossCard';
import TokenSelector from '@/components/TokenSelector';
import PlaceBetCard from '@/components/PlaceBetCard';
import FortuneTigerBetCard from '@/components/FortuneTigerBetCard';
import AddLiquidityCard from '@/components/AddLiquidityCard';
import RemoveLiquidityCard from '@/components/RemoveLiquidityCard';
import { ContractInfoCompact } from '@/components/ContractInfoCompact';
import { NetworkSelector } from '@/components/NetworkSelector';
import { UIModeSwitcher, type UIMode } from '@/components/UIModeSwitcher';
import HelpIcon from '@/components/HelpIcon';
import { WalletConnectionModal } from '@/components/WalletConnectionModal';
import { IntroVideo } from '@/components/IntroVideo';
import { formatBalance, formatBalanceWithCommas, formatAddress } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { APP_VERSION } from '@/lib/version';

export default function Home() {
  const { connected, balance, address, claimBalance, refreshBalance, contractBalance, setContractBalance, setBalance, balanceVerified, isLoadingBalance } = useWallet();
  const { network, getContractStateForToken, getContractIdForToken, switchNetwork, isConnected, coreAPI, disconnectWallet } = useHathor();
  const { walletType } = useUnifiedWallet();
  const [selectedToken, setSelectedToken] = useState('HTR');
  const [expandedCard, setExpandedCard] = useState<string | null>('placeBet');
  const [isLoadingClaimable, setIsLoadingClaimable] = useState(false);
  const [claimableError, setClaimableError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isRefreshingWallet, setIsRefreshingWallet] = useState(false);
  const [isRefreshingContract, setIsRefreshingContract] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [uiMode, setUIMode] = useState<UIMode>('fortune-tiger');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showDisconnectMenu, setShowDisconnectMenu] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  // Load UI mode preference from localStorage
  useEffect(() => {
    const storedMode = localStorage.getItem('ui_mode') as UIMode | null;
    if (storedMode && (storedMode === 'classic' || storedMode === 'fortune-tiger')) {
      setUIMode(storedMode);
    }
  }, []);

  // Listen for openStatistics event from mobile UI
  useEffect(() => {
    const handleOpenStatistics = () => {
      handleModeChange('classic');
    };
    window.addEventListener('openStatistics', handleOpenStatistics);
    return () => window.removeEventListener('openStatistics', handleOpenStatistics);
  }, []);

  const handleModeChange = (mode: UIMode) => {
    setUIMode(mode);
    localStorage.setItem('ui_mode', mode);
  };

  const handleCardToggle = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  // Handle network change - disconnect wallet first if connected
  const handleNetworkChange = (newNetwork: typeof network) => {
    if (isConnected) {
      disconnectWallet();
    }
    switchNetwork(newNetwork);
  };

  // Fetch claimable balance when connected or token changes
  useEffect(() => {
    const fetchClaimableBalance = async () => {
      if (!isConnected || !address) {
        setContractBalance(0n);
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
        setContractBalance(claimable);
        setClaimableError(null);
      } catch (error: any) {
        console.error('Failed to fetch claimable balance:', error);
        setContractBalance(0n);
        setClaimableError('Load failed');
      } finally {
        setIsLoadingClaimable(false);
      }
    };

    fetchClaimableBalance();
    // Only re-fetch when connection, address, or token actually changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, selectedToken]);

  // Handle token change - clear balance and fetch new one
  const handleTokenChange = (newToken: string) => {
    // Clear current balance when switching tokens
    setBalance(0n);
    setSelectedToken(newToken);
  };

  // Track previous token to detect token changes
  const prevTokenRef = useRef(selectedToken);
  // Track if we've fetched balance for the current connection
  const hasFetchedForConnectionRef = useRef(false);

  // Reset fetch flag when disconnected
  useEffect(() => {
    if (!isConnected) {
      hasFetchedForConnectionRef.current = false;
    }
  }, [isConnected]);

  // Refresh wallet balance when token changes OR on initial connection
  useEffect(() => {
    if (!isConnected || !address) return;

    const tokenChanged = prevTokenRef.current !== selectedToken;
    const needsInitialFetch = !hasFetchedForConnectionRef.current;

    // Fetch balance if token changed or haven't fetched yet for this connection
    if (tokenChanged || needsInitialFetch) {
      const tokenUid = getContractStateForToken(selectedToken)?.token_uid || '00';
      refreshBalance(tokenUid);
      hasFetchedForConnectionRef.current = true;
    }

    prevTokenRef.current = selectedToken;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedToken, isConnected, address]);

  const handleWithdrawClick = () => {
    setShowWithdrawModal(true);
    setWithdrawAmount('');
  };

  // Quick withdraw - withdraws full contract balance without modal
  const handleQuickWithdraw = async () => {
    if (!isConnected || contractBalance <= 0n) {
      return;
    }

    const contractId = getContractIdForToken(selectedToken);
    if (!contractId) {
      toast.error('Contract not found for token');
      return;
    }

    const contractState = getContractStateForToken(selectedToken);
    const tokenUid = contractState?.token_uid || '00';
    const withdrawAmount = Number(contractBalance) / 100;

    setIsClaiming(true);
    toast.info('⏳ Please confirm the withdrawal in your wallet...');

    try {
      const result = await claimBalance(withdrawAmount, selectedToken, contractId, tokenUid);

      // Update balances locally IMMEDIATELY after successful withdrawal
      const withdrawAmountCents = Math.round(withdrawAmount * 100);
      setBalance(prev => prev + BigInt(withdrawAmountCents));
      setContractBalance(0n);

      toast.success(`Withdrawal successful! TX: ${result.response.hash?.slice(0, 10)}...`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to withdraw');
    } finally {
      setIsClaiming(false);
    }
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

    const availableBalance = Number(contractBalance) / 100;
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

      // Update balances locally after successful withdraw
      const withdrawAmountCents = Math.round(amount * 100);
      // Increase wallet balance
      setBalance(balance + BigInt(withdrawAmountCents));
      // Decrease contract balance
      setContractBalance(contractBalance - BigInt(withdrawAmountCents));

      setShowWithdrawModal(false);
      setWithdrawAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to withdraw balance');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleSetMaxWithdraw = () => {
    const maxAmount = Number(contractBalance) / 100;
    setWithdrawAmount(maxAmount.toString());
  };

  const handleRefreshWalletBalance = async () => {
    setIsRefreshingWallet(true);
    try {
      const tokenUid = getContractStateForToken(selectedToken)?.token_uid || '00';
      await refreshBalance(tokenUid);
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
      setContractBalance(claimable);
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

  // If in Fortune Tiger mode, render full-screen slot machine
  if (uiMode === 'fortune-tiger') {
    const totalBalance = BigInt(balance) + BigInt(contractBalance);
    const formattedBalance = isConnected && balanceVerified && totalBalance > 0n
      ? `${formatBalanceWithCommas(totalBalance)} ${selectedToken}`
      : undefined;

    return (
      <div className="relative">
        {/* Intro Video */}
        {showIntro && (
          <IntroVideo onComplete={() => setShowIntro(false)} />
        )}
        {/* Wallet Controls - Top Right on desktop, hidden on mobile (shown in FortuneTigerBetCard) */}
        <div className="hidden md:flex fixed top-4 right-4 z-40 items-center gap-2">
          <TokenSelector selectedToken={selectedToken} onTokenChange={handleTokenChange} />
          <NetworkSelector
            value={network}
            onChange={handleNetworkChange}
          />
          {isConnected ? (
            <div className="relative">
              <button
                onClick={() => setShowDisconnectMenu(!showDisconnectMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm text-slate-300">{formatAddress(address || '')}</span>
              </button>
              {showDisconnectMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDisconnectMenu(false)} />
                  <div className="absolute top-full mt-2 right-0 z-50">
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setShowDisconnectMenu(false);
                      }}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors whitespace-nowrap"
                    >
                      Disconnect
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowWalletModal(true)}
              className="px-4 py-2 rounded-lg font-bold bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600 text-yellow-900 hover:brightness-110 transition-all whitespace-nowrap"
            >
              Connect Wallet
            </button>
          )}
        </div>

        <FortuneTigerBetCard
          selectedToken={selectedToken}
          onTokenChange={handleTokenChange}
          network={network}
          onNetworkChange={handleNetworkChange}
          onConnectWallet={() => setShowWalletModal(true)}
          onDisconnectWallet={disconnectWallet}
          formattedBalance={formattedBalance}
          onLoadBalance={() => {
            const tokenUid = getContractStateForToken(selectedToken)?.token_uid || '00';
            refreshBalance(tokenUid);
          }}
          walletType={walletType ?? undefined}
        />
        <UIModeSwitcher
          currentMode={uiMode}
          onModeChange={handleModeChange}
          balance={formattedBalance}
          onGetBalance={refreshBalance}
          isConnected={isConnected}
          isLoadingBalance={isLoadingBalance}
          walletType={walletType ?? undefined}
          contractBalance={contractBalance}
          onWithdraw={handleQuickWithdraw}
          isWithdrawing={isClaiming}
        />

        {/* Wallet Connection Modal */}
        <WalletConnectionModal
          open={showWalletModal}
          onOpenChange={setShowWalletModal}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header selectedToken={selectedToken} onTokenChange={handleTokenChange} />

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {connected && <BalanceCard selectedToken={selectedToken} />}
            <ProfitLossCard selectedToken={selectedToken} />
            <RecentBetsTable selectedToken={selectedToken} />
            <RecentOperationsTable selectedToken={selectedToken} />
          </div>

          <div className="space-y-6">
            {/* Place Bet - Right Panel */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-lg font-bold text-white mb-4">PLACE BET</h2>

              {isConnected && (
                <div className="mb-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm font-medium flex items-center gap-1">
                      Wallet Balance:
                      <HelpIcon text="Your wallet's token balance. This is stored in your personal wallet and can be used for betting or adding liquidity." />
                    </span>
                    {balanceVerified && balance > 0n ? (
                      <span className="text-white font-bold">
                        {formatBalanceWithCommas(balance)} {selectedToken}
                      </span>
                    ) : isLoadingBalance ? (
                      <span className="text-slate-400 text-xs">Authorize to view balance</span>
                    ) : isConnected ? (
                      <button
                        onClick={() => {
                          // Only show confirmation toast for WalletConnect (not MetaMask Snap)
                          if (walletType !== 'metamask') {
                            toast.info('⏳ Please confirm the operation in your wallet...');
                          }
                          const tokenUid = getContractStateForToken(selectedToken)?.token_uid || '00';
                          refreshBalance(tokenUid);
                        }}
                        className="px-3 py-1 font-medium rounded transition-colors hover:opacity-90"
                        style={{ background: 'linear-gradient(244deg, rgb(255, 166, 0) 0%, rgb(255, 115, 0) 100%)', color: '#1e293b' }}
                      >
                        Load Balance
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">Connect wallet first</span>
                    )}
                  </div>
                  <div className="border-t border-slate-600 pt-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-300 text-sm font-medium flex items-center gap-1">
                        Contract Balance:
                        <HelpIcon text="Your claimable balance held in the contract from previous bet winnings. Can be used for betting, or withdrawn to your wallet." />
                      </span>
                      <div className="flex items-center gap-2">
                        {claimableError ? (
                          <span className="text-red-400 text-xs">{claimableError}</span>
                        ) : (
                          <span className="text-green-400 font-bold">
                            {formatBalanceWithCommas(contractBalance)} {selectedToken}
                          </span>
                        )}
                      </div>
                    </div>
                    {contractBalance > 0n && !claimableError && (
                      <button
                        onClick={handleWithdrawClick}
                        disabled={isClaiming}
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              )}

              <PlaceBetCard
                selectedToken={selectedToken}
                isExpanded={true}
                onToggle={() => {}}
              />
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">INFO & LIQUIDITY</h2>
              </div>

              <ContractInfoCompact contractState={contractState} token={selectedToken} />

              <div className="space-y-4">
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
                  {formatBalance(contractBalance)} {selectedToken}
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

      {/* Version Footer */}
      <footer className="mt-8 text-center text-sm pb-6">
        <p className="text-slate-400 mb-2">Built on Hathor Network • Powered by Nano Contracts</p>
        <p className="text-slate-500">HathorDice {APP_VERSION}</p>
      </footer>

      {/* UI Mode Switcher - Only show in classic mode */}
      <UIModeSwitcher currentMode={uiMode} onModeChange={handleModeChange} />
    </div>
  );
}
