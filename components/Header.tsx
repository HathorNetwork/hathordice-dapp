'use client';

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useHathor } from '@/contexts/HathorContext';
import { formatAddress } from '@/lib/utils';
import { WalletConnectionModal } from './WalletConnectionModal';

export default function Header() {
  const { connected, address, disconnectWallet } = useWallet();
  const { isConnected, address: hathorAddress, connectWallet: hathorConnect, disconnectWallet: hathorDisconnect } = useHathor();
  const [showModal, setShowModal] = useState(false);

  const handleConnect = async () => {
    setShowModal(true);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    hathorDisconnect();
  };

  const displayAddress = hathorAddress || address;
  const isWalletConnected = isConnected || connected;

  return (
    <>
      <header className="flex items-center justify-between p-6 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🎲</div>
          <div>
            <h1 className="text-2xl font-bold text-white">HATHOR DICE</h1>
            <p className="text-sm text-slate-400">Provably Fair Betting</p>
          </div>
        </div>

        {isWalletConnected ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm text-slate-300">{formatAddress(displayAddress || '')}</span>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Connect Wallet
          </button>
        )}
      </header>

      <WalletConnectionModal
        open={showModal}
        onOpenChange={setShowModal}
        onConnect={hathorConnect}
      />
    </>
  );
}
