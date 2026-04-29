import { createI18n } from 'vue-i18n';

import ruRU from './ru-RU';
import tgTJ from './tg-TJ';

export const messages = {
  'ru-RU': ruRU,
  'tg-TJ': tgTJ,
} as const;

export type MessageLanguages = keyof typeof messages;
export type MessageSchema = (typeof messages)['ru-RU'];

export interface LocaleOption {
  value: MessageLanguages;
  label: string;
}

export const SUPPORTED_LOCALES: LocaleOption[] = [
  { value: 'ru-RU', label: 'RU' },
  { value: 'tg-TJ', label: 'TJ' },
];

export function isMessageLanguage(value: string): value is MessageLanguages {
  return value in messages;
}

export const i18n = createI18n<{ message: MessageSchema }, MessageLanguages>({
  locale: 'ru-RU',
  legacy: false,
  messages,
});

/* eslint-disable @typescript-eslint/no-empty-object-type */
declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
  export interface DefineDateTimeFormat {}
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-object-type */

export default messages;
