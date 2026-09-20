import { QUOTE_FIELD_HELP } from '@/lib/chat/quote-field-help';

export const CHAT_LOCALES = ['ja'] as const;
export const CHAT_QUOTE_STEPS = [
  'specs',
  'post-processing',
  'sku-quantity',
  'result',
] as const;

export type ChatLocale = (typeof CHAT_LOCALES)[number];
export type ChatQuoteStep = (typeof CHAT_QUOTE_STEPS)[number];

export interface ChatPageContext {
  pathname: string;
  locale: ChatLocale;
  quoteStep?: ChatQuoteStep;
  fieldId?: string;
}

export type ChatPageContextResult =
  | { success: true; context: ChatPageContext }
  | { success: false; reason: 'malformed' | 'extra-input' };

const PATHNAME_PATTERN = /^\//;
const FIELD_ID_PATTERN = /^[A-Za-z0-9._-]+$/;
const MAX_PATHNAME_LENGTH = 200;
const MAX_FIELD_ID_LENGTH = 100;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isChatQuoteStep = (value: unknown): value is ChatQuoteStep =>
  CHAT_QUOTE_STEPS.includes(value as ChatQuoteStep);

const isFieldId = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= MAX_FIELD_ID_LENGTH &&
  FIELD_ID_PATTERN.test(value);

const isKnownQuoteField = (step: ChatQuoteStep, fieldId: string): boolean =>
  QUOTE_FIELD_HELP.some((item) => item.step === step && item.fieldId === fieldId);

export function parseChatPageContext(input: unknown): ChatPageContextResult {
  if (!isRecord(input)) {
    return { success: false, reason: 'malformed' };
  }

  const allowedKeys = ['pathname', 'locale', 'quoteStep', 'fieldId'];
  if (Object.keys(input).some((key) => !allowedKeys.includes(key))) {
    return { success: false, reason: 'extra-input' };
  }

  const { pathname, locale, quoteStep, fieldId } = input;
  if (typeof pathname !== 'string' || !PATHNAME_PATTERN.test(pathname) ||
      pathname.length > MAX_PATHNAME_LENGTH) {
    return { success: false, reason: 'malformed' };
  }
  if (locale !== 'ja') {
    return { success: false, reason: 'malformed' };
  }
  if (quoteStep !== undefined && !isChatQuoteStep(quoteStep)) {
    return { success: false, reason: 'malformed' };
  }
  if (fieldId !== undefined && !isFieldId(fieldId)) {
    return { success: false, reason: 'malformed' };
  }

  const validQuoteStep = isChatQuoteStep(quoteStep) ? quoteStep : undefined;
  const validFieldId = isFieldId(fieldId) ? fieldId : undefined;
  if (validFieldId !== undefined && validQuoteStep === undefined) {
    return { success: false, reason: 'malformed' };
  }

  const context: ChatPageContext = { pathname, locale };
  if (pathname !== '/quote-simulator' || validQuoteStep === undefined) {
    return { success: true, context };
  }

  if (validFieldId !== undefined && !isKnownQuoteField(validQuoteStep, validFieldId)) {
    return { success: true, context };
  }

  context.quoteStep = validQuoteStep;
  if (validFieldId !== undefined) {
    context.fieldId = validFieldId;
  }
  return { success: true, context };
}
