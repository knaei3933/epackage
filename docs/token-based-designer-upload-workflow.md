# トークンベースデザイナーアップロードシステム ワークフロー

## 概要

このシステムは、韓国人デザイナーが安全にデザインファイルをアップロードするためのトークンベース認証システムです。Google Drive との統合、自動翻訳機能（韓国語⇄日本語）、および顧客通知機能を備えています。

---

## システム構成図

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Admin Portal  │────▶│   Supabase DB   │────▶│    Designer     │
│   (Token生成)    │     │  (Token保存)     │     │   (Email受信)   │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
                                              ┌─────────────────────┐
                                              │  Upload Page        │
                                              │  (/upload/[token])  │
                                              └──────────┬──────────┘
                                                         │
                    ┌────────────────────────────────────┼────────────────┐
                    ▼                                    ▼                ▼
            ┌───────────────┐                  ┌──────────────┐  ┌─────────────┐
            │  Google Drive │                  │  DeepL API   │  │  Supabase   │
            │  (File保存)   │                  │  (翻訳)       │  │  (DB保存)    │
            └───────────────┘                  └──────────────┘  └─────────────┘
                    │                                    │                │
                    └────────────────────────────────────┼────────────────┘
                                                         ▼
                                              ┌─────────────────────┐
                                              │  Customer           │
                                              │  (通知メール受信)    │
                                              └─────────────────────┘
