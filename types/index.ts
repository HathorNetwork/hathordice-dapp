export interface Bet {
  id: string;
  player: string;
  amount: number;
  threshold: number;
  luckyNumber?: number;
  result: 'win' | 'lose' | 'pending' | 'failed';
  payout: number;
  potentialPayout?: number;
  token: string;
  timestamp: number;
  isYourBet?: boolean;
  contractId?: string;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  walletBalance: number;
  contractBalance: number;
}

export interface GameState {
  selectedToken: string;
  betAmount: number;
  betMode: 'threshold' | 'chance';
  winChance: number;
  threshold: number;
  multiplier: number;
  potentialPayout: number;
}
