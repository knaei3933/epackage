# EPAC Homepage 테스트 실행 결과

**날짜**: 2026-01-22T15:21:56.053Z

## 전체 요약

| 항목 | 값 |
|------|-----|
| 총 시나리오 | 35 |
| 성공 시나리오 | ✅ 18 |
| 실패 시나리오 | ❌ 17 |
| 총 단계 | 448 |
| 성공 단계 | ✅ 386 |
| 실패 단계 | 62 |
| 성공률 | 86.2% |
| 총 소요 시간 | 7m 56.8s |

## 시나리오별 결과

| 시나리오 | 상태 | 단계 | 성공 | 실패 | 성공률 | 소요 시간 |
|----------|------|------|------|------|--------|----------|
| homepage/guest-quotation | ❌ | 19 | 16 | 3 | 84.2% | 13.1s |
| homepage/catalog-browsing | ✅ | 26 | 26 | 0 | 100.0% | 25.5s |
| homepage/contact-form | ✅ | 8 | 8 | 0 | 100.0% | 6.6s |
| homepage/case-studies | ✅ | 7 | 7 | 0 | 100.0% | 6.0s |
| member/login-dashboard | ✅ | 9 | 9 | 0 | 100.0% | 11.2s |
| member/orders | ❌ | 18 | 13 | 5 | 72.2% | 13.9s |
| member/quotations | ❌ | 12 | 11 | 1 | 91.7% | 11.0s |
| member/contracts | ❌ | 26 | 25 | 1 | 96.2% | 30.7s |
| member/deliveries | ❌ | 13 | 7 | 6 | 53.8% | 12.0s |
| member/invoices | ✅ | 6 | 6 | 0 | 100.0% | 9.4s |
| member/samples | ❌ | 8 | 7 | 1 | 87.5% | 9.5s |
| member/inquiries | ❌ | 9 | 8 | 1 | 88.9% | 10.1s |
| member/profile | ✅ | 3 | 3 | 0 | 100.0% | 3.9s |
| member/edit | ❌ | 13 | 8 | 5 | 61.5% | 13.0s |
| member/settings | ✅ | 9 | 9 | 0 | 100.0% | 10.0s |
| member/notifications | ❌ | 29 | 28 | 1 | 96.6% | 32.1s |
| admin/login-dashboard | ✅ | 8 | 8 | 0 | 100.0% | 10.7s |
| admin/quotations | ✅ | 12 | 12 | 0 | 100.0% | 12.5s |
| admin/approvals | ✅ | 9 | 9 | 0 | 100.0% | 10.0s |
| admin/customers | ❌ | 20 | 16 | 4 | 80.0% | 20.0s |
| admin/orders | ❌ | 19 | 17 | 2 | 89.5% | 15.5s |
| admin/contracts | ✅ | 24 | 24 | 0 | 100.0% | 26.7s |
| admin/production | ❌ | 15 | 13 | 2 | 86.7% | 15.0s |
| admin/inventory | ❌ | 7 | 6 | 1 | 85.7% | 8.9s |
| admin/shipments | ❌ | 9 | 8 | 1 | 88.9% | 9.9s |
| admin/leads | ❌ | 13 | 11 | 2 | 84.6% | 12.1s |
| admin/coupons | ❌ | 33 | 23 | 10 | 69.7% | 29.8s |
| admin/settings | ❌ | 41 | 25 | 16 | 61.0% | 38.0s |
| admin/notifications | ✅ | 9 | 9 | 0 | 100.0% | 6.8s |
| integration/guest-quotation-flow | ✅ | 0 | 0 | 0 | NaN% | 0ms |
| integration/member-registration-flow | ✅ | 0 | 0 | 0 | NaN% | 0ms |
| integration/order-shipping-flow | ✅ | 0 | 0 | 0 | NaN% | 0ms |
| integration/notification-flow | ✅ | 0 | 0 | 0 | NaN% | 0ms |
| integration/realtime-updates | ✅ | 14 | 14 | 0 | 100.0% | 43.0s |
| integration/error-performance | ✅ | 0 | 0 | 0 | NaN% | 0ms |

## 실패한 단계

### homepage/guest-quotation - 단계 13

**액션**: type

**에러**:
```
Element not found: お名前
```

### homepage/guest-quotation - 단계 15

**액션**: type

**에러**:
```
Element not found: 電話番号
```

### homepage/guest-quotation - 단계 16

**액션**: type

**에러**:
```
Element not found: 会社名
```

### member/orders - 단계 4

**액션**: type

**에러**:
```
Element not found: 郵便番号
```

### member/orders - 단계 5

**액션**: type

**에러**:
```
Element not found: 都道府県
```

### member/orders - 단계 6

**액션**: type

**에러**:
```
Element not found: 市区町村
```

### member/orders - 단계 7

**액션**: type

**에러**:
```
Element not found: 番地・建物名
```

### member/orders - 단계 8

**액션**: type

**에러**:
```
Element not found: 希望納入日
```

### member/quotations - 단계 9

**액션**: verify_text_visible


### member/contracts - 단계 23

**액션**: verify_text_visible


### member/deliveries - 단계 4

**액션**: type

