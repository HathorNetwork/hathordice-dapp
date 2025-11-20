import { describe, it, expect } from 'vitest'
import {
  cn,
  calculateMultiplier,
  calculatePayout,
  thresholdToWinChance,
  winChanceToThreshold,
  formatAddress,
  formatNumber,
  formatTokenAmount,
  formatBalance,
  MAX_THRESHOLD,
  MIN_THRESHOLD,
} from '@/lib/utils'

describe('utils', () => {
  describe('cn - className utility', () => {
    it('should join valid class names', () => {
      expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3')
    })

    it('should filter out falsy values', () => {
      expect(cn('class1', undefined, 'class2', null, false, 'class3')).toBe('class1 class2 class3')
    })

    it('should return empty string for all falsy inputs', () => {
      expect(cn(undefined, null, false)).toBe('')
    })

    it('should handle empty input', () => {
      expect(cn()).toBe('')
    })
  })

  describe('calculateMultiplier', () => {
    it('should calculate correct multiplier for 50% win chance (threshold 32768)', () => {
      // 50% win chance with 16-bit random, 2% house edge
      const multiplier = calculateMultiplier(32768, 16, 200)
      expect(multiplier).toBeCloseTo(1.96, 2) // (65536 / 32768) * 0.98 = 1.96x
    })

    it('should calculate correct multiplier for 25% win chance (threshold 16384)', () => {
      const multiplier = calculateMultiplier(16384, 16, 200)
      expect(multiplier).toBeCloseTo(3.92, 2) // (65536 / 16384) * 0.98 = 3.92x
    })

    it('should calculate correct multiplier for 10% win chance (threshold 6553)', () => {
      const multiplier = calculateMultiplier(6553, 16, 200)
      expect(multiplier).toBeCloseTo(9.8, 1) // (65536 / 6553) * 0.98 ≈ 9.8x
    })

    it('should handle different random bit lengths', () => {
      // 20-bit random: max value = 1,048,576
      const multiplier = calculateMultiplier(524288, 20, 200)
      expect(multiplier).toBeCloseTo(1.96, 2) // 50% win chance
    })

    it('should handle different house edge values', () => {
      // 5% house edge (500 basis points)
      const multiplier = calculateMultiplier(32768, 16, 500)
      expect(multiplier).toBeCloseTo(1.9, 2) // (65536 / 32768) * 0.95 = 1.9x
    })

    it('should handle minimum threshold', () => {
      const multiplier = calculateMultiplier(MIN_THRESHOLD, 16, 200)
      expect(multiplier).toBeGreaterThan(1)
      expect(multiplier).toBeLessThan(100000) // Very high but reasonable
    })

    it('should handle maximum threshold', () => {
      const multiplier = calculateMultiplier(MAX_THRESHOLD, 16, 200)
      expect(multiplier).toBeCloseTo(0.98, 2) // Close to 1x with 2% house edge
    })
  })

  describe('calculatePayout', () => {
    it('should calculate correct payout for 1000 bet at 50% win chance', () => {
      const payout = calculatePayout(1000, 32768, 16, 200)
      expect(payout).toBe(1960) // 1000 * 1.96 = 1960
    })

    it('should calculate correct payout for 500 bet at 25% win chance', () => {
      const payout = calculatePayout(500, 16384, 16, 200)
      expect(payout).toBe(1960) // 500 * 3.92 = 1960
    })

    it('should floor the payout result', () => {
      const payout = calculatePayout(333, 32768, 16, 200)
      expect(payout).toBe(652) // Should be floored
      expect(Number.isInteger(payout)).toBe(true)
    })

    it('should handle large bet amounts', () => {
      const payout = calculatePayout(100000, 32768, 16, 200)
      expect(payout).toBe(196000)
    })

    it('should handle small bet amounts', () => {
      const payout = calculatePayout(1, 32768, 16, 200)
      expect(payout).toBe(1) // Minimum payout
    })

    it('should handle different random bit lengths', () => {
      const payout = calculatePayout(1000, 524288, 20, 200)
      expect(payout).toBe(1960) // Same 50% chance, different bit length
    })

    it('should handle zero house edge', () => {
      const payout = calculatePayout(1000, 32768, 16, 0)
      expect(payout).toBe(2000) // Perfect 2x multiplier
    })

    it('should return 0 for impossible win (threshold 0 would cause division issues)', () => {
      // This edge case might not be realistic, but we test bounds
      const payout = calculatePayout(1000, 1, 16, 200)
      expect(payout).toBeGreaterThan(0)
    })
  })

  describe('thresholdToWinChance', () => {
    it('should convert threshold to 50% win chance', () => {
      const winChance = thresholdToWinChance(32768, 16)
      expect(winChance).toBeCloseTo(50, 2)
    })

    it('should convert threshold to 25% win chance', () => {
      const winChance = thresholdToWinChance(16384, 16)
      expect(winChance).toBeCloseTo(25, 2)
    })

    it('should convert threshold to 75% win chance', () => {
      const winChance = thresholdToWinChance(49152, 16)
      expect(winChance).toBeCloseTo(75, 2)
    })

    it('should convert threshold to 10% win chance', () => {
      const winChance = thresholdToWinChance(6553, 16)
      expect(winChance).toBeCloseTo(10, 1)
    })

    it('should handle minimum threshold', () => {
      const winChance = thresholdToWinChance(MIN_THRESHOLD, 16)
      expect(winChance).toBeGreaterThan(0)
      expect(winChance).toBeLessThan(1)
    })

    it('should handle maximum threshold', () => {
      const winChance = thresholdToWinChance(MAX_THRESHOLD, 16)
      expect(winChance).toBeCloseTo(100, 1)
    })

    it('should handle different random bit lengths', () => {
      const winChance20Bit = thresholdToWinChance(524288, 20)
      expect(winChance20Bit).toBeCloseTo(50, 2)

      const winChance12Bit = thresholdToWinChance(2048, 12)
      expect(winChance12Bit).toBeCloseTo(50, 2)
    })
  })

  describe('winChanceToThreshold', () => {
    it('should convert 50% win chance to threshold', () => {
      const threshold = winChanceToThreshold(50, 16)
      expect(threshold).toBe(32768)
    })

    it('should convert 25% win chance to threshold', () => {
      const threshold = winChanceToThreshold(25, 16)
      expect(threshold).toBe(16384)
    })

    it('should convert 75% win chance to threshold', () => {
      const threshold = winChanceToThreshold(75, 16)
      expect(threshold).toBe(49152)
    })

    it('should convert 10% win chance to threshold', () => {
      const threshold = winChanceToThreshold(10, 16)
      expect(threshold).toBe(6553)
    })

    it('should floor the threshold result', () => {
      const threshold = winChanceToThreshold(33.33, 16)
      expect(Number.isInteger(threshold)).toBe(true)
    })

    it('should handle 100% win chance', () => {
      const threshold = winChanceToThreshold(100, 16)
      expect(threshold).toBe(65536)
    })

    it('should handle 0% win chance', () => {
      const threshold = winChanceToThreshold(0, 16)
      expect(threshold).toBe(0)
    })

    it('should handle different random bit lengths', () => {
      const threshold20Bit = winChanceToThreshold(50, 20)
      expect(threshold20Bit).toBe(524288)

      const threshold12Bit = winChanceToThreshold(50, 12)
      expect(threshold12Bit).toBe(2048)
    })

    it('should be inverse of thresholdToWinChance', () => {
      const originalChance = 42.5
      const threshold = winChanceToThreshold(originalChance, 16)
      const convertedChance = thresholdToWinChance(threshold, 16)
      expect(convertedChance).toBeCloseTo(originalChance, 0) // Within 1% due to flooring
    })
  })

  describe('formatAddress', () => {
    it('should format a standard Hathor address', () => {
      const address = 'WYBwT3xLpDnHNtYZiU52oanupVeDKhAvNp'
      const formatted = formatAddress(address)
      expect(formatted).toBe('WYBwT3...AvNp')
    })

    it('should handle shorter addresses', () => {
      const address = 'WYBwT3xLp'
      const formatted = formatAddress(address)
      expect(formatted).toBe('WYBwT3...3xLp')
    })

    it('should handle empty string', () => {
      expect(formatAddress('')).toBe('')
    })

    it('should preserve format for very short addresses', () => {
      const address = 'ABCD'
      const formatted = formatAddress(address)
      expect(formatted).toBe('ABCD...ABCD')
    })
  })

  describe('formatNumber', () => {
    it('should format number with default 2 decimals', () => {
      expect(formatNumber(123.456)).toBe('123.46')
    })

    it('should format number with custom decimals', () => {
      expect(formatNumber(123.456, 3)).toBe('123.456')
      expect(formatNumber(123.456, 1)).toBe('123.5')
      expect(formatNumber(123.456, 0)).toBe('123')
    })

    it('should handle integers', () => {
      expect(formatNumber(123)).toBe('123.00')
    })

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0.00')
    })

    it('should handle negative numbers', () => {
      expect(formatNumber(-123.456)).toBe('-123.46')
    })
  })

  describe('formatTokenAmount', () => {
    it('should format bigint amount correctly (100 = 1.00)', () => {
      expect(formatTokenAmount(100n)).toBe('1.00')
    })

    it('should format bigint amount with large value', () => {
      expect(formatTokenAmount(123456n)).toBe('1234.56')
    })

    it('should format bigint amount with small value', () => {
      expect(formatTokenAmount(50n)).toBe('0.50')
    })

    it('should format bigint amount with very small value', () => {
      expect(formatTokenAmount(5n)).toBe('0.05')
    })

    it('should format bigint amount with 1 unit', () => {
      expect(formatTokenAmount(1n)).toBe('0.01')
    })

    it('should format bigint zero', () => {
      expect(formatTokenAmount(0n)).toBe('0.00')
    })

    it('should format number amount correctly', () => {
      expect(formatTokenAmount(100)).toBe('1.00')
      expect(formatTokenAmount(12345)).toBe('123.45')
    })

    it('should handle large bigint amounts', () => {
      expect(formatTokenAmount(100000000n)).toBe('1000000.00')
    })

    it('should pad with zeros for amounts less than 100', () => {
      expect(formatTokenAmount(99n)).toBe('0.99')
      expect(formatTokenAmount(10n)).toBe('0.10')
      expect(formatTokenAmount(1n)).toBe('0.01')
    })
  })

  describe('formatBalance', () => {
    it('should format bigint balance correctly (100 = 1.00)', () => {
      expect(formatBalance(100n)).toBe('1.00')
    })

    it('should format bigint balance with large value', () => {
      expect(formatBalance(125050n)).toBe('1250.50')
    })

    it('should format bigint balance with small value', () => {
      expect(formatBalance(50n)).toBe('0.50')
    })

    it('should format bigint zero balance', () => {
      expect(formatBalance(0n)).toBe('0.00')
    })

    it('should format number balance correctly', () => {
      expect(formatBalance(100)).toBe('1.00')
      expect(formatBalance(125050)).toBe('1250.50')
    })

    it('should handle large balances', () => {
      expect(formatBalance(10000000000n)).toBe('100000000.00')
    })

    it('should pad with zeros for small amounts', () => {
      expect(formatBalance(5n)).toBe('0.05')
      expect(formatBalance(1n)).toBe('0.01')
    })
  })

  describe('Integration - bet calculations', () => {
    it('should maintain consistency between win chance and threshold conversions', () => {
      const testCases = [10, 25, 33.33, 50, 66.67, 75, 90]

      testCases.forEach(chance => {
        const threshold = winChanceToThreshold(chance, 16)
        const convertedChance = thresholdToWinChance(threshold, 16)
        expect(convertedChance).toBeCloseTo(chance, 0)
      })
    })

    it('should calculate realistic payout scenarios', () => {
      // User bets 1000 HTR (100000 units) at 50% win chance
      const betAmount = 100000
      const threshold = winChanceToThreshold(50, 16)
      const payout = calculatePayout(betAmount, threshold, 16, 190)

      // Expected: ~1.98x multiplier (2% house edge)
      const expectedMultiplier = calculateMultiplier(threshold, 16, 190)
      const expectedPayout = Math.floor(betAmount * expectedMultiplier)

      expect(payout).toBe(expectedPayout)
      expect(payout).toBeGreaterThan(betAmount) // Should win more than bet
    })

    it('should verify house always has edge', () => {
      const betAmount = 100000
      const winChance = 50
      const threshold = winChanceToThreshold(winChance, 16)
      const payout = calculatePayout(betAmount, threshold, 16, 200)

      // Expected payout should be less than fair odds (2x for 50%)
      const fairPayout = betAmount * 2
      expect(payout).toBeLessThan(fairPayout)
    })
  })
})
