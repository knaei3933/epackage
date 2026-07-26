import { ImageResponse } from 'next/og';
import { getPublishedPostBySlug } from '@/lib/blog/queries';
import { getCategoryLabel } from '@/lib/types/blog';
import fs from 'fs';
import path from 'path';

export const alt = 'Epackage Lab ブログ記事';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// nodejs runtime（fs / service client を使うため edge ではなく nodejs）。
export const runtime = 'nodejs';

// ローカルの Noto Sans JP (variable TTF) を読み込む。
//
// 背景: satori (next/og のレンダリングエンジン) は WOFF2 をデコードできず
//       "Unsupported OpenType signature wOF2" でクラッシュする。
//       Google Fonts CSS API は Noto Sans JP を woff2 のみ・124分割で返すため、
//       どの User-Agent でも CSS API 経由では TTF を取得できない。
// 解決策: variable TTF をリポジトリに同梱し fs で読む。
//       → 外部ネットワーク依存ゼロ・初回レイテンシなし・Vercel/standalone で確実動作。
//       9.2MB だがサーバーサイド専用（クライアント転送サイズには影響しない）。
let cachedFont: ArrayBuffer | null | undefined;

function loadNotoSansJPBold(): ArrayBuffer | null {
  if (cachedFont !== undefined) return cachedFont;
  try {
    const fontPath = path.join(
      process.cwd(),
      'src',
      'app',
      'blog',
      '[slug]',
      'fonts',
      'NotoSansJP.otf'
    );
    const buffer = fs.readFileSync(fontPath);
    // Node の Buffer を ArrayBuffer に変換（satori が要求する形式）。
    // slice で共有メモリを避け、独立した ArrayBuffer を作る。
    cachedFont = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer;
    return cachedFont;
  } catch {
    // フォント読み込み失敗時は null → sans-serif にフォールバック（文字化け上等よりマシ）。
    cachedFont = null;
    return null;
  }
}

/**
 * 動的 OGP 画像（og_image_path 未設定の記事用）。
 * page.tsx の generateMetadata で images を省略した場合に使われる。
 * 記事タイトル・カテゴリ・ブランドを描画する 1200x630 画像。
 */
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  const title = post?.meta_title || post?.title || 'Epackage Lab ブログ';
  const category = post ? getCategoryLabel(post.category, 'ja') : '';

  const font = loadNotoSansJPBold();

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #1A365D 0%, #8380FF 100%)',
          color: 'white',
          padding: '80px',
          fontFamily: font ? 'Noto Sans JP' : 'sans-serif',
        }}
      >
        {/* 上部: ブランド名 + カテゴリバッジ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Epackage Lab
          </div>
          {category ? (
            <div
              style={{
                display: 'flex',
                padding: '12px 32px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.18)',
                fontSize: 30,
                fontWeight: 600,
              }}
            >
              {category}
            </div>
          ) : null}
        </div>

        {/* 中央: 記事タイトル */}
        <div
          style={{
            display: 'flex',
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        {/* 下部: キャッチコピー */}
        <div style={{ display: 'flex', fontSize: 30, opacity: 0.92 }}>
          小ロット500枚〜・最短28日納品のパッケージ専門製造
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: 'Noto Sans JP', data: font, weight: 700, style: 'normal' as const }]
        : undefined,
    }
  );
}
