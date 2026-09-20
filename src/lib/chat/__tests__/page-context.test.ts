import { parseChatPageContext } from '@/lib/chat/page-context';

describe('parseChatPageContext', () => {
  it('accepts a known quote simulator field', () => {
    const result = parseChatPageContext({
      pathname: '/quote-simulator',
      locale: 'ja',
      quoteStep: 'specs',
      fieldId: 'width',
    });

    expect(result).toEqual({
      success: true,
      context: {
        pathname: '/quote-simulator',
        locale: 'ja',
        quoteStep: 'specs',
        fieldId: 'width',
      },
    });
  });

  it('returns general context for an unknown route', () => {
    const result = parseChatPageContext({
      pathname: '/unknown-page',
      locale: 'ja',
      quoteStep: 'specs',
      fieldId: 'width',
    });

    expect(result).toEqual({
      success: true,
      context: { pathname: '/unknown-page', locale: 'ja' },
    });
  });

  it('returns general context for a syntactically valid unknown field', () => {
    const result = parseChatPageContext({
      pathname: '/quote-simulator',
      locale: 'ja',
      quoteStep: 'specs',
      fieldId: 'not-in-catalog',
    });

    expect(result).toEqual({
      success: true,
      context: { pathname: '/quote-simulator', locale: 'ja' },
    });
  });

  it('rejects extra input and malformed values', () => {
    expect(parseChatPageContext(null).success).toBe(false);
    expect(parseChatPageContext({
      pathname: '/quote-simulator',
      locale: 'ja',
      extra: true,
    }).success).toBe(false);
    expect(parseChatPageContext({
      pathname: 'quote-simulator',
      locale: 'ja',
    }).success).toBe(false);
    expect(parseChatPageContext({
      pathname: `/${'a'.repeat(200)}`,
      locale: 'ja',
    }).success).toBe(false);
    expect(parseChatPageContext({
      pathname: '/quote-simulator',
      locale: 'en',
    }).success).toBe(false);
    expect(parseChatPageContext({
      pathname: '/quote-simulator',
      locale: 'ja',
      quoteStep: 'unknown',
    }).success).toBe(false);
    expect(parseChatPageContext({
      pathname: '/quote-simulator',
      locale: 'ja',
      quoteStep: 'specs',
      fieldId: 'bad field',
    }).success).toBe(false);
  });
});
