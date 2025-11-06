export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ')
}

export const HOUSE_EDGE = 0.02;
export const MAX_THRESHOLD = 65535;
export const MIN_THRESHOLD = 1;

export const TOKENS = [
  { value: 'HTR', label: 'HTR' },
  { value: 'USDC', label: 'USDC' },
  { value: 'custom', label: 'Custom...' },
];

export function calculateMultiplier(threshold: number, randomBitLength: number = 16, houseEdgeBasisPoints: number = 200): number {
  const maxValue = Math.pow(2, randomBitLength);
  const houseEdge = houseEdgeBasisPoints / 10000;
  return (maxValue / threshold) * (1 - houseEdge);
}

export function calculatePayout(betAmount: number, threshold: number, randomBitLength: number = 16, houseEdgeBasisPoints: number = 200): number {
  const numerator = betAmount * Math.pow(2, randomBitLength) * (10000 - houseEdgeBasisPoints);
  const denominator = 10000 * threshold;
  return Math.floor(numerator / denominator);
}

export function thresholdToWinChance(threshold: number, randomBitLength: number = 16): number {
  const maxValue = Math.pow(2, randomBitLength);
  return (threshold / maxValue) * 100;
}

export function winChanceToThreshold(winChance: number, randomBitLength: number = 16): number {
  const maxValue = Math.pow(2, randomBitLength);
  return Math.floor(winChance * maxValue / 100);
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

export function formatTokenAmount(amount: number, decimals: number = 2): string {
  return (amount / 100).toFixed(decimals);
}
