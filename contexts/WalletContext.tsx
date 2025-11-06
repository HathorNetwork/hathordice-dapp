'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WalletState } from '@/types';

interface WalletContextType extends WalletState {
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    address: null,
    walletBalance: 0,
    contractBalance: 0,
  });

  const connectWallet = () => {
    setWalletState({
      connected: true,
      address: '0x7a3f...9b2c',
      walletBalance: 1250.50,
      contractBalance: 342.75,
    });
  };

  const disconnectWallet = () => {
    setWalletState({
      connected: false,
      address: null,
      walletBalance: 0,
      contractBalance: 0,
    });
  };

  return (
    <WalletContext.Provider value={{ ...walletState, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
