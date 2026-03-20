import { computed, isDevMode } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  prependEntity,
  removeEntities,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { interval, switchMap, tap } from 'rxjs';
import {
  AutoDisabledFixedReason,
  type ConversionRecord,
  Currency,
  RateDirection,
} from '../models/conversion.model';
import {
  clampRate,
  invertRate,
  randomFluctuation,
  roundAmount,
  roundRate,
} from './converter.utils';

export const INITIAL_EUR_USD_RATE = 1.1;
const INITIAL_RATE = INITIAL_EUR_USD_RATE;
const RATE_MIN = 0.5;
const RATE_MAX = 2;
const POLL_MS = 3000;
const DEVIATION_THRESHOLD = 0.02;
const MAX_HISTORY = 5;

const conversionHistoryCol = { collection: 'conversionHistory' } as const;

type ConverterState = {
  realExchangeRate: number;
  previousRate: number;
  inputAmount: number;
  inputCurrency: Currency;
  fixedExchangeRate: number | null;
  isFixedRateActive: boolean;
  autoDisabledFixedReason: AutoDisabledFixedReason | null;
  showFixedDeviationBanner: boolean;
};

const initialState: ConverterState = {
  realExchangeRate: INITIAL_RATE,
  previousRate: INITIAL_RATE,
  inputAmount: 0,
  inputCurrency: Currency.EUR,
  fixedExchangeRate: roundRate(INITIAL_RATE),
  isFixedRateActive: false,
  autoDisabledFixedReason: null,
  showFixedDeviationBanner: false,
};

function deviationRatio(fixed: number, real: number): number {
  return Math.abs(fixed - real) / real;
}

