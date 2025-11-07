'use client';

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface IMetaMaskContext {
  address: string | null;
  isConnected: boolean;
  isInstalled: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  request: <T = any>(method: string, params?: any) => Promise<T>;
}

const MetaMaskContext = createContext<IMetaMaskContext>({} as IMetaMaskContext);

const SNAP_ID = 'npm:@hathor/wallet-snap';
const SNAP_VERSION = '*'; // Use latest version

export function MetaMaskProvider({ children }: { children: ReactNode | ReactNode[] }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Check if MetaMask is installed
  useEffect(() => {
    const checkMetaMask = () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        setIsInstalled(true);
      }
    };
    checkMetaMask();
  }, []);

  // Check persisted connection on mount
  useEffect(() => {
    const checkPersistedConnection = async () => {
      if (typeof window === 'undefined' || !window.ethereum) return;

      try {
        const walletType = localStorage.getItem('wallet_type');
        if (walletType !== 'metamask') return;

        // Check if snap is already connected
        const snaps = await window.ethereum.request({
          method: 'wallet_getSnaps',
        });

        if (snaps?.[SNAP_ID]) {
          // Get address from snap
          const result = await window.ethereum.request({
            method: 'wallet_invokeSnap',
            params: {
              snapId: SNAP_ID,
              request: {
                method: 'htr_getAddress',
                params: { network: 'testnet' },
              },
            },
          });

          if (result?.address) {
            setAddress(result.address);
            setIsConnected(true);
          }
        }
      } catch (error) {
        console.error('Failed to check persisted MetaMask connection:', error);
      }
    };

    checkPersistedConnection();
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask extension.');
    }

    try {
      // Request snap connection
      const result = await window.ethereum.request({
        method: 'wallet_requestSnaps',
        params: {
          [SNAP_ID]: {
            version: SNAP_VERSION,
          },
        },
      });

      if (!result?.[SNAP_ID]) {
        throw new Error('Failed to connect to Hathor Snap');
      }

      // Get address from snap
      const addressResult = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
          snapId: SNAP_ID,
          request: {
            method: 'htr_getAddress',
            params: { network: 'testnet' },
          },
        },
      });

      if (!addressResult?.address) {
        throw new Error('Failed to get address from snap');
      }

      setAddress(addressResult.address);
      setIsConnected(true);
      localStorage.setItem('wallet_type', 'metamask');
      localStorage.setItem('metamask_address', addressResult.address);
    } catch (error: any) {
      console.error('Failed to connect to MetaMask Snap:', error);
      throw new Error(error?.message || 'Failed to connect to MetaMask Snap');
    }
  }, []);

  const disconnect = useCallback(async () => {
    setAddress(null);
    setIsConnected(false);
    localStorage.removeItem('wallet_type');
    localStorage.removeItem('metamask_address');
  }, []);

  const request = useCallback(
    async <T = any,>(method: string, params?: any): Promise<T> => {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      if (!isConnected) {
        throw new Error('MetaMask Snap is not connected');
      }

      try {
        const result = await window.ethereum.request({
          method: 'wallet_invokeSnap',
          params: {
            snapId: SNAP_ID,
            request: {
              method,
              params,
            },
          },
        });

        return result as T;
      } catch (error: any) {
        console.error('MetaMask Snap request failed:', error);
        throw new Error(error?.message || 'MetaMask Snap request failed');
      }
    },
    [isConnected]
  );

  const value = useMemo(
    () => ({
      address,
      isConnected,
      isInstalled,
      connect,
      disconnect,
      request,
    }),
    [address, isConnected, isInstalled, connect, disconnect, request]
  );

  return <MetaMaskContext.Provider value={value}>{children}</MetaMaskContext.Provider>;
}

export function useMetaMask() {
  const context = useContext(MetaMaskContext);
  if (context === undefined) {
    throw new Error('useMetaMask must be used within a MetaMaskProvider');
  }
  return context;
}
