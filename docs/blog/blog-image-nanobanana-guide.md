# ブログ記事別 画像生成プロンプト集（nanobanana最適化版）

## nanobanana (Gemini 2.5 Flash Image) 仕様

| 項目 | 制限・仕様 |
|------|-----------|
| **プロンプト長制限** | 2000文字（推奨: 200-400文字） |
| **デフォルト解像度** | 1024x1024 |
| **日本語サポート** | ✓ 完全対応 |
| **アスペクト比** | 1:1, 16:9, 4:3, 3:2 など |
| **対応フォーマット** | PNG, JPEG, WebP |

## nanobanana最適化のポイント

### ✓ 推奨事項
- **簡潔なプロンプト**: 200-400文字で要点をまとめる
- **英語ベース**: 日本語は補助的に使用
- **色の指定**: HEXコードではなく色名（white, purple, light blue）
- **品質キーワード**: "professional", "high quality", "detailed"
- **明確な主題**: メインとなる被写体を最初に指定

### ✗ 避けるべき事項
- **過度な技術仕様**: 具体的なカメラ名、レンズ名は不要
- **HEXコード**: #FFFFFF ではなく "white background"
- **長すぎるプロンプト**: 400文字を超えると品質が低下する可能性
- **複雑な構造**: 1つのプロンプトで複数の複雑な指示を混ぜない

---

# 共通テンプレート

## 製品写真テンプレート
```
Professional product photography of [製品名],
filled with [内容物], [包装仕様],
standing on white background,
studio lighting with soft shadows,
Japanese minimalist aesthetic,
commercial quality, sharp focus, high resolution
```

## 技術図解テンプレート
```
Clean technical diagram showing [図解内容],
line art illustration with bold lines,
labeled in Japanese, white background,
modern technical illustration style,
professional quality
```

## ライフスタイル写真テンプレート
```
Professional lifestyle photography showing [シーン],
[詳細な状況描写],
natural lighting with warm tones,
Japanese [業界] aesthetic,
commercial quality, high resolution
```

---

# 画像サイズ規格

| 種類 | サイズ | アスペクト比 | nanobanana用aspect_ratio |
|------|--------|-------------|------------------------|
| **Hero (メイン)** | 1920 x 1080px | 16:9 | "16:9" |
| **Section Header** | 1200 x 630px | 2:1 | "2:1" |
| **Product Shot** | 1024 x 1024px | 1:1 | "1:1" |
| **Comparison** | 1200 x 800px | 3:2 | "3:2" |
| **Lifestyle** | 1200 x 900px | 4:3 | "4:3" |
| **Thumbnail** | 400 x 300px | 4:3 | "4:3" |

---

# 06. 平袋｜コストパフォーマンス最強の定番パッケージ

## 06-hero-01 (1920x1080px, aspect_ratio: "16:9")

```
Professional product photography of flat pouch collection,
five pouches filled with coffee beans, nuts, dried fruits, rice,
arranged artistically on white background,
soft studio lighting creating subtle shadows,
Japanese minimalist aesthetic,
commercial hero banner quality, sharp focus, high resolution
```

**パラメータ:**
```json
{
  "prompt": "[上記プロンプト]",
  "aspect_ratio": "16:9",
  "quality": "high",
  "candidate_count": 1
}
```

---

## 06-section-01 (1200x630px, aspect_ratio: "2:1")

```
Clean technical diagram showing three-side seal structure of flat pouch,
exploded view with clear separation,
line art illustration with bold dark gray lines,
labeled in Japanese: three-side seal, heat seal, sealed edge,
white background with light blue grid,
modern technical illustration style, professional quality
```

**パラメータ:**
```json
{
  "prompt": "[上記プロンプト]",
  "aspect_ratio": "2:1",
  "quality": "high",
  "candidate_count": 1
}
```

---

## 06-product-01 (1024x1024px, aspect_ratio: "1:1")

```
Professional studio product photography of flat pouch,
filled with premium roasted coffee beans,
matte finish packaging with elegant typography,
standing on white background,
soft studio lighting, sharp focus,
Japanese minimalist aesthetic, commercial quality, high resolution
```

---

## 06-product-02 (1024x1024px, aspect_ratio: "1:1")

```
Professional studio product photography of flat pouch with transparent window,
clear window showing mixed nuts inside,
matte finish packaging with gold logo,
standing on white background,
studio lighting, sharp focus,
Japanese premium packaging aesthetic, commercial quality
```

---

## 06-product-03 (1024x1024px, aspect_ratio: "1:1")

```
Professional studio product photography of Kraft paper flat pouch,
natural brown kraft paper texture,
filled with organic oatmeal,
standing on white background,
natural lighting with warm tones,
Japanese organic product aesthetic, commercial quality
```

---

## 06-comparison-01 (1200x800px, aspect_ratio: "3:2")

