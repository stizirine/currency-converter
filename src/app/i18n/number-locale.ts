import { TranslocoLang } from '../models/conversion.model';

export function resolveNumberLocale(activeLang: string): string {
  return activeLang === TranslocoLang.En ? 'en-US' : 'fr-FR';
}
