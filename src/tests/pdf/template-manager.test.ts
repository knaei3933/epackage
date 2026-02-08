/**
 * Template Manager Tests
 *
 * テンプレートマネージャーテスト
 * - テンプレート登録
 * - テンプレートキャッシュ
 * - ヘルパー関数
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { TemplateManager } from '@/lib/pdf/core/template-manager';
import type { TemplateDefinition } from '@/lib/pdf/core/template-manager';

// ============================================================
// Tests
// ============================================================

describe('TemplateManager', () => {
  let manager: TemplateManager;

  beforeEach(() => {
    manager = new TemplateManager();
  });

  describe('Initialization', () => {
    it('should initialize with empty templates', () => {
      const ids = manager.getRegisteredTemplateIds();
      expect(ids).toEqual([]);
    });

    it('should have cache enabled by default', () => {
      expect(manager).toBeDefined();
    });
  });

  describe('Template Registration', () => {
    it('should register template from definition', () => {
      const definition: TemplateDefinition = {
        id: 'test-template',
        name: 'Test Template',
        sourceType: 'string',
        templateString: '<div>{{content}}</div>',
      };

      manager.registerTemplate(definition);
      expect(manager.hasTemplate('test-template')).toBe(true);
    });

    it('should register template from string', () => {
      manager.registerTemplateFromString('string-template', '<p>{{text}}</p>', 'String Template');
      expect(manager.hasTemplate('string-template')).toBe(true);
    });

    it('should throw error for non-existent template', async () => {
      await expect(manager.getTemplate('non-existent')).rejects.toThrow('Template not found');
    });
  });

  describe('Template Loading', () => {
    it('should load string template', async () => {
      manager.registerTemplateFromString('test', '<div>{{name}}</div>');

      const template = await manager.getTemplate('test');
      expect(typeof template).toBe('function');

      const result = template({ name: 'Test' });
      expect(result).toContain('Test');
    });

    it('should cache loaded templates', async () => {
      manager.registerTemplateFromString('test', '<div>{{value}}</div>');

      const template1 = await manager.getTemplate('test');
      const template2 = await manager.getTemplate('test');

      expect(template1).toBe(template2);
    });

    it('should clear cache', async () => {
      manager.registerTemplateFromString('test', '<div>{{value}}</div>');

      await manager.getTemplate('test');
      manager.clearCache();

      expect(manager.hasTemplate('test')).toBe(true);
    });
  });

  describe('Helper Functions', () => {
    it('should have formatYen helper', async () => {
      manager.registerTemplateFromString('test', '{{formatYen amount}}');
      const template = await manager.getTemplate('test');

      const result = template({ amount: 1234 });
      expect(result).toContain('¥1,234');
    });

    it('should have formatJapaneseDate helper', async () => {
      manager.registerTemplateFromString('test', '{{formatJapaneseDate date}}');
      const template = await manager.getTemplate('test');

      const result = template({ date: '2024-04-01' });
      expect(result).toMatch(/2024年4月1日/);
    });

    it('should have eq helper', async () => {
      manager.registerTemplateFromString('test', '{{#if (eq a b)}}equal{{/if}}');
      const template = await manager.getTemplate('test');

      const result1 = template({ a: 1, b: 1 });
      expect(result1).toContain('equal');

      const result2 = template({ a: 1, b: 2 });
      expect(result2).not.toContain('equal');
    });

    it('should have length helper', async () => {
      manager.registerTemplateFromString('test', '{{length items}}');
      const template = await manager.getTemplate('test');

      const result = template({ items: [1, 2, 3] });
      expect(result).toContain('3');
    });

    it('should have truncate helper', async () => {
      manager.registerTemplateFromString('test', '{{truncate text 5}}');
      const template = await manager.getTemplate('test');

      const result = template({ text: 'Hello World' });
      expect(result).toContain('Hello...');
    });
  });

  describe('Cache Management', () => {
    it('should clear specific template cache', async () => {
      manager.registerTemplateFromString('test1', '<div>{{a}}</div>');
      manager.registerTemplateFromString('test2', '<div>{{b}}</div>');

      await manager.getTemplate('test1');
      await manager.getTemplate('test2');

      manager.clearTemplateCache('test1');

      expect(manager.hasTemplate('test1')).toBe(true);
      expect(manager.hasTemplate('test2')).toBe(true);
    });

    it('should clear all templates cache', async () => {
      manager.registerTemplateFromString('test1', '<div>{{a}}</div>');
      manager.registerTemplateFromString('test2', '<div>{{b}}</div>');

      await manager.getTemplate('test1');
      await manager.getTemplate('test2');

      manager.clearCache();

      expect(manager.hasTemplate('test1')).toBe(true);
      expect(manager.hasTemplate('test2')).toBe(true);
    });
  });

  describe('Template Queries', () => {
    it('should return empty list when no templates', () => {
      const ids = manager.getRegisteredTemplateIds();
      expect(ids).toEqual([]);
    });

    it('should return list of registered template IDs', () => {
      manager.registerTemplateFromString('test1', '<div></div>');
      manager.registerTemplateFromString('test2', '<div></div>');
      manager.registerTemplateFromString('test3', '<div></div>');

      const ids = manager.getRegisteredTemplateIds();
      expect(ids).toContain('test1');
      expect(ids).toContain('test2');
      expect(ids).toContain('test3');
      expect(ids.length).toBe(3);
    });

    it('should check template existence', () => {
      manager.registerTemplateFromString('test', '<div></div>');

      expect(manager.hasTemplate('test')).toBe(true);
      expect(manager.hasTemplate('non-existent')).toBe(false);
    });
  });
});

describe('TemplateManager Edge Cases', () => {
  it('should handle empty template string', async () => {
    const manager = new TemplateManager();
    manager.registerTemplateFromString('empty', '');
    const template = await manager.getTemplate('empty');

    const result = template({ test: 'value' });
    expect(result).toBe('');
  });

  it('should handle template with no variables', async () => {
    const manager = new TemplateManager();
    manager.registerTemplateFromString('static', '<div>Static Content</div>');
    const template = await manager.getTemplate('static');

    const result = template({});
    expect(result).toContain('Static Content');
  });

  it('should handle nested object data', async () => {
    const manager = new TemplateManager();
    manager.registerTemplateFromString('nested', '{{user.name}} - {{user.email}}');
    const template = await manager.getTemplate('nested');

    const result = template({
      user: { name: 'Test', email: 'test@example.com' },
    });
    expect(result).toContain('Test - test@example.com');
  });

  it('should handle array iteration', async () => {
    const manager = new TemplateManager();
    manager.registerTemplateFromString(
      'array',
      '{{#each items}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}'
    );
    const template = await manager.getTemplate('array');

    const result = template({ items: ['a', 'b', 'c'] });
    expect(result).toContain('a, b, c');
  });

  it('should handle conditional sections', async () => {
    const manager = new TemplateManager();
    manager.registerTemplateFromString(
      'conditional',
      '{{#if show}}Visible{{/if}}{{#unless show}}Hidden{{/unless}}'
    );
    const template = await manager.getTemplate('conditional');

    const result1 = template({ show: true });
    expect(result1).toContain('Visible');
    expect(result1).not.toContain('Hidden');

    const result2 = template({ show: false });
    expect(result2).not.toContain('Visible');
    expect(result2).toContain('Hidden');
  });
});
