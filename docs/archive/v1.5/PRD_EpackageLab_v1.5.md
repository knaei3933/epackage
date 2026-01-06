# Epackage Lab ホームページ PRD v1.5

## 1. Purpose

- **Problem**: 既存の日本の包装資材市場は、機能重視でデザイン性が低く、ユーザー体験が前時代的である。また、小ロット生産における高コスト、長い納期、品質の不安定性という課題も抱えている。
- **Solution**: 韓国製造業の強みを活かした高品質軟包材を、**Brixa.jpのような動的で洗練されたプレミアムなWeb体験**と共に提供する。自動見積りシミュレーションシステムにより、顧客が即座に価格を算出・比較できるだけでなく、操作そのものに「心地よさ」を感じるプラットフォームを構築する。
- **Business Value**:
  - 年商目標: 1.2億円（初年度、ブランド価値向上による単価アップ含む）
  - 顧客獲得コスト削減: 40%（自動見積りによる）
  - ブランド認知: "デザインと品質のEpackage Lab"としてのポジション確立
  - 平均滞在時間: 既存比 150% 向上（没入感のあるUIによる）

## 2. Competitive Analysis

### Key Competitors
1. **日本国内包装資材メーカーA**:
   - 強み: 高品質、信頼性
   - 弱み: Webサイトが古く使いにくい、スマホ対応不十分
2. **Brixa.jp (ベンチマーク)**:
   - 強み: **圧倒的なビジュアル、動的なUI、洗練されたブランド体験**
   - 弱み: (特になし、これを目標とする)
3. **オンライン包装資材C**:
   - 強み: 安価、機能的
   - 弱み: デザインが安っぽく、ブランド価値を感じにくい

### Our Differentiation Strategy
- **Premium UX**: Framer Motionを活用した**流れるようなアニメーションとマイクロインタラクション**
- **Visual Excellence**: グラスモーフィズム、動的グラデーション、高品質なタイポグラフィによる圧倒的な第一印象
- **Technological Edge**: 世界最新鋭設備による品質と、それをWeb上で表現する技術力の融合
- **Transparency**: リアルタイム見積りの即時性と視覚的なフィードバック

## 3. Risk Assessment

### Technical Risks
- **リスク**: アニメーション多用によるパフォーマンス低下
  - **緩和策**: `framer-motion`の最適化（`layoutId`活用、GPU加速）、Lighthouseでの継続的な計測
- **リスク**: 複雑な価格計算とUIの同期ラグ
  - **緩和策**: Optimistic UI（楽観的UI）の実装、Web Workerの活用検討

### Market Risks
- **リスク**: デザイン重視により「高そう」と敬遠される可能性
  - **緩和策**: 明確な価格表示と「適正価格」の訴求メッセージをバランスよく配置

## 4. Core Features (Priority Order)

### P0 (Essential - MVP + Premium Feel)
- [ ] **Premium Design System**: Brixaライクな洗練されたカラーパレット、タイポグラフィ、グラスモーフィズム
- [ ] **Dynamic Simulation UI**: ステップ遷移時のスムーズなアニメーション、選択時の心地よいフィードバック
- [ ] **自動見積りシミュレーション**: 最大5パターン同時比較、リアルタイム計算（ロジック実装済み）
- [ ] **レスポンシブ & モバイルファースト**: スマホでもアプリのような操作感

### P1 (Important - Engagement)
- [ ] **Micro-interactions**: ボタンホバー、入力フォーカス、スクロール連動の細やかな動き
- [ ] **Scroll Animations**: スクロールに応じた要素の出現（Fade-in, Slide-up）
- [ ] **製品カタログ (Interactive)**: フィルタリング時の動的な並び替えアニメーション

### P2 (Nice to Have)
- [ ] **3D Product Preview**: Three.jsを用いたパッケージの3D回転表示
- [ ] **Dark Mode Toggle**: シームレスなテーマ切り替え

## 5. User Stories

### User Story 1: 没入感のある見積り体験
**As a** デザインに敏感なブランド担当者
**I want to** 直感的で美しいUIで見積りシミュレーションを行いたい
**So that** ストレスなく仕様を検討でき、サービスの品質への信頼感が高まる

**Acceptance Criteria:**
- [ ] ページ遷移がシームレスである（画面が白くならない）
- [ ] 入力に対するフィードバックが即座に、かつ視覚的に心地よく返ってくる
- [ ] 複雑な計算中もローディングアニメーション等で「待たされている感」がない

### User Story 2: 直感的な形状選択
**As a** パッケージ知識が浅いユーザー
**I want to** 形状や素材を視覚的に選択したい
**So that** 専門用語がわからなくても間違いのない発注ができる

**Acceptance Criteria:**
- [ ] 形状選択時にアイコンやイラストが動的に強調される
- [ ] 選択した項目が明確にハイライトされる（Brixaのようなボーダー/背景変化）

## 6. Success Metrics

### Key Metrics
- **User Engagement**: 平均セッション時間 4分以上（没入感による向上）
- **Conversion Rate**: 見積り完了率 20%以上
- **Performance**: Core Web Vitals (LCP < 2.5s, CLS < 0.1) ※アニメーションがあっても高速

### Measurement Method
- **Google Analytics 4**: イベントトラッキング（スクロール深度、インタラクション数）
- **Vercel Analytics**: リアルタイムパフォーマンス監視

## 7. Timeline

- **Week 1**: Design System & Foundation (Framer Motion導入、基本コンポーネント作成)
- **Week 2**: Simulation Logic & UI (アニメーション付きステップフォーム実装)
- **Week 3**: Content & Polish (スクロールアニメーション、マイクロインタラクション調整)
- **Week 4**: Optimization & Launch (パフォーマンスチューニング、最終確認)

---

**Document Version**: 1.5
**Created**: 2025-11-24
**Based on**: User Request for "Brixa-like Dynamic Feel"
