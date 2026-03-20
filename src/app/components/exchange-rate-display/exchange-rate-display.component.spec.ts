import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeFr from '@angular/common/locales/fr';
import { TestBed } from '@angular/core/testing';
import { patchState } from '@ngrx/signals';
import { TranslocoTestingModule, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { beforeAll, describe, expect, it } from 'vitest';

import { Currency, RateDirection, TranslocoLang } from '../../models/conversion.model';
import { TRANSLOCO_TEST_FR } from '../../testing/transloco-test-langs';
import { ConverterStore } from '../../store/converter.store';
import { ExchangeRateDisplayComponent } from './exchange-rate-display.component';

describe('ExchangeRateDisplayComponent', () => {
  beforeAll(() => {
    registerLocaleData(localeFr, 'fr-FR');
    registerLocaleData(localeEn, 'en-US');
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ExchangeRateDisplayComponent,
        TranslocoTestingModule.forRoot({
          langs: { fr: TRANSLOCO_TEST_FR },
          preloadLangs: true,
          translocoConfig: {
            availableLangs: [TranslocoLang.Fr],
            defaultLang: TranslocoLang.Fr,
            fallbackLang: TranslocoLang.Fr,
          },
        }),
      ],
      providers: [ConverterStore],
    }).compileComponents();
  });

  async function render() {
    const fixture = TestBed.createComponent(ExchangeRateDisplayComponent);
    const transloco = TestBed.inject(TranslocoService);
    await firstValueFrom(transloco.load('fr'));
    transloco.setActiveLang('fr');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('should create', async () => {
    const fixture = await render();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('directionTranslationKey pour up / down / stable', async () => {
    const fixture = await render();
    const store = TestBed.inject(ConverterStore);
    const cmp = fixture.componentInstance;
    patchState(store as never, { previousRate: 1.0, realExchangeRate: 1.1 });
    expect(store.displayRateDirection()).toBe(RateDirection.Up);
    expect(cmp.directionTranslationKey()).toBe('rate.up');
    patchState(store as never, { previousRate: 1.2, realExchangeRate: 1.1 });
    expect(cmp.directionTranslationKey()).toBe('rate.down');
    patchState(store as never, { previousRate: 1.1, realExchangeRate: 1.1 });
    expect(cmp.directionTranslationKey()).toBe('rate.stable');
  });

  it('affiche le format EUR ou USD selon la devise saisie', async () => {
    const fixture = await render();
    const store = TestBed.inject(ConverterStore);
    let text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('1 EUR');
    patchState(store as never, { inputCurrency: Currency.USD });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('1 USD');
  });

  it('affiche les icônes de direction', async () => {
    const fixture = await render();
    const store = TestBed.inject(ConverterStore);
    patchState(store as never, { previousRate: 1.0, realExchangeRate: 1.1 });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pi-arrow-up')).toBeTruthy();
    patchState(store as never, { previousRate: 1.2, realExchangeRate: 1.05 });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pi-arrow-down')).toBeTruthy();
    patchState(store as never, { previousRate: 1.1, realExchangeRate: 1.1 });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pi-minus')).toBeTruthy();
  });
});
