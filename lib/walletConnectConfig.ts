export const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

export const WALLETCONNECT_METADATA = {
  name: 'HathorDice DApp',
  description: 'Decentralized dice game on Hathor Network',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://hathordice.app',
  icons: [typeof window !== 'undefined' ? `${window.location.origin}/icon.png` : 'https://hathordice.app/icon.png'],
};

export const RELAY_URL = 'wss://relay.walletconnect.com';
