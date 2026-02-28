# Epackage Lab - Google Ads URL設定ガイド

**作成日**: 2026-02-28
**用途**: Google Ads 広告URLオプション設定用

---

## URLオプション一覧

Google Adsには以下の4種類のURL設定があります。

| 項目 | 英語 | 日本語 | 必須 |
|------|------|--------|------|
| **最終URL** | Final URL | ランディングページの実際のURL | ✅ 必須 |
| **表示URLパス** | Display Path | 検索結果に表示されるURLパス | - 任意 |
| **トラッキングテンプレート** | Tracking Template | トラッキングパラメータを追加 | - 任意 |
| **カスタムパラメータ** | Custom Parameters | カスタムトラッキング用変数 | - 任意 |

---

## 1. 最終URL（Final URL）

### 設定例

```
【広告グループ別最終URL】

化粧品パッケージ向け:
https://epackage-lab.com/products/cosmetics

健康食品パッケージ向け:
https://epackage-lab.com/products/supplements

コーヒー向け:
https://epackage-lab.com/products/coffee

小ロット・見積トップ:
https://epackage-lab.com/quote

全製品一覧:
https://epackage-lab.com/products
```

---

### 設定のポイント

```
✅ HTTPS必須（SSL証明書必須）
✅ モバイルフレンドリーであること
✅ 読み込み速度3秒以内
✅ 関連性の高いページを設定
✅ UTMパラメータはトラッキングテンプレートで追加
```

---

## 2. 表示URLパス（Display Path）

### 仕様

| 項目 | 制限 |
|------|------|
| 文字数 | 最大15文字 |
| 数量 | 最大2個 |
| 表示形式 | ドメイン/パス1/パス2 |

---

### 設定例

#### パターン1: 製品カテゴリ表示

```
表示URL: epackage-lab.com/packaging/pouch

パス1: packaging
パス2: pouch
```

---

#### パターン2: 機能強調

```
表示URL: epackage-lab.com/quote/ai-estimate

パス1: quote
パス2: ai-estimate
```

---

#### パターン3: ターゲット業界表示

```
表示URL: epackage-lab.com/cosmetics/stand-pouch

パス1: cosmetics
パス2: stand-pouch
```

---

#### パターン4: サービス強調

```
表示URL: epackage-lab.com/small-lot/500-from

パス1: small-lot
パス2: 500-from
```

---

### 表示URLパス設定推奨セット

```
【製品別】
1. /packaging/pouch（パウチ）
2. /packaging/flat-bag（平袋）
3. /packaging/gusset（ガゼット）
4. /packaging/spout（スパウト）
5. /packaging/roll-film（ロールフィルム）

【機能別】
6. /quote/ai-estimate（AI見積）
7. /small-lot/500-from（小ロット）
8. /services/manufacturing（製造サービス）

【業界別】
9. /cosmetics/packaging（化粧品）
10. /supplement/packaging（サプリメント）
11. /coffee/packaging（コーヒー）
12. /food/packaging（食品）
```

---

## 3. トラッキングテンプレート（Tracking Template）

### 仕様

```
形式: {lpurl}?utm_source=google&utm_medium=cpc&...
```

---

### 設定例（Google Analytics 4連携）

```
基本テンプレート:
{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}

サフィックス付き:
{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign={_campaign}&utm_content={_adgroup}&utm_term={_targetid}&gclid={gclid}
```

---

### 変数一覧

| 変数 | 説明 | 例 |
|------|------|------|
| `{lpurl}` | ランディングページURL | https://epackage-lab.com/quote |
| `{campaignid}` | キャンペーンID | 123456789 |
| `{adgroupid}` | 広告グループID | 987654321 |
| `{creative}` | クリエイティブID | 456789123 |
| `{keyword}` | キーワード | パッケージ製造 小ロット |
| `{_campaign}` | キャンペーン名 | B2B_包装材_検索 |
| `{_adgroup}` | 広告グループ名 | スタンドパウチ_化粧品 |
| `{gclid}` | Google Click ID | xxxxxxxxxxxx |
| `{matchtype}` | マッチタイプ | b（完全一致） |
| `{network}` | ネットワーク | g（Google検索） |
| `{device}` | デバイス | m（モバイル） |
| `{devicemodel}` | デバイスモデル | iPhone |
| `{placement}` | プレイスメント | URLまたはアプリID |
| `{target}` | ターゲット | placementまたはkeyword |
| `{ifMobile:[value]}` | モバイル条件分岐 | 値 |
| `{ifNotMobile:[value]}` | 非モバイル条件分岐 | 値 |

---

### 実装例（アカウントレベル設定）

```
トラッキングテンプレート（アカウントレベル共通）:
{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign={_campaign}&utm_content={_adgroup}&utm_term={keyword}&gclid={gclid}
```

---

## 4. カスタムパラメータ（Custom Parameters）

### 仕様

```
形式: key1={value1}&key2={value2}...
```

---

### 設定例（Epackage Lab用）

```
アカウントレベル:
business_type=b2b&service=packaging&market=japan

キャンペーンレベル:
campaign_type=search&target={_campaign}

広告グループレベル:
product_category={_adgroup}&lot_size=small
```

---

### 利用シーン

