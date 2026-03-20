import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';

import { TranslocoLang } from '../models/conversion.model';
import { TRANSLOCO_TEST_FR } from '../testing/transloco-test-langs';
import { AppConfigStore } from './app-config.store';

describe('AppConfigStore', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('setActiveLang met à jour Transloco et le state', async () => {
    TestBed.configureTestingModule({
      imports: [
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
      providers: [AppConfigStore],
    });

    const transloco = TestBed.inject(TranslocoService);
    await firstValueFrom(transloco.load('fr'));
    transloco.setActiveLang('fr');

    const store = TestBed.inject(AppConfigStore);
    expect(store.activeLang()).toBe(TranslocoLang.Fr);

    store.setActiveLang(TranslocoLang.En);
    expect(transloco.getActiveLang()).toBe(TranslocoLang.En);
    expect(store.activeLang()).toBe(TranslocoLang.En);
  });
});
