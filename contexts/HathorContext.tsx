'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { HathorCoreAPI } from '@/lib/hathorCoreAPI';
import { ContractState } from '@/types/hathor';
import { config, Network } from '@/lib/config';
import { Bet } from '@/types';
import { useWalletConnect } from './WalletConnectContext';
import { useMetaMask } from './MetaMaskContext';
import { useWallet } from './WalletContext';

interface HathorContextType {
  isConnected: boolean;
  address: string | null;
  network: Network;
  contractStates: Record<string, ContractState>;
  getContractStateForToken: (token: string) => ContractState | null;
  getContractIdForToken: (token: string) => string | null;
  coreAPI: HathorCoreAPI;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  switchNetwork: (network: Network) => Promise<void>;
  refreshContractStates: () => Promise<void>;
  fetchRecentBets: () => Promise<Bet[]>;
}

const HathorContext = createContext<HathorContextType | undefined>(undefined);

const TOKEN_UID_MAP: Record<string, string> = {
  '00': 'HTR',
  '01': 'USDC',
};

const MOCK_CONTRACT_STATES: Record<string, ContractState> = {
  'HTR': {
    token_uid: '00',
    max_bet_amount: 10000n,
    house_edge_basis_points: 190,
    random_bit_length: 16,
    available_tokens: 100000000n,
    total_liquidity_provided: 100000000n,
  },
  'USDC': {
    token_uid: '01',
    max_bet_amount: 5000n,
    house_edge_basis_points: 250,
    random_bit_length: 20,
    available_tokens: 50000000n,
    total_liquidity_provided: 50000000n,
  },
};