```
Modern infographic comparing flat pouch vs stand pouch costs,
left side: flat pouch with low cost label,
right side: stand pouch with high appeal label,
clean flat design with purple gradient bars,
Japanese labels for cost comparison,
white background, modern infographic style, professional quality
```

---

## 06-products-grid (1200x900px, aspect_ratio: "4:3")

```
Professional flat lay photography of products in flat pouches,
coffee beans, nuts, dried fruits arranged artistically,
on white marble surface,
natural lighting, subtle shadows,
Japanese minimalist aesthetic, commercial quality, high resolution
```

---

## 06-size-guide (1200x800px, aspect_ratio: "3:2")

```
Technical diagram showing flat pouch size guide,
five pouches in ascending size order,
labeled with dimensions in millimeters,
measurement lines and arrows,
white background with grid lines,
modern technical illustration style, professional quality
```

---

## 06-lifestyle-01 (1200x900px, aspect_ratio: "4:3")

```
Professional lifestyle photography of small business owner,
woman packaging products into flat pouches,
warm natural lighting,
clean home office setting,
Japanese small business aesthetic, commercial lifestyle photography
```

---

## 06-thumb-01 (400x300px, aspect_ratio: "4:3")

```
Professional product photography thumbnail of flat pouch with coffee beans,
centered on white background,
soft studio lighting, sharp focus,
Japanese minimalist aesthetic
```

---

# 07. スタンドパウチ｜陳列効果を最大化する自立袋

## 07-hero-01 (1920x1080px, aspect_ratio: "16:9")

```
Epic commercial product photography of stand-up pouch collection,
five pouches standing tall in arc formation on retail shelf,
filled with chips, granola, nuts, dried fruits,
dramatic spotlighting on center pouch,
gradient background from white to light purple,
Japanese premium retail packaging aesthetic, commercial hero quality
```

---

## 07-section-01 (1200x630px, aspect_ratio: "2:1")

```
Technical diagram showing W-shaped bottom structure of stand-up pouch,
cross-section view with bottom expanded,
line art illustration with bold lines,
labeled in Japanese: W-shape bottom, self-standing mechanism,
white background with grid,
purple accent bars highlighting structure, professional quality
```

---

## 07-product-01 (1024x1024px, aspect_ratio: "1:1")

```
Professional studio product photography of plain stand-up pouch,
standing upright, filled with organic granola,
matte finish packaging,
three-point studio lighting,
sharp focus on W-shaped bottom,
white background, Japanese minimalist aesthetic, commercial quality
```

---

## 07-product-02 (1024x1024px, aspect_ratio: "1:1")

```
Professional studio product photography of round bottom stand pouch,
elegant curved bottom, filled with premium nuts,
glossy finish with gold logo,
dramatic lighting highlighting curved bottom,
white background, Japanese premium packaging aesthetic
```

---

## 07-product-03 (1024x1024px, aspect_ratio: "1:1")

```
Professional studio product photography of flat bottom stand pouch,
box-like appearance, filled with coffee beans,
standing perfectly upright,
premium matte finish,
even studio lighting,
white background, Japanese premium packaging aesthetic, commercial quality
```

---

## 07-product-04 (1024x1024px, aspect_ratio: "1:1")

```
Macro photography close-up of zipper closure on stand pouch,
showing interlocking teeth and pull tab,
studio lighting highlighting texture,
sharp focus on zipper detail,
white background, commercial macro photography quality
```

---

## 07-display-01 (1200x900px, aspect_ratio: "4:3")

```
Professional retail photography showing stand pouches on store shelf,
five pouches standing整齐排列,
warm store lighting with purple accent,
clean modern shelving,
Japanese retail aesthetic, commercial store photography
```

---

## 07-products-grid (1200x900px, aspect_ratio: "4:3")

```
Professional flat lay photography of products in stand pouches,
chips, granola, nuts, dried fruits arranged neatly,
on white surface with soft purple gradient,
natural lighting, subtle shadows,
Japanese minimalist aesthetic, commercial quality
```

---

## 07-comparison-01 (1200x800px, aspect_ratio: "3:2")

```
Size comparison diagram showing different stand pouch sizes,
five pouches in ascending size order,
labeled with dimensions in millimeters,
measurement lines and arrows in dark gray,
Japanese labels for sizes,
white background, modern infographic style, professional quality
```

---

## 07-thumb-01 (400x300px, aspect_ratio: "4:3")

```
Professional product photography thumbnail of stand pouch with snacks,
standing upright on white background,
soft studio lighting, sharp focus,
Japanese minimalist aesthetic
```

---

# 08. ガゼットパウチ（BOX型）｜大容量商品を自立させる箱型パッケージ

## 08-hero-01 (1920x1080px, aspect_ratio: "16:9")

