'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletState } from '@/types';
import { HathorRPCService } from '@/lib/hathorRPC';
import { useUnifiedWallet } from './UnifiedWalletContext';
import { config } from '@/lib/config';

interface WalletContextType {
  connected: boolean;
  address: string | null;
  balance: bigint;
  walletBalance: number;
  contractBalance: bigint;
  balanceVerified: boolean;
  isLoadingBalance: boolean;
  setContractBalance: (balance: bigint) => void;
  connectWallet: () => void;
  disconnectWallet: () => void;
  setBalance: (balance: bigint) => void;
  placeBet: (betAmount: number, threshold: number, token: string, contractId: string, tokenUid: string, contractBalance: bigint) => Promise<any>;
  addLiquidity: (amount: number, token: string, contractId: string, tokenUid: string) => Promise<any>;
  removeLiquidity: (amount: number, token: string, contractId: string, tokenUid: string) => Promise<any>;
  claimBalance: (amount: number, token: string, contractId: string, tokenUid: string) => Promise<any>;
  refreshBalance: (tokenUid?: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const BALANCE_CACHE_KEY = 'hathor_balance_cache';
const BALANCE_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

interface BalanceCache {
  balance: string; // Store as string since bigint can't be JSON serialized
  timestamp: number;
  address: string;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const { adapter } = useUnifiedWallet();
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint>(0n);
  const [contractBalance, setContractBalance] = useState<bigint>(0n);
  const [balanceVerified, setBalanceVerified] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [rpcService] = useState(() => new HathorRPCService(config.useMockWallet));

  // Load cached balance from localStorage
  const loadCachedBalance = (addr: string): bigint | null => {
    try {
      const cached = localStorage.getItem(BALANCE_CACHE_KEY);
      if (!cached) return null;

      const cache: BalanceCache = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is for the same address and is still valid (less than 15 minutes old)
      if (cache.address === addr && (now - cache.timestamp) < BALANCE_CACHE_DURATION) {
        return BigInt(cache.balance);
      }

      return null;
    } catch (error) {
      console.error('Failed to load cached balance:', error);
      return null;
    }
  };

  // Save balance to cache
  const saveCachedBalance = (addr: string, bal: bigint) => {
    try {
      const cache: BalanceCache = {
        balance: bal.toString(),
        timestamp: Date.now(),
        address: addr,
      };
      localStorage.setItem(BALANCE_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to save cached balance:', error);
    }
  };

  // Define fetchBalance before it's used in useEffect
  const fetchBalance = async (addr: string, forceRefresh: boolean = false, tokenUid: string = '00') => {
    if (!addr) return;

    // Don't use cache - always fetch fresh balance to ensure authorization
    if (config.useMockWallet) {
      setBalance(100000n);
      setBalanceVerified(true);
      saveCachedBalance(addr, 100000n);
      return;
    }

    setIsLoadingBalance(true);
    setBalanceVerified(false); // Reset verified state while fetching new balance
    try {
      const balanceInfo = await rpcService.getBalance({
        network: 'testnet',
        tokens: [tokenUid],
      });

      console.log('Balance response:', balanceInfo);

      // Handle both direct response and nested response format (MetaMask Snap wraps response)
      const responseData = (balanceInfo as any)?.response?.response || balanceInfo?.response;
      const balanceData = responseData?.[0]?.balance?.unlocked;

      // Convert to bigint - value is already in cents from API
      const balanceValue = typeof balanceData === 'number'
        ? BigInt(Math.floor(balanceData))
        : (typeof balanceData === 'bigint' ? balanceData : 0n);

      console.log('Parsed balance:', balanceValue.toString());

      setBalance(balanceValue);
      setBalanceVerified(true);
      saveCachedBalance(addr, balanceValue);
    } catch (error: any) {
      console.log('Balance fetch was rejected or failed:', error);
      setBalance(0n);
      setBalanceVerified(false);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Update rpcService and fetch balance when wallet connects
  useEffect(() => {
    console.log('WalletContext useEffect - adapter state:', {
      isConnected: adapter?.isConnected,
      address: adapter?.address,
      hasRequest: !!adapter?.request,
    });

    if (adapter?.isConnected && adapter.address) {
      // Update rpcService with adapter's request function
      console.log('Updating rpcService with adapter.request');
      rpcService.updateClientAndSession(undefined, undefined, adapter.request);
      // Update address - balance fetch is handled by page.tsx with correct token
      setAddress(adapter.address);
    } else if (!adapter?.isConnected) {
      setAddress(null);
      setBalance(0n);
    }
  }, [adapter?.isConnected, adapter?.address, adapter?.request, rpcService]);

  // Convert balance from cents (bigint) to token units (number) for backwards compatibility
  const walletBalance = typeof balance === 'bigint' ? Number(balance) / 100 : 0;

  const connectWallet = () => {
    setConnected(true);
    setAddress('0x7a3f...9b2c');
    setBalance(100000n);
    setContractBalance(34275n);
  };

  const disconnectWallet = () => {
    setConnected(false);
    setAddress(null);
    setBalance(0n);
    setContractBalance(0n);
    setBalanceVerified(false);
    setIsLoadingBalance(false);
  };

  const placeBet = async (betAmount: number, threshold: number, token: string, contractId: string, tokenUid: string, currentContractBalance: bigint) => {
    if (!adapter?.isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    const amountInCents = Math.floor(betAmount * 100);
    const contractBalanceInCents = Number(currentContractBalance);

    // Calculate how much we need to deposit: bet amount - contract balance
    // If contract balance covers the bet, depositAmount will be 0 or negative (no deposit needed)
    const depositAmount = Math.max(0, amountInCents - contractBalanceInCents);

    console.log('Placing bet:', {
      betAmount,
      threshold,
      token,
      contractId,
      address,
      amountInCents,
      contractBalanceInCents,
      depositAmount,
    });

    // Build actions array - only include deposit if needed
    const actions = [];
    if (depositAmount > 0) {
      actions.push({
        type: 'deposit' as const,
        amount: depositAmount.toString(),
        token: tokenUid,
      });
    }

    const params = {
      network: 'testnet',
      nc_id: contractId,
      method: 'place_bet',
      args: [amountInCents, threshold],
      actions,
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
    if (!adapter?.isConnected || !address) {
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

  const removeLiquidity = async (amount: number, token: string, contractId: string, tokenUid: string) => {
    if (!adapter?.isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    const amountInCents = Math.floor(amount * 100);

    console.log('Removing liquidity:', {
      amount,
      token,
      contractId,
      address,
      amountInCents,
    });

    const params = {
      network: 'testnet',
      nc_id: contractId,
      method: 'remove_liquidity',
      args: [],
      actions: [
        {
          type: 'withdrawal' as const,
          amount: amountInCents.toString(),
          token: tokenUid,
          address: address,
        },
      ],
      push_tx: true,
    };

    console.log('Sending remove_liquidity nano contract tx with params:', params);

    try {
      const result = await rpcService.sendNanoContractTx(params);
      console.log('Liquidity removed successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to remove liquidity:', error);
      throw error;
    }
  };

  const claimBalance = async (amount: number, token: string, contractId: string, tokenUid: string) => {
    if (!adapter?.isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    const amountInCents = Math.floor(amount * 100);

    console.log('Claiming balance:', {
      amount,
      token,
      contractId,
      address,
      amountInCents,
    });

    const params = {
      network: 'testnet',
      nc_id: contractId,
      method: 'claim_balance',
      args: [],
      actions: [
        {
          type: 'withdrawal' as const,
          amount: amountInCents.toString(),
          token: tokenUid,
          address: address,
        },
      ],
      push_tx: true,
    };

    console.log('Sending claim_balance nano contract tx with params:', params);

    try {
      const result = await rpcService.sendNanoContractTx(params);
      console.log('Balance claimed successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to claim balance:', error);
      throw error;
    }
  };

  const refreshBalance = async (tokenUid: string = '00') => {
    if (address) {
      await fetchBalance(address, true, tokenUid); // Force refresh
    }
  };

  return (
    <WalletContext.Provider value={{
      connected,
      address,
      balance,
      walletBalance,
      contractBalance,
      balanceVerified,
      isLoadingBalance,
      setContractBalance,
      connectWallet,
      disconnectWallet,
      setBalance,
      placeBet,
      addLiquidity,
      removeLiquidity,
      claimBalance,
      refreshBalance,
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
