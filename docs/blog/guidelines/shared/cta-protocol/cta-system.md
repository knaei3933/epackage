# CTA System
# CTA配置とコンバージョン最適化

> **対象**: 開発者、ライター
> **目的**: CTA自動挿入システムの理解
> **適用**: 全言語共通

---

## CTA自動挿入システム

ブログシステムでは、CTAが自動的に挿入されます。

```typescript
// src/lib/blog/cta.ts
const CTA_PLACEHOLDERS = {
  MID: '<!-- CTA:mid-article -->',
  END: '<!-- CTA:end-article -->',
} as const;
```

### 挿入位置

| 位置 | 説明 | 割合 |
|------|------|------|
| **中盤CTA** | 記事の50%位置（最初のH2見出しの後） | 50% |
| **終了CTA** | 記事の最後 | 100% |

---

## CTAコンポーネント

### 中盤CTA (mid-article)

```tsx
// ArticleCTA variant="mid-article"
<div className="rounded-2xl border border-[#8380FF]/20 bg-gradient-to-r from-[#8380FF]/5 to-[#8380FF]/10 p-4 sm:p-6">
  <h3>お気軽にご相談ください</h3>
  <p>最適なパッケージソリューションをご提案いたします。</p>
  <div className="flex gap-3">
    <Link href="/contact">お問い合わせ</Link>
    <Link href="/quote">見積もり依頼</Link>
  </div>
</div>
```

### 終了CTA (end-article)

```tsx
// ArticleCTA variant="end-article"
<div className="rounded-2xl border border-[#8380FF]/20 bg-gradient-to-r from-[#8380FF]/5 to-[#8380FF]/10 p-6 sm:p-8">
  <h3>パッケージ制作のご相談はこちら</h3>
  <p>お客様のニーズに合わせた最適なパッケージをご提案いたします。お気軽にお問い合わせください。</p>
  <div className="flex gap-3">
    <Link href="/contact">お問い合わせ</Link>
    <Link href="/quote">見積もり依頼</Link>
  </div>
</div>
```

---

## コンバージョン最適化のポイント

### CTAの数

- 記事中2〜3個が最適
- 中盤1個、終了1個

### 配置

- 中盤: 読者が記事の価値を理解した後
- 終了: 読者がアクションを起こしやすいタイミング

### 文言

- 具体的でアクション可能に
- ベネフィットを明確に伝える

### デザイン

- 目立つが邪魔にならない程度に
- ブランドカラー（#8380FF）を使用

---

## 使用方法

### ライター

記事を作成する際、CTAの手動挿入は不要です。システムが自動的に挿入します。

### 開発者

```typescript
import { insertCTAPlaceholders, splitContentByCTA } from '@/lib/blog/cta';

// CTAプレースホルダーを挿入
const htmlWithCTAs = insertCTAPlaceholders(html, {
  midPosition: 0.5, // 50%の位置
  enabled: true,
});

// CTAでコンテンツを分割
const { beforeMid, afterMid, hasMidCTA } = splitContentByCTA(htmlWithCTAs);
```

---

## A/Bテスト

CTAの文言、配置、デザインについては、A/Bテストで最適化できます。

詳細は [ab-testing.md](./ab-testing.md) を参照してください。

---

## 関連資料

- [挿入位置の定義](./insertion-points.md)
- [CTA variants](./cta-variants.md)
- [A/Bテスト手法](./ab-testing.md)

---

**最終更新**: 2025-04-11
