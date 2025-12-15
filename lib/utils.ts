export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ')
}

export const HOUSE_EDGE = 0.019;
export const MAX_THRESHOLD = 65535;
export const MIN_THRESHOLD = 1;

export const TOKENS = [
  { value: 'HTR', label: 'HTR' },
];

export function calculateMultiplier(threshold: number, randomBitLength: number = 16, houseEdgeBasisPoints: number = 190): number {
  const maxValue = Math.pow(2, randomBitLength);
  const houseEdge = houseEdgeBasisPoints / 10000;
  return (maxValue / threshold) * (1 - houseEdge);
}

export function calculatePayout(betAmount: number, threshold: number, randomBitLength: number = 16, houseEdgeBasisPoints: number = 190): number {
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

export function formatTokenAmount(amount: bigint | number, decimals: number = 2): string {
  if (typeof amount === 'bigint') {
    // Convert BigInt to string to avoid precision loss with large numbers
    const amountStr = amount.toString();

    // Pad with zeros if needed (for values less than 100)
    const paddedStr = amountStr.padStart(decimals + 1, '0');

    // Insert decimal point
    const decimalPosition = paddedStr.length - decimals;
    const integerPart = paddedStr.slice(0, decimalPosition);
    const decimalPart = paddedStr.slice(decimalPosition);

    return `${integerPart}.${decimalPart}`;
  }
  return (amount / 100).toFixed(decimals);
}

export function formatBalance(balance: bigint | number, decimals: number = 2): string {
  if (typeof balance === 'bigint') {
    // Convert BigInt to string to avoid precision loss with large numbers
    const balanceStr = balance.toString();

    // Pad with zeros if needed (for values less than 100)
    const paddedStr = balanceStr.padStart(decimals + 1, '0');

    // Insert decimal point
    const decimalPosition = paddedStr.length - decimals;
    const integerPart = paddedStr.slice(0, decimalPosition);
    const decimalPart = paddedStr.slice(decimalPosition);

    return `${integerPart}.${decimalPart}`;
  }
  return (balance / 100).toFixed(decimals);
}

export function formatBalanceWithCommas(balance: bigint | number, decimals: number = 2): string {
  const formatted = formatBalance(balance, decimals);
  const [integerPart, decimalPart] = formatted.split('.');

  // Add thousand separators
  const withCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return decimalPart ? `${withCommas}.${decimalPart}` : withCommas;
}

// Fortune Tiger Mode Utilities
export function multiplierToThreshold(
  multiplier: number,
  randomBitLength: number = 16,
  houseEdgeBasisPoints: number = 190
): number {
  const maxValue = Math.pow(2, randomBitLength);
  const houseEdge = houseEdgeBasisPoints / 10000;
  return Math.floor(maxValue / (multiplier / (1 - houseEdge)));
}

export interface FortuneTigerMultiplier {
  multiplier: number;
  label: string;
  color: string;
  winChance: number;
}

export const FORTUNE_TIGER_MULTIPLIERS: FortuneTigerMultiplier[] = [
  { multiplier: 1.5, label: '1.5x', color: 'green', winChance: 65.3 },
  { multiplier: 2, label: '2x', color: 'blue', winChance: 49.0 },
  { multiplier: 3, label: '3x', color: 'purple', winChance: 32.7 },
  { multiplier: 5, label: '5x', color: 'orange', winChance: 19.6 },
  { multiplier: 10, label: '10x', color: 'red', winChance: 9.8 },
];

// Maximum multiplier allowed in the UI (can be overridden by contract's max_multiplier_tenths)
export const MAX_UI_MULTIPLIER = 100;

/**
 * Calculate the minimum valid threshold for the contract.
 * Based on the blueprint validation:
 * - threshold must be > 0
 * - if max_multiplier_tenths is set: multiplier must be < max_multiplier_tenths / 10
 *
 * For a given multiplier M, threshold = (2^randomBitLength * (10000 - houseEdge)) / (10000 * M)
 * So for max multiplier, min threshold = (2^randomBitLength * (10000 - houseEdge)) / (10000 * maxMultiplier)
 */
export function calculateMinThreshold(
  randomBitLength: number = 16,
  houseEdgeBasisPoints: number = 190,
  maxMultiplier: number = MAX_UI_MULTIPLIER
): number {
  const maxValue = Math.pow(2, randomBitLength);
  const numerator = maxValue * (10000 - houseEdgeBasisPoints);
  const denominator = 10000 * maxMultiplier;
  // Add 1 to ensure we're strictly greater than the limit
  return Math.ceil(numerator / denominator) + 1;
}

/**
 * Calculate the maximum valid threshold for the contract.
 * Based on the blueprint validation:
 * max_threshold_numerator = (2^random_bit_length) * (10000 - house_edge_basis_points)
 * threshold * 10000 < max_threshold_numerator
 */
export function calculateMaxThreshold(
  randomBitLength: number = 16,
  houseEdgeBasisPoints: number = 190
): number {
  const maxValue = Math.pow(2, randomBitLength);
  const maxThresholdNumerator = maxValue * (10000 - houseEdgeBasisPoints);
  // Subtract 1 to ensure we're strictly less than the limit
  return Math.floor(maxThresholdNumerator / 10000) - 1;
}

/**
 * Calculate the maximum multiplier allowed given contract parameters.
 * Uses binary search to find the highest multiplier that produces a valid threshold.
 */
export function calculateMaxMultiplier(
  randomBitLength: number = 16,
  houseEdgeBasisPoints: number = 190,
  contractMaxMultiplierTenths?: number | null
): number {
  // If contract has a max multiplier set, use it (convert from tenths)
  if (contractMaxMultiplierTenths) {
    const contractMax = contractMaxMultiplierTenths / 10;
    return Math.min(contractMax, MAX_UI_MULTIPLIER);
  }

  // Otherwise, use binary search to find max multiplier that gives threshold >= 1
  let low = 1;
  let high = 10000; // Start with a very high upper bound

  while (low < high) {
    const mid = Math.ceil((low + high + 1) / 2);
    const threshold = multiplierToThreshold(mid, randomBitLength, houseEdgeBasisPoints);

    if (threshold >= 1) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  return Math.min(low, MAX_UI_MULTIPLIER);
}

/**
 * Clamp a multiplier to valid range and return the effective threshold.
 * If the requested multiplier would produce an invalid threshold, return the min valid threshold.
 */
export function clampMultiplierToValidThreshold(
  multiplier: number,
  randomBitLength: number = 16,
  houseEdgeBasisPoints: number = 190,
  contractMaxMultiplierTenths?: number | null
): { threshold: number; effectiveMultiplier: number } {
  const maxMultiplier = calculateMaxMultiplier(randomBitLength, houseEdgeBasisPoints, contractMaxMultiplierTenths);
  const clampedMultiplier = Math.min(multiplier, maxMultiplier);

  let threshold = multiplierToThreshold(clampedMultiplier, randomBitLength, houseEdgeBasisPoints);
  const minThreshold = calculateMinThreshold(randomBitLength, houseEdgeBasisPoints, maxMultiplier);
  const maxThreshold = calculateMaxThreshold(randomBitLength, houseEdgeBasisPoints);

  // Clamp threshold to valid range
  if (threshold < minThreshold) {
    threshold = minThreshold;
  } else if (threshold > maxThreshold) {
    threshold = maxThreshold;
  }

  // Recalculate effective multiplier from clamped threshold
  const effectiveMultiplier = calculateMultiplier(threshold, randomBitLength, houseEdgeBasisPoints);

  return { threshold, effectiveMultiplier };
}
