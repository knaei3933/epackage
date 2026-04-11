# nanobanana MCP 画像プロンプトライブラリ

> **目的**: Epackage Labブログ用の最適化された画像生成プロンプト集
> **更新日**: 2025-04-11
> **バージョン**: 2.0
> **ツール**: nanobanana (Gemini 2.5 Flash Image)

---

## プロンプト基本構造

### 必須5要素

1. **主語の明確化**: `Professional product photography of [製品名]`
2. **被写体の詳細**: `filled with [内容物], [包装仕様]`
3. **ライティング指定**: `studio lighting with soft shadows`
4. **背景指定**: `white background` または `light purple gradient background`
5. **品質キーワード**: `commercial quality, sharp focus, high resolution`

### 推奨パラメータ

```json
{
  "prompt": "[200-400文字のプロンプト]",
  "aspect_ratio": "16:9|2:1|1:1|4:3|3:2",
  "quality": "high",
  "candidate_count": 1
}
```

---

## 画像タイプ別テンプレート

### Hero（記事トップ画像）

**用途**: 記事の冒頭で使用するメイン画像
**サイズ**: 1920 x 1080px (16:9)
**プロンプト**:
```
Epic commercial product photography of [製品名] collection,
five [製品]s filled with [内容物例],
dramatic studio lighting with warm sunlight feel,
gradient background from white to light purple,
Japanese premium packaging aesthetic,
commercial hero banner quality, sharp focus, high resolution
```

**例: スタンドパウチ**
```
Epic commercial product photography of stand-up pouch collection,
five pouches filled with chips, granola, nuts, dried fruits,
dramatic spotlighting on center pouch,
gradient background from white to light purple,
Japanese premium retail packaging aesthetic,
commercial hero quality, sharp focus, high resolution
```

---

### Section（セクション見出し）

**用途**: セクション内の説明図・比較図
**サイズ**: 1200 x 630px (2:1)
**プロンプト**:
```
Clean technical diagram showing [図解内容],
line art illustration with bold dark gray lines,
labeled in Japanese: [ラベル例],
white background with light blue grid,
modern technical illustration style, professional quality
```

---

### Product（製品紹介）

**用途**: 製品の単独紹介
**サイズ**: 1024 x 1024px (1:1)
**プロンプト**:
```
Professional studio product photography of [製品名],
filled with [内容物],
[包装仕様],
standing on white background,
soft studio lighting, sharp focus,
Japanese minimalist aesthetic,
commercial quality, high resolution
```

---

## 製品別プロンプト集

### スタンドパウチ

#### 製品ショット（Product）
```
Professional studio product photography of stand-up pouch,
standing upright, filled with organic granola,
matte finish packaging with elegant typography,
three-point studio lighting,
sharp focus on W-shaped bottom,
white background,
Japanese premium packaging aesthetic,
commercial quality, high resolution
```

#### 構造図（Section）
```
Technical diagram showing W-shaped bottom structure of stand-up pouch,
cross-section view with bottom expanded,
line art illustration with bold lines,
labeled in Japanese: W-shape bottom, self-standing mechanism,
white background with grid,
purple accent bars highlighting structure,
professional quality
```

### ガゼットパウチ（BOX型）

#### 製品ショット（Product）
```
Professional studio product photography of four-sided gusset pouch,
complete box shape with all panels expanded, filled with flour,
standing perfectly upright like a box,
premium packaging with clean design,
even studio lighting,
white background,
Japanese premium packaging aesthetic,
commercial quality, high resolution
```

#### 容量比較（Comparison）
```
Modern infographic showing capacity comparison,
left side: flat pouch at 500ml with red indicator,
right side: gusset pouch at 1000ml with green checkmark,
product silhouettes showing same footprint but different capacity,
purple gradient volume bars,
Japanese labels for volume comparison,
white background,
modern infographic style, professional quality
```

### スパウトパウチ

#### 注ぎ口のクローズアップ
```
Macro photography close-up of straight spout pouch,
showing interlocking teeth and pull tab,
studio lighting highlighting texture,
sharp focus on zipper detail,
white background,
commercial macro photography quality
```

#### 注ぎ込みシーン（Lifestyle）
```
Professional lifestyle photography showing pouring from spout pouch,
warm Japanese kitchen setting with morning sunlight,
stream of orange juice flowing from spout in mid-air,
clean modern kitchen with purple accent elements,
hands holding pouch,
natural lighting,
Japanese home cooking aesthetic,
commercial lifestyle photography
```

