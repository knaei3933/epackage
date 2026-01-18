# 샘플 요청 RPC 함수 수정 필요
# Sample Request RPC Function Fix Required

## 문제 (Problem)

샘플 요청 폼 제출 시 `relation "sample_requests" does not exist` 오류가 발생합니다.

**원인**: RPC 함수 `create_sample_request_transaction`가 명시적인 `search_path` 설정 없이 생성되어 `public` 스키마의 테이블을 찾지 못합니다.

**증상**:
- `sample_requests` 테이블은 존재함 (확인됨)
- `sample_items` 테이블은 존재함 (확인됨)
- RPC 함수는 존재하지만 테이블을 찾지 못함

---

## 해결 방법 (Solution)

### 방법 1: Supabase SQL Editor에서 직접 실행 (권장)

1. **Supabase SQL Editor 열기**:
   ```
   https://supabase.com/dashboard/project/ijlgpzjdfipzmjvawofp.supabase.co/sql
   ```

2. **아래 SQL을 복사하여 붙여넣기**:

```sql
-- =====================================================
-- Fix Sample RPC Function Schema Issue
-- =====================================================

-- Drop old function
DROP FUNCTION IF EXISTS create_sample_request_transaction CASCADE;

-- Create new function with SET search_path = public
CREATE OR REPLACE FUNCTION create_sample_request_transaction(
  p_user_id UUID DEFAULT NULL,
  p_request_number VARCHAR(50) DEFAULT NULL,
  p_notes TEXT,
  p_sample_items JSONB
)
RETURNS TABLE (
  success BOOLEAN,
  sample_request_id UUID,
  request_number VARCHAR(50),
  items_created INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
SET search_path = public  -- <-- FIX: Explicitly set search_path
AS $$
DECLARE
  v_new_request_id UUID;
  v_final_request_number VARCHAR(50);
  v_items_count INTEGER;
BEGIN
  success := false;
  sample_request_id := NULL;
  request_number := NULL;
  items_created := 0;
  error_message := NULL;

  IF p_sample_items IS NULL OR jsonb_array_length(p_sample_items) = 0 THEN
    error_message := '少なくとも1つのサンプルを選択してください';
    RETURN NEXT;
    RETURN;
  END IF;

  IF jsonb_array_length(p_sample_items) > 5 THEN
    error_message := 'サンプルは最大5点までです';
    RETURN NEXT;
    RETURN;
  END IF;

  IF p_request_number IS NULL OR p_request_number = '' THEN
    v_final_request_number := 'SMP-' || TO_TIMESTAMP(NOW())::TEXT || '-' || UPPER(SUBSTR(ENCODE(GEN_RANDOM_BYTES(2), 'HEX'), 1, 4));
  ELSE
    v_final_request_number := p_request_number;
  END IF;

  BEGIN
    INSERT INTO sample_requests (
      user_id, request_number, status, delivery_address_id,
      tracking_number, notes, shipped_at, created_at
    ) VALUES (
      p_user_id, v_final_request_number, 'received', NULL,
      NULL, p_notes, NULL, NOW()
    ) RETURNING id INTO v_new_request_id;

    IF v_new_request_id IS NULL THEN
      RAISE EXCEPTION 'Failed to create sample request';
    END IF;

    INSERT INTO sample_items (
      sample_request_id, product_id, product_name, category, quantity
    )
    SELECT
      v_new_request_id,
      (item->>'productId')::UUID,
      item->>'productName',
      COALESCE(item->>'productCategory', 'other'),
      (item->>'quantity')::INTEGER
    FROM jsonb_array_elements(p_sample_items) AS item;

    SELECT COUNT(*) INTO v_items_count
    FROM sample_items
    WHERE sample_request_id = v_new_request_id;

    IF v_items_count = 0 THEN
      RAISE EXCEPTION 'No sample items were created';
    END IF;

    success := true;
    sample_request_id := v_new_request_id;
    request_number := v_final_request_number;
    items_created := v_items_count;

  EXCEPTION
    WHEN OTHERS THEN
      success := false;
      sample_request_id := NULL;
      request_number := NULL;
      items_created = 0;
      error_message := SQLERRM;
      RAISE WARNING 'create_sample_request_transaction failed: %', SQLERRM;
      RETURN NEXT;
      RETURN;
  END;

  RETURN NEXT;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_sample_request_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION create_sample_request_transaction TO service_role;
GRANT EXECUTE ON FUNCTION create_sample_request_transaction TO anon;
```

3. **"Run" 버튼 클릭**

4. **성공 메시지 확인**: `Migration completed: Fixed RPC function schema issue`

---

### 방법 2: 생성된 스크립트 사용

터미널에서 다음 명령을 실행하여 SQL을 확인할 수 있습니다:

```bash
npx tsx scripts/fix-sample-rpc.ts
```

---

## 수정 후 테스트

SQL 실행 후 다음과 같이 테스트합니다:

```bash
# 테스트 스크립트 실행
npx tsx scripts/check-db-remote.ts
```

예상 결과:
```
✓ RPC function exists and executed
Result: [ { success: true, sample_request_id: '...', ... } ]
```

---

## 관련 파일

- `scripts/fix-sample-rpc.ts` - SQL 수정 스크립트
- `scripts/check-db-remote.ts` - DB 상태 확인 스크립트
- `src/app/api/samples/route.ts` - 샘플 요청 API (import bug 수정 완료)
- `supabase/migrations/20260112000001_fix_sample_rpc_schema.sql` - 마이그레이션 파일

---

## 다음 단계

SQL 수정이 완료되면:
1. 샘플 요청 폼 재테스트
2. 회원가입 폼 테스트
3. 견적 시뮬레이터 테스트
