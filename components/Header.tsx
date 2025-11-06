'use client';

import { useWallet } from '@/contexts/WalletContext';
import { formatAddress } from '@/lib/utils';

export default function Header() {
  const { connected, address, connectWallet, disconnectWallet } = useWallet();

  return (
    <header className="flex items-center justify-between p-6 border-b border-slate-700">
      <div className="flex items-center gap-4">
        <div className="text-4xl">🎲</div>
        <div>
          <h1 className="text-2xl font-bold text-white">HATHOR DICE</h1>
          <p className="text-sm text-slate-400">Provably Fair Betting</p>
        </div>
      </div>
      
      {connected ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-sm text-slate-300">{formatAddress(address || '')}</span>
          </div>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Connect Wallet
        </button>
      )}
    </header>
  );
}
