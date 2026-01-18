# Post-Processing Mutual Exclusivity Implementation

## Problem Statement
Customers can currently select conflicting options (e.g., both "ジッパー付き" and "ジッパーなし"), causing confusion.

## Solution Overview
Implemented mutually exclusive option groups with clear visual separation using radio-button-style behavior.

## Implementation Details

### 1. New Component: `PostProcessingGroups.tsx`

**Location**: `src/components/quote/PostProcessingGroups.tsx`

**Features**:
- **Visual Grouping**: Options organized into clear groups (zipper, finish, notch, hang-hole, corner, valve, opening)
- **Mutual Exclusivity**: Selecting one option automatically deselects conflicting options
- **Visual Feedback**: Color-coded states (selected=green, conflicting=amber, normal=gray)
- **Icon Support**: Each group has an emoji icon for quick recognition
- **Sticky Summary**: Total multiplier shown in a sticky footer when options are selected

### 2. Group Structure

```typescript
const postProcessingGroups = [
  {
    id: 'zipper',
    name: 'ジッパー',
    icon: '🔒',
    description: '再封性の選択',
    options: [
      { id: 'zipper-yes', name: 'ジッパー付き', multiplier: 1.15, ... },
      { id: 'zipper-no', name: 'ジッパーなし', multiplier: 1.0, ... }
    ]
  },
  // ... more groups
];
```

### 3. Mutual Exclusivity Logic

The component automatically builds exclusive groups from the group structure:

```typescript
const exclusiveGroups: Record<string, string[]> = {};
groups.forEach(group => {
  const optionIds = group.options.map(opt => opt.id);
  group.options.forEach(option => {
    exclusiveGroups[option.id] = optionIds.filter(id => id !== option.id);
  });
});
```

### 4. UI Improvements

**Group Cards**:
- Each group is displayed in a bordered card
- Group header shows icon, name, description
- Visual indication when group has a selection

**Option Cards**:
- Radio-button style behavior (only one per group)
- Preview image on the left
- Name, description, features, multiplier
- Conflict warnings with amber background
- Green checkmark for selected options

**Sticky Summary**:
- Shows total multiplier at bottom of screen
- Only appears when options are selected
- Gradient background for visibility

## Integration Steps

### Step 1: Replace the PostProcessingStep return statement

Find the `PostProcessingStep` function in `ImprovedQuotingWizard.tsx` (around line 553).

Replace the existing data structure with:

