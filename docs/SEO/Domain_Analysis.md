# ドメイン技術設定分析レポート

**分析日:** 2026年2月25日
**対象ドメイン:** https://www.package-lab.com/
**分析ツール:** curl, openssl, Playwright MCP

---

## 1. 実行概要

ドメイン関連の技術設定に**重大な問題**が2件発見されました。これはSEOに悪影響を与える可能性があります。

| 問題 | 緊急度 | 状態 |
|------|--------|------|
| Canonical URLの矛盾 | 高 🔴 | 要修正 |
| WWWなしURLがリダイレクトされない | 高 🔴 | 要修正 |
| SSL証明書 | - | 正常 ✅ |
| HTTP→HTTPSリダイレクト | - | 正常 ✅ |

---

## 2. 詳細分析

### 2.1 Canonical URLの矛盾 🔴

#### 現状
| URL | Canonical URL |
|-----|---------------|
| `https://www.package-lab.com/` | `https://package-lab.com` ❌ |
| `https://package-lab.com/` | `https://package-lab.com` |

#### 問題点
**WWWありのURLが正しいはずなのに、canonicalがWWWなしを指している**

- サイトは `https://www.package-lab.com/` が正しいURL（SSL証明書もWWW付き）
- しかしcanonical URLは `https://package-lab.com` (WWWなし) を指している
- これは検索エンジンに「どちらが正しいURLか」という矛盾した信号を送っています

#### 影響
- 検索エンジンが正しいURLを判断できない可能性
- 重複コンテンツとして扱われるリスク
- インデックスの分散

#### 推奨される修正

**コード内の変更:**
`src/app/layout.tsx` または各ページのmetadataを確認し、canonical URLをWWW付きに修正してください。

```typescript
// 変更前
canonical: 'https://package-lab.com'

// 変更後
canonical: 'https://www.package-lab.com/'
```

または、Vercel/Netlify等のホスティング設定で、WWWなしをWWW付きにリダイレクトすることを推奨します。

---

### 2.2 WWWなしURLがリダイレクトされない 🔴

#### 現状のリダイレクト状況

| リクエストURL | レスポンス | 転送先 | 評価 |
|--------------|-----------|--------|------|
| `http://www.package-lab.com/` | 308 | `https://www.package-lab.com/` | ✅ 正常 |
| `http://package-lab.com/` | 308 | `https://package-lab.com/` | ⚠️ WWWなし |
| `https://package-lab.com/` | 200 | (リダイレクトなし) | ❌ 問題 |

#### 問題点
**`https://package-lab.com/` が `https://www.package-lab.com/` にリダイレクトされない**

- ユーザーが `https://package-lab.com/` に直接アクセスすると、WWWなしのURLでページが表示される
- これは重複コンテンツの問題を引き起こす可能性があります

#### 推奨される修正

**ホスティング設定（Vercel/Netlify等）:**

```json
// vercel.json または netlify.toml
{
  "redirects": [
    {
      "source": "https://package-lab.com/:path*",
      "destination": "https://www.package-lab.com/:path*",
      "statusCode": 308
    },
    {
      "source": "http://package-lab.com/:path*",
      "destination": "https://www.package-lab.com/:path*",
      "statusCode": 308
    },
    {
      "source": "http://www.package-lab.com/:path*",
      "destination": "https://www.package-lab.com/:path*",
      "statusCode": 308
    }
  ]
}
```

---

### 2.3 SSL証明書 ✅

#### 証明書情報
```
CN (Common Name): www.package-lab.com
有効期間: 2026年2月12日 〜 2026年5月13日
発行元: Let's Encrypt (推定)
```

#### 評価
- **正常** ✅
- WWW付きのドメインに対して証明書が発行されています
- 有効期限内です
- **注意:** WWWなしの `package-lab.com` はSSL証明書がカバーしていない可能性があります

#### 推奨
- WWWなしのアクセスをWWW付きにリダイレクトすることで、SSL証明書の問題を回避

---

## 3. 要件と推奨設定

### 3.1 望ましいURL構造

**推奨:** WWWありを正規URLとする

```
正規URL: https://www.package-lab.com/

全てのアクセスをこのURLに統一:
├── http://package-lab.com/*         → https://www.package-lab.com/*
├── http://www.package-lab.com/*     → https://www.package-lab.com/*
└── https://package-lab.com/*        → https://www.package-lab.com/*
```

### 3.2 設定ファイルの修正が必要な箇所

| ファイル | 項目 | 現在 | 修正後 |
|----------|------|------|--------|
| `src/app/layout.tsx` | metadata.canonical | `https://package-lab.com` | `https://www.package-lab.com/` |
| `vercel.json` または `netlify.toml` | redirects | - | WWWなし→WWWありを追加 |
| 各ページのmetadata | canonical | - | WWW付きに統一 |

---

## 4. 検証チェックリスト

修正後、以下を確認してください：

- [ ] `https://package-lab.com/` が `https://www.package-lab.com/` にリダイレクトされる
- [ ] `http://package-lab.com/` が `https://www.package-lab.com/` にリダイレクトされる
- [ ] `http://www.package-lab.com/` が `https://www.package-lab.com/` にリダイレクトされる
- [ ] 全ページのcanonical URLが `https://www.package-lab.com/...` になっている
- [ ] sitemap.xmlのURLが `https://www.package-lab.com/...` になっている
- [ ] robots.txtのSitemap URLが `https://www.package-lab.com/sitemap.xml` になっている

---

## 5. 優先度別アクション

### 高優先度 🔴（今すぐ実施）

1. **ホスティング設定でWWWなし→WWWありのリダイレクトを追加**
2. **canonical URLをWWW付きに修正**
3. **sitemap.ts、robots.txtのURLを確認・修正**

### 中優先度 🟡

4. Google Search Consoleで正規URLの設定を確認
5. 既存のインデックス状況を確認

---

## 6. 結論

ドメイン設定に2つの重大な問題があります：
1. **canonical URLがWWWなしを指している** - 直ちに修正が必要
2. **WWWなしURLがリダイレクトされない** - 直ちに修正が必要

これらを修正することで、重複コンテンツの問題を回避し、SEO評価を向上させることができます。

---

**レポート作成:** Claude Code
**分析日時:** 2026-02-25
