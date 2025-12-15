'use client';

import { useWallet } from '@/contexts/WalletContext';
import { formatBalanceWithCommas } from '@/lib/utils';

interface BalanceCardProps {
  selectedToken: string;
}

export default function BalanceCard({ selectedToken }: BalanceCardProps) {
  const { walletBalance, contractBalance } = useWallet();
  const contractBalanceInTokens = Number(contractBalance) / 100;
  const totalBalance = walletBalance + contractBalanceInTokens;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 mb-6">
      <div className="text-lg font-bold text-white mb-4">
        YOUR BALANCE
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Wallet Balance:</span>
          <span className="text-white font-medium">
            {formatBalanceWithCommas(walletBalance)} {selectedToken}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400">Contract Balance:</span>
          <span className="text-white font-medium">
            {formatBalanceWithCommas(contractBalanceInTokens)} {selectedToken}
          </span>
        </div>

        <div className="h-px bg-slate-700 my-2"></div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400">Available to Bet:</span>
          <span className="text-green-400 font-bold text-lg">
            {formatBalanceWithCommas(totalBalance)} {selectedToken}
          </span>
        </div>
      </div>
    </div>
  );
}
