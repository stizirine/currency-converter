import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeFr from '@angular/common/locales/fr';
import { TestBed } from '@angular/core/testing';
import { patchState } from '@ngrx/signals';
import { TranslocoTestingModule, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { AutoDisabledFixedReason, TranslocoLang } from '../../models/conversion.model';
import { TRANSLOCO_TEST_FR } from '../../testing/transloco-test-langs';
import { AppConfigStore } from '../../store/app-config.store';
import { ConverterStore } from '../../store/converter.store';
import { ConverterComponent } from './converter.component';

describe('ConverterComponent', () => {
  beforeAll(() => {
    registerLocaleData(localeFr, 'fr-FR');
    registerLocaleData(localeEn, 'en-US');
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ConverterComponent,
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
      providers: [ConverterStore, AppConfigStore],
    }).compileComponents();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  async function renderConverter() {
    const fixture = TestBed.createComponent(ConverterComponent);
    const transloco = TestBed.inject(TranslocoService);
    await firstValueFrom(transloco.load('fr'));
    transloco.setActiveLang('fr');
    const store = TestBed.inject(ConverterStore);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, store, component: fixture.componentInstance };
  }

  it('should create', async () => {
    const { fixture } = await renderConverter();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('activeLang et numberLocale suivent Transloco', async () => {
    const { component, fixture } = await renderConverter();
    expect(component.activeLang()).toBe(TranslocoLang.Fr);
    expect(component.numberLocale()).toBe('fr-FR');
    const transloco = TestBed.inject(TranslocoService);
    transloco.setActiveLang(TranslocoLang.En);
    fixture.detectChanges();
    expect(component.activeLang()).toBe(TranslocoLang.En);
    expect(component.numberLocale()).toBe('en-US');
  });

  it('setLang ne change rien pour un code inconnu', async () => {
    const { component, fixture } = await renderConverter();
    const transloco = TestBed.inject(TranslocoService);
    transloco.setActiveLang(TranslocoLang.Fr);
    fixture.detectChanges();
    component.setLang('de');
    expect(transloco.getActiveLang()).toBe(TranslocoLang.Fr);
  });

  it('setLang bascule la langue active', async () => {
    const { component, fixture } = await renderConverter();
    component.setLang(TranslocoLang.En);
    fixture.detectChanges();
    expect(TestBed.inject(TranslocoService).getActiveLang()).toBe(TranslocoLang.En);
  });

  it('affiche l’alerte déviation et le résumé convertisseur', async () => {
    const { fixture, store } = await renderConverter();
    patchState(store as never, {
      autoDisabledFixedReason: AutoDisabledFixedReason.Deviation,
      showFixedDeviationBanner: true,
    });
    store.setInputAmount(100);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('désactivé');
    expect(text).toContain('$');
  });

  it('bouton historique déclenche addToHistory quand montant > 0', async () => {
    const { fixture, store } = await renderConverter();
    const spy = vi.spyOn(store, 'addToHistory');
    store.setInputAmount(50);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button.p-button') as HTMLButtonElement | null;
    expect(btn).toBeTruthy();
    btn?.click();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
