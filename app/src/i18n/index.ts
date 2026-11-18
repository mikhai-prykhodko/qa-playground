import type { Lang } from '../markets/markets';
import { en, type Dictionary, type TranslationKey } from './en';
import { de } from './de';
import { fr } from './fr';
import { it } from './it';

export type { TranslationKey };

const DICTIONARIES: Record<Lang, Dictionary> = { en, de, fr, it };

export function translate(lang: Lang, key: TranslationKey, vars: Record<string, string | number> = {}): string {
  const template = DICTIONARIES[lang][key] ?? en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
}
