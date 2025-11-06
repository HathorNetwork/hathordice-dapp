'use client';

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { formatNumber } from '@/lib/utils';

interface WithdrawCardProps {
  selectedToken: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function WithdrawCard({ selectedToken, isExpanded, onToggle }: WithdrawCardProps) {
  const { contractBalance } = useWallet();
  const [amount, setAmount] = useState(contractBalance);

  const setMaxAmount = () => {
    setAmount(contractBalance);
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
      >
        <span className="text-white font-medium">🏦 WITHDRAW BALANCE</span>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>
      
      {isExpanded && (
        <div className="p-6 border-t border-slate-700 space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Amount</label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="flex-1 bg-transparent text-white outline-none"
                min="0"
                step="0.01"
              />
              <span className="text-slate-400">{selectedToken}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={setMaxAmount} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors">MAX</button>
            </div>
            <div className="text-sm text-slate-400 mt-2">
              Available: {formatNumber(contractBalance)} {selectedToken}
            </div>
          </div>

          <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            🏦 Withdraw
          </button>
        </div>
      )}
    </div>
  );
}
