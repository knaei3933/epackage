export const CHAT_LEAD_INTENTS = [
  'quote',
  'sample',
  'technical',
  'general',
  'human',
] as const;

export type ChatLeadIntent = (typeof CHAT_LEAD_INTENTS)[number];
export type ChatContactChannel = 'email' | 'phone';
export type ChatPreferredChannel = 'email' | 'phone' | 'any';
export type ChatContactWindow =
  | 'unspecified'
  | 'weekday_daytime'
  | 'weekday_evening'
  | 'weekend';

export interface ChatLeadRequirements {
  contentsDescription?: string;
  quantityDescription?: string;
  sizeSpecState?: string;
  materialPrintingNeeds?: string;
  deadlineText?: string;
}

export interface ChatLeadContact {
  channel: ChatContactChannel;
  email?: string;
  phone?: string;
  companyName?: string;
  contactName?: string;
  preferredChannel: ChatPreferredChannel;
  contactWindow: ChatContactWindow;
}

export interface ChatLeadConsent {
  contact: boolean;
  privacy: boolean;
  marketing: boolean;
  memberLinkage: boolean;
}

export interface ChatLeadSubmission {
  sessionId: string;
  intent: ChatLeadIntent;
  requirements: ChatLeadRequirements;
  contact: ChatLeadContact;
  consent: ChatLeadConsent;
  memberLinkage: boolean;
  pageContext: Record<string, unknown>;
}

export type ChatLeadSchemaFailure =
  | 'malformed'
  | 'extra-input'
  | 'invalid-session'
  | 'invalid-intent'
  | 'invalid-requirements'
  | 'invalid-contact'
  | 'invalid-consent'
  | 'invalid-page-context';

export type ChatLeadSchemaResult =
  | { success: true; lead: ChatLeadSubmission }
  | { success: false; reason: ChatLeadSchemaFailure };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/;
const PHONE_PATTERN = /^\+?[0-9][0-9-]{5,30}[0-9]$/;
const DIGIT_RUN_PATTERN = /\d{9,}/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasOnly = (value: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(value).every((key) => keys.includes(key));

const normalizeText = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') return undefined;
  const normalized = value.normalize('NFKC').trim();
  return normalized.length === 0 ? undefined : normalized;
};

const requirement = (
  value: unknown,
  maxLength: number,
): string | undefined | false => {
  const normalized = normalizeText(value);
  if (normalized === undefined) return undefined;
  if (
    normalized.length > maxLength ||
    normalized.includes('@') ||
    DIGIT_RUN_PATTERN.test(normalized)
  ) {
    return false;
  }
  return normalized;
};

