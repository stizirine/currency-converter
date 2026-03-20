export enum Currency {
  EUR = 'EUR',
  USD = 'USD',
}

export enum RateDirection {
  Up = 'up',
  Down = 'down',
  Stable = 'stable',
}

export enum AutoDisabledFixedReason {
  Deviation = 'deviation',
}

export enum TranslocoLang {
  Fr = 'fr',
  En = 'en',
}

export interface ConversionRecord {
  id: string;
  timestamp: Date;
  realRate: number;
  appliedRate: number;
  inputValue: number;
  inputCurrency: Currency;
  outputValue: number;
  outputCurrency: Currency;
  wasFixedRateUsed: boolean;
}
