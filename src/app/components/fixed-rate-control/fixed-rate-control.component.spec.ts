import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeFr from '@angular/common/locales/fr';
import { TestBed } from '@angular/core/testing';
import { patchState } from '@ngrx/signals';
import { TranslocoTestingModule, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

import { ConverterStore } from '../../store/converter.store';
import { FixedRateControlComponent } from './fixed-rate-control.component';

/** Traductions minimales pour le rendu UI du taux fixe (structure nested Transloco). */
const TEST_LANG_FR = {
  fixed: {
    title: 'Taux fixe',
    enable: 'Activer le taux fixe',
    hint: 'Ex. 1 EUR = {{ rate }} USD (4 décimales)',
    hintUsd: 'Ex. 1 USD = {{ rate }} EUR (4 décimales)',
    placeholder: 'Ex. 1,1200',
    realSide: 'Taux réel',
    appliedSide: 'Taux appliqué',
    badgeReal: 'Réel',
    badgeFixed: 'Fixe',
    deviation: 'Déviation',
  },
};

async function renderFixedRateControl() {
  const fixture = TestBed.createComponent(FixedRateControlComponent);
  const store = TestBed.inject(ConverterStore);
  store.setFixedRateActive(false);
  store.acknowledgeAutoFixedDisable();
  const transloco = TestBed.inject(TranslocoService);
  await firstValueFrom(transloco.load('fr'));
  transloco.setActiveLang('fr');
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return { fixture, store };
}

describe('FixedRateControlComponent (UI taux fixe)', () => {
  beforeAll(() => {
    registerLocaleData(localeFr, 'fr-FR');
    registerLocaleData(localeEn, 'en-US');
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [
        FixedRateControlComponent,
        TranslocoTestingModule.forRoot({
          langs: { fr: TEST_LANG_FR },
          preloadLangs: true,
          translocoConfig: {
            availableLangs: ['fr'],
            defaultLang: 'fr',
            fallbackLang: 'fr',
          },
        }),
      ],
      providers: [ConverterStore],
    }).compileComponents();
  });

  it('should create', async () => {
    const { fixture } = await renderFixedRateControl();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('désactive le champ taux tant que le taux fixe est inactif', async () => {
    const { fixture, store } = await renderFixedRateControl();
    expect(store.isFixedRateActive()).toBe(false);
    const rateInput = fixture.nativeElement.querySelector('#fixed-rate') as HTMLInputElement | null;
    expect(rateInput).toBeTruthy();
    expect(rateInput!.disabled).toBe(true);
  });

  it('active le champ taux après activation du switch', async () => {
    const { fixture, store } = await renderFixedRateControl();
    store.setFixedRateActive(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rateInput = fixture.nativeElement.querySelector('#fixed-rate') as HTMLInputElement;
    expect(store.isFixedRateActive()).toBe(true);
    expect(rateInput.disabled).toBe(false);
  });

  it('affiche le libellé « Fixe » sur le tag quand le taux fixe est actif', async () => {
    const { fixture, store } = await renderFixedRateControl();
    store.setFixedRateActive(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const tagLabel = fixture.nativeElement.querySelector('.p-tag-label');
    expect(tagLabel?.textContent?.trim()).toBe('Fixe');
  });

  it('active le taux fixe via le switch (clic UI)', async () => {
    const { fixture, store } = await renderFixedRateControl();
    expect(store.isFixedRateActive()).toBe(false);

    const toggle = fixture.nativeElement.querySelector('#fixed-toggle') as HTMLInputElement;
    expect(toggle).toBeTruthy();
    toggle.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(store.isFixedRateActive()).toBe(true);
    const rateInput = fixture.nativeElement.querySelector('#fixed-rate') as HTMLInputElement;
    expect(rateInput.disabled).toBe(false);
  });

  it('recule le switch si la déviation excède 2 % à l’activation', async () => {
    const { fixture, store } = await renderFixedRateControl();
    patchState(store as never, {
      realExchangeRate: 1.1,
      previousRate: 1.1,
      fixedExchangeRate: 1.15,
      isFixedRateActive: false,
    });

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector('#fixed-toggle') as HTMLInputElement;
    expect(toggle.checked).toBe(false);

    toggle.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(store.isFixedRateActive()).toBe(false);
    // Source de vérité pour le switch : le FormControl (l’état DOM natif sous jsdom peut diverger).
    expect(fixture.componentInstance.fixedForm.controls.enabled.value).toBe(false);
  });

  it('affiche une aide avec exemple de taux (séquence Transloco)', async () => {
    const { fixture } = await renderFixedRateControl();
    const help = fixture.nativeElement.querySelector('small.help');
    expect(help?.textContent).toContain('1 EUR =');
    expect(help?.textContent).toContain('USD');
  });

  it('affiche hintUsd lorsque la devise saisie est USD', async () => {
    const { fixture, store } = await renderFixedRateControl();
    store.toggleCurrency();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const help = fixture.nativeElement.querySelector('small.help');
    expect(help?.textContent).toContain('1 USD =');
    expect(help?.textContent).toContain('EUR');
  });
});