```
1. オフラインコンバージョン連携
   - CRMシステムとデータ連携

2. リードスコアリング
   - キーワード別スコア付与

3. 内部レポート
   - 独自の分析軸で集計
```

---

## URL設定ベストプラクティス

### 階層構造

```
アカウントレベル（共通）
├─ トラッキングテンプレート
└─ カスタムパメータ（基本）

キャンペーンレベル
├─ カスタムパラメータ（キャンペーン別）

広告グループレベル
├─ 最終URL（LPごとに設定）
├─ 表示URLパス（製品別に設定）
└─ カスタムパラメータ（製品別）
```

---

### URL設定チェックリスト

```
□ 最終URLが正しいLPを指している
□ 最終URLはHTTPS対応済み
□ 表示URLパスは日本語15文字以内
□ 表示URLパスは実際のURLと関連している
□ トラッキングテンプレートに{lpurl}を含めている
□ UTMパラメータを正しく設定している
□ GA4との連携が完了している
□ gclidパラメータを含めている
□ カスタムパラメータを必要に応じて設定している
```

---

## 広告グループ別URL設定まとめ

### グループ1: スタンドパウチ（化粧品）

```
最終URL: https://epackage-lab.com/products/stand-pouch
表示URLパス1: cosmetics
表示URLパス2: stand-pouch
トラッキング: {lpurl}?utm_source=google&utm_medium=cpc&utm_campaign={_campaign}&utm_content={_adgroup}&utm_term={keyword}&gclid={gclid}
```

---

### グループ2: 健康食品・サプリメント

```
最終URL: https://epackage-lab.com/products/flat-bag
表示URLパス1: supplement
表示URLパス2: packaging
トラッキング: {lpurl}?utm_source=google&utm_medium=cpc&utm_campaign={_campaign}&utm_content={_adgroup}&utm_term={keyword}&gclid={gclid}
```

---

### グループ3: コーヒー・ガゼットパウチ

```
最終URL: https://epackage-lab.com/products/gusset-pouch
表示URLパス1: coffee
表示URLパス2: gusset-pouch
トラッキング: {lpurl}?utm_source=google&utm_medium=cpc&utm_campaign={_campaign}&utm_content={_adgroup}&utm_term={keyword}&gclid={gclid}
```

---

### グループ4: 小ロット・即見積

```
最終URL: https://epackage-lab.com/quote
表示URLパス1: quote
表示URLパス2: ai-estimate
トラッキング: {lpurl}?utm_source=google&utm_medium=cpc&utm_campaign={_campaign}&utm_content={_adgroup}&utm_term={keyword}&gclid={gclid}
```

---

### グループ5: 液体製品・合掌袋・スパウト

```
最終URL: https://epackage-lab.com/products/spout-pouch
表示URLパス1: liquid
表示URLパス2: spout-pouch
トラッキング: {lpurl}?utm_source=google&utm_medium=cpc&utm_campaign={_campaign}&utm_content={_adgroup}&utm_term={keyword}&gclid={gclid}
```

---

## トラッキング設定の流れ

### ステップ1: Google Analytics 4設定

```
1. GA4プロパティ作成
2. 測定ID取得（G-XXXXXXXXXX）
3. ウェブサイトにGA4タグ実装
4. Google Adsとのリンク設定
5. コンバージョンアクション設定
```

---

### ステップ2: Google Adsタグ設定

```
1. Googleタグ（gtag.js）実装
2. コンバージョン追跡タグ設定
3. 電話番号クリック追跡（任意）
4. オフラインコンバージョン連携（任意）
```

---

### ステップ3: URLパラメータ確認

```
Google Ads管理画面
└─ 設定
   └─ アカウント設定
      └─ トラッキング
         └─ 「自動タグ設定」をオンにする
```

---

## よくある質問

### Q1: 表示URLと最終URLの違いは？

```
表示URL:
- ユーザーに表示されるURL
- 実際のURLと異なっていてもOK
- ドメインは実際のURLと一致している必要がある

最終URL:
- 実際のランディングページURL
- ユーザーがクリックした後に遷移する先
- HTTPS必須
```

---

### Q2: トラッキングテンプレートとUTMパラメータの違いは？

```
トラッキングテンプレート:
- Google Adsの機能
- 変数（{lpurl}、{keyword}等）が使える
- 一括管理が可能

UTMパラメータ:
- Google Analytics用の標準パラメータ
- utm_source、utm_medium、utm_campaign等
- 手動または自動で設定可能

→ 併用推奨
```

---

### Q3: {lpurl}を使うべき理由は？

```
1. リダイレクトに対応できる
2. 手動でURLを入力するミスを防ぐ
3. テストと本番でURLを変更する際に一括管理可能
4. 最終URLを変更してもトラッキングが維持される
```

---

## 関連ファイル

| ファイル | 内容 |
|----------|------|
| `GOOGLE_ADS_COMPLETE_GUIDE.md` | 完全設定ガイド |
| `GOOGLE_ADS_AD_COPY.md` | 広告文パターン集 |
| `GOOGLE_ADS_KEYWORDS.md` | ターゲットキーワード |
| `GOOGLE_ADS_URL_SETTINGS.md` | **これ（URL設定）** |

---

**文書バージョン**: 1.0
**最終更新**: 2026-02-28
