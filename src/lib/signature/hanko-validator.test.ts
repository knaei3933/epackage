/**
 * hanko-validator unit tests
 *
 * loadImageInfo の sharp 化（バグ2）の意味論的等価性を validateHankoImage 経由で検証する。
 * 以前のブラウザ実装（new Image / canvas.getImageData）は Node.js で ReferenceError に
 * なっていたため、sharp 版に置き換わったことをテスト環境（jsdom + Node sharp）で確認する。
 *
 * 検証対象:
 * - 正常なはんこ PNG で valid=true になること（AC2-5）
 * - 透明 PNG / 不透明 PNG / JPEG で hasTransparency 判定が正しいこと（間接検証）
 * - 画像形式不正・サイズ超過で valid=false になること（回帰）
 */

import sharp from 'sharp';
import { validateHankoImage } from '@/lib/signature/hanko-validator';

// ============================================================
// テスト用画像ヘルパー（sharp で SVG → PNG/JPEG を生成）
// ============================================================

/** 中央に赤い円を描いた size×size の透明 PNG（典型なはんこ） */
async function makeRedCirclePng(size: number): Promise<File> {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size / 2}" cy="${size / 2}" r="${Math.max(1, size / 2 - 5)}" fill="rgb(200,0,0)"/></svg>`;
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return new File([buf], 'hanko.png', { type: 'image/png' });
}

/** 全面赤一色の size×size の不透明 PNG */
async function makeOpaquePng(size: number): Promise<File> {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" fill="rgb(200,0,0)"/></svg>`;
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return new File([buf], 'hanko.png', { type: 'image/png' });
}

/** JPEG 画像（透明なし） */
async function makeJpeg(size: number): Promise<File> {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" fill="rgb(200,0,0)"/></svg>`;
  const buf = await sharp(Buffer.from(svg)).jpeg().toBuffer();
  return new File([buf], 'hanko.jpg', { type: 'image/jpeg' });
}

// ============================================================
// Tests
// ============================================================

describe('validateHankoImage', () => {
  test('正常なはんこ PNG（透明背景・300x300）は valid=true（AC2-5）', async () => {
    const file = await makeRedCirclePng(300);
    const result = await validateHankoImage(file);

    // AC2-5: 正常はんこで valid=true
    expect(result.valid).toBe(true);
    expect(result.checks.imageFormat).toBe(true);
    expect(result.checks.transparency).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(0.6);

    // 透明 PNG なので「透明背景がない」という警告は出ない
    expect(result.warnings.some((w) => w.includes('透明背景がない'))).toBe(false);
  });

  test('不透明 PNG は valid=true だが「透明背景がない」警告が出る（hasTransparency=false の間接検証）', async () => {
    const file = await makeOpaquePng(300);
    const result = await validateHankoImage(file);

    expect(result.valid).toBe(true);
    // 透明性チェックは成功するが、透明ピクセルがないため警告が出る
    expect(result.warnings.some((w) => w.includes('透明背景がない'))).toBe(true);
  });

  test('JPEG は valid=true だが「透明背景をサポートしない」警告が出る', async () => {
    const file = await makeJpeg(300);
    const result = await validateHankoImage(file);

    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.includes('透明背景をサポートしない'))).toBe(true);
  });

  test('小サイズ（100x100 < min=200）は valid=true だがサイズ警告が出る', async () => {
    const file = await makeRedCirclePng(100);
    const result = await validateHankoImage(file);

    // confidence 計算上 valid=true（小サイズでも format/size/quality で 0.6 を超える）
    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.includes('画像サイズが小さいです'))).toBe(true);
  });

  test('画像形式不正（GIF）は valid=false（回帰）', async () => {
    const png = await makeRedCirclePng(300);
    const gifFile = {
      type: 'image/gif',
      size: 100 * 1024,
      arrayBuffer: () => png.arrayBuffer(),
    } as unknown as File;

    const result = await validateHankoImage(gifFile);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('許可されていない画像形式'))).toBe(true);
  });

  test('ファイルサイズ超過（6MB > 5MB）は valid=false（回帰）', async () => {
    const png = await makeRedCirclePng(300);
    const oversized = {
      type: 'image/png',
      size: 6 * 1024 * 1024,
      arrayBuffer: () => png.arrayBuffer(),
    } as unknown as File;

    const result = await validateHankoImage(oversized);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('ファイルサイズが大きすぎます'))).toBe(true);
  });
});