```
Epic commercial product photography of gusset pouch collection,
five pouches with coffee beans, pet food, flour,
showing expanded gusset sides demonstrating capacity,
dramatic studio lighting with warm sunlight feel,
white to light purple gradient background,
Japanese premium packaging aesthetic, commercial hero quality
```

---

## 08-section-01 (1200x630px, aspect_ratio: "2:1")

```
Technical diagram showing gusset structure with side expansion,
exploded view illustration,
line art with bold lines,
labeled in Japanese: gusset expansion, capacity increase,
white background with grid,
purple accent highlighting gusset panels, professional quality
```

---

## 08-product-01 (1024x1024px, aspect_ratio: "1:1")

```
Professional studio product photography of side gusset pouch,
standing with side panels expanded, filled with coffee beans,
matte finish packaging,
studio lighting with softbox,
sharp focus on side gusset detail,
white background, Japanese premium packaging aesthetic, commercial quality
```

---

## 08-product-02 (1024x1024px, aspect_ratio: "1:1")

```
Professional studio product photography of bottom gusset pouch,
showing wide bottom base, filled with pet food,
standing with maximum stability,
studio lighting highlighting bottom width,
white background, Japanese pet industry packaging aesthetic
```

---

## 08-product-03 (1024x1024px, aspect_ratio: "1:1")

```
Professional studio product photography of four-sided gusset pouch,
complete box shape with all panels expanded, filled with flour,
standing perfectly upright like a box,
premium packaging with clean design,
even studio lighting,
white background, Japanese premium packaging aesthetic, commercial quality
```

---

## 08-capacity-01 (1200x800px, aspect_ratio: "3:2")

```
Modern infographic showing capacity comparison,
left side: flat pouch at 500ml with red indicator,
right side: gusset pouch at 1000ml with green checkmark,
product silhouettes showing same footprint but different capacity,
purple gradient volume bars,
Japanese labels for volume comparison,
white background, modern infographic style, professional quality
```

---

## 08-products-grid (1200x900px, aspect_ratio: "4:3")

```
Professional product photography of products in gusset pouches,
coffee beans, pet food, flour, rice arranged artistically,
each pouch showing expanded gusset sides,
on white surface, natural lighting,
subtle shadows, Japanese product aesthetic, commercial quality
```

---

## 08-size-guide (1200x800px, aspect_ratio: "3:2")

```
Technical diagram showing gusset width selection guide,
five pouches with different gusset widths: 30mm, 50mm, 80mm, 100mm, 120mm,
labeled with gusset width and estimated capacity,
measurement lines and arrows,
Japanese labels for gusset width and capacity,
white background with grid, modern technical illustration style, professional quality
```

---

## 08-thumb-01 (400x300px, aspect_ratio: "4:3")

```
Professional product photography thumbnail of box-type gusset pouch,
showing expanded gusset sides, filled with pet food,
centered on white background,
soft studio lighting, sharp focus, Japanese minimalist aesthetic
```

---

# 09. スパウトパウチ｜液体対応の注ぎやすいパッケージ

## 09-hero-01 (1920x1080px, aspect_ratio: "16:9")

```
Epic commercial product photography of spout pouch collection,
five pouches: orange juice, soy sauce, shampoo, detergent, honey,
dramatic splash of orange juice in mid-air from pouring spout,
studio lighting with backlighting through liquid,
gradient background from white to light purple,
Japanese premium packaging aesthetic, commercial hero quality
```

---

## 09-section-01 (1200x630px, aspect_ratio: "2:1")

```
Technical diagram showing spout pouch parts and structure,
exploded view with clear separation,
line art illustration with bold lines,
labeled in Japanese: pouch body, spout, cap,
white background with grid,
color-coded sections: purple for spout, blue for labels, professional quality
```

---

## 09-product-01 (1024x1024px, aspect_ratio: "1:1")

```
Professional studio product photography of straight spout pouch,
filled with orange juice, straight spout with cap,
translucent pouch material showing liquid color,
studio lighting with backlighting,
sharp focus on spout detail,
white background, Japanese beverage packaging aesthetic, commercial quality
```

---

## 09-product-02 (1024x1024px, aspect_ratio: "1:1")

```
Professional studio product photography of curved spout pouch,
filled with premium shampoo, elegant curved spout,
glossy pouch material with premium branding,
studio lighting with accent light on curved spout,
sharp focus on curved spout detail,
white background with soft purple gradient, Japanese premium cosmetic packaging aesthetic
```

---

## 09-product-03 (1024x1024px, aspect_ratio: "1:1")

```
Professional studio product photography of wide mouth spout pouch,
filled with thick honey, wide opening for viscous liquids,
matte finish pouch material,
studio lighting with softbox,
sharp focus on wide mouth opening and cap,
white background, Japanese food packaging aesthetic, commercial quality
```

---

