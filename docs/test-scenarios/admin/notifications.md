# 관리자 알림 시나리오

**작성일**: 2026-01-21
**목적**: 관리자가 알림을 확인하고 관리하는 시나리오

---

## 9.1 관리자 알림 확인

**목표**: 관리자 알림 센터 접근 및 미읽음 알림 확인

**전제 조건**:
- 관리자로 로그인된 상태

**테스트 단계**:

```bash
# 1. 상단 네비게이션에서 알림 버튼 확인
# 알림 수가 표시됨

# 2. 알림 버튼 클릭
[Browser_click] element="알림 버튼"]

# 3. 알림 목록 확인
[Browser_snapshot]

# 4. 알림 읽음
[Browser_click] element="알림 아이템"]
[Browser_click] element="읽음으로 표시 버튼"]
```

**API 확인**:

```bash
# GET /api/admin/notifications/unread-count
# 예상 응답:
{
  "count": 5
}

# GET /api/admin/notifications
# 예상 응답:
{
  "notifications": [
    {
      "id": "notif-uuid",
      "type": "quotation_created",
      "title": "새 견적이 접수되었습니다.",
      "message": "게스트 사용자로부터 견적이 접수되었습니다.",
      "is_read": false,
      "created_at": "2026-01-21T10:00:00Z"
    }
  ]
}
```

**관리자 알림 타입**:

| 타입 | 제목 | 메시지 |
|------|------|--------|
| quotation_created | 새 견적 접수 | 게스트 사용자로부터 견적이 접수되었습니다 |
| user_registered | 신규 회원가입 | 새로운 회원가입이 접수되었습니다 |
| order_created | 새 주문 접수 | 새로운 주문이 접수되었습니다 |
| inventory_low | 재고 부족 경고 | 재고가 안전 수준 미만입니다 |
| production_delay | 생산 지연 보고 | 생산 지연이 발생했습니다 |

**성공 기준**:
- ✅ 알림 수가 정확히 표시됨
- ✅ 알림 목록이 표시됨
- ✅ 알림을 읽음으로 표시할 수 있음

---

## 9.2 전체 알림 읽음

**목표**: 모든 알림을 읽음으로 표시

**테스트 단계**:

```bash
# 1. 알림 목록에서 "전체 읽음" 버튼 클릭
[Browser_click] element="전체 읽음 버튼"]

# 2. 확인
# alert("모든 알림을 읽음으로 표시하시겠습니까?")

# 3. 미읽음 알림 수가 0이 되는지 확인
[Browser_wait_for] time: 2
```

**API 확인**:

```bash
# PATCH /api/admin/notifications/mark-all-read
# 예상 응답:
{
  "success": true,
  "markedCount": 5
}
```

**성공 기준**:
- ✅ 모든 알림이 읽음으로 표시됨
- ✅ 알림 수가 0이 됨
- ✅ 알림 배지가 사라짐

---

## 9.3 알림 필터링

**목표**: 알림 유형별 필터링

**테스트 단계**:

```bash
# 1. 알림 필터 선택
[Browser_click] element="견적 알림만"]

# 2. 다른 필터
[Browser_click] element="주문 알림만"]

# 3. 전체 보기
[Browser_click] element="전체"]
```

**성공 기준**:
- ✅ 필터가 정상 작동함
- ✅ 각 유형별 알림이 정확히 표시됨

---

## 데이터베이스 검증

```sql
-- 관리자 알림 확인
SELECT type, title, is_read, created_at
FROM unified_notifications
WHERE recipient_type = 'admin'
ORDER BY created_at DESC;

-- 미읽음 알림 수
SELECT COUNT(*) as unread_count
FROM unified_notifications
WHERE recipient_type = 'admin' AND is_read = false;
```

---

## 다음 단계

이 시나리오 완료 후:
- [대시보드](./login-dashboard.md)로 돌아가기
- [통합 테스트](../integration/)로 이동