```

---

## データベーススキーマ

### 1. designer_upload_tokens テーブル

| カラム | タイプ | 説明 |
|--------|--------|------|
| id | uuid | 主キー |
| token_hash | text | SHA-256ハッシュ化されたトークン |
| order_id | uuid | 関連する注文ID |
| status | text | `active`, `used`, `expired` |
| expires_at | timestamp | 有効期限（デフォルト: 1ヶ月） |
| designer_email | text | デザイナーのメールアドレス（デフォルト: `arwg22@gmail.com`） |
| upload_count | integer | アップロード回数 |
| last_uploaded_at | timestamp | 最終アップロード日時 |
| created_at | timestamp | 作成日時 |

### 2. design_revisions テーブル

| カラム | タイプ | 説明 |
|--------|--------|------|
| id | uuid | 主キー |
| order_id | uuid | 関連する注文ID |
| revision_number | integer | リビジョン番号 |
| revision_name | text | リビジョン名（例: "Revision 1"） |
| preview_image_url | text | プレビュー画像URL（Google Drive） |
| original_file_url | text | 元ファイルURL（Google Drive） |
| partner_comment | text | パートナー（韓国人デザイナー）コメント |
| customer_comment | text | 顧客向けコメント（日本語翻訳） |
| approval_status | text | 承認ステータス: `pending`, `approved`, `rejected` |
| created_at | timestamp | 作成日時 |

### 3. order_comments テーブル

| カラム | タイプ | 説明 |
|--------|--------|------|
| id | uuid | 主キー |
| order_id | uuid | 関連する注文ID |
| content | text | コメント内容 |
| comment_type | text | コメントタイプ: `correction` |
| author_id | uuid | 作成者ID |
| author_role | text | 作成者ロール |
| is_internal | boolean | 内部コメントかどうか |
| metadata | jsonb | メタデータ（翻訳情報など） |
| created_at | timestamp | 作成日時 |

---

## API エンドポイント

### 1. トークン生成 API

**エンドポイント:** `POST /api/admin/orders/[id]/upload-token`

**説明:** 管理者がデザイナー用のアップロードトークンを生成する

**リクエスト:**
```json
{
  "designer_email": "arwg22@gmail.com",  // オプション（デフォルト: arwg22@gmail.com）
  "expiresInDays": 30  // オプション（デフォルト: 30）
}
```

**レスポンス:**
```json
{
  "success": true,
  "token": "abc123...",
  "uploadUrl": "https://your-domain.com/upload/abc123...",
  "expiresAt": "2026-03-21T00:00:00.000Z"
}
```

---

### 2. ファイルアップロード API

**エンドポイント:** `POST /api/upload/[token]`

**説明:** デザイナーがファイルをアップロードする

**リクエスト (multipart/form-data):**
```
preview_image: File     // 必須 - プレビュー画像
original_file: File     // 必須 - 元ファイル
comment_ko: string      // オプション - 韓国語コメント
order_item_id: string   // オプション - 注文項目ID
```

**レスポンス:**
```json
{
  "success": true,
  "revision": {
    "id": "uuid",
    "revision_number": 1,
    "preview_image_url": "https://drive.google.com/...",
    "original_file_url": "https://drive.google.com/..."
  },
  "message": "Revision 1 uploaded successfully"
}
```

---

### 3. コメント API（双方向翻訳）

**エンドポイント:** `POST /api/design-revisions/[orderId]/comments`

**説明:** 管理者/顧客がコメントを追加（日本語→韓国語に自動翻訳）

**リクエスト:**
```json
{
  "content": "コメント内容（日本語）",
  "comment_type": "correction",
  "author_role": "admin"
}
```

**レスポンス:**
```json
{
  "success": true,
  "comment": {
    "id": "uuid",
    "content": "원본 내용",
    "content_translated": "翻訳された内容",
    "original_language": "ja"
  }
}
```

---

## ワークフロー詳細

### フェーズ1: トークン生成（管理者）

1. 管理者が注文詳細ページで「トークン生成」ボタンをクリック
2. APIが32文字のランダムトークンを生成
3. トークンをSHA-256でハッシュ化
4. データベースに保存:
   - `token_hash`: ハッシュ化されたトークン
   - `order_id`: 注文ID
   - `status`: `active`
   - `expires_at`: 作成日時 + 30日
   - `designer_email`: `arwg22@gmail.com`（デフォルト）

### フェーズ2: トークン送信（管理者）

1. 管理者が生成されたトークンとURLをコピー
2. メール等でデザイナーに送信:
   ```
   件名: デザイン校正依頼

   以下のURLからファイルをアップロードしてください:
   https://your-domain.com/upload/abc123...

   有効期限: 2026-03-21
   ```

### フェーズ3: ファイルアップロード（デザイナー）

1. デザイナーがURLにアクセス
2. トークンが自動的に検証される
3. フォームに入力:
   - プレビュー画像を選択
   - 元ファイルを選択
   - コメントを入力（韓国語、オプション）
4. 「アップロード」ボタンをクリック

### フェーズ4: アップロード処理

1. **トークン検証:**
   - トークンが存在するか確認
   - ステータスが `active` か確認
   - 有効期限切れでないか確認

2. **Google Drive へのアップロード:**
   - プレビュー画像と元ファイルを並列アップロード
   - Google OAuth 2.0（リフレッシュトークン方式）
   - フォルダ: `GOOGLE_DRIVE_UPLOAD_FOLDER_ID`

3. **DeepL翻訳:**
   - 韓国語コメントを日本語に翻訳
   - API: `api-free.deepl.com/v2/translate`

4. **データベース保存:**
   ```typescript
   // design_revisions テーブル
   {
     order_id: tokenData.order_id,
     revision_number: lastRevision?.revision_number + 1,
     revision_name: `Revision ${nextRevisionNumber}`,
     preview_image_url: previewImageUrl,  // Google Drive URL
     original_file_url: originalFileUrl,  // Google Drive URL
     partner_comment: comment_ko,         // 韓国語オリジナル
     customer_comment: commentJa,         // 日本語翻訳
     approval_status: 'pending',
     created_at: now
   }
   ```

5. **コメント保存:**
   ```typescript
   // order_comments テーブル（コメントがある場合）
   {
     order_id: tokenData.order_id,
     content: comment_ko,
     comment_type: 'correction',
     author_id: adminUser.id,
     author_role: 'admin',
     is_internal: false,
     metadata: {
       original_language: 'ko',
       content_translated: commentJa,
       revision_id: revision.id,
       author_name_display: 'Korean Designer'
     }
   }
   ```

6. **注文ステータス更新:**
   ```typescript
   orders.status = 'CUSTOMER_APPROVAL_PENDING'
   ```

### フェーズ5: 顧客通知

1. 顧客にメール送信:
   ```
   件名: 新しいリビジョンがアップロードされました

   {customer_name} 様

   注文番号: {order_number}
   リビジョン番号: {revision_number}

   以下のURLから確認・承認できます:
   https://your-domain.com/customer/orders/{order_number}
   ```

### フェーズ6: コメント双方向翻訳

**日本語 → 韓国語（管理者/顧客 → デザイナー）:**
1. 管理者/顧客がコメントを日本語で入力
2. APIがDeepLで韓国語に翻訳
3. `order_comments` テーブルに両方保存:
   - `content`: 韓国語（翻訳）
   - `metadata.original_language: 'ja'`
   - `metadata.content_translated`: 日本語（元文）

**韓国語 → 日本語（デザイナー → 管理者/顧客）:**
1. デザイナーがコメントを韓国語で入力
2. APIがDeepLで日本語に翻訳
3. `order_comments` テーブルに両方保存:
   - `content`: 韓国語（元文）
   - `metadata.original_language: 'ko'`
   - `metadata.content_translated`: 日本語（翻訳）

---

## 環境変数設定

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# DeepL API
DEEPL_API_KEY=your-deepl-api-key

# Google Drive
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_DRIVE_UPLOAD_FOLDER_ID=your-folder-id
GOOGLE_DRIVE_ADMIN_USER_ID=admin-user-id
GOOGLE_DRIVE_REFRESH_TOKEN=your-refresh-token

# デザイナーメール（オプション）
DEFAULT_DESIGNER_EMAIL=arwg22@gmail.com

# アプリURL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## フロントエンドコンポーネント

### アップロードページ

**パス:** `/app/upload/[token]/page.tsx`

**機能:**
- トークン検証
- ファイル選択（プレビュー画像、元ファイル）
- コメント入力（韓国語）
- アップロード進捗表示
- 成功/エラーメッセージ表示

---

## セキュリティ考慮事項

1. **トークンハッシュ化:** 生トークンをデータベースに保存せず、SHA-256ハッシュを保存
2. **トークン有効期限:** デフォルト30日、期限切れトークンは自動的に `expired` ステータスに変更
3. **トークン使用制限:** 1回限りの使用ではなく、回数追跡可能
4. **RLS（Row Level Security）:** Supabaseで適切なアクセス制御
5. **JWT検証:** Google OAuthトークンを適切に検証

---

## エラーハンドリング

| エラー | 原因 | 対処 |
|--------|------|------|
| "Invalid token" | トークンが存在しない | 管理者に連絡 |
| "Token has expired" | 有効期限切れ | 新しいトークンを要求 |
| "Token is used/expired" | すでに使用済み | 新しいトークンを要求 |
| "Failed to upload to Google Drive" | Google API エラー | 管理者に連絡 |
| "Translation error" | DeepL API エラー | 元文をそのまま表示 |

---

## メールテンプレート

### デザイナー通知（韓国語）

**件名:** [Epackage Lab] 디자인 교정 요청

```
안녕하세요,

