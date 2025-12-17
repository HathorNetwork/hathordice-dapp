'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/contexts/WalletContext';
import { useHathor } from '@/contexts/HathorContext';
import {
  calculatePayout,
  formatTokenAmount,
  multiplierToThreshold,
  thresholdToWinChance,
  calculateMaxMultiplier,
  calculateMinThreshold,
  clampMultiplierToValidThreshold,
  MAX_UI_MULTIPLIER,
  FORTUNE_TIGER_MULTIPLIERS,
} from '@/lib/utils';
import { toast } from '@/lib/toast';
import { MultiplierSelector } from './MultiplierSelector';
import { SlotMachineAnimation } from './SlotMachineAnimation';
import { WinnerChickenDinner } from './WinnerChickenDinner';
import { BigWin } from './animations/BigWin';
import { MegaWin } from './animations/MegaWin';
import { Jackpot } from './animations/Jackpot';
import { TryAgain } from './animations/TryAgain';
import { AlmostThere } from './animations/AlmostThere';
import { LossAnimation } from './animations/LossAnimation';
import { AnimationSelector, type AnimationType, ANIMATIONS } from './AnimationSelector';
import { WalletConnectionModal } from './WalletConnectionModal';
import { GoddessSpinner } from './GoddessSpinner';

import { GoldButton } from './GoldButton';
import { GoldFrame } from './GoldFrame';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import TokenSelector from './TokenSelector';
import { NetworkSelector } from './NetworkSelector';
import { Network } from '@/lib/config';
import { formatAddress } from '@/lib/utils';

interface FortuneTigerBetCardProps {
  selectedToken: string;
  onTokenChange?: (token: string) => void;
  network?: Network;
  onNetworkChange?: (network: Network) => void;
  onConnectWallet?: () => void;
  onDisconnectWallet?: () => void;
  formattedBalance?: string;
  onLoadBalance?: () => void;
  walletType?: string;
}

