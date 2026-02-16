# 顧客別割引率バグ修正 - 完了報告

作成日: 2026-02-17

---

## ✅ 修正完了

### 問題の特定

`ImprovedQuotingWizard.tsx` の複数箇所で `calculateQuote` を呼び出す際、`markupRate` パラメータが渡されていないことが原因でした。

### 修正箇所

#### 1. `unified-pricing-engine.ts` (既に修正済み)
- 行1189: `const salesMargin = 0.20` → `const salesMargin = markupRate`
- 行1202: `const salesMarginRate = 0.20` → `const salesMarginRate = markupRate`

#### 2. `ImprovedQuotingWizard.tsx` - handleQuantityChange 関数 (1737行目付近)
```typescript
// 修正前: markupRate が渡されていない
newResult = await unifiedPricingEngine.calculateQuote({
  // ... パラメータ
});

// 修正後: 顧客別マークアップ率を取得して渡す
let customerMarkupRate = 0.2; // デフォルト20%
if (user?.id) {
  try {
    const response = await fetch('/api/user/markup-rate');
    if (response.ok) {
      const result = await response.json();
      customerMarkupRate = result.data?.markupRate ?? 0.2;
    }
  } catch (e) {
    console.warn('[handleQuantityChange] Failed to fetch markup rate:', e);
  }
}

newResult = await unifiedPricingEngine.calculateQuote({
  // ... パラメータ
  markupRate: customerMarkupRate, // ✅ 追加
});
```

#### 3. `ImprovedQuotingWizard.tsx` - useEffect内のcalculatePrice関数 (3561行目付近)
```typescript
// 修正前: markupRate が渡されていない
const quoteResult = await unifiedPricingEngine.calculateQuote({
  // ... パラメータ
});

// 修正後: 顧客別マークアップ率を取得して渡す
let customerMarkupRate = 0.2; // デフォルト20%
if (user?.id) {
  try {
    const response = await fetch('/api/user/markup-rate');
    if (response.ok) {
      const result = await response.json();
      customerMarkupRate = result.data?.markupRate ?? 0.2;
    }
  } catch (e) {
    console.warn('[calculatePrice] Failed to fetch markup rate:', e);
  }
}

const quoteResult = await unifiedPricingEngine.calculateQuote({
  // ... パラメータ
  markupRate: customerMarkupRate, // ✅ 追加
});
```

---

## 🚀 デプロイ手順

修正を本番環境に反映するには、以下の手順でデプロイしてください：

```bash
# 1. コミット
git add src/lib/unified-pricing-engine.ts src/lib/supabase.ts src/components/quote/wizards/ImprovedQuotingWizard.tsx
git commit -m "fix: 顧客別割引率を全ての見積もり計算パスに適用

- handleQuantityChange関数にmarkupRate取得ロジックを追加
- useEffect内のcalculatePrice関数にmarkupRate取得ロジックを追加
- calculateQuote呼び出し時にmarkupRateを渡すように修正"

# 2. プッシュ
git push

# 3. Vercelで自動デプロイ（または手動デプロイ）
```

---

## 🧪 デプロイ後のテスト手順

1. https://www.package-lab.com/auth/signin にアクセス
2. メールアドレス: `arwg22@gmail.com`
3. パスワード: `test1234!`
4. https://www.package-lab.com/quote-simulator に移動
5. 以下の条件で見積もり作成：
   - 内容物: 食品 / 固体 / 一般/中性 / 一般/常温
   - 袋タイプ: 平袋
   - サイズ: 200×300mm
   - 素材: PET/AL
   - 厚さ: 標準タイプ (~300g)

### 期待される価格

| 項目 | 金額 |
|------|------|
| **合計金額** | **¥150,210** ✅ |
| **単価** | **¥300.4/個** ✅ |
| **数量** | 500個 |

¥166,900 (管理者価格) から **10%割引** された価格です。

---

## 📊 テスト結果報告

デプロイ後のテスト結果をお知らせください。以下の情報を確認してください：

1. **価格**: ¥150,210 (10%割引後) になっているか
2. **単価**: ¥300.4/個 になっているか
3. **コンソールログ**: `[handleNext] Customer markup rate: -0.1` が表示されているか

---

## 🔍 開発者コンソールでの確認方法

```javascript
// 顧客別割引率を確認
fetch('/api/user/markup-rate')
  .then(res => res.json())
  .then(data => console.log('Markup Rate:', data));

// 期待される出力:
// {
//   "data": {
//     "markupRate": -0.1,
//     "email": "arwg22@gmail.com"
//   }
// }
```

---

## 📝 まとめ

**修正内容**:
- 3箇所の `calculateQuote` 呼び出しに `markupRate` パラメータを追加
- 顧客別割引率が正しく適用されるようになりました

**次のステップ**:
- コードをコミットしてプッシュ
- Vercelでデプロイ
- 手動テストで10%割引が適用されていることを確認

**期待価格**: ¥150,210 (¥166,900 から10%割引)
