'use client';

import { useEffect, useState } from 'react';
import { initializeWalletConnectClient } from '@/lib/walletConnectClient';

export function WalletConnectInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeWalletConnectClient()
      .then(() => setIsInitialized(true))
      .catch((error) => {
        console.error('Failed to initialize WalletConnect:', error);
        setIsInitialized(true);
      });
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Initializing wallet connection...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
