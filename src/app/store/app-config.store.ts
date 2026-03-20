import { DestroyRef, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';
import { switchMap, tap } from 'rxjs';

import { TranslocoLang } from '../models/conversion.model';
import { translocoAppConfig } from '../transloco.config';

const BREAKPOINT_WIDE = '(min-width: 768px)';

function normalizeLang(lang: string): TranslocoLang {
  return lang === TranslocoLang.En ? TranslocoLang.En : TranslocoLang.Fr;
}

type AppConfigState = {
  activeLang: TranslocoLang;
  isWideLayout: boolean;
};

export const AppConfigStore = signalStore(
  { providedIn: 'root' },
  withState<AppConfigState>({
    activeLang: translocoAppConfig.defaultLang as TranslocoLang,
    isWideLayout: false,
  }),
  withMethods((store) => {
    const transloco = inject(TranslocoService);
    return {
      setActiveLang(lang: TranslocoLang): void {
        patchState(store, { activeLang: lang });
        transloco.setActiveLang(lang);
      },

      listenTranslocoLang: rxMethod<void>((trigger$) =>
        trigger$.pipe(
          switchMap(() =>
            transloco.langChanges$.pipe(
              tap((lang) => patchState(store, { activeLang: normalizeLang(lang) })),
            ),
          ),
        ),
      ),
    };
  }),
  withHooks({
    onInit(store) {
      const transloco = inject(TranslocoService);
      const destroyRef = inject(DestroyRef);

      patchState(store, {
        activeLang: normalizeLang(transloco.getActiveLang()),
      });

      if (typeof globalThis !== 'undefined' && typeof globalThis.matchMedia === 'function') {
        const mql = globalThis.matchMedia(BREAKPOINT_WIDE);
        patchState(store, { isWideLayout: mql.matches });
        const onChange = () => patchState(store, { isWideLayout: mql.matches });
        mql.addEventListener('change', onChange);
        destroyRef.onDestroy(() => mql.removeEventListener('change', onChange));
      }

      store.listenTranslocoLang();
    },
  }),
);
