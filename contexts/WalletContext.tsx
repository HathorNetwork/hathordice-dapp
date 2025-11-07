'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletState } from '@/types';
import { HathorRPCService } from '@/lib/hathorRPC';
import { useWalletConnect } from './WalletConnectContext';
import { config } from '@/lib/config';

interface WalletContextType {
  connected: boolean;
  address: string | null;
  balance: bigint;
  walletBalance: number;
  contractBalance: number;
  connectWallet: () => void;
  disconnectWallet: () => void;
  setBalance: (balance: bigint) => void;
  placeBet: (betAmount: number, threshold: number, token: string, contractId: string, tokenUid: string) => Promise<any>;
  addLiquidity: (amount: number, token: string, contractId: string, tokenUid: string) => Promise<any>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const walletConnect = useWalletConnect();
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint>(0n);
  const [contractBalance, setContractBalance] = useState(0);
  const [rpcService] = useState(() => new HathorRPCService(config.useMockWallet, walletConnect.client, walletConnect.session));

  // Define fetchBalance before it's used in useEffect
  const fetchBalance = async (addr: string) => {
    if (!addr) return;
    if (config.useMockWallet) {
      setBalance(100000n);
      return;
    }
    try {
      const balanceInfo = await rpcService.getBalance({
        network: 'testnet',
        tokens: ['00'],
      });
      const balance = balanceInfo.response[0]?.balance?.unlocked || 0n;
      setBalance(balance);
    } catch (error: any) {
      console.log('Balance fetch was rejected or failed. This is normal if the wallet requires manual approval.');
      setBalance(0n);
    }
  };

  // Update rpcService when walletConnect changes
  useEffect(() => {
    rpcService.updateClientAndSession(walletConnect.client, walletConnect.session);
  }, [walletConnect.client, walletConnect.session, rpcService]);

  // Auto-fetch balance when wallet connects
  useEffect(() => {
    if (walletConnect.isConnected) {
      const addr = walletConnect.getFirstAddress?.();
      if (addr) {
        setAddress(addr);
        fetchBalance(addr);
      }
    } else {
      setAddress(null);
      setBalance(0n);
    }
  }, [walletConnect.isConnected]);

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

  const placeBet = async (betAmount: number, threshold: number, token: string, contractId: string, tokenUid: string) => {
    if (!walletConnect.isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    const amountInCents = Math.floor(betAmount * 100);

    console.log('Placing bet:', {
      betAmount,
      threshold,
      token,
      contractId,
      address,
      amountInCents,
    });

    const params = {
      network: 'testnet',
      nc_id: contractId,
      method: 'place_bet',
      args: [amountInCents, threshold],
      actions: [
        {
          type: 'deposit' as const,
          amount: amountInCents.toString(),
          token: tokenUid,
        },
      ],
      push_tx: true,
    };

    console.log('Sending nano contract tx with params:', params);

    try {
      const result = await rpcService.sendNanoContractTx(params);
      console.log('Bet placed successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to place bet:', error);
      throw error;
    }
  };

  const addLiquidity = async (amount: number, token: string, contractId: string, tokenUid: string) => {
    if (!walletConnect.isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    const amountInCents = Math.floor(amount * 100);

    console.log('Adding liquidity:', {
      amount,
      token,
      contractId,
      address,
      amountInCents,
    });

    const params = {
      network: 'testnet',
      nc_id: contractId,
      method: 'add_liquidity',
      args: [],
      actions: [
        {
          type: 'deposit' as const,
          amount: amountInCents.toString(),
          token: tokenUid,
        },
      ],
      push_tx: true,
    };

    console.log('Sending add_liquidity nano contract tx with params:', params);

    try {
      const result = await rpcService.sendNanoContractTx(params);
      console.log('Liquidity added successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to add liquidity:', error);
      throw error;
    }
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
      setBalance,
      placeBet,
      addLiquidity,
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
