import { readFileSync } from 'fs';
import { join } from 'path';
import {
  EXPECTED_KNOWLEDGE_IDS,
  KNOWLEDGE_CORPUS,
  getKnowledgeCorpusIntegrity,
  getKnowledgeEntry,
} from '../knowledge-corpus';

describe('knowledge corpus integrity', () => {
  it('contains the exact tracked ID set with no duplicates', () => {
    const integrity = getKnowledgeCorpusIntegrity();

    expect(EXPECTED_KNOWLEDGE_IDS).toEqual([
      '01-flat-pouch',
      '02-stand-pouch',
      '03-gazette-pouch',
      '04-spout-pouch',
      '05-chojiu-bag',
      '06-roll-film',
      '07-die-cut-package',
      '08-white-plate',
      '09-product-selection-guide',
      '10-printing-guide',
      '11-user-flows',
      '12-pricing-tips',
    ]);
    expect(EXPECTED_KNOWLEDGE_IDS).toHaveLength(12);
    expect(KNOWLEDGE_CORPUS).toHaveLength(12);
    expect(integrity.actualIds).toEqual(EXPECTED_KNOWLEDGE_IDS);
    expect(integrity.duplicateIds).toEqual([]);
    expect(integrity.missingIds).toEqual([]);
    expect(integrity.unexpectedIds).toEqual([]);
    expect(integrity.isValid).toBe(true);
  });

  it('has non-empty Japanese content and keywords for every entry', () => {
    for (const entry of KNOWLEDGE_CORPUS) {
      expect(entry.keywords.length).toBeGreaterThan(0);
      expect(entry.keywords.every((keyword) => keyword.trim().length > 0)).toBe(true);
      expect(entry.content.trim().length).toBeGreaterThan(0);
      expect(entry.content).toMatch(/[\u3040-\u30ff\u4e00-\u9fff]/);
      expect(entry.content).toMatch(/見積もり|お問い合わせ|担当者/);
    }
  });

  it('resolves known IDs and returns undefined for a missing ID', () => {
    expect(getKnowledgeEntry('01-flat-pouch')?.id).toBe('01-flat-pouch');
    expect(getKnowledgeEntry('99-missing')).toBeUndefined();
  });

  it('reports structural failures for a supplied invalid corpus', () => {
    const integrity = getKnowledgeCorpusIntegrity([
      {
        id: '02-stand-pouch',
        keywords: [],
        content: '',
      },
      {
        id: '02-stand-pouch',
        keywords: ['複製'],
        content: '複製',
      },
    ]);

    expect(integrity.isValid).toBe(false);
    expect(integrity.missingIds).toContain('01-flat-pouch');
    expect(integrity.duplicateIds).toContain('02-stand-pouch');
    expect(integrity.emptyEntryIds).toContain('02-stand-pouch');
    expect(integrity.errors.length).toBeGreaterThan(0);
  });

  it('keeps production imports free of gitignored .omc file access', () => {
    const sourcePath = join(process.cwd(), 'src/lib/ai/knowledge-corpus.ts');
    const productionSource = readFileSync(sourcePath, 'utf8');

    expect(productionSource).not.toMatch(/\bfrom\s+['"](?:node:)?fs['"]/);
    expect(productionSource).not.toMatch(/\b(?:readFileSync|existsSync)\b/);
    expect(productionSource).not.toMatch(/\.omc\b/);

    const knowledgeBaseSource = readFileSync(join(process.cwd(), 'src/lib/ai/knowledge-base.ts'), 'utf8');
    expect(knowledgeBaseSource).not.toMatch(/\bfrom\s+['"](?:node:)?(?:fs|path)['"]/);
    expect(knowledgeBaseSource).not.toMatch(/\b(?:readFileSync|existsSync)\b/);
    expect(knowledgeBaseSource).not.toMatch(/\.omc\b/);
  });
});
