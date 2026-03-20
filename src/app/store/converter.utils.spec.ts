import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  clampRate,
  invertRate,
  randomFluctuation,
  roundAmount,
  roundRate,
} from './converter.utils';

describe('converter.utils', () => {
  it('roundRate uses 4 decimals', () => {
    expect(roundRate(1.123456)).toBe(1.1235);
  });

  it('roundAmount uses 2 decimals', () => {
    expect(roundAmount(10.129)).toBe(10.13);
  });

  it('clampRate respects bounds', () => {
    expect(clampRate(0.1, 0.5, 2)).toBe(0.5);
    expect(clampRate(5, 0.5, 2)).toBe(2);
  });

  it('invertRate rounds to 4 decimals', () => {
    expect(invertRate(1.1)).toBe(0.9091);
    expect(invertRate(2)).toBe(0.5);
  });

  it('invertRate retourne NaN pour taux non positif', () => {
    expect(Number.isNaN(invertRate(0))).toBe(true);
    expect(Number.isNaN(invertRate(-1))).toBe(true);
  });

  describe('randomFluctuation', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('peut valoir -0.05 et +0.05 (intervalle fermé)', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);
      expect(randomFluctuation()).toBe(-0.05);
      vi.spyOn(Math, 'random').mockReturnValue(1000 / 1001);
      expect(randomFluctuation()).toBe(0.05);
    });

    it('reste dans [-0.05, +0.05] avec un pas de 0,0001', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const d = randomFluctuation();
      expect(d).toBeGreaterThanOrEqual(-0.05);
      expect(d).toBeLessThanOrEqual(0.05);
      expect(Number.isInteger(Math.round(d * 10000))).toBe(true);
    });
  });
});
