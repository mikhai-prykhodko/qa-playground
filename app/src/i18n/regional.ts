import type { TranslationKey } from './en';

/**
 * Regional overrides on top of a language dictionary, keyed by locale ("de-DE").
 * Only keys that differ from the shared language dictionary are listed.
 *
 * The shared German dictionary is written in Swiss Standard German, which never uses "ß".
 * Germany and Austria write "ß" after long vowels and diphthongs (Straße, Größe, heißen).
 */
const GERMAN_ESZETT: Partial<Record<TranslationKey, string>> = {
  'cookie.text': 'Wir verwenden Cookies, um Ihr Erlebnis zu verbessern. Ihre Daten werden gemäß {law} verarbeitet.',
  'dialogs.promptMessage': 'Wie heißen Sie?',
  'dialogs.modalText': 'Drücken Sie Escape oder klicken Sie auf Schließen.',
  'dialogs.close': 'Schließen',
  'checkout.street': 'Straße und Hausnummer',
  'product.size': 'Größe',
  'product.selectSize': 'Bitte wählen Sie eine Größe',
  'color.white': 'Weiß',
};

export const REGIONAL: Record<string, Partial<Record<TranslationKey, string>>> = {
  'de-DE': GERMAN_ESZETT,
  'de-AT': GERMAN_ESZETT,
};
