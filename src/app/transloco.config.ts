import type { TranslocoConfig } from '@jsverse/transloco';

import { TranslocoLang } from './models/conversion.model';

export const translocoAppConfig: Partial<TranslocoConfig> = {
  availableLangs: [TranslocoLang.Fr, TranslocoLang.En],
  defaultLang: TranslocoLang.Fr,
  reRenderOnLangChange: true,
  fallbackLang: TranslocoLang.En,
};
