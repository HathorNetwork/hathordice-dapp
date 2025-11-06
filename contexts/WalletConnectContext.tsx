'use client';

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Client from '@walletconnect/sign-client';
import { PairingTypes, SessionTypes } from '@walletconnect/types';
import { Web3Modal } from '@web3modal/standalone';
import { getSdkError } from '@walletconnect/utils';
import { WALLETCONNECT_PROJECT_ID } from '@/lib/walletConnectConfig';
import { initializeWalletConnectClient } from '@/lib/walletConnectClient';

interface IWalletConnectContext {
  client: Client | undefined;
  session: SessionTypes.Struct | undefined;
  connect: (pairing?: { topic: string }) => Promise<void>;
  disconnect: () => Promise<void>;
  chains: string[];
  pairings: PairingTypes.Struct[];
  accounts: string[];
  setChains: React.Dispatch<React.SetStateAction<string[]>>;
  getFirstAddress: () => string;
  isConnected: boolean;
}

const WalletConnectContext = createContext<IWalletConnectContext>({} as IWalletConnectContext);

const web3Modal = new Web3Modal({
  projectId: WALLETCONNECT_PROJECT_ID,
  themeMode: 'dark',
  walletConnectVersion: 2,
});

export function WalletConnectProvider({ children }: { children: ReactNode | ReactNode[] }) {
  const [client, setClient] = useState<Client>();
  const [pairings, setPairings] = useState<PairingTypes.Struct[]>([]);
  const [session, setSession] = useState<SessionTypes.Struct>();
  const [accounts, setAccounts] = useState<string[]>([]);
  const [chains, setChains] = useState<string[]>([]);
  const [clientInitialized, setClientInitialized] = useState(false);

  const reset = () => {
    setSession(undefined);
    setAccounts([]);
    setChains([]);
  };

  const onSessionConnected = useCallback(async (_session: SessionTypes.Struct) => {
    const allNamespaceAccounts = Object.values(_session.namespaces)
      .map((namespace) => namespace.accounts)
      .flat();
    const allNamespaceChains = Object.keys(_session.namespaces);

    setSession(_session);
    setChains(allNamespaceChains);
    setAccounts(allNamespaceAccounts);
  }, []);

  const getFirstAddress = useCallback(() => {
    if (!session?.namespaces?.hathor?.accounts?.[0]) {
      return '';
    }
    const [, , addr] = session.namespaces.hathor.accounts[0].split(':');
    return addr;
  }, [session]);

  const subscribeToEvents = useCallback(
    async (_client: Client) => {
      if (!_client) {
        throw new Error('WalletConnect is not initialized');
      }

      _client.on('session_ping', (args) => {
        console.log('EVENT', 'session_ping', args);
      });

      _client.on('session_event', (args) => {
        console.log('EVENT', 'session_event', args);
      });

      _client.on('session_update', ({ topic, params }) => {
        console.log('EVENT', 'session_update', { topic, params });
        const { namespaces } = params;
        const _session = _client.session.get(topic);
        const updatedSession = { ..._session, namespaces };
        onSessionConnected(updatedSession);
      });

      _client.on('session_delete', () => {
        console.log('EVENT', 'session_delete');
        reset();
      });
    },
    [onSessionConnected]
  );

  const checkPersistedState = useCallback(
    async (_client: Client) => {
      if (!_client) {
        throw new Error('WalletConnect is not initialized');
      }
      setPairings(_client.pairing.getAll({ active: true }));

      if (session) return;
      if (_client.session.length) {
        const lastKeyIndex = _client.session.keys.length - 1;
        const _session = _client.session.get(_client.session.keys[lastKeyIndex]);
        await onSessionConnected(_session);
        return _session;
      }
    },
    [session, onSessionConnected]
  );

  useEffect(() => {
    if (client && !clientInitialized) {
      (async () => {
        try {
          await subscribeToEvents(client);
          await checkPersistedState(client);
          setClientInitialized(true);
        } catch (error) {
          console.error('Failed to setup WalletConnect:', error);
        }
      })();
    }
  }, [client, clientInitialized, subscribeToEvents, checkPersistedState]);

  const connect = useCallback(
    async (pairing: { topic: string } | undefined) => {
      let _client = client;

      if (!_client) {
        try {
          _client = await initializeWalletConnectClient();
          setClient(_client);
          await subscribeToEvents(_client);
          await checkPersistedState(_client);
        } catch (error) {
          console.error('Failed to initialize WalletConnect:', error);
          throw error;
        }
      }

      if (session) {
        return;
      }

      let unsubscribe: (() => void) | undefined;

      try {
        const requiredNamespaces = {
          hathor: {
            methods: [
              'htr_getAddress',
              'htr_getBalance',
              'htr_getUtxos',
              'htr_signWithAddress',
              'htr_sendNanoContractTx',
            ],
            chains: ['hathor:testnet'],
            events: [],
          },
        };

        const { uri, approval } = await _client.connect({
          pairingTopic: pairing?.topic,
          requiredNamespaces,
        });

        if (uri) {
          const standaloneChains = Object.values(requiredNamespaces)
            .map((namespace) => namespace.chains)
            .flat() as string[];

          web3Modal.openModal({ uri, standaloneChains });
        }

        const modalClosedPromise = new Promise<never>((_, reject) => {
          unsubscribe = web3Modal.subscribeModal((state) => {
            if (!state.open) {
              reject(new Error('User closed the modal'));
            }
          });
        });

        const session = await Promise.race([approval(), modalClosedPromise]);
        await onSessionConnected(session);
        setPairings(_client.pairing.getAll({ active: true }));
      } catch (e) {
        console.error('Failed to connect:', e);
        throw e;
      } finally {
        if (unsubscribe) {
          unsubscribe();
        }
        web3Modal.closeModal();
      }
    },
    [client, session, onSessionConnected, subscribeToEvents, checkPersistedState]
  );

  const disconnect = useCallback(async () => {
    if (!client) {
      throw new Error('WalletConnect is not initialized');
    }
    if (!session) {
      throw new Error('Session is not connected');
    }

    try {
      await client.disconnect({
        topic: session.topic,
        reason: getSdkError('USER_DISCONNECTED'),
      });
    } catch (error) {
      console.error('SignClient.disconnect failed:', error);
    } finally {
      reset();
    }
  }, [client, session]);

  const value = useMemo(
    () => ({
      pairings,
      accounts,
      chains,
      client,
      session,
      connect,
      disconnect,
      getFirstAddress,
      setChains,
      isConnected: !!session,
    }),
    [pairings, accounts, chains, client, session, connect, disconnect, getFirstAddress, setChains]
  );

  return <WalletConnectContext.Provider value={value}>{children}</WalletConnectContext.Provider>;
}

export function useWalletConnect() {
  const context = useContext(WalletConnectContext);
  if (context === undefined) {
    throw new Error('useWalletConnect must be used within a WalletConnectProvider');
  }
  return context;
}
