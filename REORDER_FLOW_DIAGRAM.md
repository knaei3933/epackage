# Reorder Flow - Visual Diagram

## User Journey Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     MEMBER DASHBOARD                            │
│                         /member                                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ User clicks "注文履歴" (Order History)
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ORDERS LIST                                │
│                      /member/orders                             │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Order #12345 - DELIVERED - 2024-12-15                  │   │
│  │ Items: 3 | Total: ¥50,000                              │   │
│  │ [詳細を見る] [再注文]                                   │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Order #12344 - SHIPPED - 2024-12-10                   │   │
│  │ Items: 5 | Total: ¥75,000                              │   │
│  │ [詳細を見る] [再注文]                                   │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ User clicks "再注文" (Reorder)
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REORDER PAGE                                 │
│                  /member/orders/reorder                         │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │           過去の注文から再注文                          │   │
│  │           (Reorder from Past Orders)                   │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Order #12345                                           │   │
│  │ 3日前 (3 days ago)                                     │   │
│  │                                                          │   │
│  │ • PEパック (500枚) x 1000  - ¥15,000                   │   │
│  │ • ダンボール箱 (大) x 500    - ¥25,000                 │   │
│  │ • 緩衝材 x 200              - ¥10,000                  │   │
│  │                                                          │   │
│  │ 合計: ¥50,000                                           │   │
│  │                                          [再注文する]    │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ User clicks "再注文する"
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CONFIRMATION DIALOG                            │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  確認                                                   │   │
│  │  同じ内容で再注文しますか？                              │   │
│  │  新しい注文として作成されます。                          │   │
│  │                                                          │   │
│  │            [キャンセル]  [OK]                            │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ User clicks "OK"
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API CALL                                     │
│              POST /api/orders/reorder                           │
│                                                                   │
│  Request:                                                        │
│  {                                                              │
│    "originalOrderId": "uuid-12345"                              │
│  }                                                              │
│                                                                  │
│  Processing:                                                     │
│  1. ✅ Verify authentication                                    │
│  2. ✅ Check ownership                                          │
│  3. ✅ Validate status (DELIVERED/CANCELLED)                    │
│  4. ✅ Get order details                                        │
│  5. ✅ Duplicate order (new order #12346)                      │
│  6. ✅ Duplicate items                                         │
│  7. ✅ Recalculate totals                                      │
│  8. ✅ Return new order ID                                     │
│                                                                  │
│  Response:                                                       │
│  {                                                              │
│    "success": true,                                            │
│    "order": {                                                  │
│      "id": "uuid-12346",                                       │
│      "orderNumber": "ORD-2024-12346",                          │
│      "status": "PENDING",                                      │
│      "totalAmount": 50000                                      │
│    },                                                           │
│    "redirectUrl": "/member/orders/uuid-12346"                  │
│  }                                                              │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ Auto-redirect
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              NEW ORDER DETAIL PAGE                              │
│            /member/orders/uuid-12346                           │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Order #12346 - PENDING - ただ今                       │   │
│  │  Status: 保留中 (Pending)                               │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  注文アイテム (Order Items)                             │   │
│  │                                                          │   │
│  │  PEパック (500枚)                                       │   │
│  │  数量: [1000] ▲ ▼  単価: ¥15  小計: ¥15,000            │   │
│  │  仕様: [編集]                                            │   │
│  │                                                          │   │
│  │  ダンボール箱 (大)                                      │   │
│  │  数量: [500] ▲ ▼   単価: ¥50  小計: ¥25,000            │   │
│  │  仕様: [編集]                                            │   │
│  │                                                          │   │
│  │  緩衝材                                                  │   │
│  │  数量: [200] ▲ ▼   単価: ¥50  小計: ¥10,000            │   │
│  │  仕様: [編集]                                            │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  配送先: [編集]                                          │   │
│  │  〒100-0001 東京都...                                   │   │
│  │                                                          │   │
│  │  合計: ¥50,000 (税込)                                   │   │
│  │                                                          │   │
│  │  [見積書を作成] [注文を確定] [キャンセル]                │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ User modifies quantities/specifications
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              MODIFIED ORDER DETAIL                              │
│                                                                   │
│  User changes:                                                  │
│  - PEパック: 1000 → 2000 (¥15,000 → ¥30,000)                  │
│  - ダンボール箱: 500 → 750 (¥25,000 → ¥37,500)                │
│                                                                   │
│  New Total: ¥77,500                                             │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ User clicks "見積書を作成"
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                  QUOTATION FLOW                                │
│                                                                   │
│  1. POST /api/quotations/save                                   │
│     → Create quotation #Q-2024-001                              │
│     → Save items with new quantities                            │
│     → Calculate new totals                                      │
│                                                                  │
│  2. Generate PDF (Japanese)                                     │
│     → Noto Sans JP font                                         │
│     → Company letterhead                                        │
│     → Item details with specifications                          │
│     → Tax calculation (10%)                                     │
│                                                                  │
│  3. Send email notification                                     │
│     → SendGrid integration                                     │
│     → Japanese email template                                  │
│                                                                  │
│  4. Display quotation to user                                   │
│     → Show PDF preview                                          │
│     → Option to download                                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ User approves quotation
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                 ORDER CONFIRMATION                              │
│                                                                   │
│  1. POST /api/orders/create                                     │
│     → Convert quotation to order                                │
│     → Update order status to "PROCESSING"                       │
│     → Clear cart                                                │
│                                                                  │
│  2. Send confirmation email                                     │
│     → Order confirmation with PDF                              │
│     → Expected delivery date                                    │
│                                                                  │
│  3. Display success message                                     │
│     → "注文を受け付けました"                                   │
│     → Order number and tracking link                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORIGINAL ORDER                               │
│                  orders (uuid-12345)                            │
│                                                                   │
│  id: uuid-12345                                                 │
│  order_number: ORD-2024-12345                                   │
│  status: DELIVERED                                              │
│  user_id: user-uuid                                             │
│  customer_name: 株式会社サンプル                                │
│  total_amount: 50000                                            │
│  created_at: 2024-12-15                                         │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ duplicateOrder()
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NEW ORDER                                   │
│                  orders (uuid-12346)                            │
│                                                                   │
│  id: uuid-12346 ⬅ NEW UUID                                     │
│  order_number: ORD-2024-12346 ⬅ NEW NUMBER                     │
│  status: PENDING ⬅ RESET                                       │
│  user_id: user-uuid ⬅ COPIED                                   │
│  customer_name: 株式会社サンプル ⬅ COPIED                      │
│  total_amount: 50000 ⬅ COPIED (will be recalculated)          │
│  created_at: 2025-01-08 ⬅ NEW TIMESTAMP                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ duplicateOrderItems()
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              ORIGINAL ORDER ITEMS                               │
│              order_items                                        │
│                                                                   │
│  id: item-1    order_id: uuid-12345  product: PEパック         │
│  id: item-2    order_id: uuid-12345  product: ダンボール箱     │
│  id: item-3    order_id: uuid-12345  product: 緩衝材           │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ Copy to new order
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                  NEW ORDER ITEMS                                │
│              order_items                                        │
│                                                                   │
│  id: item-4 ⬅ NEW    order_id: uuid-12346 ⬅ NEW ORDER        │
│  id: item-5 ⬅ NEW    order_id: uuid-12346 ⬅ NEW ORDER        │
│  id: item-6 ⬅ NEW    order_id: uuid-12346 ⬅ NEW ORDER        │
│                                                                   │
│  All data copied from original items:                           │
│  - product_name                                                 │
│  - quantity                                                      │
│  - unit_price                                                    │
│  - specifications (JSONB)                                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ recalculateOrderTotal()
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                  UPDATED TOTALS                                 │
│              orders (uuid-12346)                                │
│                                                                   │
│  subtotal_amount: 50000 ⬅ SUM OF ITEMS                         │
│  tax_amount: 5000 ⬅ 10% OF SUBTOTAL                            │
│  total_amount: 55000 ⬅ SUBTOTAL + TAX                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ReorderPage                                  │
│                (page.tsx)                                       │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  ReorderContent (Server Component)                     │   │
│  │    ├─ requireAuth()                                    │   │
│  │    ├─ getOrders()                                      │   │
│  │    ├─ Filter by status (DELIVERED/SHIPPED)             │   │
│  │    └─ Map to ReorderCard components                    │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  ReorderCard                                      │  │   │
│  │  │    ├─ Order Number                               │  │   │
│  │  │    ├─ Date (Japanese format)                     │  │   │
│  │  │    ├─ Items List                                 │  │   │
│  │  │    ├─ Total Amount                               │  │   │
│  │  │    └─ Reorder Link → /quote-simulator?orderId=   │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  ReorderLoading (Suspense Fallback)                    │   │
│  │    └─ FullPageSpinner                                  │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 OrderManagementButtons                          │
│                (OrderManagementButtons.tsx)                     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  ReorderButton (Client Component)                      │   │
│  │    ├─ useState(isReordering)                           │   │
│  │    ├─ handleReorder()                                  │   │
│  │    │    ├─ confirm()                                   │   │
│  │    │    ├─ getOrderDetails()                           │   │
│  │    │    ├─ duplicateOrder()                            │   │
│  │    │    ├─ duplicateOrderItems()                       │   │
│  │    │    ├─ recalculateOrderTotal()                     │   │
│  │    │    ├─ alert('Success')                            │   │
│  │    │    └─ router.push(newOrderId)                     │   │
│  │    └─ Render (if canReorder)                           │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  OrderCancelButton                                     │   │
│  │  OrderModifyButton                                     │   │
│  │  OrderHistoryPDFButton                                 │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     CartContext                                 │
│                                                                   │
│  State:                                                          │
│  ├─ cart: Cart | null                                           │
│  ├─ items: CartItem[]                                           │
│  ├─ isLoading: boolean                                          │
│  └─ error: string | null                                        │
│                                                                  │
│  Actions:                                                        │
│  ├─ addItem(product, quantity, specifications)                  │
│  ├─ removeItem(itemId)                                          │
│  ├─ updateQuantity(itemId, quantity)                            │
│  ├─ updateSpecifications(itemId, specifications)                │
│  ├─ clearCart()                                                 │
│  ├─ requestQuote(quoteRequest)                                  │
│  └─ convertToOrder(quoteId)                                     │
│                                                                  │
│  Persistence:                                                    │
│  └─ localStorage.getItem('epackage-cart')                       │
│                                                                  │
│  Flow:                                                           │
│  1. Reorder → Create new order                                   │
│  2. Load items into cart                                         │
│  3. User modifies quantities/specs                              │
│  4. Request quote from cart                                     │
│  5. Convert quote to order                                      │
│  6. Clear cart                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Request/Response Flow

```
CLIENT                              SERVER                           DATABASE
│                                   │                                │
├─ POST /api/orders/reorder         │                                │
│  { originalOrderId }              │                                │
│                                   │                                │
│                                   ├─ 1. Verify Auth                │
│                                   │   SELECT * FROM auth.users     │
│                                   │                                │
│                                   ├─ 2. Check Ownership            │
│                                   │   SELECT user_id FROM orders    │
│                                   │   WHERE id = $1                │
│                                   │                                │
│                                   ├─ 3. Validate Status            │
│                                   │   SELECT status FROM orders     │
│                                   │   WHERE id = $1                │
│                                   │                                │
│                                   ├─ 4. Get Order Details          │
│                                   │   SELECT * FROM orders          │
│                                   │   JOIN order_items              │
│                                   │   WHERE id = $1                │
│                                   │                                │
│                                   ├─ 5. Duplicate Order            │
│                                   │   INSERT INTO orders            │
│                                   │   (SELECT * FROM orders         │
│                                   │    WHERE id = $1)               │
│                                   │   RETURNING id                  │
│                                   │                                │
│                                   ├─ 6. Duplicate Items            │
│                                   │   INSERT INTO order_items       │
│                                   │   SELECT * FROM order_items     │
│                                   │   WHERE order_id = $1           │
│                                   │                                │
│                                   ├─ 7. Recalculate Total          │
│                                   │   UPDATE orders                 │
│                                   │   SET total_amount =            │
│                                   │     (SELECT SUM(total_price)    │
│                                   │      FROM order_items           │
│                                   │      WHERE order_id = $1)       │
│                                   │   WHERE id = $2                 │
│                                   │                                │
│                                   ├─ 8. Fetch New Order            │
│                                   │   SELECT * FROM orders          │
│                                   │   WHERE id = $2                 │
│                                   │                                │
├─ Response:                        │                                │
│  { success: true,                 │                                │
│    order: { id, number, ... },    │                                │
│    redirectUrl }                  │                                │
│                                   │                                │
├─ Redirect to /member/orders/[id]  │                                │
│                                   │                                │
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   ERROR SCENARIOS                               │
│                                                                   │
│  Scenario 1: Not Authenticated                                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ POST /api/orders/reorder                                 │   │
│  │ → 401 Unauthorized                                       │   │
│  │ → Redirect to /auth/signin?redirect=/member/orders     │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Scenario 2: Not Your Order                                      │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ POST /api/orders/reorder                                 │   │
│  │ → Check: order.user_id !== user.id                      │   │
│  │ → 403 Forbidden                                          │   │
│  │ → Error: "Access denied: This order does not belong..."  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Scenario 3: Wrong Status                                       │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ POST /api/orders/reorder                                 │   │
│  │ → Check: status not in [DELIVERED, CANCELLED]           │   │
│  │ → 400 Bad Request                                        │   │
│  │ → Error: "Cannot reorder order with status: PROCESSING" │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Scenario 4: Item Duplication Failed                            │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ POST /api/orders/reorder                                 │   │
│  │ → duplicateOrderItems() error                            │   │
│  │ → Rollback: DELETE new order                             │   │
│  │ → 500 Internal Server Error                              │   │
│  │ → Error: "Failed to duplicate order items"              │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

**Last Updated**: 2026-01-08
**Version**: 1.0.0