## 09-caps-01 (1024x1024px, aspect_ratio: "1:1")

```
Professional flat lay photography of different cap types for spout pouches,
standard cap, flip-top cap, sports cap, child-proof cap arranged artistically,
each cap in open and closed positions,
even studio lighting, sharp focus,
subtle shadows, Japanese product collection aesthetic, commercial quality
```

---

## 09-pouring-01 (1200x900px, aspect_ratio: "4:3")

```
Professional lifestyle photography showing pouring from spout pouch,
warm Japanese kitchen setting with morning sunlight,
stream of orange juice flowing from spout in mid-air,
clean modern kitchen with purple accent elements,
hands holding pouch, natural lighting,
Japanese home cooking aesthetic, commercial lifestyle photography
```

---

## 09-products-grid (1200x900px, aspect_ratio: "4:3")

```
Professional product photography of products in spout pouches,
juice, sauce, shampoo, detergent, honey arranged artistically,
each pouch with spout and cap visible,
on white surface, natural lighting,
subtle shadows, Japanese product collection aesthetic, commercial quality
```

---

## 09-thumb-01 (400x300px, aspect_ratio: "4:3")

```
Professional product photography thumbnail of spout pouch with cap,
filled with juice, centered on white background,
soft studio lighting, sharp focus on spout and cap,
Japanese minimalist aesthetic
```

---

# nanobanana 使用ガイド

## 基本パラメータ設定

```json
{
  "prompt": "[プロンプト]",
  "aspect_ratio": "16:9",
  "quality": "high",
  "candidate_count": 1
}
```

## パラメータ詳細

| パラメータ | 値 | 説明 |
|-----------|---|------|
| **prompt** | 文字列 | 画像生成プロンプト（200-400文字推奨） |
| **aspect_ratio** | "1:1", "16:9", "4:3", "3:2", "2:1" | 画像のアスペクト比 |
| **quality** | "low", "medium", "high", "auto" | 画像品質（推奨: "high"） |
| **candidate_count** | 1-4 | 生成する画像数 |

## 画像生成コマンド例

### MCP経由で使用する場合
```json
{
  "prompt": "Professional product photography of flat pouch filled with coffee beans, white background, studio lighting, Japanese minimalist aesthetic, commercial quality",
  "aspect_ratio": "16:9",
  "quality": "high",
  "candidate_count": 1
}
```

### Claude Code で使用する場合
```
/mcp__nanobanana__nanobanana_generate
prompt: "Professional product photography of flat pouch filled with coffee beans..."
aspect_ratio: "16:9"
quality: "high"
candidate_count: 1
```

---

# 画像品質向上のヒント

## より良い結果を得るために

### 1. 主題を明確にする
```
✅ 良い例: "Professional product photography of flat pouch filled with coffee beans"
❌ 悪い例: "A pouch with some stuff inside"
```

### 2. ライティングを指定する
```
✅ 良い例: "studio lighting with softbox diffusion"
❌ 悪い例: "good lighting"
```

### 3. 背景を明確にする
```
✅ 良い例: "white background" または "light purple gradient background"
❌ 悪い例: "#FFFFFF background" または "white or blue background"
```

### 4. スタイルを指定する
```
✅ 良い例: "Japanese minimalist aesthetic"
❌ 悪い例: "minimalist design"
```

### 5. 品質キーワードを追加する
```
推奨: "professional quality", "sharp focus", "high resolution", "commercial quality"
```

---

# 画像配置ガイド

## 記事テンプレート

```markdown
# 【記事タイトル】

**日付** | #タグ

---

## ヒーロー画像
![hero-01](./blog/06-hero-01.jpg)
*幅: 100%*

---

## リード文

テキスト...

---

## 目次

1. [セクション1](#section-1)
...

---

## セクション見出し
![section-01](./blog/06-section-01.png)
*幅: 100%*

### サブセクション
テキスト...

![product-01](./blog/06-product-01.jpg)
*幅: 60%, 右寄せ*

---

## まとめ

テキスト...

---

## 関連記事

...
```

---

# 画像最適化ガイド

### ファイル形式
- **写真**: JPG (品質 85%)
- **図解**: PNG
- **インフォグラフィック**: PNG または SVG

### 画像圧縮目標
| 種類 | 最大サイズ |
|------|-----------|
| Hero | 300KB |
| Section | 200KB |
| Product | 150KB |
| Thumbnail | 50KB |

### Alt テキスト例
```
alt="平袋の製品写真、コーヒー豆が入ったパッケージ"
alt="スタンドパウチの構造図、W字型底部の説明"
alt="ガゼットパウチの容量比較、平袋500mlvsガゼット1000ml"
```

---

*更新日: 2026-02-26*
*Epackage Lab ブログ用*
*nanobanana (Gemini 2.5 Flash Image) 最適化版*
