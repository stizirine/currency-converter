import { describe, expect, it } from 'vitest';

import { TranslocoLang } from '../models/conversion.model';

import { resolveNumberLocale } from './number-locale';

describe('resolveNumberLocale', () => {
  it("renvoie fr-FR pour toute langue autre que 'en'", () => {
    expect(resolveNumberLocale(TranslocoLang.Fr)).toBe('fr-FR');
    expect(resolveNumberLocale('de')).toBe('fr-FR');
  });

  it("renvoie en-US pour la langue active 'en'", () => {
    expect(resolveNumberLocale(TranslocoLang.En)).toBe('en-US');
  });
});