export default function FortuneTigerBetCard({
  selectedToken,
  onTokenChange,
  network,
  onNetworkChange,
  onConnectWallet,
  onDisconnectWallet,
  formattedBalance,
  onLoadBalance,
  walletType,
}: FortuneTigerBetCardProps) {
  const { walletBalance, contractBalance, placeBet, connectWallet, balance, refreshBalance, isLoadingBalance, balanceVerified } = useWallet();
  const { isConnected, getContractStateForToken, getContractIdForToken, allBets, address } = useHathor();
  const [showMobileDisconnect, setShowMobileDisconnect] = useState(false);
  const contractBalanceInTokens = Number(contractBalance) / 100;
  const totalBalance = walletBalance + contractBalanceInTokens;

  const [betAmount, setBetAmount] = useState(1);
  const [selectedMultiplier, setSelectedMultiplier] = useState(1.5);
  const [showBetInput, setShowBetInput] = useState(false);
  const [showMultiplierInput, setShowMultiplierInput] = useState(false);
  const [betInputValue, setBetInputValue] = useState('1');
  const [multiplierInputValue, setMultiplierInputValue] = useState('1.5');
  const [threshold, setThreshold] = useState(32768);
  const [potentialPayout, setPotentialPayout] = useState(20);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [luckyNumber, setLuckyNumber] = useState(0);
  const [pendingBetTxId, setPendingBetTxId] = useState<string | null>(null);
  const [betResult, setBetResult] = useState<'win' | 'lose' | null>(null);
  const [activeAnimation, setActiveAnimation] = useState<AnimationType | null>(null);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showAnimationSelector, setShowAnimationSelector] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [hasAttemptedBalance, setHasAttemptedBalance] = useState(false);

  const contractState = getContractStateForToken(selectedToken);
  const randomBitLength = contractState?.random_bit_length || 16;
  const houseEdgeBasisPoints = contractState?.house_edge_basis_points || 190;
  const maxBetAmount = contractState?.max_bet_amount || 1000000;
  const contractMaxMultiplierTenths = (contractState as any)?.max_multiplier_tenths;

  // Calculate the maximum allowed multiplier for this contract
  const maxAllowedMultiplier = calculateMaxMultiplier(randomBitLength, houseEdgeBasisPoints, contractMaxMultiplierTenths);

  // Calculate threshold and payout when multiplier or bet amount changes
  // Use clampMultiplierToValidThreshold to ensure we're within valid bounds
  useEffect(() => {
    const { threshold: validThreshold } = clampMultiplierToValidThreshold(
      selectedMultiplier,
      randomBitLength,
      houseEdgeBasisPoints,
      contractMaxMultiplierTenths
    );
    const payout = calculatePayout(betAmount, validThreshold, randomBitLength, houseEdgeBasisPoints);
    setThreshold(validThreshold);
    setPotentialPayout(payout);
  }, [betAmount, selectedMultiplier, randomBitLength, houseEdgeBasisPoints, contractMaxMultiplierTenths]);

  // Watch for bet results
  useEffect(() => {
    if (!pendingBetTxId) return;

    const bet = allBets.find(b => b.id === pendingBetTxId);
    if (bet && bet.result !== 'pending') {
      // Bet has been confirmed
      setLuckyNumber(bet.luckyNumber || 0);
      setIsSpinning(false);
      setBetResult(bet.result as 'win' | 'lose');
      setPendingBetTxId(null);

      // Randomly select an animation based on result
      const winAnimations: AnimationType[] = [
        'winner-chicken-dinner',
        'big-win',
        'mega-win',
        'jackpot',
      ];
      const loseAnimations: AnimationType[] = [
        'try-again',
        'almost-there',
        'better-luck',
      ];

      let selectedAnimation: AnimationType;
      if (bet.result === 'win') {
        selectedAnimation = winAnimations[Math.floor(Math.random() * winAnimations.length)];
      } else {
        selectedAnimation = loseAnimations[Math.floor(Math.random() * loseAnimations.length)];
      }

      // Show animation immediately - no delay
      setActiveAnimation(selectedAnimation);
    }
  }, [allBets, pendingBetTxId]);

  // Trigger balance request when auth popup shows, and close popup when balance is loaded
  useEffect(() => {
    if (showAuthPopup) {
      // Only trigger balance request if it hasn't been attempted yet in this session
      if (!isLoadingBalance && !hasAttemptedBalance && balance === 0n) {
        setHasAttemptedBalance(true);
        const tokenUid = contractState?.token_uid || '00';
        refreshBalance(tokenUid);
      }
      // Close popup when balance is loaded
      if (balance > 0n) {
        setShowAuthPopup(false);
      }
    }
  }, [balance, showAuthPopup, isLoadingBalance, hasAttemptedBalance, refreshBalance, contractState]);

  // Check for debug mode from localStorage
  useEffect(() => {
    const isDebug = localStorage.getItem('debug_mode') === 'true';
    setDebugMode(isDebug);

    // Listen for debug mode changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'debug_mode') {
        setDebugMode(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setQuickAmount = (percentage: number) => {
    const amount = totalBalance * percentage;
    const maxAllowed = Number(maxBetAmount) / 100;
    setBetAmount(Math.min(amount, maxAllowed));
  };

  const handleDebugSpin = () => {
    // Show animation selector
    setShowAnimationSelector(true);
  };

  const handleAnimationSelected = (animationId: AnimationType) => {
    setShowAnimationSelector(false);

    // Find the animation config
    const animationConfig = ANIMATIONS.find(a => a.id === animationId);
    const isWin = animationConfig?.type === 'win';

    // Reset states
    setBetResult(null);
    setActiveAnimation(null);
    setIsPlacingBet(true);

    // Show wallet confirmation message
    toast.info('⏳ Debug: Please confirm the transaction in your wallet...');

    // Simulate wallet confirmation after 2 seconds
    setTimeout(() => {
      setIsPlacingBet(false);

      // Start spinning AFTER wallet confirmation
      setIsSpinning(true);
      toast.success('🎰 Debug: Transaction confirmed! Spinning...');

      // Simulate result after 7 seconds of spinning (fast and fun!)
      setTimeout(() => {
        let randomNum: number;
        if (isWin) {
          // Generate a winning number (below threshold)
          randomNum = Math.floor(Math.random() * threshold);
        } else {
          // Generate a losing number (above threshold)
          randomNum = threshold + Math.floor(Math.random() * (65536 - threshold));
        }

        setLuckyNumber(randomNum);
        setIsSpinning(false);
        setBetResult(isWin ? 'win' : 'lose');

        // Show the selected animation immediately
        setActiveAnimation(animationId);
      }, 7000); // 7 seconds of spinning
    }, 2000); // 2 seconds for wallet confirmation
  };

  const handleSpin = async () => {
    // If not connected, open wallet connection
    if (!isConnected) {
      setShowWalletModal(true);
      return;
    }

    // If connected but no balance available yet (need authorization)
    if (balance === 0n) {
      setShowAuthPopup(true);
      return;
    }

    if (betAmount <= 0) {
      toast.error('Bet amount must be positive');
      return;
    }

    const maxAllowed = Number(maxBetAmount) / 100;
    if (betAmount > maxAllowed) {
      toast.error(`Bet amount exceeds maximum of ${formatTokenAmount(Number(maxBetAmount))} ${selectedToken}`);
      return;
    }

    if (betAmount > totalBalance) {
      toast.error('Insufficient balance');
      return;
    }

    const contractId = getContractIdForToken(selectedToken);
    if (!contractId) {
      toast.error('Contract not found for token');
      return;
    }

    const tokenUid = contractState?.token_uid || '00';

    // Reset states
    setBetResult(null);
    setActiveAnimation(null);

    // Show wallet confirmation message
    toast.info('⏳ Please confirm the transaction in your wallet...');

    setIsPlacingBet(true);

    try {
      const result = await placeBet(betAmount, threshold, selectedToken, contractId, tokenUid, contractBalance);
      setPendingBetTxId(result.response.hash);

      // Start spinning AFTER wallet confirmation
      setIsSpinning(true);
      toast.success('🎰 Transaction confirmed! Spinning...');
    } catch (error: any) {
      toast.error(error.message || 'Failed to place bet');
      setIsSpinning(false);
      setBetResult(null);
    } finally {
      setIsPlacingBet(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#0f0518] flex items-center justify-center p-4 font-serif">
        {/* Debug Button - Top Left */}
        {debugMode && (
          <div className="fixed top-4 left-4 z-50">
            <button
              onClick={handleDebugSpin}
              disabled={isPlacingBet || isSpinning}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg border-2 border-purple-400 transition-all"
            >
              🐛 Debug Spin
            </button>
            <div className="mt-2 text-xs text-purple-300 bg-black/50 px-2 py-1 rounded">
              Debug Mode Active
            </div>
          </div>
        )}

        <div className="w-full max-w-4xl relative">

          {/* Title */}
          <div className="text-center mb-4 md:mb-8">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-700 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center justify-center gap-4 tracking-wider"
            >
              HATHOR DICE
            </motion.h2>
          </div>

          {/* Mobile Wallet Controls - Below title on mobile only */}
          <div className="flex md:hidden items-center justify-center gap-2 mb-4 px-4 w-full">
            {onTokenChange && (
              <div className="flex-1">
                <TokenSelector selectedToken={selectedToken} onTokenChange={onTokenChange} />
              </div>
            )}
            {network && onNetworkChange && (
              <div className="flex-1">
                <NetworkSelector
                  value={network}
                  onChange={onNetworkChange}
                  disabled={isConnected}
                />
              </div>
            )}
            {isConnected ? (
              <div className="relative flex-1">
                <button
                  onClick={() => setShowMobileDisconnect(!showMobileDisconnect)}
                  className="flex items-center justify-center gap-2 px-3 h-10 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors w-full"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-xs text-slate-300">{formatAddress(address || '')}</span>
                </button>
                {showMobileDisconnect && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMobileDisconnect(false)} />
                    <div className="absolute top-full mt-2 right-0 z-50">
                      <button
                        onClick={() => {
                          onDisconnectWallet?.();
                          setShowMobileDisconnect(false);
                        }}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors whitespace-nowrap text-sm"
                      >
                        Disconnect
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : onConnectWallet && (
              <button
                onClick={onConnectWallet}
                className="flex-1 px-4 h-10 rounded-lg font-bold text-sm bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600 text-yellow-900 hover:brightness-110 transition-all"
              >
                Connect
              </button>
            )}
          </div>

          {/* Slot Machine Area */}
          <div className="mb-4 md:mb-8 px-4 md:px-0">
            <SlotMachineAnimation
              isSpinning={isSpinning}
              finalNumber={luckyNumber}
              result={betResult}
            />
          </div>

          {/* Controls Container */}
          <div className="flex flex-col items-center gap-4 md:gap-6 px-4 md:px-0">

            {/* Top Row: Selects - aligned with SPIN button width */}
            <div className="flex items-start gap-3 md:gap-6 justify-center w-full md:w-[424px]">
              {/* Bet Amount Select */}
              <div className="relative flex-1">
                <Select
                  value={betAmount.toString()}
                  onValueChange={(value) => {
                    if (value === 'custom') {
                      setBetInputValue(betAmount.toString());
                      setShowBetInput(true);
                    } else {
                      const numValue = Number(value);
                      setBetAmount(numValue);
                      setBetInputValue(numValue.toString());
                      setShowBetInput(false);
                    }
                  }}
                  disabled={isPlacingBet || isSpinning}
                >
                  <SelectTrigger className="h-[52px] md:h-[72px] px-3 md:px-6 border-2 border-yellow-700/50 bg-black/40 hover:border-yellow-500 hover:bg-black/60 rounded-lg font-bold transition-all w-full">
                    <span className="text-base md:text-xl text-yellow-400">{betAmount} {selectedToken}</span>
                  </SelectTrigger>
                  <SelectContent className="border-2 border-yellow-500/60 bg-gradient-to-br from-yellow-900/40 via-black/80 to-yellow-900/40 backdrop-blur-sm">
                    {[1, 10, 100, 250].map(amount => (
                      <SelectItem
                        key={amount}
                        value={amount.toString()}
                        className="text-yellow-400 hover:bg-yellow-500/20 focus:bg-yellow-500/20 cursor-pointer"
                      >
                        {amount} {selectedToken}
                      </SelectItem>
                    ))}
                    <SelectItem
                      value="custom"
                      className="text-yellow-400 hover:bg-yellow-500/20 focus:bg-yellow-500/20 cursor-pointer border-t border-yellow-500/30 mt-1"
                    >
                      Custom (max {formatTokenAmount(Number(maxBetAmount))})
                    </SelectItem>
                  </SelectContent>
                </Select>
                {showBetInput && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowBetInput(false)} />
                    <div className="absolute top-full mt-2 left-0 z-50 min-w-[180px] px-4 py-3 rounded-lg border-2 border-yellow-700/50 bg-black/40 backdrop-blur-sm shadow-xl">
                      <input
                        type="number"
                        value={betInputValue}
                        onChange={(e) => setBetInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = parseFloat(betInputValue);
                            if (!isNaN(val) && val > 0) {
                              setBetAmount(val);
                              setShowBetInput(false);
                            }
                          } else if (e.key === 'Escape') {
                            setShowBetInput(false);
                          }
                        }}
                        className="w-full bg-black/60 text-yellow-400 font-mono outline-none text-sm px-2 py-1 rounded border border-yellow-700/50 focus:border-yellow-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="Enter amount"
                        autoFocus
                        min="1"
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => {
                            const val = parseFloat(betInputValue);
                            if (!isNaN(val) && val > 0) {
                              setBetAmount(val);
                              setShowBetInput(false);
                            }
                          }}
                          className="flex-1 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-xs font-bold text-white rounded transition-colors"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => setShowBetInput(false)}
                          className="flex-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Multiplier Select */}
              <div className="relative flex-1 flex flex-col gap-2">
                <Select
                  value={selectedMultiplier.toString()}
                  onValueChange={(value) => {
                    if (value === 'custom') {
                      setMultiplierInputValue(selectedMultiplier.toString());
                      setShowMultiplierInput(true);
                    } else {
                      const numValue = Number(value);
                      setSelectedMultiplier(numValue);
                      setMultiplierInputValue(numValue.toString());
                      setShowMultiplierInput(false);
                    }
                  }}
                  disabled={isPlacingBet || isSpinning}
                >
                  <SelectTrigger className="h-[52px] md:h-[72px] px-3 md:px-6 border-2 border-yellow-700/50 bg-black/40 hover:border-yellow-500 hover:bg-black/60 rounded-lg font-bold transition-all w-full">
                    <span className="text-base md:text-xl text-yellow-400">{selectedMultiplier} x</span>
                  </SelectTrigger>
                  <SelectContent className="border-2 border-yellow-500/60 bg-gradient-to-br from-yellow-900/40 via-black/80 to-yellow-900/40 backdrop-blur-sm">
                    {[1.5, 2, 5, 10].map(mult => (
                      <SelectItem
                        key={mult}
                        value={mult.toString()}
                        className="text-yellow-400 hover:bg-yellow-500/20 focus:bg-yellow-500/20 cursor-pointer"
                      >
                        {mult} x
                      </SelectItem>
                    ))}
                    <SelectItem
                      value="custom"
                      className="text-yellow-400 hover:bg-yellow-500/20 focus:bg-yellow-500/20 cursor-pointer border-t border-yellow-500/30 mt-1"
                    >
                      Custom (max 100x)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-yellow-400/80 text-xs md:text-sm font-medium">
                    Win Probability: {thresholdToWinChance(threshold, contractState?.random_bit_length || 16).toFixed(1)}%
                  </span>
                  <div className="group relative">
                    <div className="w-5 h-5 rounded-full bg-yellow-900/40 border border-yellow-700/50 flex items-center justify-center cursor-help">
                      <span className="text-yellow-400 text-xs font-bold">?</span>
                    </div>
                    <div className="invisible group-hover:visible absolute left-0 bottom-full mb-2 z-50 w-64 px-4 py-3 bg-slate-800 border-2 border-slate-600 rounded-lg shadow-xl">
                      <p className="text-sm text-slate-300">
                        Your bet amount will be multiplied by this number if you win. Lower win chance = higher multiplier.
                      </p>
                    </div>
                  </div>
                </div>
                {showMultiplierInput && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMultiplierInput(false)} />
                    <div className="absolute top-full mt-2 left-0 z-50 min-w-[180px] px-4 py-3 rounded-lg border-2 border-yellow-700/50 bg-black/40 backdrop-blur-sm shadow-xl">
                      <input
                        type="number"
                        value={multiplierInputValue}
                        onChange={(e) => setMultiplierInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = parseFloat(multiplierInputValue);
                            if (!isNaN(val) && val >= 1.5) {
                              // Clamp to maxAllowedMultiplier
                              const clampedVal = Math.min(val, maxAllowedMultiplier);
                              setSelectedMultiplier(clampedVal);
                              setMultiplierInputValue(clampedVal.toString());
                              setShowMultiplierInput(false);
                            }
                          } else if (e.key === 'Escape') {
                            setShowMultiplierInput(false);
                          }
                        }}
                        className="w-full bg-black/60 text-yellow-400 font-mono outline-none text-sm px-2 py-1 rounded border border-yellow-700/50 focus:border-yellow-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder={`1.5 - ${maxAllowedMultiplier}`}
                        autoFocus
                        min="1.5"
                        max={maxAllowedMultiplier}
                        step="0.1"
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => {
                            const val = parseFloat(multiplierInputValue);
                            if (!isNaN(val) && val >= 1.5) {
                              // Clamp to maxAllowedMultiplier
                              const clampedVal = Math.min(val, maxAllowedMultiplier);
                              setSelectedMultiplier(clampedVal);
                              setMultiplierInputValue(clampedVal.toString());
                              setShowMultiplierInput(false);
                            }
                          }}
                          className="flex-1 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-xs font-bold text-white rounded transition-colors"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => setShowMultiplierInput(false)}
                          className="flex-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Spin Button (Large Rounded) */}
            <div className="mt-2 w-full md:w-auto">
              <button
                onClick={handleSpin}
                disabled={isPlacingBet || isSpinning}
                className="relative w-full md:w-[424px] h-[80px] md:h-[120px] text-3xl md:text-5xl font-bold tracking-widest rounded-xl bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600 text-yellow-900 shadow-xl border-4 border-yellow-300 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all overflow-hidden"
              >
                {/* Inner Shine */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

                {/* Content */}
                <div className="relative z-10">
                  {isPlacingBet ? (
                    <div className="flex items-center justify-center gap-2">
                      <GoddessSpinner size={48} interval={500} />
                      <span className="text-xl md:text-2xl">CONFIRMING...</span>
                    </div>
                  ) : isSpinning ? (
                    <span className="text-2xl md:text-3xl">SPINNING...</span>
                  ) : (
                    'SPIN'
                  )}
                </div>
              </button>
            </div>

            {/* Mobile Balance & Statistics - Below SPIN button on mobile only */}
            <div className="flex md:hidden items-stretch justify-center gap-3 mt-2 w-full">
              {formattedBalance ? (
                <div className="flex-1 px-4 py-2 rounded-full border-2 border-yellow-500/60 bg-gradient-to-br from-yellow-900/30 via-black/50 to-yellow-900/30 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-base">💰</div>
                    <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 font-mono">
                      {formattedBalance}
                    </span>
                  </div>
                </div>
              ) : isLoadingBalance ? (
                <div className="flex-1 px-4 py-2 rounded-full text-xs font-medium text-slate-300 text-center flex items-center justify-center">
                  Authorize to view balance
                </div>
              ) : (
                isConnected && onLoadBalance && (
                  <button
                    onClick={() => {
                      if (walletType !== 'metamask') {
                        toast.info('⏳ Please confirm the operation in your wallet...');
                      }
                      onLoadBalance();
                    }}
                    className="flex-1 px-4 py-2 rounded-full text-xs font-bold transition-all bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600 text-yellow-900 hover:brightness-110 shadow-xl flex items-center justify-center"
                  >
                    Load Balance
                  </button>
                )
              )}
              <button
                onClick={() => {
                  // Navigate to statistics/classic mode - this will be handled by parent
                  const event = new CustomEvent('openStatistics');
                  window.dispatchEvent(event);
                }}
                className="flex-1 px-4 py-2 rounded-full text-xs font-bold transition-all bg-white/10 backdrop-blur-md border-2 border-white/20 shadow-xl text-white/90 hover:text-white hover:bg-white/20 flex items-center justify-center"
              >
                Statistics
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Animation Selector for Debug Mode */}
      {showAnimationSelector && (
        <AnimationSelector
          onSelect={handleAnimationSelected}
          onClose={() => setShowAnimationSelector(false)}
        />
      )}

      {/* Active Animation */}
      {activeAnimation === 'winner-chicken-dinner' && (
        <WinnerChickenDinner
          payout={potentialPayout}
          token={selectedToken}
          onComplete={() => setActiveAnimation(null)}
        />
      )}
      {activeAnimation === 'big-win' && (
        <BigWin
          payout={potentialPayout}
          token={selectedToken}
          onComplete={() => setActiveAnimation(null)}
        />
      )}
      {activeAnimation === 'mega-win' && (
        <MegaWin
          payout={potentialPayout}
          token={selectedToken}
          onComplete={() => setActiveAnimation(null)}
        />
      )}
      {activeAnimation === 'jackpot' && (
        <Jackpot
          payout={potentialPayout}
          token={selectedToken}
          onComplete={() => setActiveAnimation(null)}
        />
      )}
      {activeAnimation === 'try-again' && (
        <TryAgain
          onComplete={() => setActiveAnimation(null)}
        />
      )}
      {activeAnimation === 'almost-there' && (
        <AlmostThere
          onComplete={() => setActiveAnimation(null)}
        />
      )}
      {activeAnimation === 'better-luck' && (
        <LossAnimation
          onComplete={() => setActiveAnimation(null)}
        />
      )}

      {/* Authorization Required Popup */}
      {showAuthPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => { setShowAuthPopup(false); setHasAttemptedBalance(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <GoldFrame className="max-w-md mx-4" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="bg-[#1a0b2e] p-8 rounded-xl text-center relative">
              {/* Close Button */}
              <button
                onClick={() => { setShowAuthPopup(false); setHasAttemptedBalance(false); }}
                className="absolute top-2 right-2 text-yellow-400 hover:text-yellow-300 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-yellow-400/10 transition-colors"
              >
                ×
              </button>

              <div className="text-6xl mb-4">🔐</div>
              <h3 className="text-2xl font-serif text-yellow-400 mb-3">Authorization Required</h3>
              <p className="text-yellow-100/80 text-lg">
                Please authorize the action in your wallet to view your balance and start playing!
              </p>
            </div>
          </GoldFrame>
        </motion.div>
      )}

      <WalletConnectionModal
        open={showWalletModal}
        onOpenChange={setShowWalletModal}
      />
    </>
  );
}
