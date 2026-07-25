import { ImageResponse } from 'next/og';
import { getPublishedPostBySlug } from '@/lib/blog/queries';
import { getCategoryLabel } from '@/lib/types/blog';

export const alt = 'Epackage Lab ブログ記事';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// nodejs runtime（service client / fetch を使うため edge ではなく nodejs）
export const runtime = 'nodejs';

/**
 * Noto Sans JP Bold を Google Fonts から取得（日本語文字化け対策）。
 * CSS API 経由で woff2 URL を抽出して fetch する。
 * 失敗時は null を返し、sans-serif にフォールバック（文字化け上等よりマシ）。
 */
async function loadNotoSansJPBold(): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(
      'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap',
      {
        // woff2 を受け取るための User-Agent（古い UA だと ttf が返る）
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        },
        // Next.js のキャッシュでビルド毎の再 fetch を抑制
        next: { revalidate: 86400 },
      }
    );
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    const match = css.match(/src:\s*url\(([^)]+)\)\s*format\('woff2'\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1], { next: { revalidate: 86400 } });
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
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

  const font = await loadNotoSansJPBold();

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
