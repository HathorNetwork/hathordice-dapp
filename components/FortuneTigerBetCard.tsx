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
import { BigWin } from './animations/BigWin';
import { MegaWin } from './animations/MegaWin';
import { Jackpot } from './animations/Jackpot';
import { TryAgain } from './animations/TryAgain';
import { AlmostThere } from './animations/AlmostThere';
import { BetterLuck } from './animations/BetterLuck';
import { AnimationSelector, type AnimationType, ANIMATIONS } from './AnimationSelector';
import { VideoPlayer } from './VideoPlayer';
import { WalletConnectionModal } from './WalletConnectionModal';
import { GoddessSpinner } from './GoddessSpinner';

import { GoldButton } from './GoldButton';
import { GoldFrame } from './GoldFrame';

interface FortuneTigerBetCardProps {
  selectedToken: string;
}

export default function FortuneTigerBetCard({ selectedToken }: FortuneTigerBetCardProps) {
  const { walletBalance, contractBalance, placeBet, connectWallet, balance } = useWallet();
  const { isConnected, getContractStateForToken, getContractIdForToken, allBets, address } = useHathor();
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
  const [activeAnimation, setActiveAnimation] = useState<AnimationType | null>(null);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showAnimationSelector, setShowAnimationSelector] = useState(false);
  const [spinAudio, setSpinAudio] = useState<HTMLAudioElement | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [oscillators, setOscillators] = useState<OscillatorNode[]>([]);

  const contractState = getContractStateForToken(selectedToken);
  const randomBitLength = contractState?.random_bit_length || 16;
  const houseEdgeBasisPoints = contractState?.house_edge_basis_points || 200;
  const maxBetAmount = contractState?.max_bet_amount || 1000000;

  // Initialize audio
  useEffect(() => {
    // Try to load spinning sound effect first
    const audio = new Audio();
    audio.src = '/sounds/spin.mp3';
    audio.loop = true;
    audio.volume = 0.3;

    let audioLoaded = false;

    // Test if audio loads successfully
    const testAudio = () => {
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        audioLoaded = true;
        console.log('✅ Audio file loaded successfully');
      }).catch(() => {
        console.log('⚠️ Spin audio file blocked by browser');
      });
    };

    audio.addEventListener('canplaythrough', testAudio, { once: true });
    audio.addEventListener('error', () => {
      console.log('❌ Spin audio file not found at /sounds/spin.mp3');
      console.log('🔊 Creating fallback Web Audio API sound...');

      // Create fallback audio using Web Audio API
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
    });

    setSpinAudio(audio);

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Control audio based on spinning state
  useEffect(() => {
    if (isSpinning) {
      // Try to play MP3 audio first
      if (spinAudio) {
        const playPromise = spinAudio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('🔊 Playing MP3 audio');
            })
            .catch(err => {
              console.log('⚠️ MP3 audio blocked or failed:', err.message);
              // Fallback to Web Audio API if MP3 fails
              if (audioContext) {
                startWebAudioSpinSound();
              }
            });
        }
      }
      // Use Web Audio API if no MP3 audio available
      else if (audioContext) {
        startWebAudioSpinSound();
      }
    } else {
      // Stop all audio
      if (spinAudio) {
        spinAudio.pause();
        spinAudio.currentTime = 0;
      }
      // Stop all oscillators
      oscillators.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Oscillator might already be stopped
        }
      });
      setOscillators([]);
    }
  }, [isSpinning, spinAudio, audioContext]);

  // Create spinning sound using Web Audio API
  const startWebAudioSpinSound = () => {
    if (!audioContext) return;

    try {
      // Stop any existing oscillators
      oscillators.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Already stopped
        }
      });

      // Create a simple spinning/mechanical sound
      const osc1 = audioContext.createOscillator();
      const osc2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      // Primary oscillator - lower frequency for mechanical rumble
      osc1.type = 'sawtooth';
      osc1.frequency.value = 100;

      // Secondary oscillator - creates the "ticking" effect
      osc2.type = 'square';
      osc2.frequency.value = 9;

      // Filter to make it sound more mechanical
      filter.type = 'lowpass';
      filter.frequency.value = 1200;
      filter.Q.value = 1;

      // Set volume lower for the oscillators
      gainNode.gain.value = 0.12;

      // Connect the audio graph
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(filter);
      filter.connect(audioContext.destination);

      // Start the oscillators immediately
      osc1.start();
      osc2.start();

      // Store both oscillators for cleanup
      setOscillators([osc1, osc2]);

      console.log('🔊 Playing Web Audio API spinning sound');
    } catch (err) {
      console.log('Failed to create Web Audio sound:', err);
    }
  };

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

      // Randomly select an animation or video based on result
      const winAnimations: AnimationType[] = [
        'winner-chicken-dinner',
        'big-win',
        'mega-win',
        'jackpot',
        'video-win-1',
      ];
      const loseAnimations: AnimationType[] = [
        'try-again',
        'almost-there',
        'better-luck',
        'video-lose-1',
        'video-lose-2',
        'video-lose-3',
        'video-lose-4',
        'video-lose-5',
        'video-lose-6',
      ];

      let selectedAnimation: AnimationType;
      if (bet.result === 'win') {
        selectedAnimation = winAnimations[Math.floor(Math.random() * winAnimations.length)];
      } else {
        selectedAnimation = loseAnimations[Math.floor(Math.random() * loseAnimations.length)];
      }

      // Show animation after a delay
      setTimeout(() => {
        setActiveAnimation(selectedAnimation);
      }, 500);
    }
  }, [allBets, pendingBetTxId]);

  // Close auth popup when balance is loaded
  useEffect(() => {
    if (showAuthPopup && balance > 0n) {
      setShowAuthPopup(false);
    }
  }, [balance, showAuthPopup]);

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

        // Show the selected animation after a delay
        setTimeout(() => {
          setActiveAnimation(animationId);
        }, 500);
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
          <div className="text-center mb-8">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-700 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center justify-center gap-4 tracking-wider"
            >
              ANUBIS FATE
            </motion.h2>
          </div>

          {/* Slot Machine Area */}
          <div className="mb-8">
            <SlotMachineAnimation
              isSpinning={isSpinning}
              finalNumber={luckyNumber}
              result={betResult}
            />
          </div>

          {/* Controls Container */}
          <div className="flex flex-col items-center gap-6">

            {/* Bet Amounts (Pills) */}
            <div className="flex items-center gap-4 w-full max-w-2xl justify-center">
              <button className="text-yellow-500 text-2xl opacity-50 hover:opacity-100">◀</button>
              <div className="flex gap-3 overflow-x-auto py-2 px-4 no-scrollbar">
                {[1, 10, 100, 250].map(amount => (
                  <GoldButton
                    key={amount}
                    variant="pill"
                    isActive={betAmount === amount}
                    onClick={() => setBetAmount(amount)}
                    disabled={isPlacingBet || isSpinning}
                    className="min-w-[100px] py-2 text-lg"
                  >
                    {amount} HTR
                  </GoldButton>
                ))}
              </div>
              <button className="text-yellow-500 text-2xl opacity-50 hover:opacity-100">▶</button>
            </div>

            {/* Multipliers (Rectangles) */}
            <div className="flex items-center gap-3 justify-center flex-wrap">
              <button className="text-yellow-500 text-2xl opacity-50 hover:opacity-100">◀</button>
              {[1.5, 2, 3, 5, 10].map(mult => (
                <GoldButton
                  key={mult}
                  variant="rectangle"
                  isActive={selectedMultiplier === mult}
                  onClick={() => setSelectedMultiplier(mult)}
                  disabled={isPlacingBet || isSpinning}
                  className="w-16 h-12 text-lg"
                >
                  {mult}x
                </GoldButton>
              ))}
              <button className="text-yellow-500 text-2xl opacity-50 hover:opacity-100">▶</button>
            </div>

            {/* Spin Button (Large Oval) */}
            <div className="mt-4">
              <motion.div
                animate={isSpinning ? {
                  scale: [1, 1.05, 1],
                } : {}}
                transition={{
                  duration: 0.8,
                  repeat: isSpinning ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                <GoldButton
                  variant="oval"
                  onClick={handleSpin}
                  disabled={isPlacingBet || isSpinning}
                  className="w-64 h-20 text-3xl tracking-widest"
                >
                  {isPlacingBet ? (
                    <div className="flex items-center gap-2">
                      <GoddessSpinner size={32} interval={500} />
                      <span className="text-lg">CONFIRMING...</span>
                    </div>
                  ) : isSpinning ? (
                    <span className="text-2xl">SPINNING...</span>
                  ) : (
                    'SPIN'
                  )}
                </GoldButton>
              </motion.div>
            </div>

            {/* Balance Display (Bottom Pill) */}
            {isConnected && (
              <div className="mt-4 px-6 py-2 rounded-full border border-yellow-700/50 bg-black/40 text-yellow-500 font-mono text-sm">
                BALANCE: {formatTokenAmount(BigInt(Math.floor(totalBalance * 100)))} HTR
              </div>
            )}

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
        <BetterLuck
          onComplete={() => setActiveAnimation(null)}
        />
      )}

      {/* Video Player for video animations */}
      {activeAnimation && activeAnimation.startsWith('video-') && betResult && (() => {
        const animationConfig = ANIMATIONS.find(a => a.id === activeAnimation);
        return animationConfig?.videoPath ? (
          <VideoPlayer
            videoPath={animationConfig.videoPath}
            result={betResult}
            payout={potentialPayout}
            token={selectedToken}
            onComplete={() => setActiveAnimation(null)}
          />
        ) : null;
      })()}

      {/* Authorization Required Popup */}
      {showAuthPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowAuthPopup(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <GoldFrame className="max-w-md mx-4" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="bg-[#1a0b2e] p-8 rounded-xl text-center relative">
              {/* Close Button */}
              <button
                onClick={() => setShowAuthPopup(false)}
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
