# 業界特化画像プロンプト集

> **目的**: パッケージ製造業界の専門的な画像生成プロンプト集
> **更新日**: 2026-04-11
> **バージョン**: 1.0
> **対象**: 包装業界、素材業界、印刷業界、製品開発担当者

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
  "candidate_count": 1,
  "output_format": "png"
}
```

### WebP変換ワークフロー

生成後のPNG画像はWebP形式に変換して使用：

```bash
# PNGからWebPへ変換（品質85%）
cwebp input.png -q 85 -o output.webp

# 一括変換スクリプト
for file in *.png; do
  cwebp "$file" -q 85 -o "${file%.png}.webp"
done
```

---

## 包装業界プロンプト（15種類）

### 1. スタンドパウチ製品ショット

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

**用途**: 製品紹介、カタログ
**アスペクト比**: 1:1

---

### 2. スタンドパウチ断面構造図

```
Technical diagram showing W-shaped bottom structure of stand-up pouch,
cross-section view with bottom expanded,
line art illustration with bold lines,
labeled in Japanese: W-shape bottom, self-standing mechanism,
white background with grid,
purple accent bars highlighting structure,
professional quality
```

**用途**: 技術解説、構造説明
**アスペクト比**: 2:1

---

### 3. ガゼットパウチ（BOX型）製品ショット

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

**用途**: 製品紹介
**アスペクト比**: 1:1

---

### 4. 容量比較インフォグラフィック

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

**用途**: 比較説明、メリット訴求
**アスペクト比**: 2:1

---

### 5. スパウトパウチ注ぎ口クローズアップ

```
Macro photography close-up of straight spout pouch,
showing interlocking teeth and pull tab,
studio lighting highlighting texture,
sharp focus on zipper detail,
white background,
commercial macro photography quality
```

**用途**: 機能説明、詳細表示
**アスペクト比**: 1:1

---

### 6. スパウトパウチ使用シーン

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

**用途**: 使用イメージ、ライフスタイル
**アスペクト比**: 16:9

---

### 7. 平袋製品コレクション

```
Professional flat lay photography of products in flat pouches,
coffee beans, nuts, dried fruits arranged artistically,
on white marble surface,
natural lighting, subtle shadows,
Japanese minimalist aesthetic,
commercial quality, high resolution
```

**用途**: 製品バリエーション紹介
**アスペクト比**: 4:3

---

### 8. コスト比較インフォグラフィック

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

**用途**: コストメリット説明
**アスペクト比**: 2:1

---

### 9. レトルトパウチ製品ショット

```
Professional studio product photography of retort pouch,
filled with curry, metallic finish with high gloss,
heat-resistant packaging clearly visible,
studio lighting with warm temperature feel,
white background,
Japanese food packaging aesthetic,
commercial quality, high resolution
```

**用途**: レトルト製品紹介
**アスペクト比**: 1:1

---

### 10. ジッパー付きパウチ詳細図

```
Technical close-up of resealable zipper mechanism,
showing interlocking profile and pull tab,
line art illustration with purple accents,
labeled in Japanese: zipper, pull tab, seal line,
white background with technical grid,
professional quality
```

**用途**: 機能説明
**アスペクト比**: 2:1

---

### 11. 易開封パウチ開封シーン

```
Action photography showing easy-open pouch being opened,
hands tearing notched opening,
clean product photography style,
studio lighting,
white background,
Japanese packaging aesthetic,
commercial quality
```

**用途**: 機能説明、使いやすさ訴求
**アスペクト比**: 16:9

---

### 12. 窓付きパウチ製品ショット

```
Professional studio product photography of window pouch,
filled with colorful dried fruits,
transparent window showing product clearly,
premium packaging design,
studio lighting,
white background,
Japanese premium packaging aesthetic,
commercial quality, high resolution
```

**用途**: 製品紹介、中身が見えるメリット
**アスペクト比**: 1:1

---

### 13. デガスバルブ付きパウチ

```
Technical diagram showing degassing valve function,
cross-section view with gas release mechanism,
line art illustration with arrows showing gas flow,
labeled in Japanese: degassing valve, one-way valve,
white background with purple accents,
professional quality
```

**用途**: 機能説明、コーヒー包装等
**アスペクト比**: 2:1

---

### 14. 真空パッケージ製品ショット

```
Professional studio product photography of vacuum package,
tight vacuum seal clearly visible,
product compressed tightly,
premium packaging film texture,
studio lighting,
white background,
Japanese food packaging aesthetic,
commercial quality, high resolution
```

**用途**: 真空包装製品紹介
**アスペクト比**: 1:1

---

### 15. 店頭陳列シーン

```
Professional retail photography showing stand pouches on store shelf,
five pouches standing整齐排列,
warm store lighting with purple accent,
clean modern shelving,
Japanese retail aesthetic,
commercial store photography
```

**用途**: 店頭イメージ、陳列効果
**アスペクト比**: 16:9

---

## 素材業界プロンプト（8種類）

### 16. 素材断面比較図

```
Technical diagram showing film material layers,
cross-section view with clear separation,
labeled in Japanese: PET, AL, LLDPE,
white background with color-coded layers,
modern technical illustration style,
professional quality
```

**用途**: 素材構造説明
**アスペクト比**: 2:1

---

### 17. バリア性比較インフォグラフィック

```
Modern infographic comparing barrier properties,
showing oxygen transmission rates with bar charts,
PET/AL/LLDPE vs PET/PET/LLDPE comparison,
purple gradient bars indicating performance,
Japanese labels for barrier levels,
white background,
modern infographic style, professional quality
```

**用途**: バリア性能比較
**アスペクト比**: 2:1

---

### 18. バイオマス素材製品ショット

```
Professional studio product photography of biomass-based pouch,
natural eco-friendly aesthetic,
plant-based texture visible,
green accent elements,
studio lighting,
white background,
sustainable packaging aesthetic,
commercial quality, high resolution
```

**用途**: 環境配慮製品紹介
**アスペクト比**: 1:1

---

### 19. 単一素材ラミネート構造図

```
Technical diagram showing mono-material laminate structure,
all layers made of same material (e.g., all PE),
labeled in Japanese: single material for recyclability,
white background with color-coded layers,
recycling symbol prominently displayed,
modern technical illustration style, professional quality
```

**用途**: リサイクル性説明
**アスペクト比**: 2:1

---

### 20. 薄肉化フィルム比較図

```
Technical comparison diagram showing film thickness reduction,
before: thick film cross-section,
after: thin film cross-section with same performance,
purple arrows indicating thickness reduction,
Japanese labels for thickness comparison,
white background,
modern infographic style, professional quality
```

**用途**: 環境配慮、コスト削減説明
**アスペクト比**: 2:1

---

### 21. Al蒸着フィルム断面図

```
Technical diagram showing aluminum vapor deposition,
microscopic view of aluminum layer on PET film,
cross-section with aluminum atoms deposited,
labeled in Japanese: Al vapor deposition layer,
white background with metallic silver accents,
professional quality
```

**用途**: バリア性説明
**アスペクト比**: 2:1

---

### 22. SiOx蒸着フィルム断面図

```
Technical diagram showing SiOx (silicon oxide) vapor deposition,
microscopic view of transparent oxide layer,
cross-section with SiOx layer clearly visible,
labeled in Japanese: transparent barrier layer,
white background with light blue accents,
professional quality
```

**用途**: 透明高バリア説明
**アスペクト比**: 2:1

---

### 23. 紙製包装製品ショット

```
Professional studio product photography of paper-based pouch,
natural paper texture clearly visible,
eco-friendly aesthetic with plant elements,
studio lighting,
white background,
sustainable packaging aesthetic,
commercial quality, high resolution
```

**用途**: 紙製包装紹介
**アスペクト比**: 1:1

---

## 印刷業界プロンプト（7種類）

### 24. グラビア印刷工程図

```
Technical diagram showing gravure printing process,
engraved cylinder with ink transfer,
roll-to-roll printing machine illustration,
labeled in Japanese: gravure cylinder, ink transfer, drying,
white background with process flow arrows,
modern technical illustration style, professional quality
```

**用途**: グラビア印刷説明
**アスペクト比**: 2:1

---

### 25. デジタル印刷工程図

```
Technical diagram showing digital printing process,
inkjet heads printing directly on film,
no printing plate required,
labeled in Japanese: digital print heads, direct printing,
white background with process flow arrows,
modern technical illustration style, professional quality
```

**用途**: デジタル印刷説明
**アスペクト比**: 2:1

---

### 26. 印刷方式比較インフォグラフィック

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

**用途**: 印刷方式選定ガイド
**アスペクト比**: 2:1

---

### 27. 10色印刷製品ショット

```
Professional studio product photography of 10-color printed pouch,
vibrant colors with gradient effects,
high-quality gravure printing result,
premium packaging design,
studio lighting,
white background,
Japanese premium packaging aesthetic,
commercial quality, high resolution
```

**用途**: 高印刷品質紹介
**アスペクト比**: 1:1

---

### 28. ホログラム加工製品ショット

```
Professional studio product photography of holographic packaging,
iridescent holographic effects clearly visible,
rainbow color shifts,
premium packaging with special effects,
studio lighting with angle variation,
dark background to enhance hologram effect,
commercial quality, high resolution
```

**用途**: 特殊加工紹介
**アスペクト比**: 1:1

---

### 29. 箔押し加工製品ショット

```
Professional studio product photography of hot foil stamped packaging,
gold foil stamping on matte black pouch,
premium luxury aesthetic,
studio lighting highlighting foil texture,
white background,
Japanese luxury packaging aesthetic,
commercial quality, high resolution
```

**用途**: プレミアム加工紹介
**アスペクト比**: 1:1

---

### 30. エンボス加工詳細図

```
Technical close-up of embossed texture on packaging,
showing raised pattern with shadow and highlight,
line art illustration with depth indication,
labeled in Japanese: embossed texture, tactile finish,
white background with depth arrows,
professional quality
```

**用途**: エンボス加工説明
**アスペクト比**: 2:1

---

## 製品・製造業界プロンプト（10種類）

### 31. 自動包装機作業シーン

```
Professional industrial photography of automatic packaging machine,
stand-up pouch filling machine in operation,
products flowing smoothly on conveyor belt,
clean factory environment with safety guards,
modern Japanese factory aesthetic,
commercial industrial photography
```

**用途**: 製造工程紹介
**アスペクト比**: 16:9

---

### 32. 品質検査工程

```
Professional industrial photography of quality inspection line,
inspection personnel checking pouch quality,
automated inspection equipment visible,
clean factory environment,
quality control documentation visible,
Japanese manufacturing aesthetic,
commercial industrial photography
```

**用途**: 品質管理紹介
**アスペクト比**: 16:9

---

### 33. デザイン作成ワークフロー

```
Professional lifestyle photography of packaging design process,
designer working on computer with packaging design on screen,
color swatches and mockups on desk,
creative studio environment,
natural lighting,
Japanese design studio aesthetic,
commercial lifestyle photography
```

**用途**: デザインプロセス紹介
**アスペクト比**: 16:9

---

### 34. サンプル製作工程

```
Professional studio photography of sample pouches,
various design versions laid out for review,
prototype samples on clean white table,
design review session aesthetic,
studio lighting,
Japanese design studio aesthetic,
commercial quality, high resolution
```

**用途**: サンプル製作紹介
**アスペクト比**: 4:3

---

### 35. 納品製品倉庫シーン

```
Professional industrial photography of packaged products in warehouse,
stacks of finished pouch products on pallets,
clean organized warehouse environment,
shipping labels and quality tags visible,
Japanese logistics aesthetic,
commercial industrial photography
```

**用途**: 納品・物流紹介
**アスペクト比**: 16:9

---

### 36. 小規模事業者作業風景

```
Professional lifestyle photography of small business owner,
woman packaging products into flat pouches,
warm natural lighting,
clean home office setting,
Japanese small business aesthetic,
commercial lifestyle photography
```

**用途**: 小規模事業者向け
**アスペクト比**: 16:9

---

### 37. 食品工場使用シーン

```
Professional industrial photography of food packaging line,
workers in protective clothing operating packaging equipment,
hygienic food factory environment,
stainless steel equipment,
food safety clearly emphasized,
Japanese food manufacturing aesthetic,
commercial industrial photography
```

**用途**: 食品工場向け
**アスペクト比**: 16:9

---

### 38. 製品開発会議シーン

```
Professional lifestyle photography of product development meeting,
team reviewing packaging samples around table,
various pouch prototypes on table,
modern meeting room environment,
natural lighting,
Japanese business meeting aesthetic,
commercial lifestyle photography
```

**用途**: 製品開発プロセス紹介
**アスペクト比**: 16:9

---

### 39. 環境配慮取り組みシーン

```
Professional lifestyle photography showing sustainability efforts,
worker separating packaging waste for recycling,
recycling bins clearly visible,
eco-friendly messaging on walls,
green office environment,
Japanese sustainability initiative aesthetic,
commercial lifestyle photography
```

**用途**: 環境配慮活動紹介
**アスペクト比**: 16:9

---

### 40. コスト削減効果インフォグラフィック

```
Modern infographic showing cost reduction through packaging optimization,
before/after comparison with cost bars,
purple gradient showing savings percentage,
Japanese labels for cost items,
white background,
modern infographic style, professional quality
```

**用途**: コストメリット説明
**アスペクト比**: 2:1

---

## トレンド・未来技術プロンプト（5種類）

### 41. スマート包装製品ショット

```
Futuristic product photography of smart packaging,
QR code and NFC tag prominently displayed,
digital integration clearly visible,
premium packaging with tech elements,
studio lighting with blue tech accents,
dark background,
commercial quality, high resolution
```

**用途**: スマート包装紹介
**アスペクト比**: 1:1

---

### 42. 鮮度インジケーター付き包装

```
Technical diagram showing freshness indicator on packaging,
color-changing indicator strip clearly visible,
labeled in Japanese: freshness indicator,
before/after color change comparison,
white background with color spectrum,
professional quality
```

**用途**: 鮮度表示技術説明
**アスペクト比**: 2:1

---

### 43. 再充填可能包装システム

```
Lifestyle photography showing refillable packaging system,
refill pouch and durable container displayed together,
sustainable consumption aesthetic,
modern home environment,
natural lighting,
Japanese eco-friendly lifestyle aesthetic,
commercial lifestyle photography
```

**用途**: 再充填システム紹介
**アスペクト比**: 16:9

---

### 44. 個別包装（名入れ）製品

```
Professional studio product photography of personalized packaging,
individual name printed on pouch,
gift packaging aesthetic,
premium personalized design,
studio lighting,
white background,
Japanese gift packaging aesthetic,
commercial quality, high resolution
```

**用途**: 個別包装、名入れ紹介
**アスペクト比**: 1:1

---

### 45. 地域限定デザイン製品

```
Professional studio product photography of region-specific packaging,
local landmark or mascot design on pouch,
tourist souvenir aesthetic,
colorful regional design,
studio lighting,
white background,
Japanese regional specialty aesthetic,
commercial quality, high resolution
```

**用途**: 地域限定商品紹介
**アスペクト比**: 1:1

---

## 使用シナリオ別プロンプト（5種類）

### 46. Eコマース出荷包装

```
Professional product photography of e-commerce shipping packaging,
pouch in protective shipping box,
branding visible on both pouch and box,
shipping labels and protective packaging,
clean modern aesthetic,
studio lighting,
white background,
commercial quality, high resolution
```

**用途**: Eコマース対応紹介
**アスペクト比**: 4:3

---

### 47. 定期購読向け包装

```
Professional studio product photography of subscription packaging,
monthly design variations displayed together,
personalized elements visible,
premium subscription aesthetic,
studio lighting,
white background,
Japanese subscription service aesthetic,
commercial quality, high resolution
```

**用途**: 定期購読サービス紹介
**アスペクト比**: 4:3

---

### 48. 試販サンプル包装

```
Professional studio product photography of sample pouches,
small size samples with "sample" marking,
variety of designs for market testing,
clean product layout,
studio lighting,
white background,
commercial quality, high resolution
```

**用途**: 試販・サンプル紹介
**アスペクト比**: 4:3

---

### 49. 季節限定デザイン製品

```
Professional studio product photography of seasonal packaging,
four seasonal designs displayed together,
cherry blossom (spring), beach (summer), maple (autumn), snow (winter),
vibrant seasonal colors,
studio lighting,
white background,
Japanese seasonal aesthetic,
commercial quality, high resolution
```

**用途**: 季節限定商品紹介
**アスペクト比**: 4:3

---

### 50. 贈答用包装

```
Premium product photography of gift packaging,
luxurious pouch with gold accents,
gift box and ribbon included,
premium gift presentation aesthetic,
dramatic studio lighting,
dark gradient background,
Japanese luxury gift aesthetic,
commercial quality, high resolution
```

**用途**: 贈答用包装紹介
**アスペクト比**: 1:1

---

## プロンプト最適化ガイド

### 文字数ガイドライン

| 用途 | 推奨文字数 | 最大文字数 |
|------|-----------|-----------|
| **製品ショット** | 150-250文字 | 300文字 |
| **技術図解** | 100-200文字 | 250文字 |
| **ライフスタイル** | 200-300文字 | 400文字 |
| **インフォグラフィック** | 150-250文字 | 350文字 |

### キーワード配置順序

1. **主語**（最優先）: `Professional photography of...`
2. **被写体詳細**: `showing..., with..., filled with...`
3. **技術的特徴**: `matte finish, glossy, transparent window...`
4. **ライティング**: `studio lighting, natural lighting, dramatic lighting...`
5. **背景**: `white background, gradient background...`
6. **スタイル**: `Japanese aesthetic, premium, commercial quality...`
7. **品質**: `high resolution, sharp focus, commercial quality...`

### 業界特化キーワード

| カテゴリー | 推奨キーワード |
|-----------|---------------|
| **包装業界** | stand-up pouch, gusset, spout, zipper, retort, vacuum, degassing valve |
| **素材業界** | PET, AL, LLDPE, barrier film, biomass, mono-material, vapor deposition |
| **印刷業界** | gravure, digital printing, 10-color, holographic, hot foil stamp, emboss |
| **製造業界** | automatic packaging machine, quality inspection, sample production, logistics |
| **トレンド** | smart packaging, freshness indicator, refillable, personalized, subscription |

---

## 生成後処理ワークフロー

### 1. 品質チェック

- [ ] 主題が明確に写っている
- [ ] 指定された背景色である
- [ ] ライティングが適切
- [ ] 商用品質として十分

### 2. WebP変換

```bash
# WebPへ変換（品質85%）
cwebp input.png -q 85 -o output.webp

# 一括変換
for file in *.png; do
  cwebp "$file" -q 85 -o "${file%.png}.webp"
done
```

### 3. ファイル命名

```
/images/blog/{記事番号}-{slug}/
├── {記事番号}-hero-01.webp     # 変換後
├── {記事番号}-section-01.webp  # 変換後
├── {記事番号}-product-01.webp  # 変換後
└── {記事番号}-comparison-01.webp  # 変換後
```

---

## 関連資料

- [nanobanana MCP 画像生成ガイド](./nanobanana-mcp-guide.md)
- [画像プロンプトリブラリー](../appendix/image-prompts/nanobanana-prompts-library.md)
- [画像戦略](./image-strategy.md)
- [画像仕様](./image-specifications.md)

---

**最終更新**: 2026-04-11
**Epackage Lab ブログ編集部**
**総プロンプト数**: 50種類
