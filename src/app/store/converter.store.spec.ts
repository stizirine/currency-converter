import { TestBed } from '@angular/core/testing';
import { patchState } from '@ngrx/signals';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  AutoDisabledFixedReason,
  Currency,
  RateDirection,
} from '../models/conversion.model';
import { ConverterStore } from './converter.store';

describe('ConverterStore', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('starts at EUR with rate 1.1', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    expect(store.realExchangeRate()).toBe(1.1);
    expect(store.fixedExchangeRate()).toBe(1.1);
    expect(store.inputCurrency()).toBe(Currency.EUR);
  });

  it('converts EUR to USD using effective rate', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    store.setInputAmount(100);
    expect(store.outputAmount()).toBe(110);
  });

  it('toggles currency preserving monetary continuity', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    store.setInputAmount(100);
    expect(store.outputAmount()).toBe(110);
    store.toggleCurrency();
    expect(store.inputCurrency()).toBe(Currency.USD);
    expect(store.inputAmount()).toBe(110);
    expect(store.outputAmount()).toBe(100);
    expect(store.displayRealExchangeRate()).toBe(0.9091);
  });

  it('disables fixed rate when deviation exceeds 2%', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    expect(store.realExchangeRate()).toBe(1.1);
    store.setFixedExchangeRate(1.15);
    store.setFixedRateActive(true);
    expect(store.isFixedRateActive()).toBe(false);
    expect(store.autoDisabledFixedReason()).toBe(AutoDisabledFixedReason.Deviation);
    expect(store.showFixedDeviationBanner()).toBe(true);
  });

  it('keeps fixed rate when deviation is below 2%', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    store.setFixedExchangeRate(1.121);
    store.setFixedRateActive(true);
    expect(store.isFixedRateActive()).toBe(true);
  });

  it('applyFixedRateFromUi avec saisie USD écrit le taux canonique EUR→USD', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    store.toggleCurrency();
    expect(store.inputCurrency()).toBe(Currency.USD);
    store.applyFixedRateFromUi(0.5);
    expect(store.fixedExchangeRate()).toBe(2);
  });

  it('setInputAmount ramène à 0 si valeur invalide ou négative', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    store.setInputAmount(50);
    store.setInputAmount(Number.NaN);
    expect(store.inputAmount()).toBe(0);
    store.setInputAmount(10);
    store.setInputAmount(-3);
    expect(store.inputAmount()).toBe(0);
  });

  it('rateDirection reflète previousRate vs realExchangeRate', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    patchState(store as never, { previousRate: 1.0, realExchangeRate: 1.1 });
    expect(store.rateDirection()).toBe(RateDirection.Up);
    patchState(store as never, { previousRate: 1.2, realExchangeRate: 1.1 });
    expect(store.rateDirection()).toBe(RateDirection.Down);
    patchState(store as never, { previousRate: 1.1, realExchangeRate: 1.1 });
    expect(store.rateDirection()).toBe(RateDirection.Stable);
  });

  it('displayRateDirection inverse hausse/baisse quand la saisie est en USD', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    patchState(store as never, {
      inputCurrency: Currency.USD,
      previousRate: 1.0,
      realExchangeRate: 1.1,
    });
    expect(store.displayRateDirection()).toBe(RateDirection.Down);
    patchState(store as never, { previousRate: 1.2, realExchangeRate: 1.1 });
    expect(store.displayRateDirection()).toBe(RateDirection.Up);
  });

  it('deviationPercent vaut 0 si aucun taux fixe ou dénominateur nul', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    store.setFixedExchangeRate(null);
    expect(store.deviationPercent()).toBe(0);
    patchState(store as never, { fixedExchangeRate: 0 });
    expect(store.deviationPercent()).toBe(0);
  });

  it('deviationPercent suit (réel − fixe) / fixe × 100', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    patchState(store as never, { realExchangeRate: 1, fixedExchangeRate: 3 });
    expect(store.deviationPercent()).toBeCloseTo((-2 / 3) * 100, 5);
    patchState(store as never, { realExchangeRate: 1.1, fixedExchangeRate: 1.1 });
    expect(store.deviationPercent()).toBe(0);
    patchState(store as never, { realExchangeRate: 1.2, fixedExchangeRate: 1 });
    expect(store.deviationPercent()).toBeCloseTo(20, 10);
  });

  it('isFixedRateOverriddenByDeviation est vrai si écart > 2 % avec mode actif', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    patchState(store as never, {
      isFixedRateActive: true,
      fixedExchangeRate: 1.2,
      realExchangeRate: 1.1,
    });
    expect(store.isFixedRateOverriddenByDeviation()).toBe(true);
  });

  it('acknowledgeAutoFixedDisable efface la raison auto', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    store.setFixedExchangeRate(1.15);
    store.setFixedRateActive(true);
    expect(store.autoDisabledFixedReason()).toBe(AutoDisabledFixedReason.Deviation);
    store.acknowledgeAutoFixedDisable();
    expect(store.autoDisabledFixedReason()).toBeNull();
    expect(store.showFixedDeviationBanner()).toBe(false);
  });

  it('setFixedRateActive(false) désactive sans toucher au taux', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    store.setFixedExchangeRate(1.11);
    store.setFixedRateActive(true);
    expect(store.isFixedRateActive()).toBe(true);
    store.setFixedRateActive(false);
    expect(store.isFixedRateActive()).toBe(false);
    expect(store.fixedExchangeRate()).toBe(1.11);
  });

  it('setFixedRateActive(true) échoue si aucun taux fixe valide', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    store.setFixedExchangeRate(null);
    store.setFixedRateActive(true);
    expect(store.isFixedRateActive()).toBe(false);
  });

  it('setFixedExchangeRate(null) désactive le mode fixe', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    store.setFixedExchangeRate(1.11);
    store.setFixedRateActive(true);
    store.setFixedExchangeRate(null);
    expect(store.isFixedRateActive()).toBe(false);
    expect(store.fixedExchangeRate()).toBeNull();
  });

  it('applyFixedRateFromUi avec valeur invalide efface le taux fixe', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    store.applyFixedRateFromUi(0);
    expect(store.fixedExchangeRate()).toBeNull();
    store.setFixedExchangeRate(1.1);
    store.applyFixedRateFromUi(null);
    expect(store.fixedExchangeRate()).toBeNull();
  });

  it('effectiveRate utilise le taux fixe si actif et dans la tolérance', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    store.setFixedExchangeRate(1.11);
    store.setFixedRateActive(true);
    expect(store.effectiveRate()).toBe(1.11);
  });

  it('addToHistory ne fait rien si montant <= 0', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    store.setInputAmount(0);
    store.addToHistory();
    expect(store.conversionHistoryEntities().length).toBe(0);
  });

  it('addToHistory enregistre wasFixedRateUsed quand le fixe s’applique', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    store.setInputAmount(10);
    store.setFixedExchangeRate(1.11);
    store.setFixedRateActive(true);
    store.addToHistory();
    expect(store.conversionHistoryEntities()[0]?.wasFixedRateUsed).toBe(true);
  });

  it('addToHistory limite à 5 entrées', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    store.setInputAmount(1);
    for (let i = 0; i < 7; i++) {
      store.addToHistory();
    }
    expect(store.conversionHistoryEntities().length).toBe(5);
  });

  it('logState appelle console.log', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    store.logState('tag');
    expect(log).toHaveBeenCalled();
  });

  it('tick du polling appelle updateRealExchangeRate', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.25);
    vi.useFakeTimers();
    try {
      TestBed.configureTestingModule({ providers: [ConverterStore] });
      const store = TestBed.inject(ConverterStore);
      const before = store.realExchangeRate();
      vi.advanceTimersByTime(3000);
      expect(store.previousRate()).toBe(before);
      expect(store.realExchangeRate()).not.toBe(before);
    } finally {
      vi.useRealTimers();
      randomSpy.mockRestore();
    }
  });

  it('displayFixedExchangeRate est null si taux fixe absent', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    store.setFixedExchangeRate(null);
    expect(store.displayFixedExchangeRate()).toBeNull();
  });

  it('affiche le taux fixe inversé en saisie USD', () => {
    TestBed.configureTestingModule({ providers: [ConverterStore] });
    const store = TestBed.inject(ConverterStore);
    store.setFixedExchangeRate(2);
    store.toggleCurrency();
    expect(store.displayFixedExchangeRate()).toBe(0.5);
  });
});
