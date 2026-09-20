import {
  clearKnowledgeCache,
  getAllKnowledge,
  getKnowledgeEntry,
  getKnowledgeStats,
  getRelevantKnowledge,
  getRelevantKnowledgeEntries,
} from '../knowledge-base';
import { KNOWLEDGE_CORPUS } from '../knowledge-corpus';

describe('relevant knowledge selection', () => {
  it('resolves expected product entries by mapped Japanese keywords', () => {
    expect(getRelevantKnowledgeEntries('スタンドパウチについて教えてください').map((entry) => entry.id))
      .toEqual(['02-stand-pouch']);
    expect(getRelevantKnowledgeEntries('平袋の価格を知りたい').map((entry) => entry.id))
      .toEqual(['01-flat-pouch', '09-product-selection-guide']);
  });

  it('returns prompt text for matched queries and empty text for unmatched queries', () => {
    const standPouch = KNOWLEDGE_CORPUS.find((entry) => entry.id === '02-stand-pouch');

    expect(getRelevantKnowledge('スタンドパウチについて教えてください')).toBe(standPouch?.content);
    expect(getRelevantKnowledge('関係のない入力です')).toBe('');
  });

  it('exposes deterministic corpus statistics and complete knowledge', () => {
    const stats = getKnowledgeStats();

    expect(stats.totalFiles).toBe(12);
    expect(stats.fileIds).toEqual(KNOWLEDGE_CORPUS.map((entry) => entry.id));
    expect(stats.totalKeywords).toBeGreaterThan(0);
    expect(getAllKnowledge()).toBe(KNOWLEDGE_CORPUS.map((entry) => entry.content).join('\n\n---\n\n'));
  });

  it('preserves the compatibility cache API without changing tracked data', () => {
    const before = getKnowledgeEntry('01-flat-pouch');

    expect(() => clearKnowledgeCache()).not.toThrow();
    expect(getKnowledgeEntry('01-flat-pouch')).toBe(before);
    expect(getKnowledgeEntry('99-missing')).toBeUndefined();
  });
});
