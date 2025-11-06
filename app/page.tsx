'use client';

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import Header from '@/components/Header';
import BalanceCard from '@/components/BalanceCard';
import RecentBetsTable from '@/components/RecentBetsTable';
import TokenSelector from '@/components/TokenSelector';
import PlaceBetCard from '@/components/PlaceBetCard';
import AddLiquidityCard from '@/components/AddLiquidityCard';
import RemoveLiquidityCard from '@/components/RemoveLiquidityCard';
import WithdrawCard from '@/components/WithdrawCard';
import { Bet } from '@/types';

const mockBets: Bet[] = [
  {
    id: '1',
    player: '0x7a3f...9b2c',
    amount: 100,
    threshold: 32768,
    result: 'win',
    payout: 195.31,
    token: 'HTR',
    timestamp: Date.now(),
    isYourBet: true,
  },
  {
    id: '2',
    player: '0x9f2a...3c1d',
    amount: 50,
    threshold: 16384,
    result: 'lose',
    payout: 0,
    token: 'HTR',
    timestamp: Date.now() - 120000,
  },
  {
    id: '3',
    player: '0x7a3f...9b2c',
    amount: 200,
    threshold: 49152,
    result: 'win',
    payout: 266.24,
    token: 'HTR',
    timestamp: Date.now() - 300000,
    isYourBet: true,
  },
  {
    id: '4',
    player: '0x1c5b...7e8f',
    amount: 75,
    threshold: 8192,
    result: 'lose',
    payout: 0,
    token: 'HTR',
    timestamp: Date.now() - 450000,
  },
  {
    id: '5',
    player: '0x6d9a...2f4b',
    amount: 150,
    threshold: 40960,
    result: 'win',
    payout: 239.06,
    token: 'HTR',
    timestamp: Date.now() - 600000,
  },
];

export default function Home() {
  const { connected } = useWallet();
  const [selectedToken, setSelectedToken] = useState('HTR');
  const [expandedCard, setExpandedCard] = useState<string | null>('placeBet');

  const handleCardToggle = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {connected && <BalanceCard selectedToken={selectedToken} />}
            <RecentBetsTable bets={mockBets} />
          </div>
          
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">🎮 GAME ACTIONS</h2>
                <TokenSelector selectedToken={selectedToken} onTokenChange={setSelectedToken} />
              </div>
              
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
