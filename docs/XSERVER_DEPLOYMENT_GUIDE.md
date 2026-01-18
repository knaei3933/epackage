# xserver デプロイメント完全ガイド

Epackage Lab Webをxserver（日本ホスティング）にデプロイするための完全手順書

## 📋 目次

1. [概要](#概要)
2. [前提条件](#前提条件)
3. [Supabase MCPでデータベース設定](#supabase-mcpでデータベース設定)
4. [本番ビルド](#本番ビルド)
5. [xserver設定](#xserver設定)
6. [アップロード手順](#アップロード手順)
7. [動作確認](#動作確認)
8. [トラブルシューティング](#トラブルシューティング)

---

## 概要

### アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────┐
│                    開発環境（ローカル）                        │
├─────────────────────────────────────────────────────────────┤
│  開発者               →  Supabase MCP (管理ツール)             │
│  (localhost:3000)       ↘                                     │
│  Next.js Dev Server   →  開発用Supabase DB                    │
│                         ↘                                    │
│  .env.local            →  環境変数                            │
└─────────────────────────────────────────────────────────────┘

                            ビルド

┌─────────────────────────────────────────────────────────────┐
│                    本番環境（xserver）                        │
├─────────────────────────────────────────────────────────────┤
│  ユーザー               →  xserver (静的ファイル)               │
│  (package-lab.com)       ↓                                     │
│  Next.js Runtime       →  ビルド済みJS (Supabase Client埋め込み) │
│                         ↓                                     │
│  環境変数               →  本番Supabase DB                     │
│  (xserver設定)          ↗                                     │
└─────────────────────────────────────────────────────────────┘
```

### 重要ポイント

- ✅ **Supabase MCPは開発時のみ使用** - 本番環境では不要
- ✅ **静的ファイルのみアップロード** - Node.jsサーバー不要
- ✅ **環境変数でDB接続** - ビルド済みJSがSupabaseに直接接続
- ✅ **データベースはSupabaseクラウド** - xserverは静的ホスティングのみ

---

## 前提条件

### 必要なアカウント

- [x] xserverアカウント（https://www.xserver.ne.jp/）
- [x] Supabaseプロジェクト（https://supabase.com/）
- [x] ドメイン取得済み（例: package-lab.com）

### 必要なツール

```bash
# Node.js 18+
node --version  # v18.0.0以上

# npm 9+
npm --version   # 9.0.0以上

# Git
git --version
```

---

## Supabase MCPでデータベース設定

### Step 1: Supabase MCPとは？

**Supabase MCPは開発用データベース管理ツールです。**

| 機能 | 開発環境 | 本番環境 |
|------|----------|----------|
| Supabase MCP | ✅ 使用（管理ツール） | ❌ 不要 |
| Supabase Client | ✅ 使用 | ✅ 使用 |
| 環境変数 | `.env.local` | xserver設定 |

**重要**: Supabase MCPは本番デプロイ後は使用しません。本番ではビルド済みのNext.jsアプリが直接Supabaseに接続します。

### Step 2: Supabaseプロジェクト情報の確認

```bash
# 現在のプロジェクト情報
SUPABASE_URL=https://ijlgpzjdfipzmjvawofp.supabase.co
PROJECT_REF=ijlgpzjdfipzmjvawofp
```

**Supabase Dashboard URL**:
```
https://supabase.com/dashboard/project/ijlgpzjdfipzmjvawofp
```

### Step 3: データベースマイグレーション適用

#### 方法A: Supabase Dashboardから適用（推奨）

1. **Supabase Dashboardにアクセス**
   - URL: https://supabase.com/dashboard/project/ijlgpzjdfipzmjvawofp

2. **SQL Editorを開く**
   - 左メニュー > SQL Editor > New Query

3. **マイグレーションファイルを順次実行**

マイグレーションファイルは `supabase/migrations/` ディレクトリに60個あります：

```bash
# 実行順序（ファイル名順）
001_dashboard_schema.sql
20250101_create_ai_parser_tables.sql
20250101000000_create_signatures_table.sql
20250102000001_create_invoices_table.sql
20250105_premium_downloads_table.sql
20250120_create_shipments.sql
20250125000000_create_profiles_table.sql
20250130000001_create_companies_table.sql
20250130000002_create_contracts_table.sql
20250130000003_create_work_orders_table.sql
# ... 合計60ファイル
```

**各ファイルの手順**:
1. `supabase/migrations/` ファイルをテキストエディタで開く
2. 全内容をコピー
3. Supabase DashboardのSQL Editorに貼り付け
4. 「Run」ボタンで実行
5. 成功を確認

**自動実行スクリプト（Node.js）**:

```javascript
// scripts/deploy-migrations.js
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ijlgpzjdfipzmjvawofp.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // サービスロールキー必須

const supabase = createClient(supabaseUrl, supabaseKey);

const migrationsDir = path.join(__dirname, '../supabase/migrations');

async function deployMigrations() {
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort(); // ファイル名順にソート

  for (const file of files) {
    console.log(`Applying: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    // SQL実行
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error(`❌ Error in ${file}:`, error);
    } else {
      console.log(`✅ Applied: ${file}`);
    }
  }
}

deployMigrations();
```

実行方法:
```bash
node scripts/deploy-migrations.js
```

#### 方法B: Supabase CLIを使用

```bash
# 1. Supabase CLIインストール
npm install -g supabase

# 2. ログイン
supabase login

# 3. プロジェクトにリンク
supabase link --project-ref ijlgpzjdfipzmjvawofp

# 4. マイグレーション適用
supabase db push

# 5. 履歴確認
supabase migration list
```

### Step 4: Row Level Security (RLS) ポリシー確認

**Supabase DashboardでRLSポリシーを確認**:

1. Dashboard > Authentication > Policies
2. 各テーブルのポリシーが有効になっていることを確認

**主要テーブルのRLS確認**:
- `profiles` - ユーザープロフィール
- `orders` - 注文
- `quotations` - 見積
- `sample_requests` - サンプルリクエスト
- `documents` - ドキュメント

### Step 5: 環境変数の取得

**Supabase Dashboardから必要なキーを取得**:

1. Dashboard > Project Settings > API
2. 以下の情報をコピー:

```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://ijlgpzjdfipzmjvawofp.supabase.co

# anon/public key（クライアント用）
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# service_role key（サーバー用 - 重要：絶対に公開しない）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 本番ビルド

### Step 1: 環境変数ファイル作成

**`.env.production`ファイルを作成**:

```bash
# .env.production

# =====================================================
# Supabase 設定（本番）
# =====================================================
NEXT_PUBLIC_SUPABASE_URL=https://ijlgpzjdfipzmjvawofp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbGdwempkZmlwem1qdmF3b2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NTgyNzcsImV4cCI6MjA4MjEzNDI3N30.SOME_KEY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbGdwempkZmlwem1qdmF3b2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU1ODI3NywiZXhwIjoyMDgyMTM0Mjc3fQ.LWSHBw-dbVkMjLMaZk3fyadfY_VrOEP7eVUMXNsvt58

# =====================================================
# サイト設定
# =====================================================
NEXT_PUBLIC_SITE_URL=https://package-lab.com

# =====================================================
# 本番モード設定（重要 - セキュリティ）
# =====================================================
# ⚠️ 本番環境では必ずfalseに設定
NEXT_PUBLIC_DEV_MODE=false
ENABLE_DEV_MOCK_AUTH=false

# =====================================================
# メール設定（XServer SMTP）
# =====================================================
XSERVER_SMTP_HOST=sv12515.xserver.jp
XSERVER_SMTP_PORT=587
XSERVER_SMTP_USER=info@package-lab.com
XSERVER_SMTP_PASSWORD=your_password_here

# メール送信設定
ADMIN_EMAIL=admin@package-lab.com
FROM_EMAIL=info@package-lab.com
```

### Step 2: ビルド実行

```bash
# 1. 依存関係インストール（初回のみ）
npm install

# 2. 本番ビルド
npm run build:production

# 出力例:
# ✓ Compiled successfully
# ✓ Linting and checking validity of types
# ✓ Collecting page data
# ✓ Generating static pages (216)
# ✓ Finalizing page optimization

# 出力ディレクトリ:
# .next/ - ビルド済みファイル
```

**ビルド後のファイル構造**:
```
.next/
├── static/          # 静的アセット（CSS, JS, 画像）
├── server/          # サーバーコード
└── cache/           # ビルドキャッシュ
```

### Step 3: ビルド結果の検証

```bash
# ローカルで本番ビルドをテスト
npm run start

# ブラウザで確認
# http://localhost:3000
```

---

## xserver設定

### Step 1: xserverにログイン

1. xserver管理パネルにアクセス
2. サーバー管理画面にログイン

### Step 2: ドメイン設定

1. **ドメイン設定** > ドメイン確認
   - `package-lab.com` が設定されていることを確認
   - DNS設定が完了していることを確認

2. **SSL設定** > 無料独自SSL
   - SSL証明書を有効化
   - `https://package-lab.com` でアクセス可能にする

### Step 3: 環境変数設定

xserverで環境変数を設定する方法：

#### 方法A: .htaccessファイル（推奨）

`public_html/.htaccess`ファイルを作成・編集：

```apache
<IfModule mod_env.c>
    # Supabase 設定
    SetEnv NEXT_PUBLIC_SUPABASE_URL "https://ijlgpzjdfipzmjvawofp.supabase.co"
    SetEnv NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    SetEnv SUPABASE_SERVICE_ROLE_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

    # サイト設定
    SetEnv NEXT_PUBLIC_SITE_URL "https://package-lab.com"

    # 本番モード（重要）
    SetEnv NEXT_PUBLIC_DEV_MODE "false"
    SetEnv ENABLE_DEV_MOCK_AUTH "false"

    # メール設定
    SetEnv XSERVER_SMTP_HOST "sv12515.xserver.jp"
    SetEnv XSERVER_SMTP_PORT "587"
    SetEnv XSERVER_SMTP_USER "info@package-lab.com"
    SetEnv XSERVER_SMTP_PASSWORD "your_password_here"

    SetEnv ADMIN_EMAIL "admin@package-lab.com"
    SetEnv FROM_EMAIL "info@package-lab.com"
</IfModule>

# Next.js静的サイト用設定
<IfModule mod_rewrite.c>
    RewriteEngine On

    # 静的ファイルはそのまま配信
    RewriteCond %{REQUEST_FILENAME} -f
    RewriteRule ^ - [L]

    # Next.jsページへのリライト
    RewriteRule ^(.*)$ /_next/server/$1 [L]
</IfModule>
```

#### 方法B: CGI環境変数ファイル

`public_html/cgi-bin/.env`ファイルを作成：

```bash
#!/bin/bash
export NEXT_PUBLIC_SUPABASE_URL="https://ijlgpzjdfipzmjvawofp.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."
export NEXT_PUBLIC_SITE_URL="https://package-lab.com"
export NEXT_PUBLIC_DEV_MODE="false"
```

実行権限を付与：
```bash
chmod +x public_html/cgi-bin/.env
```

### Step 4: PHP設定（Node.jsランタイム用）

xserverでNext.jsを実行する場合、`.htaccess`でNode.js設定が必要：

```apache
# Node.jsアプリケーション設定
<FilesMatch "\.js$">
    ForceType application/javascript
</FilesMatch>

# APIルート設定
<Directory "public_html/api">
    SetHandler "proxy:unix:/var/run/node.sock|fcgi://localhost/"
</Directory>
```

---

## アップロード手順

### Step 1: アップロードファイルの準備

**アップロードするファイル**:

```
アップロード対象:
├── .next/
│   ├── static/          # 必須
│   └── server/          # 必須
├── public/              # 必須
│   ├── images/
│   └── ...
├── package.json         # 必須
├── package-lock.json    # 必須
└── .htaccess           # 必須（作成）

アップロード不要:
├── node_modules/        ❌ アップロード不要
├── src/                 ❌ ビルド済みのため不要
├── supabase/            ❌ マイグレーション適用済み
├── tests/               ❌ テストファイル
├── .git/                ❌ Gitリポジトリ
└── .env.local           ❌ 開発環境用
```

### Step 2: FTPソフトでアップロード

#### 推奨FTPソフト

- **FileZilla**（https://filezilla-project.org/）
- **WinSCP**（https://winscp.net/）
- **Cyberduck**（https://cyberduck.io/）

#### FileZilla設定例

```plaintext
ホスト: package-lab.com
ユーザー: package-lab.com
パスワード: *********
ポート: 21
プロトコル: FTP - ファイル転送プロトコル
```

#### アップロード手順

1. **FTPでxserverに接続**
2. **`public_html/`ディレクトリに移動**
3. **以下の順序でアップロード**:

```bash
# 1. 静的ファイル（最優先）
public/ → public_html/

# 2. Next.jsビルドファイル
.next/static/ → public_html/_next/static/
.next/server/ → public_html/_next/server/

# 3. 設定ファイル
.htaccess → public_html/.htaccess
package.json → public_html/package.json
```

### Step 3: ファイル権限設定

アップロード後、ファイル権限を確認：

```bash
# ディレクトリ: 755
find public_html -type d -exec chmod 755 {} \;

# ファイル: 644
find public_html -type f -exec chmod 644 {} \;

# 実行ファイル（必要な場合）
chmod +x public_html/cgi-bin/.env
```

### Step 4: .htaccessファイル作成

`public_html/.htaccess`ファイルを作成：

```apache
# =====================================================
# xserver Next.js 静的サイト設定
# =====================================================

# 環境変数設定
<IfModule mod_env.c>
    # Supabase 設定
    SetEnv NEXT_PUBLIC_SUPABASE_URL "https://ijlgpzjdfipzmjvawofp.supabase.co"
    SetEnv NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbGdwempkZmlwem1qdmF3b2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NTgyNzcsImV4cCI6MjA4MjEzNDI3N30.SOME_KEY"
    SetEnv SUPABASE_SERVICE_ROLE_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbGdwempkZmlwem1qdmF3b2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU1ODI3NywiZXhwIjoyMDgyMTM0Mjc3fQ.LWSHBw-dbVkMjLMaZk3fyadfY_VrOEP7eVUMXNsvt58"

    # サイト設定
    SetEnv NEXT_PUBLIC_SITE_URL "https://package-lab.com"

    # 本番モード（重要）
    SetEnv NEXT_PUBLIC_DEV_MODE "false"
    SetEnv ENABLE_DEV_MOCK_AUTH "false"

    # メール設定
    SetEnv XSERVER_SMTP_HOST "sv12515.xserver.jp"
    SetEnv XSERVER_SMTP_PORT "587"
    SetEnv XSERVER_SMTP_USER "info@package-lab.com"
    SetEnv XSERVER_SMTP_PASSWORD "your_password_here"
    SetEnv ADMIN_EMAIL "admin@package-lab.com"
    SetEnv FROM_EMAIL "info@package-lab.com"
</IfModule>

# =====================================================
# Next.js 静的サイト配信設定
# =====================================================

# オプション設定
Options -Indexes +FollowSymLinks

# デフォルトドキュメント
DirectoryIndex index.html

# 圧縮設定
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# キャッシュ設定
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
</IfModule>

# セキュリティヘッダー
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "DENY"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# =====================================================
# URL リライト設定（静的生成用）
# =====================================================
<IfModule mod_rewrite.c>
    RewriteEngine On

    # HTTPSリダイレクト
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]

    # wwwなしに統一
    RewriteCond %{HTTP_HOST} ^www\.package-lab\.com [NC]
    RewriteRule ^(.*)$ https://package-lab.com/$1 [R=301,L]

    # 静的ファイルはそのまま配信
    RewriteCond %{REQUEST_FILENAME} -f
    RewriteRule ^ - [L]

    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]

    # Next.js静的ページ
    RewriteCond %{REQUEST_URI} !^/api/
    RewriteCond %{REQUEST_URI} !^/_next/
    RewriteCond %{REQUEST_URI} !^/static/
    RewriteRule ^(.*)$ /_next/static/pages/$1.html [L]
</IfModule>

# =====================================================
# 301リダイレクト（Portal → Admin統合）
# =====================================================
<IfModule mod_rewrite.c>
    RewriteEngine On

    # /portal → /admin/customers
    RedirectMatch 301 ^/portal/?$ https://package-lab.com/admin/customers
    RedirectMatch 301 ^/portal/(.*)$ https://package-lab.com/admin/customers/$1

    # /b2b → /auth or /member
    RedirectMatch 301 ^/b2b/login$ https://package-lab.com/auth/signin
    RedirectMatch 301 ^/b2b/register$ https://package-lab.com/auth/register
    RedirectMatch 301 ^/b2b/(.*)$ https://package-lab.com/member/$1

    # /roi-calculator → /quote-simulator
    RedirectMatch 301 ^/roi-calculator$ https://package-lab.com/quote-simulator
    RedirectMatch 301 ^/roi-calculator/(.*)$ https://package-lab.com/quote-simulator/$1
</IfModule>
```

---

## 動作確認

### Step 1: 基本動作確認

**チェックリスト**:

```bash
# 1. トップページ
✅ https://package-lab.com
   - 正常に表示される
   - スタイルが適用されている
   - コンソールエラーなし

# 2. 認証機能
✅ https://package-lab.com/auth/signin
   - サインインフォーム表示
   - バリデーション動作

✅ https://package-lab.com/auth/register
   - 登録フォーム表示
   - 入力バリデーション

# 3. カスタマーポータル（/admin/customers）
✅ https://package-lab.com/admin/customers
   - ダッシュボード表示
   - 注文一覧表示
   - ドキュメント表示

# 4. メンバーポータル
✅ https://package-lab.com/member/dashboard
   - ダッシュボード表示
   - 注文管理機能

# 5. 301リダイレクト
✅ https://package-lab.com/portal → /admin/customers
✅ https://package-lab.com/b2b/login → /auth/signin
```

### Step 2: データベース接続確認

**ブラウザコンソールで確認**:

```javascript
// 1. Supabaseクライアント確認
const { data: { user } } = await supabase.auth.getUser();
console.log('Auth User:', user);

// 2. データベースクエリ確認
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(1);

console.log('DB Connection:', data ? 'OK' : 'Error');
console.log('Error:', error);
```

### Step 3: APIエンドポイント確認

```bash
# API動作確認（curlコマンド）

# 1. ダッシュボード統計
curl https://package-lab.com/api/member/dashboard

# 2. 注文一覧
curl https://package-lab.com/api/member/orders

# 3. 見積一覧
curl https://package-lab.com/api/member/quotations
```

### Step 4: 環境変数確認

**本番環境で環境変数が正しく設定されているか確認**:

ブラウザで`https://package-lab.com`にアクセスし、開発者ツールのコンソールで：

```javascript
// NEXT_PUBLIC_ 変数はクライアントで確認可能
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Site URL:', process.env.NEXT_PUBLIC_SITE_URL);
console.log('DEV_MODE:', process.env.NEXT_PUBLIC_DEV_MODE);

// 期待値:
// Supabase URL: "https://ijlgpzjdfipzmjvawofp.supabase.co"
// Site URL: "https://package-lab.com"
// DEV_MODE: "false"
```

### Step 5: パフォーマンス確認

**Lighthouseスコア確認**:

```bash
# Chrome DevToolsでLighthouse実行
# 目標スコア:
# - Performance: 90+
# - Accessibility: 90+
# - Best Practices: 90+
# - SEO: 90+
```

---

## トラブルシューティング

### 問題1: ページが表示されない（404エラー）

**原因**: `.htaccess`リライト設定の問題

**解決策**:

1. `.htaccess`ファイルを確認
2. `RewriteBase`パスを確認
3. 静的ファイルが正しくアップロードされているか確認

```apache
# .htaccessに追加
RewriteBase /
```

### 問題2: 環境変数が読み込まれない

**原因**: xserverの環境変数設定の問題

**解決策**:

1. `.htaccess`で`SetEnv`を使用
2. または`next.config.js`で`env`をハードコード（非推奨）

```javascript
// next.config.ts（一時的な回避策）
export default {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://ijlgpzjdfipzmjvawofp.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGci...',
    NEXT_PUBLIC_SITE_URL: 'https://package-lab.com',
    NEXT_PUBLIC_DEV_MODE: 'false',
  },
};
```

### 問題3: Supabase接続エラー

**エラーメッセージ**: `Supabase connection failed`

**原因**: 環境変数が間違っている、またはRLSポリシー

**解決策**:

1. 環境変数を再確認
2. Supabase DashboardでAPIキーを再取得
3. RLSポリシーを確認

```bash
# 環境変数確認
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 問題4: APIエンドポイントが404

**原因**: 静的エクスポート設定の問題

**解決策**:

```typescript
// next.config.tsでoutputモード確認
export default {
  output: 'export', // 静的エクスポート
  // または
  output: 'standalone', // スタンドアロンサーバー
};
```

### 問題5: DEV_MODEが有効になっている

**原因**: 本番環境で`NEXT_PUBLIC_DEV_MODE=true`になっている

**解決策**:

```bash
# .htaccessで強制的にオフ
SetEnv NEXT_PUBLIC_DEV_MODE "false"
```

またはビルド時に設定：

```bash
NEXT_PUBLIC_DEV_MODE=false npm run build:production
```

### 問題6: 画像が表示されない

**原因**: 画像パスの問題

**解決策**:

1. `public/`ディレクトリが正しくアップロードされているか確認
2. 画像パスが相対パスになっているか確認

```typescript
// ❌ 悪い例
<Image src="/images/logo.png" />

// ✅ 良い例
<Image src="/images/logo.png" width={200} height={100} />
```

### 問題7: スタイルが適用されない

**原因**: CSSファイルが読み込まれていない

**解決策**:

1. `.next/static/css/`がアップロードされているか確認
2. `.htaccess`でMIMEタイプ設定

```apache
# .htaccessに追加
<IfModule mod_mime.c>
    AddType text/css .css
</IfModule>
```

---

## まとめ

### デプロイメントフロー

```bash
# 1. データベース設定（Supabase Dashboard）
- マイグレーション適用（60ファイル）
- RLSポリシー確認
- APIキー取得

# 2. 本番ビルド
- .env.production作成
- npm run build:production

# 3. xserver設定
- ドメイン設定
- SSL設定
- 環境変数設定（.htaccess）

# 4. アップロード
- FTPでファイルアップロード
- .htaccess作成
- ファイル権限設定

# 5. 動作確認
- 基本動作確認
- データベース接続確認
- パフォーマンス確認
```

### 重要ポイント

| 項目 | 開発環境 | 本番環境 |
|------|----------|----------|
| **Supabase MCP** | ✅ 使用（管理ツール） | ❌ 不要 |
| **データベース接続** | 開発DB | 本番DB |
| **環境変数** | `.env.local` | xserver `.htaccess` |
| **ビルドコマンド** | `npm run dev` | `npm run build:production` |
| **DEV_MODE** | `true` | `false` (必須) |
| **静的ファイル** | `.next/` | xserverアップロード |
| **Node.jsサーバー** | 必要 | 不要（静的ファイルのみ） |

### 次のステップ

1. **Staging環境でテスト**
   - 本番デプロイ前にステージング環境で動作確認
   - https://staging.package-lab.com など

2. **バックアップ計画**
   - データベースバックアップ設定
   - ロールバック手順の文書化

3. **モニタリング設定**
   - Google Analytics設定
   - エラートラッキング（Sentryなど）
   - Uptimeモニタリング

4. **セキュリティ対策**
   - 定期的なセキュリティアップデート
   - Supabase RLSポリシー見直し
   - 環境変数の定期ローテーション

---

## 参考リンク

- [xserver マニュアル](https://www.xserver.ne.jp/manual/)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Next.js デプロイメントドキュメント](https://nextjs.org/docs/deployment)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**最終更新**: 2026-01-15
**バージョン**: 1.0.0