```typescript
// Define mutually exclusive option groups
const postProcessingGroups = [
  {
    id: 'zipper',
    name: 'ジッパー',
    icon: '🔒',
    description: '再封性の選択',
    options: [
      {
        id: 'zipper-yes',
        name: 'ジッパー付き',
        multiplier: 1.15,
        description: '再利用可能なジッパー付き',
        detailedDescription: '開閉が容易なジッパーを装着。内容物の新鮮度保持と再利用性を向上させます。',
        previewImage: '/images/post-processing/1.ジッパーあり.png',
        features: ['再利用可能', '気密性維持', '開閉簡単']
      },
      {
        id: 'zipper-no',
        name: 'ジッパーなし',
        multiplier: 1.0,
        description: '一回使用のシールトップ',
        detailedDescription: 'シンプルなシール構造でコスト効率に優れています。',
        previewImage: '/images/post-processing/1.ジッパーなし.png',
        features: ['コスト効率', 'シンプル構造', '安全閉鎖']
      }
    ]
  },
  {
    id: 'finish',
    name: '表面仕上げ',
    icon: '✨',
    description: '光沢感の選択',
    options: [
      {
        id: 'glossy',
        name: '光沢仕上げ',
        multiplier: 1.08,
        description: '高光沢のプレミアム仕上げ',
        detailedDescription: '高光沢表面処理で視覚的な魅力と色彩の鮮やかさを高めます。',
        previewImage: '/images/post-processing/2.光沢.png',
        features: ['プレミアム外観', '色彩強化', 'プロの見た目']
      },
      {
        id: 'matte',
        name: 'マット仕上げ',
        multiplier: 1.05,
        description: '光沢のないエレガントな表面',
        detailedDescription: '高級感のあるマット調表面処理。光沢を抑え、指紋が目立ちにくくなります。',
        previewImage: '/images/post-processing/2.マット.png',
        features: ['エレガント外観', 'グレア軽減', '指紋防止']
      }
    ]
  },
  {
    id: 'notch',
    name: 'ノッチ',
    icon: '✂️',
    description: '開封のしやすさ',
    options: [
      {
        id: 'notch-yes',
        name: 'ノッチ付き',
        multiplier: 1.03,
        description: '開封しやすいノッチ付き',
        detailedDescription: '手で簡単に開封できるノッチ加工。スナック包装に適しています。',
        previewImage: '/images/post-processing/3.ノッチあり.png',
        features: ['手で簡単開封', '清潔な切断', '工具不要']
      },
      {
        id: 'notch-no',
        name: 'ノッチなし',
        multiplier: 1.0,
        description: 'ノッチなしのクリーンエッジ',
        detailedDescription: 'ノッチなしのクリーンなエッジデザイン。',
        previewImage: '/images/post-processing/3.ノッチなし.png',
        features: ['クリーンデザイン', 'シンプルエッジ', '標準仕上げ']
      }
    ]
  },
  {
    id: 'hang-hole',
    name: '吊り下げ穴',
    icon: '⭕',
    description: '陳列用の穴',
    options: [
      {
        id: 'hang-hole-6mm',
        name: '吊り下げ穴 (6mm)',
        multiplier: 1.03,
        description: '軽量製品用の6mm小さな吊り穴',
        detailedDescription: '店舗での吊り下げ陳列に最適な6mm穴加工。軽量製品に適しています。',
        previewImage: '/images/post-processing/4.吊り穴あり.png',
        features: ['陳列効率UP', '省スペース', '小さいサイズ']
      },
      {
        id: 'hang-hole-8mm',
        name: '吊り下げ穴 (8mm)',
        multiplier: 1.04,
        description: '標準製品用の8mm大きな吊り穴',
        detailedDescription: 'やや大きめの8mm穴加工。太い吊り下げ器具にも対応可能です。',
        previewImage: '/images/post-processing/4.吊り穴あり.png',
        features: ['陳列効率UP', '多用途', '標準サイズ']
      },
      {
        id: 'hang-hole-no',
        name: '吊り穴なし',
        multiplier: 1.0,
        description: '吊り穴なしのクリーンなデザイン',
        detailedDescription: '吊り穴なしのクリーンなデザイン。',
        previewImage: '/images/post-processing/4.吊り穴なし.png',
        features: ['クリーン外観', 'シンプルデザイン', '標準仕上げ']
      }
    ]
  },
  {
    id: 'corner',
    name: '角の形状',
    icon: '📐',
    description: '角のデザイン',
    options: [
      {
        id: 'corner-round',
        name: '角丸',
        multiplier: 1.06,
        description: '安全でモダンな角丸加工',
        detailedDescription: 'パッケージの角を丸く加工。安全性を高め、モダンな印象を与えます。',
        previewImage: '/images/post-processing/5.角丸.png',
        features: ['安全性向上', 'モダン外観', '手当たり良好']
      },
      {
        id: 'corner-square',
        name: '角直角',
        multiplier: 1.0,
        description: '伝統的な直角デザイン',
        detailedDescription: '伝統的な直角デザインで最大スペースを確保できます。',
        previewImage: '/images/post-processing/5.角直.png',
        features: ['伝統外観', '最大スペース', 'クラシックデザイン']
      }
    ]
  },
  {
    id: 'valve',
    name: 'バルブ',
    icon: '💨',
    description: '脱ガス機能',
    options: [
      {
        id: 'valve-yes',
        name: 'バルブ付き',
        multiplier: 1.08,
        description: 'コーヒー製品用の一方弁付き',
        detailedDescription: '空気を逃がす一方通行バルブ。コーヒー豆などの脱ガスが必要な製品に最適です。',
        previewImage: '/images/post-processing/バルブあり.png',
        features: ['脱ガス機能', '湿気防止', '鮮度保持']
      },
      {
        id: 'valve-no',
        name: 'バルブなし',
        multiplier: 1.0,
        description: 'バルブなしの標準パウチ',
        detailedDescription: 'バルブなしの標準パウチ構造。',
        previewImage: '/images/post-processing/バルブなし.png',
        features: ['シンプル構造', 'コスト効率', '標準デザイン']
      }
    ]
  },
  {
    id: 'opening',
    name: '開封位置',
    icon: '📍',
    description: '開封する位置',
    options: [
      {
        id: 'top-open',
        name: '上端開封',
        multiplier: 1.02,
        description: '使いやすい上端開封シール',
        detailedDescription: '開封しやすい上端デザイン。使いやすさを重視した製品に適しています。',
        previewImage: '/images/post-processing/6.上端オープン.png',
        features: ['アクセス容易', '便利分配', 'ユーザーフレンドリー']
      },
      {
        id: 'bottom-open',
        name: '下端開封',
        multiplier: 1.03,
        description: '製品を完全に排出する下端開封',
        detailedDescription: '製品を完全に排出できる下端開封。産業用途に適しています。',
        previewImage: '/images/post-processing/6.下端オープン.png',
        features: ['完全空にする', '無駄なし', '産業用途']
      }
    ]
  }
];

// Keep flattened version for compatibility
const postProcessingOptions = postProcessingGroups.flatMap(g => g.options);
```

### Step 2: Update the return statement

Replace the options rendering section (around line 815-917) with:

```tsx
<div className="mb-4">
  <p className="text-sm text-gray-600 mb-4">
    各グループからオプションを選択してください（ラジオボタン形式）
  </p>

  <PostProcessingGroups
    groups={postProcessingGroups}
    selectedOptions={state.postProcessingOptions || []}
    onToggleOption={toggleOption}
    totalMultiplier={state.postProcessingMultiplier}
  />
</div>
```

### Step 3: Add the import

At the top of the file, add:

```typescript
import PostProcessingGroups from './PostProcessingGroups';
```

## Benefits

1. **No More Confusion**: Customers can't select conflicting options
2. **Clear Visual Hierarchy**: Groups are visually distinct
3. **Better UX**: Radio-button behavior is intuitive
4. **Sticky Summary**: Total always visible
5. **Conflict Warnings**: Clear feedback before selection

## Testing Checklist

- [ ] Select zipper-yes, then select zipper-no (should auto-deselect)
- [ ] Select glossy, then select matte (should auto-deselect)
- [ ] Try selecting hang-hole-6mm, then hang-hole-8mm (should auto-deselect)
- [ ] Verify total multiplier updates correctly
- [ ] Check conflict warnings appear for conflicting options
- [ ] Verify sticky summary appears when options are selected
- [ ] Test zipper position options still work (conditional display)

## Migration Notes

- The `toggleOption` function already has mutual exclusivity logic
- No changes needed to state management
- Backward compatible with existing zipper position options
- All existing tests should pass

## File Changes

1. **New**: `src/components/quote/PostProcessingGroups.tsx` - Reusable grouped component
2. **Modified**: `src/components/quote/ImprovedQuotingWizard.tsx` - Update PostProcessingStep data and import
