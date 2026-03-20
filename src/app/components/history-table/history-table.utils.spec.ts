import { describe, expect, it } from 'vitest';

import { Currency } from '../../models/conversion.model';

import { currencySymbol, historyQuoteRate } from './history-table.utils';

describe('history-table.utils', () => {
  it('currencySymbol', () => {
    expect(currencySymbol(Currency.EUR)).toBe('€');
    expect(currencySymbol(Currency.USD)).toBe('$');
  });

  it('historyQuoteRate — EUR garde le taux canonique', () => {
    expect(historyQuoteRate(1.1, Currency.EUR)).toBe(1.1);
  });

  it('historyQuoteRate — USD affiche l’inverse', () => {
    expect(historyQuoteRate(1.1, Currency.USD)).toBe(0.9091);
  });
});
