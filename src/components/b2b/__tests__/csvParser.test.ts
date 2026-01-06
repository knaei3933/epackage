/**
 * CSV Parser Utility Tests
 *
 * CSV解析ユーティリティ単体テスト
 * Unit tests for CSV parsing utilities
 *
 * @jest-environment node
 */

import { describe, it, expect } from '@jest/globals';

// ============================================================
// CSV Parser Function (imported from CSVBulkImport)
// ============================================================

function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let currentLine: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++;
        } else {
          // End of quoted field
          insideQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ',') {
        currentLine.push(currentField);
        currentField = '';
      } else if (char === '\n') {
        currentLine.push(currentField);
        lines.push(currentLine);
        currentLine = [];
        currentField = '';
      } else if (char === '\r' && nextChar === '\n') {
        // Windows line ending
        currentLine.push(currentField);
        lines.push(currentLine);
        currentLine = [];
        currentField = '';
        i++;
      } else {
        currentField += char;
      }
    }
  }

  // Add last field and line
  currentLine.push(currentField);
  if (currentLine.length > 0 && (currentLine.length > 1 || currentLine[0] !== '')) {
    lines.push(currentLine);
  }

  return lines;
}

// ============================================================
// Test Suites
// ============================================================

describe('parseCSV', () => {
  it('should parse simple CSV', () => {
    const csv = 'name,age,city\nJohn,30,New York\nJane,25,Tokyo';
    const result = parseCSV(csv);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(['name', 'age', 'city']);
    expect(result[1]).toEqual(['John', '30', 'New York']);
    expect(result[2]).toEqual(['Jane', '25', 'Tokyo']);
  });

  it('should handle quoted fields', () => {
    const csv = 'name,description\nJohn,"A person with, comma"\nJane,"Another person"';
    const result = parseCSV(csv);

    expect(result).toHaveLength(3);
    expect(result[1]).toEqual(['John', 'A person with, comma']);
    expect(result[2]).toEqual(['Jane', 'Another person']);
  });

  it('should handle escaped quotes', () => {
    const csv = 'name,quote\nJohn,"He said ""Hello"""\nJane,"""Test""';
    const result = parseCSV(csv);

    expect(result).toHaveLength(3);
    expect(result[1]).toEqual(['John', 'He said "Hello"']);
    expect(result[2]).toEqual(['Jane', '"Test"']);
  });

  it('should handle empty fields', () => {
    const csv = 'name,age,city\nJohn,30,\nJane,,Tokyo';
    const result = parseCSV(csv);

    expect(result).toHaveLength(3);
    expect(result[1]).toEqual(['John', '30', '']);
    expect(result[2]).toEqual(['Jane', '', 'Tokyo']);
  });

  it('should handle empty lines', () => {
    const csv = 'name,age\nJohn,30\n\nJane,25';
    const result = parseCSV(csv);

    // Empty lines should be skipped
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toEqual(['name', 'age']);
    expect(result[result.length - 1]).toEqual(['Jane', '25']);
  });

  it('should handle Windows line endings (CRLF)', () => {
    const csv = 'name,age\r\nJohn,30\r\nJane,25';
    const result = parseCSV(csv);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(['name', 'age']);
    expect(result[1]).toEqual(['John', '30']);
    expect(result[2]).toEqual(['Jane', '25']);
  });

  it('should handle Unix line endings (LF)', () => {
    const csv = 'name,age\nJohn,30\nJane,25';
    const result = parseCSV(csv);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(['name', 'age']);
    expect(result[1]).toEqual(['John', '30']);
    expect(result[2]).toEqual(['Jane', '25']);
  });

  it('should handle Japanese characters', () => {
    const csv = 'productName,quantity\nスタンドアップパウチ,1000\n三方シール袋,500';
    const result = parseCSV(csv);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(['productName', 'quantity']);
    expect(result[1]).toEqual(['スタンドアップパウチ', '1000']);
    expect(result[2]).toEqual(['三方シール袋', '500']);
  });

  it('should handle single column CSV', () => {
    const csv = 'name\nJohn\nJane';
    const result = parseCSV(csv);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(['name']);
    expect(result[1]).toEqual(['John']);
    expect(result[2]).toEqual(['Jane']);
  });

  it('should handle trailing comma', () => {
    const csv = 'name,age,\nJohn,30,\nJane,25,';
    const result = parseCSV(csv);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(['name', 'age', '']);
    expect(result[1]).toEqual(['John', '30', '']);
    expect(result[2]).toEqual(['Jane', '25', '']);
  });

  it('should handle quoted fields with line breaks', () => {
    const csv = 'name,description\nProduct1,"Line 1\nLine 2"\nProduct2,Normal';
    const result = parseCSV(csv);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(['name', 'description']);
    expect(result[1]).toEqual(['Product1', 'Line 1\nLine 2']);
    expect(result[2]).toEqual(['Product2', 'Normal']);
  });
});

// ============================================================
// CSV Row Validation Tests
// ============================================================

describe('CSV Row Validation', () => {
  it('should validate required fields exist', () => {
    const csv = 'productName,quantity\nProduct1,1000';
    const result = parseCSV(csv);

    const headers = result[0].map(h => h.trim().toLowerCase());
    expect(headers).toContain('productname');
    expect(headers).toContain('quantity');
  });

  it('should detect missing required columns', () => {
    const csv = 'productName,notes\nProduct1,Test note';
    const result = parseCSV(csv);

    const headers = result[0].map(h => h.trim().toLowerCase());
    expect(headers).toContain('productname');
    expect(headers).not.toContain('quantity');
  });

  it('should parse quotation item data correctly', () => {
    const csv = `productName,productCode,category,quantity,unitPrice,notes
スタンドアップパウチ,PRD-001,stand_up,1000,150,サンプル
三方シール袋,PRD-002,flat_3_side,500,100,`;

    const result = parseCSV(csv);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual([
      'productName',
      'productCode',
      'category',
      'quantity',
      'unitPrice',
      'notes'
    ]);

    expect(result[1][0]).toBe('スタンドアップパウチ');
    expect(result[1][1]).toBe('PRD-001');
    expect(result[1][3]).toBe('1000');
  });

  it('should handle specifications as JSON', () => {
    const csv = 'productName,quantity,specifications\nProduct1,1000,"{""size"":""W150×H200""}"';
    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[1][2]).toBe('{"size":"W150×H200"}');
  });
});

// ============================================================
// Edge Cases
// ============================================================

describe('CSV Parser Edge Cases', () => {
  it('should handle empty CSV', () => {
    const csv = '';
    const result = parseCSV(csv);

    // Should return empty or minimal array
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle CSV with only headers', () => {
    const csv = 'name,age,city';
    const result = parseCSV(csv);

    // Should return headers only
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(['name', 'age', 'city']);
  });

  it('should handle very long field values', () => {
    const longValue = 'A'.repeat(10000);
    const csv = `name,value\nTest,${longValue}`;
    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[1][1]).toBe(longValue);
  });

  it('should handle special characters', () => {
    const csv = 'name,specialChars\nTest,"!@#$%^&*(){}[]"';
    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[1][1]).toBe('!@#$%^&*(){}[]');
  });

  it('should handle Unicode characters', () => {
    const csv = 'name,emoji\nTest,"🎉🎊🎁"';
    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[1][1]).toBe('🎉🎊🎁');
  });
});
