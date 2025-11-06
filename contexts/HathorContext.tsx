'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { HathorRPCService } from '@/lib/hathorRPC';
import { HathorCoreAPI } from '@/lib/hathorCoreAPI';
import { ContractState } from '@/types/hathor';
import { config, Network } from '@/lib/config';

interface HathorContextType {
  isConnected: boolean;
  address: string | null;
  balance: number;
  network: Network;
  contractState: ContractState | null;
  rpcService: HathorRPCService;
  coreAPI: HathorCoreAPI;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (network: Network) => Promise<void>;
  refreshContractState: () => Promise<void>;
  placeBet: (betAmount: number, threshold: number) => Promise<any>;
}

const HathorContext = createContext<HathorContextType | undefined>(undefined);

export function HathorProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [network, setNetwork] = useState<Network>(config.defaultNetwork);
  const [contractState, setContractState] = useState<ContractState | null>(null);
  const [rpcService] = useState(() => new HathorRPCService(config.useMockWallet));
  const [coreAPI, setCoreAPI] = useState(() => new HathorCoreAPI(network));

  useEffect(() => {
    setCoreAPI(new HathorCoreAPI(network));
  }, [network]);

  useEffect(() => {
    if (isConnected) {
      refreshContractState();
    }
  }, [isConnected, network]);

  const connectWallet = async () => {
    try {
      const networkInfo = await rpcService.getConnectedNetwork();
      const addressInfo = await rpcService.getAddress({
        network: networkInfo.network,
        type: 'first_empty',
      });
      const balanceInfo = await rpcService.getBalance({
        network: networkInfo.network,
        tokens: ['00'],
      });

      setAddress(addressInfo.address);
      setBalance(balanceInfo[0]?.balance?.unlocked || 0);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    setBalance(0);
  };

  const switchNetwork = async (newNetwork: Network) => {
    setNetwork(newNetwork);
    if (isConnected) {
      await refreshContractState();
    }
  };

  const refreshContractState = async () => {
    if (config.contractIds.length === 0) return;
    
    try {
      const state = await coreAPI.getContractState(config.contractIds[0]);
      setContractState(state);
    } catch (error) {
      console.error('Failed to fetch contract state:', error);
    }
  };

  const placeBet = async (betAmount: number, threshold: number) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    if (!contractState) {
      throw new Error('Contract state not loaded');
    }

    const amountInCents = Math.floor(betAmount * 100);

    const params = {
      method: 'place_bet',
      nc_id: config.contractIds[0],
      actions: [
        {
          type: 'deposit' as const,
          amount: amountInCents.toString(),
          token: contractState.token_uid,
          address,
        },
      ],
      args: [amountInCents, threshold],
      push_tx: true,
    };

    return rpcService.sendNanoContractTx(params);
  };

  return (
    <HathorContext.Provider
      value={{
        isConnected,
        address,
        balance,
        network,
        contractState,
        rpcService,
        coreAPI,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        refreshContractState,
        placeBet,
      }}
    >
      {children}
    </HathorContext.Provider>
  );
}

export function useHathor() {
  const context = useContext(HathorContext);
  if (context === undefined) {
    throw new Error('useHathor must be used within a HathorProvider');
  }
  return context;
}