**에러**:
```
Element not found: 納入先名
```

### member/deliveries - 단계 5

**액션**: type

**에러**:
```
Element not found: 連絡先
```

### member/deliveries - 단계 6

**액션**: type

**에러**:
```
Element not found: 郵便番号
```

### member/deliveries - 단계 7

**액션**: type

**에러**:
```
Element not found: 都道府県
```

### member/deliveries - 단계 8

**액션**: type

**에러**:
```
Element not found: 市区町村
```

### member/deliveries - 단계 9

**액션**: type

**에러**:
```
Element not found: 番地・建物名
```

### member/samples - 단계 3

**액션**: type

**에러**:
```
Element not found: 数量
```

### member/inquiries - 단계 5

**액션**: type

**에러**:
```
Element not found: 件名
```

### member/edit - 단계 3

**액션**: type

**에러**:
```
Element not found: 会社電話番号
```

### member/edit - 단계 4

**액션**: type

**에러**:
```
Element not found: 携帯電話
```

### member/edit - 단계 8

**액션**: type

**에러**:
```
Element not found: 現在のパスワード
```

### member/edit - 단계 9

**액션**: type

**에러**:
```
Element not found: 新しいパスワード
```

### member/edit - 단계 10

**액션**: type

**에러**:
```
Element not found: パスワード確認
```

### member/notifications - 단계 25

**액션**: verify_text_visible


### admin/customers - 단계 8

**액션**: type

**에러**:
```
Element not found: 会社電話番号
```

### admin/customers - 단계 9

**액션**: type

**에러**:
```
Element not found: 携帯電話
```

### admin/customers - 단계 18

**액션**: verify_text_visible


### admin/customers - 단계 19

**액션**: verify_text_visible


### admin/orders - 단계 16

**액션**: type

**에러**:
```
Element not found: 進捗率
```

### admin/orders - 단계 17

**액션**: type

**에러**:
```
Element not found: 作業メモ
```

### admin/production - 단계 11

**액션**: type

**에러**:
```
Element not found: 進捗率
```

### admin/production - 단계 12

**액션**: type

**에러**:
```
Element not found: 作業メモ
```

### admin/inventory - 단계 4

**액션**: type

**에러**:
```
Element not found: 入庫数量
```

### admin/shipments - 단계 4

**액션**: type

**에러**:
```
Element not found: 送り状番号
```

### admin/leads - 단계 6

**액션**: type

**에러**:
```
Element not found: 氏名
```

### admin/leads - 단계 8

**액션**: type

**에러**:
```
Element not found: 会社電話番号
```

### admin/coupons - 단계 6

**액션**: type

**에러**:
```
Element not found: クーポンコード
```

### admin/coupons - 단계 9

**액션**: type

**에러**:
```
Element not found: 割引額
```

### admin/coupons - 단계 10

**액션**: type

**에러**:
```
Element not found: 最小購入額
```

### admin/coupons - 단계 11

**액션**: type

**에러**:
```
Element not found: 最大割引
```

### admin/coupons - 단계 12

**액션**: type

**에러**:
```
Element not found: 有効期間開始
```

### admin/coupons - 단계 13

**액션**: type

**에러**:
```
Element not found: 有効期間終了
```

### admin/coupons - 단계 26

**액션**: type

**에러**:
```
Element not found: 数量
```

### admin/coupons - 단계 28

**액션**: type

**에러**:
```
Element not found: クーポンコード
```

### admin/coupons - 단계 31

**액션**: verify_text_visible


### admin/coupons - 단계 32

**액션**: verify_text_visible


### admin/settings - 단계 4

**액션**: type

**에러**:
```
Element not found: サイト名
```

### admin/settings - 단계 5

**액션**: type

**에러**:
```
Element not found: 連絡先メール
```

### admin/settings - 단계 6

**액션**: type

**에러**:
```
Element not found: カスタマーサービス電話
```

### admin/settings - 단계 11

**액션**: type

**에러**:
```
Element not found: クーポン有効期間
```

### admin/settings - 단계 12

**액션**: type

**에러**:
```
Element not found: 最小数量
```

### admin/settings - 단계 13

**액션**: type

**에러**:
```
Element not found: 最大数量
```

### admin/settings - 단계 14

**액션**: type

**에러**:
```
Element not found: 基本リードタイム
```

### admin/settings - 단계 18

**액션**: type

**에러**:
```
Element not found: 基本送料
```

### admin/settings - 단계 19

**액션**: type

**에러**:
```
Element not found: 無料送料条件
```

### admin/settings - 단계 21

**액션**: type

**에러**:
```
Element not found: 企業名
```

### admin/settings - 단계 22

**액션**: type

**에러**:
```
Element not found: APIキー
```

### admin/settings - 단계 27

**액션**: type

**에러**:
```
Element not found: 無料送料条件
```

### admin/settings - 단계 37

**액션**: type

**에러**:
```
Element not found: 数量
```

### admin/settings - 단계 38

**액션**: verify_text_visible


### admin/settings - 단계 39

**액션**: type

**에러**:
```
Element not found: 数量
```

### admin/settings - 단계 40

**액션**: verify_text_visible

