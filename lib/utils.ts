export const HOUSE_EDGE = 0.02;
export const MAX_THRESHOLD = 65535;
export const MIN_THRESHOLD = 1;

export const TOKENS = [
  { value: 'HTR', label: 'HTR' },
  { value: 'USDC', label: 'USDC' },
];

export function calculateMultiplier(threshold: number): number {
  return (MAX_THRESHOLD + 1) / threshold * (1 - HOUSE_EDGE);
}

export function calculatePayout(betAmount: number, threshold: number): number {
  return betAmount * calculateMultiplier(threshold);
}

export function thresholdToWinChance(threshold: number): number {
  return (threshold / (MAX_THRESHOLD + 1)) * 100;
}

export function winChanceToThreshold(winChance: number): number {
  return Math.floor(winChance * (MAX_THRESHOLD + 1) / 100);
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}