### 平袋

#### 製品コレクション
```
Professional flat lay photography of products in flat pouches,
coffee beans, nuts, dried fruits arranged artistically,
on white marble surface,
natural lighting, subtle shadows,
Japanese minimalist aesthetic,
commercial quality, high resolution
```

#### コスト比較
```
Modern infographic comparing flat pouch vs stand pouch costs,
left side: flat pouch with low cost label,
right side: stand pouch with high appeal label,
clean flat design with purple gradient bars,
Japanese labels for cost comparison,
white background,
modern infographic style,
professional quality
```

---

## 素材・技術関連プロンプト

### 素材比較
```
Technical diagram showing film material layers,
cross-section view with clear separation,
labeled in Japanese: PET, AL, LLDPE,
white background with color-coded layers,
modern technical illustration style,
professional quality
```

### 印刷方式比較
```
Modern infographic comparing gravure vs digital printing,
left side: gravure printing with high volume label,
right side: digital printing with small lot label,
clean flat design with comparison table,
Japanese labels,
white background,
modern infographic style,
professional quality
```

---

## ライフスタイル・シーン別プロンプト

### 小規模事業者の作業風景
```
Professional lifestyle photography of small business owner,
woman packaging products into flat pouches,
warm natural lighting,
clean home office setting,
Japanese small business aesthetic,
commercial lifestyle photography
```

### 店頭陳列シーン
```
Professional retail photography showing stand pouches on store shelf,
five pouches standing整齐排列,
warm store lighting with purple accent,
clean modern shelving,
Japanese retail aesthetic,
commercial store photography
```

### キッチン風使用シーン
```
Professional lifestyle photography of kitchen usage,
person pouring granola from stand pouch into bowl,
morning sunlight through window,
clean modern kitchen with granite counter,
natural lighting,
Japanese home cooking aesthetic,
commercial lifestyle photography
```

---

## プロンプト作成のベストプラクティス

### 文字数の最適化

- **推奨**: 200-400文字
- **最大**: 500文字（品質が低下する可能性）
- **最小**: 100文字（要件不足）

### 言語の選択

| カテゴリー | 推奨する用語 | 避けるべき用語 |
|---------|--------------|----------------|
| **品質** | professional, commercial, high quality | cheap, low quality |
| **照明** | studio lighting, soft shadows, natural lighting | bright light, dark |
| **スタイル** | Japanese minimalist, premium packaging aesthetic | cheap style |
| **フォーカス** | sharp focus, clear details | blurry, out of focus |

### 色の指定

| 方法 | 例 |
|------|-----|
| **色名のみ** | white, purple, light blue |
| **HEXコード** | 使用しない（#FFFFFF → "white"） |
| **複雑な指定** | 複数の色を指定する場合は単純化 |

### アスペクト比の選択

| アスペクト比 | 用途 | nanobananaパラメータ |
|-----------|------|-------------------|
| **16:9** | Hero画像 | "16:9" |
| **2:1** | Sectionヘッダー | "2:1" |
| **1:1** | 製品ショット | "1:1" |
| **4:3** | Lifestyle | "4:3" |
| **3:2** | Comparison | "3:2" |

---

## 品質チェックリスト

### 生成前チェック

- [ ] プロンプトが200-400文字以内
- [ ] 必須5要素が含まれている
- [ ] 適切なアスペクト比を選択している
- [ ] 品質キーワードが含まれている

### 生成後チェック

- [ ] 主題が明確に写っている
- [ ] 指定された背景色である
- [ ] ライティングが適切に表現されている
- - [ ] 日本語ミスがない（日本語を使用する場合）
- [ ] 商用品質として十分な品質である

---

## トラブルシューティング

### よくある問題と解決策

| 問題 | 原因 | 解決策 |
|------|------|------|
| **意図しない画像** | プロンプトが不明確 | 主語を最前に配置 |
| **背景が透明** | 背景指定がない | "white background"を追加 |
| **品質が低い** | 品質キーワード不足 | "commercial quality, high resolution"を追加 |
| **日本語がおかしい** | 日本語処理が不安定 | 日本語は補助的に使用し、英語ベースで記述 |

---

## バージョン管理

| バージョン | 更新日 | 主な変更 |
|---------|--------|----------|
| 1.0 | 2025-04-11 | 初版リリース |
| 2.0 | 2025-07-01 | プロンプトの最適化、新規製品追加 |

---

*最終更新: 2025-04-11*
*Epackage Lab ブログ編集部*
