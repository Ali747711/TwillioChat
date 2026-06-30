import { describe, expect, it } from 'vitest'
import { gridColsForCount } from './grid'

describe('gridColsForCount', () => {
  it('1 tile → 1 column', () => expect(gridColsForCount(1)).toBe(1))
  it('2 tiles → 2 columns', () => expect(gridColsForCount(2)).toBe(2))
  it('4 tiles → 2 columns', () => expect(gridColsForCount(4)).toBe(2))
  it('5 tiles → 3 columns', () => expect(gridColsForCount(5)).toBe(3))
  it('9 tiles → 3 columns', () => expect(gridColsForCount(9)).toBe(3))
  it('10 tiles → 4 columns', () => expect(gridColsForCount(10)).toBe(4))
  it('0 tiles → 1 column (no crash)', () => expect(gridColsForCount(0)).toBe(1))
})
