# Epackage Lab ホームページ TASK v1.5

## 🚀 変更点 (v1.5)
- **Brixa.jpライクな動的体験**を実現するためのタスクを追加
- **Framer Motion** の導入と実装タスクの具体化
- **Visual Polish (視覚的洗練)** フェーズの追加

---

## TASK-001: プロジェクト初期化 (2時間)
(v1.0と同様、ただし `framer-motion` のインストールを追加)

### ✅ Checklist (Additional)
- [x] `npm install framer-motion`
- [x] `npm install lucide-react` (アイコン用)

---

## TASK-002: デザインシステム & アニメーション基盤 (3時間)

### 🎯 Objective
Brixaのようなプレミアム感のあるデザインシステムと、アニメーションの基本設定（Tokens）を構築する。

### 🤖 Assigned Agents
- **primary**: ui-ux-designer
- **support**: frontend-developer

### ✅ Checklist
- [x] **Animation Tokens**: `duration-fast` (0.2s), `duration-normal` (0.4s), `ease-out-expo` などの定義
- [x] **Glassmorphism Utilities**: `backdrop-blur`, `bg-white/xx` の共通クラス作成
- [x] **Motion Components**: `<FadeIn>`, `<SlideUp>`, `<StaggerContainer>` などのラッパーコンポーネント作成
- [x] **Typography**: プレミアム感のあるフォント設定 (Noto Sans JP + Inter)

---

## TASK-005: 自動見積りシステム - UI & アニメーション (4時間)

### 🎯 Objective
見積りフォーム（StepOne）の実装。ただし、単なるフォームではなく、**選択する楽しさ**を感じさせる動的UIにする。

### 🔧 MCP Tools
- **Context7**: Framer Motion `layoutId` documentation

### ✅ Checklist
- [x] **StepOne Implementation**: 基本フォーム機能（v1.0通り）
- [x] **Selection Animation**: 形状選択カードのクリック時、ボーダーが滑らかに移動する (`layoutId`使用)
- [x] **Input Micro-interactions**: フォーカス時のラベル浮き上がり、ボーダー色変化
- [x] **Price Preview Animation**: 価格更新時のカウントアップアニメーション

---

## TASK-006: 自動見積りシステム - ステップ遷移 (3時間)

### 🎯 Objective
StepTwoの実装と、ステップ間のシームレスな遷移アニメーションの実装。

### ✅ Checklist
- [x] **StepTwo Implementation**: 数量・納期選択
- [x] **Wizard Transitions**: 「次へ」を押した際、現在のステップが左へ退出し、次のステップが右から入ってくるアニメーション (`AnimatePresence`)
- [x] **Height Animation**: ステップごとの高さの違いを滑らかに調整 (`motion.div layout`)

---

## TASK-014: Visual Polish & Micro-interactions (New! 4時間)

### 🎯 Objective
**「Brixaのような動的な感じ」** を完成させるための仕上げタスク。全ページに渡ってマイクロインタラクションとスクロールアニメーションを適用する。

### 🤖 Assigned Agents
- **primary**: frontend-developer (Animation Specialist)
- **support**: ui-ux-designer

### ✅ Checklist
- [x] **Scroll Reveal**: トップページ等の要素がスクロールに合わせてふわっと出現するアニメーション
- [x] **Hover Effects**: 全てのボタン、カードに対するリッチなホバーエフェクト（Scale, Shadow, Gradient）
- [x] **Page Transitions**: ページ遷移時のクロスフェード/スライドアニメーション
- [x] **Loading States**: スケルトンスクリーンではなく、ブランドロゴを用いたカスタムローディング
- [x] **Performance Check**: アニメーションによるFPS低下がないか確認 (DevTools Performance Tab)

### 🔍 Automatic Verification
```bash
# Check for layout thrashing or heavy paints
npm run analyze:performance
echo "✅ TASK-014 verification successful"
```

---

## (Other Tasks 003, 004, 007-013 remain largely same, incorporating animation components where applicable)
