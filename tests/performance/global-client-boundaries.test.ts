import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { ModalWrapper } from '@/app/components/ModalWrapper';
import { CookieConsentBannerWrapper } from '@/components/analytics/CookieConsentBannerWrapper';
import { ChatWidget } from '@/components/chat/ChatWidgetWrapper';

const repoRoot = resolve(__dirname, '../..');

function isRenderableComponent(component: unknown): boolean {
  if (typeof component === 'function') {
    return true;
  }

  if (typeof component !== 'object' || component === null) {
    return false;
  }

  const reactComponent = component as {
    $$typeof?: unknown;
    render?: unknown;
  };

  return (
    typeof reactComponent.render === 'function' ||
    typeof reactComponent.$$typeof === 'symbol'
  );
}

function readSource(path: string): string {
  return readFileSync(resolve(repoRoot, path), 'utf8');
}

describe('G005 global deferred client boundaries', () => {
  it('keeps runtime wrapper exports available without eagerly importing hidden content', () => {
    expect(isRenderableComponent(ModalWrapper)).toBe(true);
    expect(isRenderableComponent(CookieConsentBannerWrapper)).toBe(true);
    expect(isRenderableComponent(ChatWidget)).toBe(true);
  });

  it('uses in-memory next/dynamic imports with SSR disabled and null loading UI', () => {
    const deferredSources: Array<[string, string]> = [
      ['modal runtime', 'src/app/components/ModalWrapper.tsx'],
      ['chat runtime', 'src/components/chat/ChatWidgetWrapper.tsx'],
      ['cookie runtime', 'src/components/analytics/CookieConsentBannerWrapper.tsx'],
    ];

    for (const [label, path] of deferredSources) {
      const source = readSource(path);
      expect(`${label}: ${source}`).toContain("import dynamic from 'next/dynamic'");
      expect(`${label}: ${source}`).toMatch(/\(\)\s*=>\s*import\(/);
      expect(`${label}: ${source}`).toMatch(/ssr:\s*false/);
      expect(`${label}: ${source}`).toMatch(/loading:\s*\(\)\s*=>\s*null/);
      expect(`${label}: ${source}`).not.toMatch(/require\(/);
    }
  });

  it('imports the expected runtime components across each boundary', () => {
    expect(readSource('src/app/components/ModalWrapper.tsx'))
      .toContain("import('@/components/contact/SampleRequestModal')");
    expect(readSource('src/components/chat/ChatWidgetWrapper.tsx'))
      .toContain("import('./ChatWidget')");
    expect(readSource('src/components/analytics/CookieConsentBannerWrapper.tsx'))
      .toContain("import('./CookieConsentBanner')");
  });

  it('does not add storage persistence at the deferred boundary', () => {
    const boundaryPaths = [
      'src/app/components/ModalWrapper.tsx',
      'src/components/chat/ChatWidgetWrapper.tsx',
      'src/components/analytics/CookieConsentBannerWrapper.tsx',
    ];

    for (const path of boundaryPaths) {
      const source = readSource(path);
      expect(`${path}: ${source}`).not.toMatch(/\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b|document\.cookie/);
    }
  });

  it('keeps dead widgets out of the root module and mounts only the two deferred boundaries', () => {
    const layout = readSource('src/app/layout.tsx');
    expect(layout).toContain('CookieConsentBannerWrapper');
    expect(layout).toContain('<CookieConsentBannerWrapper />');
    expect(layout).not.toMatch(/import\s+\{\s*CustomCursor[^}]*\}\s+from/);
    expect(layout).not.toMatch(/import\s+\{\s*InactivityWarningModal[^}]*\}\s+from/);
    expect(layout).toContain('ModalWrapper />');
  });

  it('keeps matrix actions aligned with the bounded implementation', () => {
    const matrix = JSON.parse(readFileSync(
      resolve(repoRoot, '.omx/reports/provider-consumer-matrix-homepage-speed.json'),
      'utf8',
    ));
    const byName = new Map(matrix.entries.map((entry: { name: string; action: string }) => [entry.name, entry.action]));
    expect(byName.get('ModalWrapper')).toBe('split');
    expect(byName.get('CookieConsentBanner')).toBe('defer');
    expect(byName.get('ChatWidget')).toBe('retain');
    expect(byName.get('AuthProvider')).toBe('retain');
    expect(byName.get('CatalogProvider')).toBe('retain');
    expect(byName.get('LanguageProvider')).toBe('retain');
  });
});
