# G1/G2: ゲストトークン検証用 DB 操作手順書

## 目的
検証用 token を DB に登録・期限切れ化・revoked 化するための SQL 手順。
**本番 DB には触れない**。ステージングまたは開発環境の Supabase で実行すること。
クエリの実行はユーザーが行う（このドキュメントは手順書としてのみ提供）。

---

## 前提テーブルとカラム

| 対象パス | テーブル | 主なカラム |
|----------|----------|-----------|
| `/designer-order/[token]` | `designer_task_assignments` | `access_token_hash`, `access_token_expires_at`, `status` (`pending` / `in_progress` / `completed` / `cancelled`), `designer_id`, `order_id`, `assigned_at` |
| `/upload/[token]` | `designer_upload_tokens` | `token_hash`, `expires_at`, `status` (`active` / `used` / `expired` / `revoked`), `upload_count`, `order_id`, `created_at` |

どちらのテーブルも `order_id` が必須（外部キー）。テスト時は既存のダミー注文の `order_id` を使い回すか、検証用の注文を別途用意すること。

---

## 1. テスト用 token の作成

### ステップ 1-1: 生 token と SHA-256 ハッシュを計算

token は URL-safe base64 43 文字。アプリ側は `SHA-256(token)` の **hex** 文字列を保存する（`src/lib/designer-tokens.ts` の `hashToken`参照）。

**Node で計算する場合**（推奨・プロジェクトと同じ方式）:

```bash
# 生 token (43文字) を生成
node -e "const c=require('crypto'); const t=c.randomBytes(32).toString('base64url').substring(0,43); console.log('RAW_TOKEN='+t); console.log('HASH='+c.createHash('sha256').update(t).digest('hex'))"
```

出力例:
```
RAW_TOKEN=AbC123...            (43文字)
HASH=a1b2c3d4e5...             (64文字 hex)
```

**sha256sum で計算する場合**（Git Bash / Linux）:

```bash
RAW_TOKEN="AbC123..."   # 43文字の base64url 文字列を入力
HASH=$(printf '%s' "$RAW_TOKEN" | sha256sum | awk '{print $1}')
echo "RAW_TOKEN=$RAW_TOKEN"
echo "HASH=$HASH"
```

> 重要: `RAW_TOKEN` の値は URL（`/designer-order/<RAW_TOKEN>`）に使う。
> `HASH` の値のみを DB に保存する。`RAW_TOKEN` は DB に保存しないこと。

### ステップ 1-2: designer_task_assignments へ INSERT（designer-order 検証用）

```sql
-- UUID は gen_random_uuid() で自動生成（pgcrypto 有効前提）
-- 既存注文の order_id / designer_id を使うこと（ダミーデータ推奨）
INSERT INTO designer_task_assignments (
  id,
  designer_id,
  order_id,
  status,
  assigned_at,
  access_token_hash,
  access_token_expires_at
) VALUES (
  gen_random_uuid(),
  '<既存 designer_id>',
  '<既存 order_id>',
  'pending',
  now(),
  '<HASH>',                          -- ステップ 1-1 で計算
  now() + interval '30 days'         -- 有効期限 (30日後)
);
```

### ステップ 1-3: designer_upload_tokens へ INSERT（upload 検証用）

```sql
INSERT INTO designer_upload_tokens (
  id,
  order_id,
  token_hash,
  expires_at,
  status,
  upload_count,
  created_at
) VALUES (
  gen_random_uuid(),
  '<既存 order_id>',
  '<HASH>',                          -- ステップ 1-1 で計算
  now() + interval '30 days',
  'active',
  0,
  now()
);
```

---

## 2. 期限切れ token の作成

### 2-1: designer-order 用

```sql
UPDATE designer_task_assignments
   SET access_token_expires_at = now() - interval '1 day'
 WHERE access_token_hash = '<HASH>';
```

### 2-2: upload 用

```sql
UPDATE designer_upload_tokens
   SET expires_at = now() - interval '1 day'
 WHERE token_hash = '<HASH>';
```

---

## 3. revoked / cancelled 化

### 3-1: upload token を revoked 化

```sql
UPDATE designer_upload_tokens
   SET status = 'revoked'
 WHERE token_hash = '<HASH>';
```

### 3-2: designer-order を cancelled 化

```sql
UPDATE designer_task_assignments
   SET status = 'cancelled'
 WHERE access_token_hash = '<HASH>';
```

> **注意（仕様上の懸念）**
> `designer-order/[token]` の実装は `status` を見ない。
> `access_token_hash` が合致すれば `status='cancelled'` でも注文データを 200 で返す。
> つまり designer-order 側には実質的な revoked 遮断が無い。
> 検証時はこの挙動（TC5）を記録し、必要なら `page.tsx` 側で
> `status='cancelled'` のときに 404 相当の表示にする改修を検討すること。

---

## 4. クリーンアップ

検証後にテスト token を削除する。

```sql
-- upload 側
DELETE FROM designer_upload_tokens
 WHERE token_hash IN (
   '<HASH_有効>',
   '<HASH_期限切れ>',
   '<HASH_revoked>'
 );

-- designer-order 側
DELETE FROM designer_task_assignments
 WHERE access_token_hash IN (
   '<HASH_有効>',
   '<HASH_期限切れ>',
   '<HASH_cancelled>'
 );
```

---

## 5. 検証の流れ（まとめ）

1. 本手順書で token を 3 種類（有効 / 期限切れ / revoked）作成する。
2. 作成した `RAW_TOKEN` 文字列を環境変数に設定する。
   - `DESIGNER_TOKEN`, `EXPIRED_DESIGNER_TOKEN`, `CANCELLED_DESIGNER_TOKEN`
   - `UPLOAD_TOKEN`, `EXPIRED_UPLOAD_TOKEN`, `REVOKED_UPLOAD_TOKEN`
3. `guest-tokens.sh` を実行して TC1〜TC10 の結果を確認する。
4. 終わったら手順 4 のクリーンアップ SQL を実行する。

---

## 参照ソース
- `src/lib/designer-tokens.ts` — `generateUploadToken` / `hashToken` / `validateTokenFormat` / `isTokenExpired`
- `src/app/designer-order/[token]/page.tsx` — designer-order の token 検証
- `src/app/upload/[token]/page.tsx` — upload の token 検証
