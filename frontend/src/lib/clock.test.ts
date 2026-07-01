import { describe, expect, it } from 'vitest'
import { formatClock } from './clock'

describe('formatClock', () => {
  it('zero-pads single digits', () =>
    expect(formatClock(new Date(2026, 0, 1, 9, 5, 3))).toBe('09:05:03'))
  it('handles midnight', () =>
    expect(formatClock(new Date(2026, 0, 1, 0, 0, 0))).toBe('00:00:00'))
  it('uses 24-hour time', () =>
    expect(formatClock(new Date(2026, 0, 1, 13, 7, 42))).toBe('13:07:42'))
})
