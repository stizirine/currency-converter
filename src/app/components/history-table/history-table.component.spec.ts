import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeFr from '@angular/common/locales/fr';
import { TestBed } from '@angular/core/testing';
import { TranslocoService, TranslocoTestingModule } from '@jsverse/transloco';
import { patchState } from '@ngrx/signals';
import { setAllEntities } from '@ngrx/signals/entities';
import { firstValueFrom } from 'rxjs';
import { beforeAll, describe, expect, it } from 'vitest';

import type { ConversionRecord } from '../../models/conversion.model';
import { Currency, TranslocoLang } from '../../models/conversion.model';
import { ConverterStore } from '../../store/converter.store';
import { TRANSLOCO_TEST_FR } from '../../testing/transloco-test-langs';
import { HistoryTableComponent } from './history-table.component';

describe('HistoryTableComponent', () => {
  beforeAll(() => {
    registerLocaleData(localeFr, 'fr-FR');
    registerLocaleData(localeEn, 'en-US');
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HistoryTableComponent,
        TranslocoTestingModule.forRoot({
          langs: { fr: TRANSLOCO_TEST_FR, en: TRANSLOCO_TEST_FR },
          preloadLangs: true,
          translocoConfig: {
            availableLangs: [TranslocoLang.Fr, TranslocoLang.En],
            defaultLang: TranslocoLang.Fr,
            fallbackLang: TranslocoLang.Fr,
          },
        }),
      ],
      providers: [ConverterStore],
    }).compileComponents();
  });

  async function render() {
    const fixture = TestBed.createComponent(HistoryTableComponent);
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

  it('affiche l’état vide sans historique', async () => {
    const fixture = await render();
    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('Aucune conversion');
    expect(fixture.nativeElement.querySelector('.empty-history')).toBeTruthy();
  });

  it('affiche le tableau quand l’historique contient des entrées', async () => {
    const fixture = await render();
    const store = TestBed.inject(ConverterStore);
    const row: ConversionRecord = {
      id: 'test-row-1',
      timestamp: new Date('2026-06-01T14:34:56'),
      realRate: 1.1,
      appliedRate: 1.1,
      inputValue: 10,
      inputCurrency: Currency.EUR,
      outputValue: 11,
      outputCurrency: Currency.USD,
      wasFixedRateUsed: false,
    };
    patchState(
      store as never,
      setAllEntities([row], { collection: 'conversionHistory' }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p-table')).toBeTruthy();
    const body = fixture.nativeElement.textContent ?? '';
    expect(body).toContain('Réel');
    expect(body).toMatch(/€|EUR/);
  });

  it('numberLocale suit la langue Transloco', async () => {
    const fixture = await render();
    const transloco = TestBed.inject(TranslocoService);
    expect(fixture.componentInstance.numberLocale()).toBe('fr-FR');
    transloco.setActiveLang(TranslocoLang.En);
    fixture.detectChanges();
    expect(fixture.componentInstance.numberLocale()).toBe('en-US');
  });
});