export function HathorProvider({ children }: { children: ReactNode }) {
  const walletConnect = useWalletConnect();
  const metaMask = useMetaMask();
  const wallet = useWallet();
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<Network>(config.defaultNetwork);
  const [contractStates, setContractStates] = useState<Record<string, ContractState>>({});
  const [tokenContractMap, setTokenContractMap] = useState<Record<string, string>>({});
  const [coreAPI, setCoreAPI] = useState(() => new HathorCoreAPI(network));

  const isConnected = walletConnect.isConnected || metaMask.isConnected;

  useEffect(() => {
    setCoreAPI(new HathorCoreAPI(network));
  }, [network]);

  useEffect(() => {
    refreshContractStates();
  }, []);

  useEffect(() => {
    if (isConnected) {
      refreshContractStates();
      // Get address from the connected wallet
      if (walletConnect.isConnected) {
        const addr = walletConnect.getFirstAddress();
        setAddress(addr);
      } else if (metaMask.isConnected) {
        setAddress(metaMask.address);
      }
    } else {
      setAddress(null);
      wallet.setBalance(0n);
    }
  }, [isConnected, network, walletConnect, metaMask]);

  const connectWallet = async () => {
    try {
      await walletConnect.connect();
      // walletConnect context will update isConnected and addresses; effect above will pick it up
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      // Disconnect whichever wallet is connected
      if (walletConnect.isConnected) {
        await walletConnect.disconnect();
      }
      if (metaMask.isConnected) {
        await metaMask.disconnect();
      }
      // Clear wallet type from localStorage
      localStorage.removeItem('wallet_type');
      // wallet contexts will update isConnected; effect above will clear address/balance
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      // don't rethrow to avoid breaking UI flows
    }
  };

  const switchNetwork = async (newNetwork: Network) => {
    setNetwork(newNetwork);
    // If WalletConnect supports network switching, attempt it
    if (typeof (walletConnect as any).switchNetwork === 'function') {
      try {
        await (walletConnect as any).switchNetwork(newNetwork);
      } catch (err) {
        console.warn('WalletConnect network switch failed (continuing with client-side network):', err);
      }
    }
    if (isConnected) {
      await refreshContractStates();
    }
  };

  const getContractStateForToken = (token: string): ContractState | null => {
    return contractStates[token] || null;
  };

  const getContractIdForToken = (token: string): string | null => {
    return tokenContractMap[token] || null;
  };

  const refreshContractStates = async () => {
    if (config.useMockWallet) {
      setContractStates(MOCK_CONTRACT_STATES);
      setTokenContractMap({
        'HTR': 'mock-contract-htr',
        'USDC': 'mock-contract-usdc',
      });
      return;
    }

    if (config.contractIds.length === 0) return;

    try {
      const states: Record<string, ContractState> = {};
      const map: Record<string, string> = {};
      for (const contractId of config.contractIds) {
        const state = await coreAPI.getContractState(contractId);
        const tokenName = TOKEN_UID_MAP[state.token_uid] || state.token_uid;
        states[tokenName] = state;
        map[tokenName] = contractId;
      }
      setContractStates(states);
      setTokenContractMap(map);
    } catch (error) {
      console.error('Failed to fetch contract states:', error);
    }
  };

  const fetchRecentBets = async (): Promise<Bet[]> => {
    if (config.useMockWallet) {
      return [
        {
          id: 'pending-1',
          player: address || '0x7a3f...9b2c',
          amount: 50,
          threshold: 32768,
          result: 'pending',
          payout: 0,
          potentialPayout: 97.66,
          token: 'HTR',
          timestamp: Date.now() - 5000,
          isYourBet: true,
        },
        {
          id: '1',
          player: '0x7a3f...9b2c',
          amount: 100,
          threshold: 32768,
          result: 'win',
          payout: 195.31,
          token: 'HTR',
          timestamp: Date.now() - 60000,
          isYourBet: true,
        },
        {
          id: '2',
          player: '0x9f2a...3c1d',
          amount: 50,
          threshold: 16384,
          result: 'lose',
          payout: 0,
          token: 'HTR',
          timestamp: Date.now() - 120000,
        },
        {
          id: 'failed-1',
          player: '0x5e8c...4d2a',
          amount: 250,
          threshold: 45000,
          result: 'failed',
          payout: 0,
          token: 'USDC',
          timestamp: Date.now() - 180000,
        },
        {
          id: '3',
          player: '0x7a3f...9b2c',
          amount: 200,
          threshold: 49152,
          result: 'win',
          payout: 266.24,
          token: 'HTR',
          timestamp: Date.now() - 300000,
          isYourBet: true,
        },
        {
          id: '4',
          player: '0x1c5b...7e8f',
          amount: 75,
          threshold: 8192,
          result: 'lose',
          payout: 0,
          token: 'USDC',
          timestamp: Date.now() - 450000,
        },
        {
          id: '5',
          player: '0x6d9a...2f4b',
          amount: 150,
          threshold: 40960,
          result: 'win',
          payout: 239.06,
          token: 'HTR',
          timestamp: Date.now() - 600000,
        },
      ];
    }

    try {
      const allBets: Bet[] = [];

      for (const contractId of config.contractIds) {
        const history = await coreAPI.getContractHistory(contractId, 20);

        for (const tx of history.transactions) {
          if (tx.nc_method === 'place_bet') {
            // Check if the bet is from the connected wallet
            const isYourBet = address && tx.nc_caller.toLowerCase() === address.toLowerCase();

            // If nc_args_decoded doesn't exist or is invalid, treat as pending
            let amount = 0;
            let threshold = 0;
            let hasPendingArgs = false;

            if (!tx.nc_args_decoded || tx.nc_args_decoded.length !== 2) {
              // Transaction is likely pending and doesn't have decoded args yet
              hasPendingArgs = true;
            } else {
              amount = tx.nc_args_decoded[0] / 100; // First argument is bet amount in cents
              threshold = tx.nc_args_decoded[1]; // Second argument is threshold
            }

            // Parse nc_events to extract lucky_number and payout
            let luckyNumber: number | undefined;
            let payout = 0;
            let potentialPayout: number | undefined;

            if (tx.nc_events && tx.nc_events.length === 1) {
              try {
                // Convert hex string to bytes, then to UTF-8 string, then parse JSON
                const hexString = tx.nc_events[0].data;
                const bytes = new Uint8Array(hexString.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
                const eventStr = new TextDecoder().decode(bytes);
                const eventData = JSON.parse(eventStr);

                luckyNumber = eventData.lucky_number;
                payout = eventData.payout ? eventData.payout / 100 : 0;
              } catch (error) {
                console.warn(`Failed to parse nc_events for transaction ${tx.tx_id}:`, error);
              }
            } else if (tx.nc_events && tx.nc_events.length !== 1) {
              console.warn(`Expected exactly 1 nc_event for transaction ${tx.tx_id}, got ${tx.nc_events.length}`);
            }

            const bet: Bet = {
              id: tx.tx_id,
              player: tx.nc_caller || 'Unknown',
              amount,
              threshold,
              luckyNumber,
              result: tx.is_voided ? 'failed' : (hasPendingArgs || !tx.first_block ? 'pending' : (payout > 0 ? 'win' : 'lose')),
              payout,
              potentialPayout,
              token: 'HTR',
              timestamp: tx.timestamp * 1000,
              contractId,
              isYourBet,
            };
            allBets.push(bet);
          }
        }
      }

      allBets.sort((a, b) => {
        if (a.result === 'pending' && b.result !== 'pending') return -1;
        if (a.result !== 'pending' && b.result === 'pending') return 1;
        return b.timestamp - a.timestamp;
      });

      return allBets;
    } catch (error) {
      console.error('Failed to fetch recent bets:', error);
      throw error;
    }
  };

  return (
    <HathorContext.Provider
      value={{
        isConnected,
        address,
        network,
        contractStates,
        getContractStateForToken,
        getContractIdForToken,
        coreAPI,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        refreshContractStates,
        fetchRecentBets,
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