export const ConverterStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities({ entity: {} as ConversionRecord, collection: 'conversionHistory' }),
  withComputed((store) => {
    const effectiveRate = computed(() => {
      const real = store.realExchangeRate();
      const fixed = store.fixedExchangeRate();
      const active = store.isFixedRateActive();
      if (!active || fixed === null || fixed <= 0) {
        return real;
      }
      if (deviationRatio(fixed, real) > DEVIATION_THRESHOLD) {
        return real;
      }
      return fixed;
    });

    return {
      effectiveRate,
      outputCurrency: computed((): Currency =>
        store.inputCurrency() === Currency.EUR ? Currency.USD : Currency.EUR,
      ),
      outputAmount: computed(() => {
        const amount = store.inputAmount();
        const rate = effectiveRate();
        if (store.inputCurrency() === Currency.EUR) {
          return roundAmount(amount * rate);
        }
        return roundAmount(amount / rate);
      }),
      rateDirection: computed((): RateDirection => {
        const cur = store.realExchangeRate();
        const prev = store.previousRate();
        if (cur > prev) return RateDirection.Up;
        if (cur < prev) return RateDirection.Down;
        return RateDirection.Stable;
      }),
      deviationPercent: computed(() => {
        const real = store.realExchangeRate();
        const fixed = store.fixedExchangeRate();
        if (fixed === null || fixed === 0) return 0;
        return ((real - fixed) / fixed) * 100;
      }),
      isFixedRateOverriddenByDeviation: computed(() => {
        const fixed = store.fixedExchangeRate();
        const active = store.isFixedRateActive();
        const real = store.realExchangeRate();
        if (!active || fixed === null || fixed <= 0) return false;
        return deviationRatio(fixed, real) > DEVIATION_THRESHOLD;
      }),

      displayRealExchangeRate: computed(() => {
        const r = store.realExchangeRate();
        return store.inputCurrency() === Currency.EUR ? r : invertRate(r);
      }),
      displayEffectiveRate: computed(() => {
        const e = effectiveRate();
        return store.inputCurrency() === Currency.EUR ? e : invertRate(e);
      }),
      displayFixedExchangeRate: computed(() => {
        const f = store.fixedExchangeRate();
        if (f === null || f <= 0) return null;
        return store.inputCurrency() === Currency.EUR ? f : invertRate(f);
      }),

      displayRateDirection: computed((): RateDirection => {
        const cur = store.realExchangeRate();
        const prev = store.previousRate();
        let d: RateDirection;
        if (cur > prev) d = RateDirection.Up;
        else if (cur < prev) d = RateDirection.Down;
        else d = RateDirection.Stable;
        if (store.inputCurrency() === Currency.EUR) return d;
        if (d === RateDirection.Up) return RateDirection.Down;
        if (d === RateDirection.Down) return RateDirection.Up;
        return RateDirection.Stable;
      }),
    };
  }),
  withMethods((store) => {
    const applyDeviationGuard = (): void => {
      if (!store.isFixedRateActive()) return;
      const fixed = store.fixedExchangeRate();
      const real = store.realExchangeRate();
      if (fixed === null || fixed <= 0) return;
      if (deviationRatio(fixed, real) > DEVIATION_THRESHOLD) {
        patchState(store, {
          isFixedRateActive: false,
          autoDisabledFixedReason: AutoDisabledFixedReason.Deviation,
          showFixedDeviationBanner: true,
        });
      }
    };

    const patchFixedExchangeRate = (rate: number | null): void => {
      if (rate === null || !Number.isFinite(rate)) {
        patchState(store, {
          fixedExchangeRate: null,
          isFixedRateActive: false,
          autoDisabledFixedReason: null,
          showFixedDeviationBanner: false,
        });
        return;
      }
      const rounded = roundRate(rate);
      patchState(store, {
        fixedExchangeRate: rounded,
        autoDisabledFixedReason: null,
        showFixedDeviationBanner: false,
      });
      if (store.isFixedRateActive()) {
        applyDeviationGuard();
      }
    };

    return {
      updateRealExchangeRate(): void {
        const prev = store.realExchangeRate();
        const next = roundRate(
          clampRate(prev + randomFluctuation(), RATE_MIN, RATE_MAX),
        );
        patchState(store, { previousRate: prev, realExchangeRate: next });
        applyDeviationGuard();
      },

      setInputAmount(value: number): void {
        patchState(store, {
          inputAmount: Number.isFinite(value) && value >= 0 ? value : 0,
        });
      },

      toggleCurrency(): void {
        const out = store.outputAmount();
        const newInputCurrency = store.outputCurrency();
        patchState(store, {
          inputCurrency: newInputCurrency,
          inputAmount: roundAmount(out),
        });
      },

      setFixedRateActive(active: boolean): void {
        patchState(store, {
          autoDisabledFixedReason: null,
          showFixedDeviationBanner: false,
        });
        if (!active) {
          patchState(store, { isFixedRateActive: false });
          return;
        }
        const fixed = store.fixedExchangeRate();
        if (fixed === null || fixed <= 0) {
          patchState(store, { isFixedRateActive: false });
          return;
        }
        patchState(store, { isFixedRateActive: true });
        applyDeviationGuard();
      },

      setFixedExchangeRate(rate: number | null): void {
        patchFixedExchangeRate(rate);
      },

      /** Valeur saisie dans l’UI (directe ou inverse selon `inputCurrency`). */
      applyFixedRateFromUi(uiValue: number | null): void {
        if (uiValue === null || !Number.isFinite(uiValue) || uiValue <= 0) {
          patchFixedExchangeRate(null);
          return;
        }
        const canonical =
          store.inputCurrency() === Currency.EUR ? uiValue : roundRate(1 / uiValue);
        patchFixedExchangeRate(canonical);
      },

      acknowledgeAutoFixedDisable(): void {
        patchState(store, {
          autoDisabledFixedReason: null,
          showFixedDeviationBanner: false,
        });
      },

      /** Instantané état + signaux dérivés (ex. `inject(ConverterStore).logState()` dans la console). */
      logState(tag = 'ConverterStore'): void {
        console.log(`[${tag}]`, {
          state: {
            realExchangeRate: store.realExchangeRate(),
            previousRate: store.previousRate(),
            inputAmount: store.inputAmount(),
            inputCurrency: store.inputCurrency(),
            fixedExchangeRate: store.fixedExchangeRate(),
            isFixedRateActive: store.isFixedRateActive(),
            autoDisabledFixedReason: store.autoDisabledFixedReason(),
            showFixedDeviationBanner: store.showFixedDeviationBanner(),
            conversionHistory: store.conversionHistoryEntities().map((r) => ({
              ...r,
              timestamp: r.timestamp.toISOString(),
            })),
          },
          computed: {
            effectiveRate: store.effectiveRate(),
            outputCurrency: store.outputCurrency(),
            outputAmount: store.outputAmount(),
            rateDirection: store.rateDirection(),
            deviationPercent: store.deviationPercent(),
            isFixedRateOverriddenByDeviation: store.isFixedRateOverriddenByDeviation(),
          },
        });
      },

      addToHistory(): void {
        const inputAmount = store.inputAmount();
        if (inputAmount <= 0) return;

        const real = store.realExchangeRate();
        const applied = store.effectiveRate();
        const wasFixed =
          store.isFixedRateActive() &&
          !store.isFixedRateOverriddenByDeviation() &&
          store.fixedExchangeRate() !== null;

        const record: ConversionRecord = {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          realRate: real,
          appliedRate: applied,
          inputValue: inputAmount,
          inputCurrency: store.inputCurrency(),
          outputValue: store.outputAmount(),
          outputCurrency: store.outputCurrency(),
          wasFixedRateUsed: wasFixed,
        };

        patchState(store, prependEntity(record, conversionHistoryCol));
        const ids = store.conversionHistoryIds();
        if (ids.length > MAX_HISTORY) {
          patchState(store, removeEntities(ids.slice(MAX_HISTORY), conversionHistoryCol));
        }
      },
    };
  }),

  withMethods((store) => ({
    pollExchangeRate: rxMethod<void>((trigger$) =>
      trigger$.pipe(
        switchMap(() =>
          interval(POLL_MS).pipe(
            tap(() => {
              store.updateRealExchangeRate();
              if (isDevMode()) {
                store.logState('ConverterStore (tick)');
              }
            }),
          ),
        ),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      store.pollExchangeRate();
    },
  }),
);
