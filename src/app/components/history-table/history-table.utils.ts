import { Currency } from '../../models/conversion.model';
import { invertRate } from '../../store/converter.utils';

export function currencySymbol(c: Currency): string {
  return c === Currency.EUR ? '€' : '$';
}

export function historyQuoteRate(canonical: number, inputCurrencyAtTime: Currency): number {
  return inputCurrencyAtTime === Currency.EUR ? canonical : invertRate(canonical);
}
