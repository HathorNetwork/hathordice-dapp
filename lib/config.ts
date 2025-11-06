export const config = {
  useMockWallet: process.env.NEXT_PUBLIC_USE_MOCK_WALLET === 'true',
  defaultNetwork: (process.env.NEXT_PUBLIC_DEFAULT_NETWORK || 'india-testnet') as 'mainnet' | 'india-testnet',
  hathorNodeUrls: {
    'india-testnet': process.env.NEXT_PUBLIC_HATHOR_NODE_URL_TESTNET || 'https://node1.india-testnet.hathor.network/v1a',
    'mainnet': process.env.NEXT_PUBLIC_HATHOR_NODE_URL_MAINNET || 'https://node1.mainnet.hathor.network/v1a',
  },
  contractIds: JSON.parse(process.env.NEXT_PUBLIC_CONTRACT_IDS || '[]') as string[],
};

export type Network = 'mainnet' | 'india-testnet';
