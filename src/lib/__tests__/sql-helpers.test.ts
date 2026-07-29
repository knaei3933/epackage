import { describe, it, expect } from '@jest/globals';
import {
  escapeSqlLike,
  escapePostgrestFilterValue,
  escapeIlikePattern,
  buildSafeIlikeQuery,
  buildSafeEqQuery,
  buildSafeSearch,
} from '../sql-helpers';

/**
 * PostgREST 共通ヘルパ基盤の単体テスト（Task #159）
 *
 * 入力網羅: ダブルクォート・カンマ・ピリオド・ワイルドカード(%/_)・バックスラッシュ・
 * 空文字・長文・マルチバイト（日本語/韓国語）
 */

describe('escapePostgrestFilterValue', () => {
  it('通常値をダブルクォートで囲む', () => {
    expect(escapePostgrestFilterValue('ABC123')).toBe('"ABC123"');
  });

  it('ピリオドを含む追跡番号を破壊しない（演算子区切り . の誤認防止）', () => {
    expect(escapePostgrestFilterValue('ABC.123')).toBe('"ABC.123"');
  });

  it('カンマを含む値を破壊しない（区切り文字 , の誤認防止）', () => {
    expect(escapePostgrestFilterValue('X,Y')).toBe('"X,Y"');
  });

  it('ダブルクォートをエスケープする', () => {
    expect(escapePostgrestFilterValue('AB"CD')).toBe('"AB\\"CD"');
  });

  it('バックスラッシュをエスケープする', () => {
    expect(escapePostgrestFilterValue('AB\\CD')).toBe('"AB\\\\CD"');
  });

  it('空文字をダブルクォートで囲む', () => {
    expect(escapePostgrestFilterValue('')).toBe('""');
  });

  it('マルチバイト（日本語）を保持する', () => {
    expect(escapePostgrestFilterValue('追跡123')).toBe('"追跡123"');
  });

  it('マルチバイト（韓国語）を保持する', () => {
    expect(escapePostgrestFilterValue('추적123')).toBe('"추적123"');
  });

  it('複数の特殊文字の組合せ', () => {
    // 入力（実際の文字）: A . B , C " D \ E
    // 期待（実際の文字）: " A . B , C \" D \\ E "
    // JS リテラルでは: '"A.B,C\\"D\\\\E"'
    expect(escapePostgrestFilterValue('A.B,C"D\\E')).toBe('"A.B,C\\"D\\\\E"');
  });

  it('単独ダブルクォート', () => {
    expect(escapePostgrestFilterValue('"')).toBe('"\\""');
  });

  it('単独バックスラッシュ', () => {
    expect(escapePostgrestFilterValue('\\')).toBe('"\\\\"');
  });

  it('長文（1000文字）を処理する', () => {
    const long = 'A'.repeat(1000);
    const result = escapePostgrestFilterValue(long);
    expect(result).toBe(`"${long}"`);
    expect(result.length).toBe(1002); // 1000 + ダブルクォート2文字
  });

  it('PostgREST の or フィルタ形式に埋め込める（. が演算子区切りと誤認されない）', () => {
    // shipment_number.eq."ABC.123" 形式
    const filter = `shipment_number.eq.${escapePostgrestFilterValue('ABC.123')}`;
    expect(filter).toBe('shipment_number.eq."ABC.123"');
  });
});

describe('escapeIlikePattern', () => {
  it('通常値をそのまま返す', () => {
    expect(escapeIlikePattern('ABC123')).toBe('ABC123');
  });

  it('パーセントをエスケープする', () => {
    expect(escapeIlikePattern('100%')).toBe('100\\%');
  });

  it('アンダースコアをエスケープする', () => {
    expect(escapeIlikePattern('a_b')).toBe('a\\_b');
  });

  it('バックスラッシュをエスケープする', () => {
    expect(escapeIlikePattern('a\\b')).toBe('a\\\\b');
  });

  it('空文字をそのまま返す', () => {
    expect(escapeIlikePattern('')).toBe('');
  });

  it('マルチバイト（日本語）+ パーセント', () => {
    expect(escapeIlikePattern('追跡%')).toBe('追跡\\%');
  });

  it('複数のワイルドカードの組合せ', () => {
    // 入力（実際の文字）: % _ \
    // 期待（実際の文字）: \% \_ \\
    // JS リテラル: '\\%\\_\\\\'
    expect(escapeIlikePattern('%_\\')).toBe('\\%\\_\\\\');
  });

  it('単独パーセント', () => {
    expect(escapeIlikePattern('%')).toBe('\\%');
  });

  it('単独アンダースコア', () => {
    expect(escapeIlikePattern('_')).toBe('\\_');
  });

  it('長文（1000個の % を処理）', () => {
    const long = '%'.repeat(1000);
    const result = escapeIlikePattern(long);
    expect(result).toBe('\\%'.repeat(1000));
  });
});

describe('後方互換: 既存ヘルパの保持', () => {
  it('escapeSqlLike が従来通り動作する', () => {
    expect(escapeSqlLike('test%data')).toBe('test\\%data');
    expect(escapeSqlLike("O'Brien")).toBe("O''Brien");
  });

  it('buildSafeEqQuery が従来通り動作する', () => {
    const result = buildSafeEqQuery(['shipment_number', 'tracking_number'], 'ABC123');
    expect(result).toBe('shipment_number.eq.ABC123,tracking_number.eq.ABC123');
  });

  it('buildSafeEqQuery が危険文字で throw する', () => {
    expect(() => buildSafeEqQuery(['col'], "'; DROP")).toThrow('Invalid value for EQ query');
  });

  it('buildSafeIlikeQuery が従来通り動作する（@deprecated だが後方互換）', () => {
    const result = buildSafeIlikeQuery(['name'], 'test%');
    // escapeSqlLike('test%') = 'test\%' → "name.ilike.%test\%%"
    expect(result).toBe('name.ilike.%test\\%%');
  });

  it('buildSafeSearch が従来通り動作する（@deprecated だが後方互換）', () => {
    const result = buildSafeSearch(['name'], 'test', { maxLength: 100 });
    expect(result).toBe('name.ilike.%test%');
  });
});