새로운 디자인 교정 요청이 있습니다.

아래 링크에서 파일을 업로드해 주세요:
{uploadUrl}

유효 기간: {expiresAt}

주문 번호: {order_number}
고객명: {customer_name}

감사합니다.
Epackage Lab
```

### 顧客通知（日本語）

**件名:** [Epackage Lab] 新しいリビジョンがアップロードされました

```
{customer_name} 様

新しいリビジョンがアップロードされました。

【注文情報】
注文番号: {order_number}
リビジョン番号: {revision_number}

以下のURLから確認・承認できます:
{reviewUrl}

ご確認をお願いいたします。
Epackage Lab
```

---

## デバッグ・トラブルシューティング

### ログの確認

```bash
# 開発サーバーログ
tail -f logs/dev-server-new.log

# Supabaseログ
# Supabase Dashboard → Logs → API/Database
```

### よくある問題

1. **Google Drive アップロード失敗**
   - リフレッシュトークンの有効期限確認
   - フォルダIDの確認

2. **DeepL翻訳が動作しない**
   - `DEEPL_API_KEY` が設定されているか確認
   - API クォータの確認

3. **トークン有効期限エラー**
   - `designer_upload_tokens` テーブルの `expires_at` を確認
   - 必要に応じて有効期限を延長

---

## 関連ファイル

```
src/
├── app/
│   ├── api/
│   │   ├── upload/
│   │   │   └── [token]/
│   │   │       └── route.ts          # ファイルアップロードAPI
│   │   ├── admin/
│   │   │   └── orders/
│   │   │       └── [id]/
│   │   │           └── upload-token/
│   │   │               └── route.ts  # トークン生成API
│   │   ├── upload-to-drive/
│   │   │   └── route.ts              # Google DriveアップロードAPI
│   │   └── design-revisions/
│   │       └── [orderId]/
│   │           └── comments/
│   │               └── route.ts      # コメントAPI
│   └── upload/
│       └── [token]/
│           └── page.tsx              # アップロードページ
├── lib/
│   ├── google-drive.ts               # Google Drive統合
│   └── utils/
│       └── token.ts                  # トークンユーティリティ
└── emails/
    └── templates/
        ├── designer-upload-ko.html   # デザイナー通知（韓国語）
        └── design-revision-uploaded.html  # 顧客通知（日本語）
```

---

## 設定値まとめ

| 設定項目 | デフォルト値 | 説明 |
|---------|-------------|------|
| トークン有効期限 | 30日 | `expiresInDays` で変更可能 |
| デザイナーメール | arwg22@gmail.com | `DEFAULT_DESIGNER_EMAIL` で変更可能 |
| 承認ステータス | pending | `pending`, `approved`, `rejected` |
| トークン長 | 32文字 | `crypto.randomBytes(16)` で生成 |

---

*最終更新: 2026-02-21*
