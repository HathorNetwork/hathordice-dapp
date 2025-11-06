'use client';

import { useState } from 'react';
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

export default function Home() {
  const { connected } = useWallet();
  const { network, getContractStateForToken, switchNetwork, isConnected } = useHathor();
  const [selectedToken, setSelectedToken] = useState('HTR');
  const [expandedCard, setExpandedCard] = useState<string | null>('placeBet');

  const handleCardToggle = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
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