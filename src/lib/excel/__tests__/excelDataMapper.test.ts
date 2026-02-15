/**
 * Excel Data Mapper Unit Tests
 *
 * Excelデータマッパー単体テスト
 * Unit tests for Excel data mapping functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from '@jest/globals';
import {
  formatJapaneseDateWithEra,
  formatJapaneseCurrency,
  booleanToSymbol,
  formatPostalCode,
  safeString,
  safeNumber,
  formatJapaneseYen,
  JAPANESE_ERAS,
  DEFAULT_SUPPLIER,
  DEFAULT_PAYMENT_TERMS,
  QUOTATION_CELL_LOCATIONS,
} from '../excelDataMapper';

// ============================================================
// Test Suites
// ============================================================

describe('formatJapaneseDateWithEra', () => {
  it('should format Reiwa date correctly', () => {
    const date = new Date(2024, 3, 1); // 2024年4月1日
    const result = formatJapaneseDateWithEra(date);

    expect(result).toBe('令和6年4月1日');
  });

  it('should format first year of Reiwa correctly', () => {
    const date = new Date(2019, 4, 1); // 2019年5月1日
    const result = formatJapaneseDateWithEra(date);

    expect(result).toBe('令和1年5月1日');
  });

  it('should format Heisei date correctly', () => {
    const date = new Date(2010, 0, 15);
    const result = formatJapaneseDateWithEra(date);

    expect(result).toBe('平成22年1月15日');
  });

  it('should format Showa date correctly', () => {
    const date = new Date(1985, 5, 20);
    const result = formatJapaneseDateWithEra(date);

    expect(result).toBe('昭和60年6月20日');
  });

  it('should format Taisho date correctly', () => {
    const date = new Date(1920, 9, 1);
    const result = formatJapaneseDateWithEra(date);

    expect(result).toBe('大正9年10月1日');
  });

  it('should format Meiji date correctly', () => {
    const date = new Date(1900, 0, 1);
    const result = formatJapaneseDateWithEra(date);

    expect(result).toBe('明治33年1月1日');
  });

  it('should handle date string input', () => {
    const dateString = '2024-04-01';
    const result = formatJapaneseDateWithEra(dateString);

    expect(result).toBe('令和6年4月1日');
  });

  it('should handle ISO date string', () => {
    const dateString = '2024-04-01T00:00:00Z';
    const result = formatJapaneseDateWithEra(dateString);

    expect(result).toBe('令和6年4月1日');
  });

  it('should return empty string for invalid date', () => {
    const invalidDate = new Date('invalid');
    const result = formatJapaneseDateWithEra(invalidDate);

    expect(result).toBe('');
  });

  it('should return empty string for invalid date string', () => {
    const result = formatJapaneseDateWithEra('not-a-date');

    expect(result).toBe('');
  });

  it('should fallback to Western calendar for dates outside defined eras', () => {
    const futureDate = new Date(2035, 0, 1);
    const result = formatJapaneseDateWithEra(futureDate);

    expect(result).toBe('2035年1月1日');
  });

  it('should handle era transition dates correctly', () => {
    // Heisei end date: 2019-04-30
    const heiseiEnd = new Date(2019, 3, 30);
    expect(formatJapaneseDateWithEra(heiseiEnd)).toBe('平成31年4月30日');

    // Reiwa start date: 2019-05-01
    const reiwaStart = new Date(2019, 4, 1);
    expect(formatJapaneseDateWithEra(reiwaStart)).toBe('令和1年5月1日');
  });
});

describe('formatJapaneseCurrency', () => {
  it('should format zero correctly', () => {
    expect(formatJapaneseCurrency(0)).toBe('¥0');
  });

  it('should format small amounts correctly', () => {
    expect(formatJapaneseCurrency(100)).toBe('¥100');
    expect(formatJapaneseCurrency(1234)).toBe('¥1,234');
  });

  it('should format large amounts correctly', () => {
    expect(formatJapaneseCurrency(1000000)).toBe('¥1,000,000');
    expect(formatJapaneseCurrency(1234567890)).toBe('¥1,234,567,890');
  });

  it('should format decimal amounts', () => {
    expect(formatJapaneseCurrency(1234.56)).toBe('¥1,235');
  });

  it('should format negative amounts', () => {
    expect(formatJapaneseCurrency(-1000)).toBe('¥-1,000');
  });

  it('should alias to formatJapaneseYen', () => {
    expect(formatJapaneseCurrency(5000)).toBe(formatJapaneseYen(5000));
  });
});

describe('booleanToSymbol', () => {
  it('should convert true to Japanese checkmark', () => {
    expect(booleanToSymbol(true)).toBe('○');
  });

  it('should convert false to dash', () => {
    expect(booleanToSymbol(false)).toBe('-');
  });

  it('should convert null to dash', () => {
    expect(booleanToSymbol(null)).toBe('-');
  });

  it('should convert undefined to dash', () => {
    expect(booleanToSymbol(undefined)).toBe('-');
  });
});

describe('formatPostalCode', () => {
  it('should format 7-digit postal code correctly', () => {
    expect(formatPostalCode('1000001')).toBe('100-0001');
    expect(formatPostalCode('6730846')).toBe('673-0846');
  });

  it('should preserve existing hyphen format', () => {
    expect(formatPostalCode('100-0001')).toBe('100-0001');
    expect(formatPostalCode('673-0846')).toBe('673-0846');
  });

  it('should handle empty string', () => {
    expect(formatPostalCode('')).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(formatPostalCode(null as any)).toBe('');
    expect(formatPostalCode(undefined as any)).toBe('');
  });

  it('should handle invalid postal codes', () => {
    expect(formatPostalCode('123')).toBe('123');
    expect(formatPostalCode('1234567890')).toBe('1234567890');
  });

  it('should remove non-numeric characters except hyphen', () => {
    expect(formatPostalCode('１００-０００１')).toBe('100-0001');
    expect(formatPostalCode('100!000@1')).toBe('100-0001');
  });
});

describe('safeString', () => {
  it('should return valid string as is', () => {
    expect(safeString('test')).toBe('test');
    expect(safeString('テスト')).toBe('テスト');
  });

  it('should return default value for null', () => {
    expect(safeString(null)).toBe('');
    expect(safeString(null, 'default')).toBe('default');
  });

  it('should return default value for undefined', () => {
    expect(safeString(undefined)).toBe('');
    expect(safeString(undefined, 'default')).toBe('default');
  });

  it('should return default value for empty string', () => {
    expect(safeString('')).toBe('');
    expect(safeString('', 'default')).toBe('default');
  });

  it('should convert non-string values to string', () => {
    expect(safeString(123 as any)).toBe('123');
    expect(safeString(true as any)).toBe('true');
  });
});

describe('safeNumber', () => {
  it('should return valid number as is', () => {
    expect(safeNumber(123)).toBe(123);
    expect(safeNumber(0)).toBe(0);
    expect(safeNumber(-100)).toBe(-100);
  });

  it('should parse string number correctly', () => {
    expect(safeNumber('123')).toBe(123);
    expect(safeNumber('123.45')).toBe(123.45);
  });

  it('should return default value for null', () => {
    expect(safeNumber(null)).toBe(0);
    expect(safeNumber(null, 100)).toBe(100);
  });

  it('should return default value for undefined', () => {
    expect(safeNumber(undefined)).toBe(0);
    expect(safeNumber(undefined, 100)).toBe(100);
  });

  it('should return default value for empty string', () => {
    expect(safeNumber('')).toBe(0);
    expect(safeNumber('', 100)).toBe(100);
  });

  it('should return default value for invalid string', () => {
    expect(safeNumber('not-a-number')).toBe(0);
    expect(safeNumber('abc', 100)).toBe(100);
  });

  it('should handle decimal strings', () => {
    expect(safeNumber('123.45')).toBeCloseTo(123.45, 2);
    expect(safeNumber('0.99')).toBeCloseTo(0.99, 2);
  });
});

describe('JAPANESE_ERAS constant', () => {
  it('should have all defined eras', () => {
    expect(JAPANESE_ERAS).toHaveLength(5);
    expect(JAPANESE_ERAS.map(e => e.name)).toEqual(['明治', '大正', '昭和', '平成', '令和']);
  });

  it('should have valid start and end dates', () => {
    JAPANESE_ERAS.forEach(era => {
      expect(era.start).toBeInstanceOf(Date);
      expect(era.end).toBeInstanceOf(Date);
      expect(era.start.getTime()).toBeLessThan(era.end.getTime());
    });
  });

  it('should cover historical timeline correctly', () => {
    // Meiji: 1868-1912
    expect(JAPANESE_ERAS[0].start.getFullYear()).toBe(1868);
    expect(JAPANESE_ERAS[0].end.getFullYear()).toBe(1912);

    // Taisho: 1912-1926
    expect(JAPANESE_ERAS[1].start.getFullYear()).toBe(1912);
    expect(JAPANESE_ERAS[1].end.getFullYear()).toBe(1926);

    // Showa: 1926-1989
    expect(JAPANESE_ERAS[2].start.getFullYear()).toBe(1926);
    expect(JAPANESE_ERAS[2].end.getFullYear()).toBe(1989);

    // Heisei: 1989-2019
    expect(JAPANESE_ERAS[3].start.getFullYear()).toBe(1989);
    expect(JAPANESE_ERAS[3].end.getFullYear()).toBe(2019);

    // Reiwa: 2019-2030
    expect(JAPANESE_ERAS[4].start.getFullYear()).toBe(2019);
    expect(JAPANESE_ERAS[4].end.getFullYear()).toBe(2030);
  });
});

describe('DEFAULT_SUPPLIER constant', () => {
  it('should have correct supplier information', () => {
    expect(DEFAULT_SUPPLIER.brandName).toBe('EPACKAGE Lab');
    expect(DEFAULT_SUPPLIER.subBrand).toBe('by kanei-trade');
    expect(DEFAULT_SUPPLIER.companyName).toBe('金井貿易株式会社');
    expect(DEFAULT_SUPPLIER.postalCode).toBe('〒673-0846');
    expect(DEFAULT_SUPPLIER.address).toBe('兵庫県明石市上ノ丸2-11-21');
    expect(DEFAULT_SUPPLIER.phone).toBe('TEL: 050-1793-6500');
    expect(DEFAULT_SUPPLIER.email).toBe('info@package-lab.com');
  });

  it('should have description in Japanese', () => {
    expect(DEFAULT_SUPPLIER.description).toBe('オーダーメイドバッグ印刷専門');
  });
});

describe('DEFAULT_PAYMENT_TERMS constant', () => {
  it('should have correct payment terms', () => {
    expect(DEFAULT_PAYMENT_TERMS.paymentMethod).toBe('先払い');
    expect(DEFAULT_PAYMENT_TERMS.submissionDeadline).toBe('指定なし');
    expect(DEFAULT_PAYMENT_TERMS.proofDeadline).toBe('指定なし');
    expect(DEFAULT_PAYMENT_TERMS.paymentDeadline).toBe('校了前');
    expect(DEFAULT_PAYMENT_TERMS.deliveryDate).toBe('校了から約1か月');
    expect(DEFAULT_PAYMENT_TERMS.bankInfo).toBe('PayPay銀行 ビジネス営業部支店(005)普通 5630235');
  });
});

describe('QUOTATION_CELL_LOCATIONS constant', () => {
  it('should have all required cell locations', () => {
    expect(QUOTATION_CELL_LOCATIONS).toHaveProperty('TITLE');
    expect(QUOTATION_CELL_LOCATIONS).toHaveProperty('CUSTOMER_COMPANY');
    expect(QUOTATION_CELL_LOCATIONS).toHaveProperty('CUSTOMER_POSTAL');
    expect(QUOTATION_CELL_LOCATIONS).toHaveProperty('CUSTOMER_ADDRESS');
    expect(QUOTATION_CELL_LOCATIONS).toHaveProperty('SUPPLIER_BRAND');
    expect(QUOTATION_CELL_LOCATIONS).toHaveProperty('SUPPLIER_NAME');
    expect(QUOTATION_CELL_LOCATIONS).toHaveProperty('SUPPLIER_POSTAL');
    expect(QUOTATION_CELL_LOCATIONS).toHaveProperty('SUPPLIER_ADDRESS');
    expect(QUOTATION_CELL_LOCATIONS).toHaveProperty('SUPPLIER_PHONE');
    expect(QUOTATION_CELL_LOCATIONS).toHaveProperty('PAYMENT_METHOD');
    expect(QUOTATION_CELL_LOCATIONS).toHaveProperty('ORDER_DATA_START');
    expect(QUOTATION_CELL_LOCATIONS).toHaveProperty('OPTIONS_DATA_START');
  });

  it('should have correct cell reference format', () => {
    const cellRegex = /^[A-Z]+\d+(:[A-Z]+\d+)?$/;

    Object.values(QUOTATION_CELL_LOCATIONS).forEach(cell => {
      expect(cell).toMatch(cellRegex);
    });
  });

  it('should map customer info to A column', () => {
    expect(QUOTATION_CELL_LOCATIONS.CUSTOMER_COMPANY).toBe('A3');
    expect(QUOTATION_CELL_LOCATIONS.CUSTOMER_POSTAL).toBe('A4');
    expect(QUOTATION_CELL_LOCATIONS.CUSTOMER_ADDRESS).toBe('A5');
  });

  it('should map supplier info to G column', () => {
    expect(QUOTATION_CELL_LOCATIONS.SUPPLIER_BRAND).toBe('G3');
    expect(QUOTATION_CELL_LOCATIONS.SUPPLIER_NAME).toBe('G5');
    expect(QUOTATION_CELL_LOCATIONS.SUPPLIER_POSTAL).toBe('G6');
    expect(QUOTATION_CELL_LOCATIONS.SUPPLIER_ADDRESS).toBe('G7');
    expect(QUOTATION_CELL_LOCATIONS.SUPPLIER_PHONE).toBe('G8');
  });

  it('should map payment terms to A column', () => {
    expect(QUOTATION_CELL_LOCATIONS.PAYMENT_METHOD).toBe('A7');
    expect(QUOTATION_CELL_LOCATIONS.SUBMISSION_DEADLINE).toBe('A8');
    expect(QUOTATION_CELL_LOCATIONS.PROOF_DEADLINE).toBe('A9');
    expect(QUOTATION_CELL_LOCATIONS.PAYMENT_DEADLINE).toBe('A10');
    expect(QUOTATION_CELL_LOCATIONS.DELIVERY_DATE).toBe('A11');
    expect(QUOTATION_CELL_LOCATIONS.BANK_INFO).toBe('A12');
  });

  it('should map order data to E-J columns', () => {
    expect(QUOTATION_CELL_LOCATIONS.ORDER_TABLE_HEADER).toBe('E14:J14');
    expect(QUOTATION_CELL_LOCATIONS.ORDER_DATA_START).toBe('E15');
    expect(QUOTATION_CELL_LOCATIONS.ORDER_DATA_END).toBe('J16');
  });

  it('should map processing options to A-B columns', () => {
    expect(QUOTATION_CELL_LOCATIONS.OPTIONS_HEADER).toBe('A32');
    expect(QUOTATION_CELL_LOCATIONS.OPTIONS_DATA_START).toBe('A33');
    expect(QUOTATION_CELL_LOCATIONS.OPTIONS_DATA_END).toBe('B40');
  });
});

// ============================================================
// Integration Tests
// ============================================================

describe('Integration Tests', () => {
  it('should format complete quotation data correctly', () => {
    const today = new Date(2024, 3, 1);

    // Format date
    const formattedDate = formatJapaneseDateWithEra(today);
    expect(formattedDate).toBe('令和6年4月1日');

    // Format currency
    const formattedCurrency = formatJapaneseCurrency(150000);
    expect(formattedCurrency).toBe('¥150,000');

    // Format postal code
    const formattedPostal = formatPostalCode('1000001');
    expect(formattedPostal).toBe('100-0001');

    // Format boolean
    const symbol = booleanToSymbol(true);
    expect(symbol).toBe('○');
  });

  it('should handle edge cases in data formatting', () => {
    // Zero values
    expect(formatJapaneseCurrency(0)).toBe('¥0');
    expect(booleanToSymbol(false)).toBe('-');

    // Empty values
    expect(safeString(null, 'N/A')).toBe('N/A');
    expect(safeNumber('', 0)).toBe(0);
    expect(formatPostalCode('')).toBe('');

    // Invalid dates
    expect(formatJapaneseDateWithEra('invalid')).toBe('');
  });

  it('should maintain consistency across formatting functions', () => {
    // Currency formatting should always use Japanese yen symbol
    const amounts = [100, 1000, 10000, 100000];
    amounts.forEach(amount => {
      expect(formatJapaneseCurrency(amount)).toMatch(/^¥/);
      expect(formatJapaneseYen(amount)).toMatch(/^¥/);
    });

    // Boolean symbols should always be single characters
    expect(booleanToSymbol(true)).toHaveLength(1);
    expect(booleanToSymbol(false)).toHaveLength(1);

    // Postal codes should always be 8 characters with hyphen
    const validCodes = ['1000001', '6730846', '1234567'];
    validCodes.forEach(code => {
      expect(formatPostalCode(code)).toHaveLength(8);
    });
  });
});
