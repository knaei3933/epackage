import { describe, it, expect } from '@jest/globals';
import {
  parseCustomerFilename,
  generateCorrectionFilename,
  extractLanguage,
  getLanguageCode,
  isValidFilename,
  getCurrentDateForFilename,
  generateSubmissionFilename,
  compareRevisionFilenames,
} from '../file-naming';

describe('File Naming Utility', () => {
  describe('parseCustomerFilename', () => {
    it('should parse standard Chinese submission filename', () => {
      const filename = '中国語_入稿データ_ORD-2026-MLU0AQIY_20260220';
      const result = parseCustomerFilename(filename);

      expect(result).not.toBeNull();
      expect(result?.language).toBe('中国語');
      expect(result?.orderNumber).toBe('ORD-2026-MLU0AQIY');
      expect(result?.date).toBe('20260220');
      expect(result?.type).toBe('submission');
      expect(result?.revision).toBeUndefined();
    });

    it('should parse standard Korean submission filename', () => {
      const filename = '韓国語_入稿データ_ORD-2026-XYZ123_20260218';
      const result = parseCustomerFilename(filename);

      expect(result).not.toBeNull();
      expect(result?.language).toBe('韓国語');
      expect(result?.orderNumber).toBe('ORD-2026-XYZ123');
      expect(result?.date).toBe('20260218');
      expect(result?.type).toBe('submission');
    });

    it('should parse standard Japanese submission filename', () => {
      const filename = '日本語_入稿データ_ORD-2026-ABC456_20260215';
      const result = parseCustomerFilename(filename);

      expect(result).not.toBeNull();
      expect(result?.language).toBe('日本語');
      expect(result?.orderNumber).toBe('ORD-2026-ABC456');
      expect(result?.date).toBe('20260215');
      expect(result?.type).toBe('submission');
    });

    it('should parse English submission filename', () => {
      const filename = 'English_入稿データ_ORD-2026-DEF789_20260210';
      const result = parseCustomerFilename(filename);

      expect(result).not.toBeNull();
      expect(result?.language).toBe('English');
      expect(result?.orderNumber).toBe('ORD-2026-DEF789');
      expect(result?.date).toBe('20260210');
    });

    it('should parse correction filename with revision', () => {
      const filename = '中国語_入稿データ_ORD-2026-MLU0AQIY_20260220_R1';
      const result = parseCustomerFilename(filename);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('correction');
      expect(result?.revision).toBe(1);
    });

    it('should parse correction filename with R2 revision', () => {
      const filename = '韓国語_入稿データ_ORD-2026-XYZ123_20260218_R2';
      const result = parseCustomerFilename(filename);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('correction');
      expect(result?.revision).toBe(2);
    });

    it('should parse correction filename with R3 revision', () => {
      const filename = '日本語_入稿データ_ORD-2026-ABC456_20260215_R3';
      const result = parseCustomerFilename(filename);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('correction');
      expect(result?.revision).toBe(3);
    });

    it('should handle filename with file extension', () => {
      const filename = '中国語_入稿データ_ORD-2026-MLU0AQIY_20260220.pdf';
      const result = parseCustomerFilename(filename);

      expect(result).not.toBeNull();
      expect(result?.language).toBe('中国語');
      expect(result?.orderNumber).toBe('ORD-2026-MLU0AQIY');
    });

    it('should handle filename with multiple extensions', () => {
      const filename = '中国語_入稿データ_ORD-2026-MLU0AQIY_20260220.pdf.zip';
      const result = parseCustomerFilename(filename);

      expect(result).not.toBeNull();
      expect(result?.language).toBe('中国語');
    });

    it('should return null for invalid filename format', () => {
      const result = parseCustomerFilename('invalid_filename.txt');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = parseCustomerFilename('');
      expect(result).toBeNull();
    });

    it('should use fallback for non-standard filename with order number', () => {
      const filename = 'ORD-2026-MLU0AQIY-something';
      const result = parseCustomerFilename(filename);

      expect(result).not.toBeNull();
      expect(result?.orderNumber).toBe('ORD-2026-MLU0AQIY');
      expect(result?.language).toBe('');
    });

    it('should return null for filename without order number', () => {
      const filename = 'some_random_file';
      const result = parseCustomerFilename(filename);

      expect(result).toBeNull();
    });
  });

  describe('generateCorrectionFilename', () => {
    it('should generate R1 correction filename from Chinese submission', () => {
      const original = '中国語_入稿データ_ORD-2026-MLU0AQIY_20260220';
      const result = generateCorrectionFilename(original, 1);

      expect(result).toBe('中国語_校正データ_ORD-2026-MLU0AQIY_20260220_R1');
    });

    it('should generate R1 correction filename from Korean submission', () => {
      const original = '韓国語_入稿データ_ORD-2026-XYZ123_20260218';
      const result = generateCorrectionFilename(original, 1);

      expect(result).toBe('韓国語_校正データ_ORD-2026-XYZ123_20260218_R1');
    });

    it('should generate R1 correction filename from Japanese submission', () => {
      const original = '日本語_入稿データ_ORD-2026-ABC456_20260215';
      const result = generateCorrectionFilename(original, 1);

      expect(result).toBe('日本語_校正データ_ORD-2026-ABC456_20260215_R1');
    });

    it('should generate R2 correction filename', () => {
      const original = '中国語_入稿データ_ORD-2026-MLU0AQIY_20260220';
      const result = generateCorrectionFilename(original, 2);

      expect(result).toBe('中国語_校正データ_ORD-2026-MLU0AQIY_20260220_R2');
    });

    it('should generate R3 correction filename', () => {
      const original = '中国語_入稿データ_ORD-2026-MLU0AQIY_20260220';
      const result = generateCorrectionFilename(original, 3);

      expect(result).toBe('中国語_校正データ_ORD-2026-MLU0AQIY_20260220_R3');
    });

    it('should handle filename with extension', () => {
      const original = '中国語_入稿データ_ORD-2026-MLU0AQIY_20260220.pdf';
      const result = generateCorrectionFilename(original, 1);

      expect(result).toBe('中国語_校正データ_ORD-2026-MLU0AQIY_20260220_R1');
    });

    it('should use fallback for non-standard filename', () => {
      const original = 'ORD-2026-MLU0AQIY-custom';
      const result = generateCorrectionFilename(original, 1, 'ORD-2026-MLU0AQIY');

      expect(result).toMatch(/ORD-2026-MLU0AQIY_校正データ_R1_/);
    });

    it('should throw error for revision number < 1', () => {
      const original = '中国語_入稿データ_ORD-2026-MLU0AQIY_20260220';

      expect(() => generateCorrectionFilename(original, 0)).toThrow();
      expect(() => generateCorrectionFilename(original, -1)).toThrow();
    });

    it('should throw error for empty filename', () => {
      expect(() => generateCorrectionFilename('', 1)).toThrow();
    });

    it('should replace existing revision number', () => {
      const original = '中国語_校正データ_ORD-2026-MLU0AQIY_20260220_R1';
      const result = generateCorrectionFilename(original, 2);

      expect(result).toBe('中国語_校正データ_ORD-2026-MLU0AQIY_20260220_R2');
    });
  });

  describe('extractLanguage', () => {
    it('should extract Japanese language', () => {
      const filename = '日本語_入稿データ_ORD-2026-ABC456_20260215';
      const result = extractLanguage(filename);

      expect(result).toBe('日本語');
    });

    it('should extract Korean language', () => {
      const filename = '韓国語_入稿データ_ORD-2026-XYZ123_20260218';
      const result = extractLanguage(filename);

      expect(result).toBe('韓国語');
    });

    it('should extract Chinese language', () => {
      const filename = '中国語_入稿データ_ORD-2026-MLU0AQIY_20260220';
      const result = extractLanguage(filename);

      expect(result).toBe('中国語');
    });

    it('should extract English language', () => {
      const filename = 'English_入稿データ_ORD-2026-DEF789_20260210';
      const result = extractLanguage(filename);

      expect(result).toBe('English');
    });

    it('should return empty string for filename without language', () => {
      const filename = 'ORD-2026-MLU0AQIY_20260220';
      const result = extractLanguage(filename);

      expect(result).toBe('');
    });

    it('should return empty string for empty input', () => {
      expect(extractLanguage('')).toBe('');
    });

    it('should handle filename with extension', () => {
      const filename = '日本語_入稿データ_ORD-2026-ABC456_20260215.pdf';
      const result = extractLanguage(filename);

      expect(result).toBe('日本語');
    });
  });

  describe('getLanguageCode', () => {
    it('should return correct code for Japanese', () => {
      expect(getLanguageCode('日本語')).toBe('ja');
    });

    it('should return correct code for Korean', () => {
      expect(getLanguageCode('韓国語')).toBe('ko');
    });

    it('should return correct code for Chinese', () => {
      expect(getLanguageCode('中国語')).toBe('zh');
    });

    it('should return correct code for English', () => {
      expect(getLanguageCode('English')).toBe('en');
    });

    it('should return empty string for unknown language', () => {
      expect(getLanguageCode('Deutsch')).toBe('');
      expect(getLanguageCode('')).toBe('');
    });
  });

  describe('isValidFilename', () => {
    it('should return true for valid Chinese filename', () => {
      expect(isValidFilename('中国語_入稿データ_ORD-2026-MLU0AQIY_20260220')).toBe(true);
    });

    it('should return true for valid Korean filename', () => {
      expect(isValidFilename('韓国語_入稿データ_ORD-2026-XYZ123_20260218')).toBe(true);
    });

    it('should return true for valid Japanese filename', () => {
      expect(isValidFilename('日本語_入稿データ_ORD-2026-ABC456_20260215')).toBe(true);
    });

    it('should return true for valid filename with revision', () => {
      expect(isValidFilename('中国語_入稿データ_ORD-2026-MLU0AQIY_20260220_R1')).toBe(true);
    });

    it('should return true for filename with extension', () => {
      expect(isValidFilename('中国語_入稿データ_ORD-2026-MLU0AQIY_20260220.pdf')).toBe(true);
    });

    it('should return false for invalid filename', () => {
      expect(isValidFilename('invalid_filename.txt')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidFilename('')).toBe(false);
    });

    it('should return true for non-standard filename with order number', () => {
      expect(isValidFilename('ORD-2026-MLU0AQIY-custom')).toBe(true);
    });
  });

  describe('getCurrentDateForFilename', () => {
    it('should return date in YYYYMMDD format', () => {
      const result = getCurrentDateForFilename();

      expect(result).toMatch(/^\d{8}$/);
    });

    it('should return current date', () => {
      const result = getCurrentDateForFilename();
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const expected = `${year}${month}${day}`;

      expect(result).toBe(expected);
    });
  });

  describe('generateSubmissionFilename', () => {
    it('should generate Chinese submission filename', () => {
      const result = generateSubmissionFilename('中国語', 'ORD-2026-MLU0AQIY', '20260220');

      expect(result).toBe('中国語_入稿データ_ORD-2026-MLU0AQIY_20260220');
    });

    it('should generate Korean submission filename', () => {
      const result = generateSubmissionFilename('韓国語', 'ORD-2026-XYZ123', '20260218');

      expect(result).toBe('韓国語_入稿データ_ORD-2026-XYZ123_20260218');
    });

    it('should generate Japanese submission filename', () => {
      const result = generateSubmissionFilename('日本語', 'ORD-2026-ABC456', '20260215');

      expect(result).toBe('日本語_入稿データ_ORD-2026-ABC456_20260215');
    });

    it('should use current date when date not provided', () => {
      const result = generateSubmissionFilename('中国語', 'ORD-2026-MLU0AQIY');
      const expectedDate = getCurrentDateForFilename();

      expect(result).toBe(`中国語_入稿データ_ORD-2026-MLU0AQIY_${expectedDate}`);
    });
  });

  describe('compareRevisionFilenames', () => {
    it('should return -1 when second filename has higher revision', () => {
      const filename1 = '中国語_入稿データ_ORD-2026-MLU0AQIY_20260220_R1';
      const filename2 = '中国語_入稿データ_ORD-2026-MLU0AQIY_20260220_R2';

      expect(compareRevisionFilenames(filename1, filename2)).toBe(-1);
    });

    it('should return 1 when first filename has higher revision', () => {
      const filename1 = '中国語_入稿データ_ORD-2026-MLU0AQIY_20260220_R2';
      const filename2 = '中国語_入稿データ_ORD-2026-MLU0AQIY_20260220_R1';

      expect(compareRevisionFilenames(filename1, filename2)).toBe(1);
    });

    it('should return 0 when revisions are equal', () => {
      const filename1 = '中国語_入稿データ_ORD-2026-MLU0AQIY_20260220_R1';
      const filename2 = '中国語_入稿データ_ORD-2026-MLU0AQIY_20260220_R1';

      expect(compareRevisionFilenames(filename1, filename2)).toBe(0);
    });

    it('should treat submission (no revision) as revision 0', () => {
      const submission = '中国語_入稿データ_ORD-2026-MLU0AQIY_20260220';
      const r1 = '中国語_入稿データ_ORD-2026-MLU0AQIY_20260220_R1';

      expect(compareRevisionFilenames(submission, r1)).toBe(-1);
      expect(compareRevisionFilenames(r1, submission)).toBe(1);
    });

    it('should return 0 for invalid filenames', () => {
      const filename1 = 'invalid_file_1';
      const filename2 = 'invalid_file_2';

      expect(compareRevisionFilenames(filename1, filename2)).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long order numbers', () => {
      const filename = '中国語_入稿データ_ORD-2026-MLU0AQIY-EXTREMELY-LONG-ORDER-NUMBER_20260220';
      const result = parseCustomerFilename(filename);

      expect(result?.orderNumber).toBe('ORD-2026-MLU0AQIY-EXTREMELY-LONG-ORDER-NUMBER');
    });

    it('should handle date at beginning of filename (fallback)', () => {
      const filename = '20260220_some_file_ORD-2026-MLU0AQIY';
      const result = parseCustomerFilename(filename);

      expect(result?.orderNumber).toBe('ORD-2026-MLU0AQIY');
    });

    it('should handle multiple underscore separators', () => {
      const filename = '中国語_入稿データ_ORD-2026-MLU0AQIY_EXTRA_20260220';
      const result = parseCustomerFilename(filename);

      // Should still extract the order number and date
      expect(result?.orderNumber).toBeTruthy();
      expect(result?.date).toBe('20260220');
    });

    it('should handle correction filename already using 校正データ', () => {
      const filename = '中国語_校正データ_ORD-2026-MLU0AQIY_20260220_R1';
      const result = parseCustomerFilename(filename);

      expect(result?.type).toBe('correction');
      expect(result?.revision).toBe(1);
    });
  });
});