export function validateChatLeadSubmission(input: unknown): ChatLeadSchemaResult {
  if (!isRecord(input)) return { success: false, reason: 'malformed' };
  if (!hasOnly(input, [
    'sessionId', 'intent', 'requirements', 'contact', 'consent',
    'memberLinkage', 'pageContext',
  ])) {
    return { success: false, reason: 'extra-input' };
  }
  if (typeof input.sessionId !== 'string' || !UUID_PATTERN.test(input.sessionId)) {
    return { success: false, reason: 'invalid-session' };
  }
  if (!CHAT_LEAD_INTENTS.includes(input.intent as ChatLeadIntent)) {
    return { success: false, reason: 'invalid-intent' };
  }

  if (
    !isRecord(input.pageContext) ||
    Object.keys(input.pageContext).some((key) => !['pathname', 'locale', 'quoteStep', 'fieldId'].includes(key))
  ) {
    return { success: false, reason: 'invalid-page-context' };
  }

  const requirementsInput = input.requirements;
  if (
    !isRecord(requirementsInput) ||
    !hasOnly(requirementsInput, [
      'contentsDescription',
      'quantityDescription',
      'sizeSpecState',
      'materialPrintingNeeds',
      'deadlineText',
    ])
  ) {
    return { success: false, reason: 'invalid-requirements' };
  }

  const contentsDescription = requirement(requirementsInput.contentsDescription, 400);
  const quantityDescription = requirement(requirementsInput.quantityDescription, 200);
  const sizeSpecState = requirement(requirementsInput.sizeSpecState, 300);
  const materialPrintingNeeds = requirement(requirementsInput.materialPrintingNeeds, 300);
  const deadlineText = requirement(requirementsInput.deadlineText, 100);
  if (
    contentsDescription === false ||
    quantityDescription === false ||
    sizeSpecState === false ||
    materialPrintingNeeds === false ||
    deadlineText === false
  ) {
    return { success: false, reason: 'invalid-requirements' };
  }
  if (
    contentsDescription === undefined &&
    quantityDescription === undefined &&
    sizeSpecState === undefined &&
    materialPrintingNeeds === undefined &&
    deadlineText === undefined
  ) {
    return { success: false, reason: 'invalid-requirements' };
  }

  const contactInput = input.contact;
  if (
    !isRecord(contactInput) ||
    !hasOnly(contactInput, [
      'channel',
      'email',
      'phone',
      'companyName',
      'contactName',
      'preferredChannel',
      'contactWindow',
    ]) ||
    (contactInput.channel !== 'email' && contactInput.channel !== 'phone') ||
    !['email', 'phone', 'any'].includes(contactInput.preferredChannel as ChatPreferredChannel) ||
    ![
      'unspecified',
      'weekday_daytime',
      'weekday_evening',
      'weekend',
    ].includes(contactInput.contactWindow as ChatContactWindow)
  ) {
    return { success: false, reason: 'invalid-contact' };
  }

  const email = normalizeText(contactInput.email)?.toLowerCase();
  const phone = normalizeText(contactInput.phone);
  const companyName = normalizeText(contactInput.companyName);
  const contactName = normalizeText(contactInput.contactName);
  if (email !== undefined && !EMAIL_PATTERN.test(email)) {
    return { success: false, reason: 'invalid-contact' };
  }
  if (phone !== undefined && !PHONE_PATTERN.test(phone)) {
    return { success: false, reason: 'invalid-contact' };
  }
  if ((companyName !== undefined && companyName.length > 200) ||
      (contactName !== undefined && contactName.length > 100)) {
    return { success: false, reason: 'invalid-contact' };
  }
  if (contactInput.channel === 'email' && (email === undefined || phone !== undefined)) {
    return { success: false, reason: 'invalid-contact' };
  }
  if (contactInput.channel === 'phone' && (phone === undefined || email !== undefined)) {
    return { success: false, reason: 'invalid-contact' };
  }

  const consentInput = input.consent;
  if (
    !isRecord(consentInput) ||
    !hasOnly(consentInput, ['contact', 'privacy', 'marketing', 'memberLinkage']) ||
    typeof consentInput.contact !== 'boolean' ||
    typeof consentInput.privacy !== 'boolean' ||
    typeof consentInput.marketing !== 'boolean' ||
    typeof consentInput.memberLinkage !== 'boolean'
  ) {
    return { success: false, reason: 'invalid-consent' };
  }
  if (!consentInput.contact || !consentInput.privacy) {
    return { success: false, reason: 'invalid-consent' };
  }
  if (typeof input.memberLinkage !== 'boolean') {
    return { success: false, reason: 'invalid-consent' };
  }

  return {
    success: true,
    lead: {
      sessionId: input.sessionId,
      intent: input.intent as ChatLeadIntent,
      requirements: {
        contentsDescription,
        quantityDescription,
        sizeSpecState,
        materialPrintingNeeds,
        deadlineText,
      },
      contact: {
        channel: contactInput.channel,
        email,
        phone,
        companyName,
        contactName,
        preferredChannel: contactInput.preferredChannel as ChatPreferredChannel,
        contactWindow: contactInput.contactWindow as ChatContactWindow,
      },
      consent: {
        contact: consentInput.contact,
        privacy: consentInput.privacy,
        marketing: consentInput.marketing,
        memberLinkage: consentInput.memberLinkage,
      },
      memberLinkage: input.memberLinkage,
      pageContext: input.pageContext,
    },
  };
}
