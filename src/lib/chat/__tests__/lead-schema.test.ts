import {
  validateChatLeadSubmission,
} from '@/lib/chat/lead-schema';

const validLead = (): Record<string, unknown> => ({
  sessionId: '123e4567-e89b-42d3-a456-426614174000',
  intent: 'quote',
  requirements: {
    contentsDescription: '粉体の健康食品',
    quantityDescription: '3SKU / 各5000枚',
    sizeSpecState: '幅120mm×高さ200mm予定',
    materialPrintingNeeds: 'アルミバリア・4色印刷',
    deadlineText: '来月中目安',
  },
  contact: {
    channel: 'email',
    email: ' Customer@Example.JP ',
    preferredChannel: 'email',
    contactWindow: 'weekday_daytime',
  },
  consent: {
    contact: true,
    privacy: true,
    marketing: false,
    memberLinkage: false,
  },
  memberLinkage: false,
  pageContext: {
    pathname: '/quote-simulator',
    locale: 'ja',
    quoteStep: 'specs',
    fieldId: 'contents',
  },
});

describe('chat lead schema', () => {
  it('normalizes and accepts the exact structured contract', () => {
    const result = validateChatLeadSubmission(validLead());

    expect(result).toMatchObject({
      success: true,
      lead: {
        contact: { email: 'customer@example.jp' },
      },
    });
  });

  it('rejects unknown keys and malformed identity/session/intent', () => {
    const extra = validLead();
    extra.webhookUrl = 'https://attacker.example';
    expect(validateChatLeadSubmission(extra)).toMatchObject({ reason: 'extra-input' });
    expect(validateChatLeadSubmission(null)).toMatchObject({ reason: 'malformed' });

    const badSession = validLead();
    badSession.sessionId = 'not-a-uuid';
    expect(validateChatLeadSubmission(badSession)).toMatchObject({ reason: 'invalid-session' });

    const badIntent = validLead();
    badIntent.intent = 'marketing';
    expect(validateChatLeadSubmission(badIntent)).toMatchObject({ reason: 'invalid-intent' });

    const badContext = validLead();
    badContext.pageContext = { pathname: '/quote-simulator', locale: 'ja', extra: true };
    expect(validateChatLeadSubmission(badContext)).toMatchObject({ reason: 'invalid-page-context' });
  });

  it('rejects PII-like requirement text and requires one field', () => {
    const email = validLead();
    (email.requirements as Record<string, unknown>).contentsDescription = 'user@example.com';
    expect(validateChatLeadSubmission(email)).toMatchObject({ reason: 'invalid-requirements' });

    const phone = validLead();
    (phone.requirements as Record<string, unknown>).deadlineText = '電話09012345678';
    expect(validateChatLeadSubmission(phone)).toMatchObject({ reason: 'invalid-requirements' });

    const empty = validLead();
    empty.requirements = {};
    expect(validateChatLeadSubmission(empty)).toMatchObject({ reason: 'invalid-requirements' });
  });

  it('requires exactly one valid contact channel and explicit consent', () => {
    const both = validLead();
    (both.contact as Record<string, unknown>).phone = '050-1793-6500';
    expect(validateChatLeadSubmission(both)).toMatchObject({ reason: 'invalid-contact' });

    const badEmail = validLead();
    (badEmail.contact as Record<string, unknown>).email = 'not-an-email';
    expect(validateChatLeadSubmission(badEmail)).toMatchObject({ reason: 'invalid-contact' });

    const noConsent = validLead();
    (noConsent.consent as Record<string, unknown>).privacy = false;
    expect(validateChatLeadSubmission(noConsent)).toMatchObject({ reason: 'invalid-consent' });
  });
});
