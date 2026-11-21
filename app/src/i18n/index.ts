import type { Lang } from '../markets/markets';
import { en, type Dictionary, type TranslationKey } from './en';
import { de } from './de';
import { fr } from './fr';
import { it } from './it';
import { REGIONAL } from './regional';

export type { TranslationKey };

const DICTIONARIES: Record<Lang, Dictionary> = { en, de, fr, it };

export interface TranslateOptions {
  /** Locale like "de-DE": regional overrides win over the language dictionary. */
  locale?: string;
  /** Pseudo-localization: makes every UI string visibly marked and ~30% longer. */
  pseudo?: boolean;
}

export function translate(
  lang: Lang,
  key: TranslationKey,
  vars: Record<string, string | number> = {},
  options: TranslateOptions = {},
): string {
  const regional = options.locale ? REGIONAL[options.locale]?.[key] : undefined;
  const template = regional ?? DICTIONARIES[lang][key] ?? en[key] ?? key;
  const text = template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
  return options.pseudo ? pseudoLocalize(text) : text;
}

const ACCENTS: Record<string, string> = {
  a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', c: 'ç', n: 'ñ', y: 'ý',
  A: 'Á', E: 'É', I: 'Í', O: 'Ó', U: 'Ú', C: 'Ç', N: 'Ñ', Y: 'Ý',
};

/**
 * "[!! Wárénkórb~~~ !!]" — any visible text WITHOUT these brackets did not come from the
 * dictionary (hardcoded), and the extra length exposes layouts that break with longer text.
 */
export function pseudoLocalize(text: string): string {
  const accented = text.replace(/[aeiouycnAEIOUYCN]/g, (ch) => ACCENTS[ch] ?? ch);
  return `[!! ${accented}${'~'.repeat(Math.ceil(text.length * 0.3))} !!]`;
}
