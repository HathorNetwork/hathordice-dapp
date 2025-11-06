'use client';

import { useWallet } from '@/contexts/WalletContext';
import { formatNumber } from '@/lib/utils';

interface BalanceCardProps {
  selectedToken: string;
}

export default function BalanceCard({ selectedToken }: BalanceCardProps) {
  const { walletBalance, contractBalance } = useWallet();
  const totalBalance = walletBalance + contractBalance;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 mb-6">
      <div className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        💰 YOUR BALANCE
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Wallet Balance:</span>
          <span className="text-white font-medium">
            {formatNumber(walletBalance)} {selectedToken}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Contract Balance:</span>
          <span className="text-white font-medium">
            {formatNumber(contractBalance)} {selectedToken}
          </span>
        </div>
        
        <div className="h-px bg-slate-700 my-2"></div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Available to Bet:</span>
          <span className="text-green-400 font-bold text-lg">
            {formatNumber(totalBalance)} {selectedToken}
          </span>
        </div>
      </div>
    </div>
  );
}
