# G3/G4: Cron ジョブ検証用 DB クエリ手順書

## 目的
cron の実行結果と対象レコードを DB 側で確認するための SQL 手順。
**本番 DB には触れない**。ステージングまたは開発環境で実行すること。

---

## G3: archive-orders の検証

### 仕様（`src/app/api/cron/archive-orders/route.ts`）

- 対象: `orders` のうち
  - `status = 'delivered'`
  - `delivered_at < now() - interval '3 months'`
  - `archived_at IS NULL`
- 実行内容: 該当レコードの `archived_at` と `updated_at` を現在時刻で更新
- 戻り値: `{ success, archivedCount, message }`

### 3-1: 実行前に対象件数を確認

```sql
SELECT count(*) AS pending_archive_count
  FROM orders
 WHERE status = 'delivered'
   AND delivered_at < now() - interval '3 months'
   AND archived_at IS NULL;
```

### 3-2: 対象レコードの一覧（サンプル）

```sql
SELECT id,
       order_number,
       customer_name,
       status,
       delivered_at,
       archived_at
  FROM orders
 WHERE status = 'delivered'
   AND delivered_at < now() - interval '3 months'
   AND archived_at IS NULL
 ORDER BY delivered_at ASC
 LIMIT 20;
```

### 3-3: cron 実行後にアーカイブされた件数を確認

```sql
SELECT count(*) AS archived_count
  FROM orders
 WHERE archived_at >= now() - interval '10 minutes';
```

### 3-4: 検証用ダミーデータの作成（任意）

dev 環境で 0 件の場合のみ。実際の注文を 3 个月前扱いにする SQL:

```sql
-- 対象の order_id を指定して delivered_at を過去にずらす
UPDATE orders
   SET status = 'delivered',
       delivered_at = now() - interval '4 months',
       archived_at = NULL
 WHERE id = '<検証用 order_id>';
```

### 3-5: 検証用データのクリーンアップ

```sql
-- 必要に応じて delivered_at を元に戻す、または該当レコードを削除
-- (テスト専用に作った注文なら削除でよい)
-- DELETE FROM orders WHERE id = '<検証用 order_id>';
```

---

## G4: publish-scheduled-posts の検証

### 仕様（`src/app/api/cron/publish-scheduled-posts/route.ts`）

- 対象: `blog_posts` のうち
  - `status = 'scheduled'`
  - `published_at <= now()`
- 実行内容: 該当レコードの `status` を `published` に更新
- 戻り値: `{ message, count, posts }`

### 4-1: 実行前に対象件数を確認

```sql
SELECT count(*) AS pending_publish_count
  FROM blog_posts
 WHERE status = 'scheduled'
   AND published_at <= now();
```

### 4-2: 対象レコードの一覧（サンプル）

```sql
SELECT id,
       slug,
       title,
       status,
       published_at
  FROM blog_posts
 WHERE status = 'scheduled'
   AND published_at <= now()
 ORDER BY published_at ASC
 LIMIT 20;
```

### 4-3: 検証用スケジュール記事の作成（任意）

dev 環境で即時公開を試す場合、`published_at` を過去に設定した `scheduled` 記事を作る。

```sql
INSERT INTO blog_posts (
  id,
  slug,
  title,
  content,
  status,
  published_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'verify-cron-test-post',
  'cron 検証用テスト記事',
  'この記事は publish-scheduled-posts の検証用です。',
  'scheduled',
  now() - interval '1 minute',    -- 過去時刻 = 即時公開対象
  now(),
  now()
);
```

> 上記カラム構成は実装に依存する。実際の `blog_posts` スキーマは
> `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'blog_posts';`
> で事前確認すること。必須カラム（NOT NULL）が他にある場合は追加する。

### 4-4: cron 実行後に published になったか確認

```sql
SELECT id, slug, status, published_at
  FROM blog_posts
 WHERE slug = 'verify-cron-test-post';
-- 期待: status='published'
```

### 4-5: 検証用データのクリーンアップ

```sql
DELETE FROM blog_posts WHERE slug = 'verify-cron-test-post';
```

---

## 検証の流れ（まとめ）

1. 3-1 / 4-1 で事前の対象件数を記録する。
2. 必要なら 3-4 / 4-3 で検証用データを作る。
3. `cron.sh` を実行して HTTP ステータスとレスポンス本文を確認する。
4. 3-3 / 4-4 で DB 上の変化（archived_at 設定・status=published）を確認する。
5. 3-5 / 4-5 で検証用データを掃除する。

---

## 参照ソース
- `src/app/api/cron/archive-orders/route.ts`
- `src/app/api/cron/publish-scheduled-posts/route.ts`
