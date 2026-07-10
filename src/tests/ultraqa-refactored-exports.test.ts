/**
 * UltraQA Adversarial Test: Verify all refactored components maintain their exports
 * Tests that extraction didn't break import chains.
 */

import * as processingConfig from '@/components/quote/shared/processingConfig';
import * as processingUtils from '@/components/quote/shared/parts/processingUtils';
import { arrayBufferToBase64 } from '@/components/quote/sections/parts/arrayBufferToBase64';
import { formatFileSize, validateEmail, getFileIconColor } from '@/components/admin/parts/emailUtils';
import { ANIMATION_VARIANTS, MAX_ATTACHMENT_SIZE } from '@/components/admin/parts/emailTypes';
import { RecipientChip, AttachmentCard } from '@/components/admin/parts/EmailSubComponents';
import {
  formatNumber,
  getBagTypeLabel,
  getMaterialLabel,
  getPrintingLabel,
  getUrgencyLabel,
} from '@/components/admin/order-items/parts/labelUtils';

describe('UltraQA: Refactored component exports', () => {
  // ADV-02: Verify processingConfig still re-exports all utility functions
  test('processingConfig exports all expected functions', () => {
    expect(processingConfig.getDefaultPostProcessingOptions).toBeDefined();
    expect(processingConfig.calculatePostProcessingMultiplier).toBeDefined();
    expect(processingConfig.validateCategorySelection).toBeDefined();
    expect(processingConfig.calculateProcessingImpact).toBeDefined();
    expect(processingConfig.getProcessingCategories).toBeDefined();
    expect(processingConfig.PROCESSING_CATEGORIES).toBeDefined();
  });

  // ADV-03: Verify processingUtils can be imported independently
  test('processingUtils functions are callable', () => {
    expect(processingUtils.getDefaultPostProcessingOptions).toBeDefined();
    expect(typeof processingUtils.getDefaultPostProcessingOptions).toBe('function');
  });

  // ADV-04: arrayBufferToBase64 works correctly
  test('arrayBufferToBase64 converts correctly', () => {
    const buf = new ArrayBuffer(3);
    const view = new Uint8Array(buf);
    view[0] = 72;  // H
    view[1] = 73;  // I
    view[2] = 33;  // !
    const result = arrayBufferToBase64(buf);
    expect(result).toBe('SEkh'); // base64 of "HI!"
  });

  // ADV-05: emailUtils functions work correctly
  test('formatFileSize formats correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1048576)).toBe('1 MB');
  });

  test('validateEmail validates correctly', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
  });

  test('getFileIconColor returns correct colors', () => {
    expect(getFileIconColor('image/png')).toContain('purple');
    expect(getFileIconColor('application/pdf')).toContain('red');
    expect(getFileIconColor('text/plain')).toContain('gray');
  });

  // ADV-06: emailTypes constants exist
  test('ANIMATION_VARIANTS has all variants', () => {
    expect(ANIMATION_VARIANTS.overlay).toBeDefined();
    expect(ANIMATION_VARIANTS.content).toBeDefined();
    expect(ANIMATION_VARIANTS.slideIn).toBeDefined();
  });

  test('MAX_ATTACHMENT_SIZE is 25MB', () => {
    expect(MAX_ATTACHMENT_SIZE).toBe(25 * 1024 * 1024);
  });

  // ADV-07: labelUtils functions work correctly
  test('formatNumber handles edge cases', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(null)).toBe('0');
    expect(formatNumber(undefined)).toBe('0');
    expect(formatNumber(NaN)).toBe('0');
    expect(formatNumber(1234)).toBe('1,234');
  });

  test('getBagTypeLabel returns correct labels', () => {
    expect(getBagTypeLabel('flat_3_side')).toBe('三方シール平袋');
    expect(getBagTypeLabel('stand_up')).toBe('スタンドパウチ');
    expect(getBagTypeLabel('unknown')).toBe('unknown');
    expect(getBagTypeLabel('')).toBe('-');
  });

  test('getMaterialLabel returns correct labels', () => {
    expect(getMaterialLabel('pet_al')).toContain('PET/AL');
    expect(getMaterialLabel('unknown')).toBe('unknown');
  });

  test('getPrintingLabel returns correct labels', () => {
    expect(getPrintingLabel('digital')).toBe('デジタル印刷');
    expect(getPrintingLabel('gravure')).toBe('グラビア印刷');
    expect(getPrintingLabel('none')).toBe('なし');
  });

  test('getUrgencyLabel returns correct labels', () => {
    expect(getUrgencyLabel('standard')).toBe('標準');
    expect(getUrgencyLabel('urgent')).toBe('至急');
  });
});
