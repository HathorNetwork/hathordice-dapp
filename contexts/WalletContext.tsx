'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletState } from '@/types';

interface WalletContextType {
  connected: boolean;
  address: string | null;
  balance: bigint;
  walletBalance: number;
  contractBalance: number;
  connectWallet: () => void;
  disconnectWallet: () => void;
  setBalance: (balance: bigint) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint>(0n);
  const [contractBalance, setContractBalance] = useState(0);

  // Convert balance from cents (bigint) to token units (number) for backwards compatibility
  const walletBalance = typeof balance === 'bigint' ? Number(balance) / 100 : 0;

  const connectWallet = () => {
    setConnected(true);
    setAddress('0x7a3f...9b2c');
    setBalance(100000n);
    setContractBalance(342.75);
  };

  const disconnectWallet = () => {
    setConnected(false);
    setAddress(null);
    setBalance(0n);
    setContractBalance(0);
  };

  return (
    <WalletContext.Provider value={{
      connected,
      address,
      balance,
      walletBalance,
      contractBalance,
      connectWallet,
      disconnectWallet,
      setBalance
    }}>
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
