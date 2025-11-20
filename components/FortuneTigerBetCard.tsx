'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/contexts/WalletContext';
import { useHathor } from '@/contexts/HathorContext';
import {
  calculatePayout,
  formatTokenAmount,
  multiplierToThreshold,
  FORTUNE_TIGER_MULTIPLIERS,
} from '@/lib/utils';
import { toast } from '@/lib/toast';
import { MultiplierSelector } from './MultiplierSelector';
import { SlotMachineAnimation } from './SlotMachineAnimation';
import { WinnerChickenDinner } from './WinnerChickenDinner';

interface FortuneTigerBetCardProps {
  selectedToken: string;
}

export default function FortuneTigerBetCard({ selectedToken }: FortuneTigerBetCardProps) {
  const { walletBalance, contractBalance, placeBet, connected, address, connectWallet, balance } = useWallet();
  const { isConnected, getContractStateForToken, getContractIdForToken, allBets } = useHathor();
  const contractBalanceInTokens = Number(contractBalance) / 100;
  const totalBalance = walletBalance + contractBalanceInTokens;

  const [betAmount, setBetAmount] = useState(10);
  const [selectedMultiplier, setSelectedMultiplier] = useState(2);
  const [threshold, setThreshold] = useState(32768);
  const [potentialPayout, setPotentialPayout] = useState(20);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [luckyNumber, setLuckyNumber] = useState(0);
  const [pendingBetTxId, setPendingBetTxId] = useState<string | null>(null);
  const [betResult, setBetResult] = useState<'win' | 'lose' | null>(null);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  const contractState = getContractStateForToken(selectedToken);
  const randomBitLength = contractState?.random_bit_length || 16;
  const houseEdgeBasisPoints = contractState?.house_edge_basis_points || 200;
  const maxBetAmount = contractState?.max_bet_amount || 1000000;

  // Calculate threshold and payout when multiplier or bet amount changes
  useEffect(() => {
    const newThreshold = multiplierToThreshold(selectedMultiplier, randomBitLength, houseEdgeBasisPoints);
    const payout = calculatePayout(betAmount, newThreshold, randomBitLength, houseEdgeBasisPoints);
    setThreshold(newThreshold);
    setPotentialPayout(payout);
  }, [betAmount, selectedMultiplier, randomBitLength, houseEdgeBasisPoints]);

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

      // Show winner animation if won
      if (bet.result === 'win') {
        setTimeout(() => {
          setShowWinAnimation(true);
        }, 500); // Small delay to let slot machine settle
      }
    }
  }, [allBets, pendingBetTxId]);

  const setQuickAmount = (percentage: number) => {
    const amount = totalBalance * percentage;
    const maxAllowed = Number(maxBetAmount) / 100;
    setBetAmount(Math.min(amount, maxAllowed));
  };

  const handleSpin = async () => {
    // If not connected, open wallet connection
    if (!connected) {
      connectWallet();
      return;
    }

    // If connected but no balance available yet (need authorization)
    if (balance === 0n) {
      setShowAuthPopup(true);
      setTimeout(() => setShowAuthPopup(false), 3000);
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

    // Show wallet confirmation message
    toast.info('⏳ Please confirm the transaction in your wallet...');

    setIsPlacingBet(true);
    setBetResult(null);

    try {
      const result = await placeBet(betAmount, threshold, selectedToken, contractId, tokenUid, contractBalance);
      setPendingBetTxId(result.response.hash);
      // Start spinning only after transaction is confirmed
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl relative">
          {/* Wallet Address - Top Right */}
          {connected && address && (
            <div className="absolute top-0 right-0 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border-2 border-white/30">
              <div className="text-xs text-white/70 font-semibold">Wallet</div>
              <div className="text-sm text-white font-bold font-mono">
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-4 mt-16">
            <motion.h2
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-4xl md:text-5xl font-black bg-gold-gradient bg-clip-text text-transparent mb-2"
            >
              🐯 FORTUNE TIGER 🐯
            </motion.h2>
            <p className="text-white text-base font-semibold">Pick your multiplier and spin to win!</p>
          </div>

          {/* Slot Machine Animation - Always Shown */}
          <div className="mb-4">
            <SlotMachineAnimation
              isSpinning={isSpinning}
              finalNumber={luckyNumber}
              result={betResult}
            />
          </div>

          {/* Quick Bet Amount Buttons */}
          <div className="mb-4">
            <div className="grid grid-cols-4 gap-2">
              {[1, 10, 100, 250].map(amount => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  disabled={isPlacingBet || isSpinning}
                  className={`py-3 rounded-xl text-base font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 ${
                    betAmount === amount
                      ? 'bg-yellow-400 text-orange-900 border-yellow-300'
                      : 'bg-white/20 hover:bg-white/30 text-white border-white/20 hover:border-white/40'
                  }`}
                >
                  {amount} {selectedToken}
                </button>
              ))}
            </div>
          </div>

          {/* Multiplier Selector */}
          <div className="mb-4">
            <MultiplierSelector
              selectedMultiplier={selectedMultiplier}
              onSelect={setSelectedMultiplier}
              disabled={isPlacingBet || isSpinning}
            />
          </div>

          {/* Payout Display */}
          <motion.div
            animate={{ scale: isSpinning ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: isSpinning ? Infinity : 0, duration: 1 }}
            className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 rounded-xl p-4 mb-4 text-center shadow-xl"
          >
            <div className="text-sm text-orange-900 font-bold">Potential Win</div>
            <div className="text-3xl md:text-4xl font-black text-orange-900">
              {formatTokenAmount(potentialPayout * 100)} {selectedToken}
            </div>
            <div className="text-xs text-orange-900 font-bold">
              {selectedMultiplier}x
            </div>
          </motion.div>

          {/* Spin Button */}
          <motion.button
            onClick={handleSpin}
            disabled={isPlacingBet || isSpinning}
            whileHover={!isPlacingBet && !isSpinning ? { scale: 1.05 } : {}}
            whileTap={!isPlacingBet && !isSpinning ? { scale: 0.95 } : {}}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-black text-2xl shadow-xl hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-3 border-white/20"
          >
            {isSpinning ? '🎰 SPINNING...' : isPlacingBet ? '⏳ CONFIRMING...' : !connected ? '🔌 CONNECT WALLET' : '🎰 SPIN TO WIN!'}
          </motion.button>

          {/* Balance Info */}
          <div className="mt-3 text-center text-sm text-white/80 font-semibold">
            <div>Balance: {formatTokenAmount(BigInt(Math.floor(totalBalance * 100)))} {selectedToken}</div>
            <div className="text-xs mt-1 text-white/60">
              Wallet: {formatTokenAmount(BigInt(Math.floor(walletBalance * 100)))} | Contract: {formatTokenAmount(contractBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* Winner Chicken Dinner Animation */}
      {showWinAnimation && (
        <WinnerChickenDinner
          payout={potentialPayout}
          token={selectedToken}
          onComplete={() => setShowWinAnimation(false)}
        />
      )}

      {/* Authorization Required Popup */}
      {showAuthPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 max-w-md mx-4 border-4 border-yellow-300 shadow-2xl"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🔐</div>
              <h3 className="text-2xl font-black text-white mb-3">Authorization Required</h3>
              <p className="text-white/90 text-lg">
                Please authorize the action in your wallet to view your balance and start playing!
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
