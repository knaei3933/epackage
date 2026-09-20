/**
 * @jest-environment node
 */

import fs from 'fs';
import path from 'path';
import {
  CHAT_PAGE_SUGGESTIONS,
  resolveChatPageSuggestions,
  validateChatSuggestionForContext,
} from '@/lib/chat/page-suggestions';
import { PUBLIC_CHAT_FALLBACK_SUGGESTIONS } from '@/lib/chat/public-chat-suggestions';
import type { ChatSuggestionAudience } from '@/lib/chat/chat-suggestion-types';

const appDirectory = path.join(process.cwd(), 'src', 'app');

const routePatterns = fs.readdirSync(appDirectory, { recursive: true })
  .filter((value): value is string => typeof value === 'string')
  .filter((value) => value.endsWith('page.tsx'))
  .map((value) => {
    const withoutFilename = value.replace(/(?:^|\/)page\.tsx$/, '');
    return withoutFilename ? `/${withoutFilename.replaceAll('\\', '/')}` : '/';
  });

describe('page suggestion catalog', () => {
  it('resolves every App Router page to at least one suggestion set', () => {
    expect(routePatterns.length).toBeGreaterThan(80);

    for (const audience of ['public', 'member', 'staff', 'designer'] as const) {
      for (const routePattern of routePatterns) {
        const result = resolveChatPageSuggestions({
          pathname: routePattern,
          locale: 'ja',
          audience,
        });

        expect({
          audience,
          routePattern,
          count: result.suggestions.length,
        }).toMatchObject({ count: expect.any(Number) });
        expect(result.suggestions.length).toBeGreaterThan(0);
      }
    }
  });

  it('has unique IDs, bounded text, explicit audiences, and safe grounding', () => {
    const ids = CHAT_PAGE_SUGGESTIONS.map((suggestion) => suggestion.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const suggestion of CHAT_PAGE_SUGGESTIONS) {
      expect(suggestion.id).toMatch(/^[a-z0-9.-]+$/);
      expect(suggestion.id.length).toBeLessThanOrEqual(128);
      expect(suggestion.labelJa.length).toBeGreaterThan(0);
      expect(suggestion.labelJa.length).toBeLessThanOrEqual(48);
      expect(suggestion.questionJa.length).toBeGreaterThan(0);
      expect(suggestion.questionJa.length).toBeLessThanOrEqual(160);
      expect(suggestion.questionJa).not.toMatch(/実行|照会します|検索します|注文データを取得|顧客データを取得/i);
    }
  });

  it('keeps internal suggestion text out of the client-safe fallback', () => {
    const protectedText = CHAT_PAGE_SUGGESTIONS
      .filter((suggestion) => suggestion.audience !== 'public')
      .flatMap((suggestion) => [suggestion.labelJa, suggestion.questionJa]);
    const fallbackText = JSON.stringify(PUBLIC_CHAT_FALLBACK_SUGGESTIONS);

    for (const text of protectedText) {
      expect(fallbackText).not.toContain(text);
    }
  });

  it('keeps the server catalog out of the ChatWidget import boundary', () => {
    const widgetSource = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'chat', 'ChatWidget.tsx'),
      'utf8',
    );

    expect(widgetSource).toContain("from '@/lib/chat/public-chat-suggestions'");
    expect(widgetSource).not.toContain("from '@/lib/chat/page-suggestions'");
  });

  it('prioritizes the focused quote field and normalizes dynamic route families', () => {
    const focused = resolveChatPageSuggestions({
      pathname: '/quote-simulator',
      locale: 'ja',
      audience: 'public',
      quoteStep: 'specs',
      fieldId: 'width',
    });
    expect(focused.suggestions[0]).toMatchObject({
      id: 'quote.specs.width',
      grounding: { kind: 'quoteField', step: 'specs', fieldId: 'width' },
    });

    const catalogItem = resolveChatPageSuggestions({
      pathname: '/catalog/example-product',
      locale: 'ja',
      audience: 'public',
    });
    expect(catalogItem.routePattern).toBe('/catalog/[slug]');
    expect(catalogItem.routeFamily).toBe('catalog');
    expect(JSON.stringify(catalogItem)).not.toContain('example-product');
  });

  it('validates suggestion compatibility by route and audience', () => {
    expect(validateChatSuggestionForContext('public.home.selection', {
      pathname: '/',
      locale: 'ja',
    }, 'public')).toBeUndefined();

    expect(validateChatSuggestionForContext('public.home.selection', {
      pathname: '/pricing',
      locale: 'ja',
    }, 'public')).toMatchObject({ reason: 'route-mismatch' });

    expect(validateChatSuggestionForContext('member.dashboard.overview', {
      pathname: '/member',
      locale: 'ja',
    }, 'public')).toMatchObject({ reason: 'audience-mismatch' });
  });
});
