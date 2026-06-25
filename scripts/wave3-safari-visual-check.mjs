/**
 * Wave3 Safari(webkit) Visual Verification Script
 * CV導線6ページを 375x812 (iPhone SE相當) で巡回し:
 * - 横スクロール有無 (scrollWidth > innerWidth)
 * - 裸HTML/崩れの検出 (<html> 内に style/link が適用されているか)
 * - 主要要素の可視性
 * を検証してスクショを保存。
 *
 * 実行: node scripts/wave3-safari-visual-check.mjs
 * ソース編集なし（本スクリプトは検証専用、終了後削除可）。
 */
import { webkit } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const OUT_DIR = '.omc/handoffs/wave3-screenshots';
mkdirSync(OUT_DIR, { recursive: true });

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'quote-simulator', path: '/quote-simulator' },
  { name: 'samples', path: '/samples' },
  { name: 'contact', path: '/contact' },
  { name: 'pricing', path: '/pricing' },
  { name: 'member-orders-new', path: '/member/orders/new' },
];

// iPhone SE 相当 (タスク指定 375x812)
const VIEWPORT = { width: 375, height: 812 };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function probe(page, entry) {
  const url = `${BASE}${entry.path}`;
  const result = { ...entry, url, status: 'ok', httpStatus: null, metrics: {}, notes: [] };

  let resp;
  try {
    resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  } catch (e) {
    // networkidle が厳しい場合は domcontentloaded で再試行
    try {
      resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    } catch (e2) {
      result.status = 'nav_error';
      result.notes.push(`navigation failed: ${e2.message}`);
      return result;
    }
  }
  result.httpStatus = resp ? resp.status() : null;

  // レンダリング安定化のため短待機
  await sleep(1500);

  const data = await page.evaluate(() => {
    const de = document.documentElement;
    const body = document.body;
    const stylesheets = Array.from(document.styleSheets);
    let accessibleCss = 0;
    for (const s of stylesheets) {
      try { s.cssRules; accessibleCss++; } catch { /* CORS/empty */ }
    }
    // 裸HTML判定: body の直接の子テキストが多く、スタイル適用がない状態を検出
    const bodyText = (body?.innerText || '').trim();
    // <link rel=stylesheet> と <style> の数
    const linkStyles = document.querySelectorAll('link[rel="stylesheet"]').length;
    const inlineStyles = document.querySelectorAll('style').length;
    // 最初の見出しの有無 (コンテンツが描画されているか)
    const hasHeadings = document.querySelectorAll('h1,h2,h3').length;
    // 背景色判定 (裸HTMLでは通常 white/transparent)
    const bodyBg = body ? getComputedStyle(body).backgroundColor : 'n/a';
    const bodyColor = body ? getComputedStyle(body).color : 'n/a';
    // フォントファミリー (裸HTMLでは default serif)
    const bodyFont = body ? getComputedStyle(body).fontFamily : 'n/a';
    // 横スクロール検出
    const scrollWidth = Math.max(
      de.scrollWidth,
      body ? body.scrollWidth : 0
    );
    const clientWidth = de.clientWidth;
    // フラッシュ判定用: 100ms 後に再取得
    return {
      scrollWidth,
      clientWidth,
      innerWidth: window.innerWidth,
      linkStyles,
      inlineStyles,
      accessibleCss,
      hasHeadings,
      bodyBg,
      bodyColor,
      bodyFont,
      bodyTextLength: bodyText.length,
      bodyTextSample: bodyText.slice(0, 120),
      documentTitle: document.title,
    };
  });

  result.metrics = data;
  result.hScroll = data.scrollWidth > data.innerWidth;
  result.hOverflowPx = data.scrollWidth - data.innerWidth;

  // 裸HTML判定ヒューリスティック
  // スタイルソースゼロ または body前景色が black/デフォルト かつ bodyBg が transparent/rgba(0,0,0,0)
  const bgTransparent = /transparent|rgba\(0,\s*0,\s*0,\s*0\)/.test(data.bodyBg);
  const looksBare =
    (data.linkStyles === 0 && data.inlineStyles === 0) ||
    (bgTransparent && data.bodyColor === 'rgb(0, 0, 0)' && /Times|serif/i.test(data.bodyFont));
  result.looksBareHTML = looksBare;
  if (looksBare) {
    result.status = 'warn';
    result.notes.push('possible bare HTML (no applied styles detected)');
  }
  if (result.hScroll) {
    result.status = result.status === 'ok' ? 'warn' : result.status;
    result.notes.push(`horizontal overflow: ${result.hOverflowPx}px (scrollWidth=${data.scrollWidth} > innerWidth=${data.innerWidth})`);
  }
  if (data.hasHeadings === 0 && data.bodyTextLength < 50) {
    result.status = 'warn';
    result.notes.push('minimal content rendered (possible JS error / empty page)');
  }

  // スクショ (フルページ + viewport)
  const baseName = `${OUT_DIR}/${entry.name}-webkit-375`;
  try {
    await page.screenshot({ path: `${baseName}-viewport.png`, fullPage: false });
    await page.screenshot({ path: `${baseName}-fullpage.png`, fullPage: true });
    result.screenshots = [`${baseName}-viewport.png`, `${baseName}-fullpage.png`];
  } catch (e) {
    result.notes.push(`screenshot failed: ${e.message}`);
  }

  // viewport meta 確認 (Phase 0.1 の効果検証)
  result.viewportMeta = await page.evaluate(() => {
    const m = document.querySelector('meta[name="viewport"]');
    return m ? m.getAttribute('content') : null;
  });

  // コンソールエラー収集 (直近の重大エラー)
  return result;
}

(async () => {
  const browser = await webkit.launch({ headless: true });
  const results = [];
  const consoleErrors = {};

  try {
    for (const entry of PAGES) {
      const context = await browser.newContext({
        viewport: VIEWPORT,
        locale: 'ja-JP',
        timezoneId: 'Asia/Tokyo',
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      });
      const page = await context.newPage();
      const errors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text().slice(0, 200));
      });
      page.on('pageerror', (err) => errors.push(`PAGEERROR: ${err.message.slice(0, 200)}`));

      console.log(`\n=== ${entry.name}: ${entry.path} ===`);
      const r = await probe(page, entry);
      consoleErrors[entry.name] = [...new Set(errors)].slice(0, 5);
      r.consoleErrors = consoleErrors[entry.name];
      results.push(r);

      console.log(`  status=${r.status} http=${r.httpStatus} hScroll=${r.hScroll} overflowPx=${r.hOverflowPx}`);
      console.log(`  bareHTML=${r.looksBareHTML} linkStyles=${r.metrics.linkStyles} inlineStyles=${r.metrics.inlineStyles} headings=${r.metrics.hasHeadings}`);
      console.log(`  viewportMeta=${r.viewportMeta}`);
      console.log(`  bodyBg=${r.metrics.bodyBg} bodyColor=${r.metrics.bodyColor} font=${r.metrics.bodyFont}`);
      if (r.notes.length) console.log(`  notes: ${r.notes.join(' | ')}`);

      await context.close();
    }
  } finally {
    await browser.close();
  }

  // サマリ出力 (JSON)
  console.log('\n\n===== JSON SUMMARY =====');
  console.log(JSON.stringify(results, null, 2));
})();
