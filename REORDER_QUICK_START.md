# Reorder Functionality - Quick Reference

## Status: ✅ COMPLETE AND FUNCTIONAL

---

## Files Reference

### Page Components
| File | Purpose | Status |
|------|---------|--------|
| `src/app/member/orders/reorder/page.tsx` | Main reorder page | ✅ Complete |
| `src/app/member/orders/[id]/OrderActions.tsx` | Order detail actions | ✅ Complete |

### API Endpoints
| File | Endpoint | Method | Status |
|------|----------|--------|--------|
| `src/app/api/orders/reorder/route.ts` | `/api/orders/reorder` | POST | ✅ Complete |
| `src/app/api/orders/[id]/route.ts` | `/api/orders/[id]` | GET | ✅ Complete |
| `src/app/api/quotations/save/route.ts` | `/api/quotations/save` | POST | ✅ Complete |

### UI Components
| File | Purpose | Status |
|------|---------|--------|
| `src/components/orders/ReorderButton.tsx` | Reorder button | ✅ Complete |
| `src/components/orders/OrderManagementButtons.tsx` | Button group | ✅ Complete |

### Database Functions (lib/supabase-mcp.ts)
| Function | Purpose | Status |
|----------|---------|--------|
| `getOrderDetails()` | Fetch order with items | ✅ Complete |
| `duplicateOrder()` | Create new order | ✅ Complete |
| `duplicateOrderItems()` | Copy items to new order | ✅ Complete |
| `recalculateOrderTotal()` | Update totals | ✅ Complete |

---

## Usage Examples

### 1. Reorder from List Page
```typescript
// User clicks reorder button on /member/orders/reorder
// -> POST to /api/orders/reorder
// -> Redirect to /member/orders/[newOrderId]
```

### 2. Reorder from Order Detail
```typescript
// User clicks reorder button on /member/orders/[id]
// -> POST to /api/orders/reorder
// -> Redirect to /member/orders/[newOrderId]
```

### 3. API Usage
```bash
curl -X POST https://your-domain.com/api/orders/reorder \
  -H "Content-Type: application/json" \
  -d '{"originalOrderId": "uuid-here"}'
```

---

## Reorderable Statuses

Only orders with these statuses can be reordered:
- ✅ `DELIVERED` - 配達済み
- ✅ `CANCELLED` - キャンセル済み

Non-reorderable statuses:
- ❌ `PENDING` - 保留中
- ❌ `PROCESSING` - 処理中
- ❌ `MANUFACTURING` - 製造中
- ❌ `SHIPPED` - 発送済み

---

## Database Tables

### orders
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- order_number (TEXT, unique)
- status (TEXT)
- customer_name (TEXT)
- customer_email (TEXT)
- delivery_address (JSONB)
- billing_address (JSONB)
- subtotal_amount (NUMERIC)
- tax_amount (NUMERIC)
- total_amount (NUMERIC)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### order_items
```sql
- id (UUID, PK)
- order_id (UUID, FK)
- product_name (TEXT)
- quantity (INTEGER)
- unit_price (NUMERIC)
- total_price (NUMERIC)
- specifications (JSONB)
```

---

## Integration Points

### CartContext
```typescript
// Add reordered items to cart
const { addItem } = useCart()
addItem(product, quantity, specifications)
```

### Quote Flow
```typescript
// Convert reordered items to quote
const { requestQuote } = useCart()
await requestQuote({ items, customerInfo })
```

### Order Creation
```typescript
// Convert quote to order
const { convertToOrder } = useCart()
await convertToOrder(quoteId)
```

---

## Error Handling

### Common Errors
| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Not logged in | Redirect to signin |
| 403 Forbidden | Not your order | Check user_id |
| 404 Not Found | Invalid order ID | Verify order exists |
| 400 Bad Request | Wrong status | Only DELIVERED/CANCELLED |

### Error Messages (Japanese)
- "認証されていません" - Not authenticated
- "注文データの取得に失敗しました" - Failed to fetch order
- "新規注文の作成に失敗しました" - Failed to create order
- "再注文に失敗しました" - Reorder failed

---

## Testing Checklist

### Manual Testing
- [ ] Navigate to `/member/orders/reorder`
- [ ] Verify reorderable orders display
- [ ] Click reorder button on an order
- [ ] Confirm dialog appears
- [ ] Verify new order created
- [ ] Check redirect to new order detail
- [ ] Verify all items copied
- [ ] Verify totals are correct

### API Testing
```bash
# Test reorder endpoint
curl -X POST http://localhost:3000/api/orders/reorder \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{"originalOrderId": "test-order-id"}'
```

---

## Deployment Notes

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Build Status
- ✅ TypeScript compilation
- ⚠️ Turbopack warning (cosmetic)
- ✅ All dependencies installed
- ✅ Database migrations applied

---

## Support & Troubleshooting

### Issue: Orders not displaying
**Solution**: Check order status is DELIVERED or CANCELLED

### Issue: Reorder button not showing
**Solution**: Verify order status meets reorderable criteria

### Issue: Authentication error
**Solution**: Check user is logged in and session is valid

### Issue: Order not created
**Solution**: Check server logs for database errors

---

## Future Enhancements

### Phase 1 (High Priority)
- [ ] Inline quantity editing on reorder page
- [ ] Specification modification before reorder
- [ ] Live price updates

### Phase 2 (Medium Priority)
- [ ] Bulk reorder functionality
- [ ] Reorder analytics
- [ ] Frequent items shortcuts

### Phase 3 (Low Priority)
- [ ] Scheduled/recurring orders
- [ ] Reorder history tracking
- [ ] Reorder pattern analysis

---

## Quick Links

- Main Page: `/member/orders/reorder`
- Orders List: `/member/orders`
- Order Detail: `/member/orders/[id]`
- Quote Simulator: `/quote-simulator`
- Cart: `/cart`

---

**Last Updated**: 2026-01-08
**Status**: Production Ready
**Version**: 1.0.0
