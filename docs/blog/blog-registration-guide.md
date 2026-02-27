# ブログ記事登録ガイド

## 方法1: Supabase DashboardでSQLを実行する（推奨）

### 手順

1. **Supabase Dashboardにアクセス**
   - https://supabase.com/dashboard にログイン
   - 該当するプロジェクトを選択

2. **SQL Editorを開く**
   - 左メニューから「SQL Editor」を選択
   - 「New query」をクリック

3. **SQLを実行**
   - 以下のファイルの内容をコピーして貼り付け:
     - `supabase/migrations/20260226000001_seed_blog_articles.sql`
   - 「Run」ボタンをクリック

4. **確認**
   - 以下のクエリを実行して登録された記事を確認:
   ```sql
   SELECT id, title, slug, category, status, published_at
   FROM blog_posts
   WHERE status = 'published'
   ORDER BY published_at DESC;
   ```

---

## 方法2: psql/Supabase CLIで実行

### 環境変数の確認

```bash
# .env.localからSupabase URLとKEYを確認
cat .env.local | grep SUPABASE
```

### psqlで直接実行

```bash
# SupabaseプロジェクトのURLとKEYを設定
export SUPABASE_URL="your_supabase_url"
export SUPABASE_ANON_KEY="your_supabase_anon_key"

# SQLファイルを実行
psql $SUPABASE_URL -f supabase/migrations/20260226000001_seed_blog_articles.sql
```

---

## 記事一覧

登録される記事は以下の11件です:

| No. | タイトル | Slug | カテゴリー |
|-----|---------|------|-----------|
| 1 | 平袋｜コストパフォーマンス最強の定番パッケージ | flat-pouch | product-intro |
| 2 | スタンドパウチ｜陳列効果を最大化する自立袋 | stand-pouch-v2 | product-intro |
| 3 | ガゼットパウチ（BOX型）｜大容量商品を自立させる箱型パッケージ | gazette-pouch-v2 | product-intro |
| 4 | スパウトパウチ｜液体対応の注ぎやすいパッケージ | spout-pouch | product-intro |
| 5 | ロールフィルム｜自動包装機用の省力化ソリューション | roll-film | product-intro |
| 6 | 合掌袋｜特徴的な形状で差別化を実現 | chojiu-bag | product-intro |
| 7 | パッケージデザインの基本｜売れるパッケージを作る3つのコツ | package-design-tips | practical-tips |
| 8 | 小ロット印刷の活用｜A/Bテストから多品種展開まで | small-lot-printing | practical-tips |
| 9 | 白版（しらはん）とは？パッケージ印刷の品質を高める技術 | white-plate-guide | printing-tech |
| 10 | 型抜きパッケージ｜形状で差別化する戦略的選択 | die-cut-package | practical-tips |
| 11 | 顧客インタビュー｜健康食品メーカーA社の導入事例 | customer-interview | customer-stories |

---

## 記事の表示確認

SQL実行後、以下のURLで記事が表示されることを確認:

- ブログ一覧: http://localhost:3000/blog
- 記事詳細: http://localhost:3000/blog/flat-pouch

---

## カテゴリーについて

追加されるカテゴリー:

| ID | name_ja | name_en |
|----|----------|---------|
| product-intro | 製品紹介 | Product Introduction |
| practical-tips | 実践的ノウハウ | Practical Tips |
| customer-stories | 導入事例 | Customer Stories |
| printing-tech | 印刷技術 | Printing Technology |

---

## トラブルシューティング

### 記事が表示されない場合

1. **ステータス確認**
   ```sql
   SELECT title, status FROM blog_posts;
   ```
   - `status`が`'published'`になっていることを確認

2. **公開日時確認**
   ```sql
   SELECT title, published_at FROM blog_posts;
   ```
   - `published_at`が過去の日時になっていることを確認

3. **RLSポリシー確認**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'blog_posts';
   ```

---

## 次のステップ

記事を表示したら、以下を追加検討:

1. **OGP画像の設定**: `og_image_path`を更新
2. **関連記事のリンク確認**: 内部リンクが正しく動作しているか確認
3. **SEOメタデータの調整**: 検索エンジン用の最適化
