import type { UIMessage } from 'ai';

export const MAX_CHAT_MESSAGES = 30;
export const MAX_CHAT_MESSAGE_ID_LENGTH = 128;
export const MAX_CHAT_MESSAGE_TEXT_LENGTH = 4_000;
export const MAX_CHAT_TOTAL_TEXT_LENGTH = 20_000;

export type ChatMessageValidationReason =
  | 'malformed-message'
  | 'system-role-forbidden'
  | 'invalid-role'
  | 'invalid-parts'
  | 'too-many-messages'
  | 'message-too-large'
  | 'conversation-too-large'
  | 'missing-user-message';

export type ChatMessagesResult =
  | { success: true; messages: UIMessage[] }
  | { success: false; reason: ChatMessageValidationReason };

const ALLOWED_MESSAGE_KEYS = new Set(['id', 'role', 'parts']);
const ALLOWED_PART_KEYS = new Set(['type', 'text']);
const ALLOWED_ROLES = new Set(['user', 'assistant']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isValidId = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= MAX_CHAT_MESSAGE_ID_LENGTH;

const isAllowedRole = (value: unknown): value is 'user' | 'assistant' =>
  typeof value === 'string' && ALLOWED_ROLES.has(value);

/**
 * Return a deterministic, array-unique ID when an optional client ID is absent.
 * The index guarantees uniqueness without trusting or echoing client content.
 */
const createFallbackId = (index: number): string => `chat-message-${index}`;

export function validateChatMessages(input: unknown): ChatMessagesResult {
  if (!Array.isArray(input) || input.length === 0) {
    return { success: false, reason: 'malformed-message' };
  }
  if (input.length > MAX_CHAT_MESSAGES) {
    return { success: false, reason: 'too-many-messages' };
  }

  const messages: UIMessage[] = [];
  let totalTextLength = 0;
  let hasUserMessage = false;

  for (const [index, value] of input.entries()) {
    if (!isRecord(value)) {
      return { success: false, reason: 'malformed-message' };
    }
    if (Object.keys(value).some((key) => !ALLOWED_MESSAGE_KEYS.has(key))) {
      return { success: false, reason: 'malformed-message' };
    }

    const { id, role, parts } = value;
    if (role === 'system') {
      return { success: false, reason: 'system-role-forbidden' };
    }
    if (!isAllowedRole(role)) {
      return { success: false, reason: 'invalid-role' };
    }
    if (id !== undefined && !isValidId(id)) {
      return { success: false, reason: 'malformed-message' };
    }
    if (!Array.isArray(parts) || parts.length === 0) {
      return { success: false, reason: 'invalid-parts' };
    }

    const validatedParts: Array<{ type: 'text'; text: string }> = [];
    let messageTextLength = 0;

    for (const part of parts) {
      if (
        !isRecord(part) ||
        Object.keys(part).some((key) => !ALLOWED_PART_KEYS.has(key)) ||
        part.type !== 'text' ||
        typeof part.text !== 'string' ||
        part.text.length === 0
      ) {
        return { success: false, reason: 'invalid-parts' };
      }

      messageTextLength += part.text.length;
      if (messageTextLength > MAX_CHAT_MESSAGE_TEXT_LENGTH) {
        return { success: false, reason: 'message-too-large' };
      }
      validatedParts.push({ type: 'text', text: part.text });
    }

    totalTextLength += messageTextLength;
    if (totalTextLength > MAX_CHAT_TOTAL_TEXT_LENGTH) {
      return { success: false, reason: 'conversation-too-large' };
    }
    if (role === 'user') {
      hasUserMessage = true;
    }

    messages.push({
      id: typeof id === 'string' ? id : createFallbackId(index),
      role,
      parts: validatedParts,
    });
  }

  if (!hasUserMessage) {
    return { success: false, reason: 'missing-user-message' };
  }

  return { success: true, messages };
}
