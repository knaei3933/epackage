# 실시간 업데이트 플로우

**작성일**: 2026-01-21
**목적**: Supabase Realtime에 의한 실시간 알림 업데이트 검증

---

## 5.1 Realtime 연결 확인

**목표**: Supabase Realtime 연결 상태 확인

**전제 조건**:
- Supabase Realtime 활성화
- `unified_notifications` 테이블에서 Realtime 활성화

### 테스트 단계

```bash
# 1. 회원으로 로그인
[Browser_navigate] http://localhost:3002/auth/signin
[Browser_type] element="メールアドレス" text="member@test.epac.co.jp"]
[Browser_type] element="パスワード" text="Member1234!"]
[Browser_click] element="로그인 버튼"]
[Browser_wait_for] time: 3

# 2. 대시보드 접속
[Browser_navigate] http://localhost:3002/member/dashboard
[Browser_wait_for] time: 2

# 3. 현재 알림 배지 수 기록
# ※ UI상 알림 배지 수 확인
```

**Realtime 로그 확인 (브라우저 콘솔)**:

```javascript
// Realtime 구독 로그
console.log('[Realtime] Notification change:', payload);
// 예상 출력:
{
  eventType: 'INSERT',
  new: {
    id: 'notif-uuid',
    type: 'order_approved',
    title: '주문이 승인되었습니다.',
    is_read: false
  }
}
```

**성공 기준**:
- ✅ Realtime 연결 상태: 'SUBSCRIBED'
- ✅ 알림 배지 수 표시됨

---

## 5.2 실시간 알림 업데이트

**목표**: 관리자 액션에 대해 회원 측에서 실시간 알림 업데이트 확인

### 테스트 단계

```bash
# 회원 대시보드 표시 상태로 가정

# --- 별도 탭에서 관리자 액션 ---
# 1. 관리자가 주문 승인
[Browser_tabs] action="new"
[Browser_navigate] http://localhost:3002/auth/signin
[Browser_type] element="メールアドレス" text="admin@test.epac.co.jp"]
[Browser_type] element="パスワード" text="Admin1234!"]
[Browser_click] element="로그인 버튼"]
[Browser_navigate] http://localhost:3002/admin/orders
[Browser_click] element="주문 승인 버튼"]

# --- 회원 측에서 확인 ---
# 2. 회원 대시보드로 복귀
[Browser_tabs] action="select" index="0"

# 3. 알림 배지 업데이트 확인
# 30초 이내에 알림 배지 수 증가 확인
[Browser_wait_for] time: 30
```

**예상 결과**:
- 페이지 리로드 없이 알림 배지 수 증가
- Realtime을 통한 즉시 업데이트

**성공 기준**:
- ✅ Realtime으로 알림 수 증가
- ✅ 페이지 리로드 불필요
- ✅ 30초 이내 업데이트

---

## 5.3 Realtime 구독 상태 확인

### 브라우저 콘솔 확인

```javascript
// Realtime 연결 상태 확인
(() => {
  const channels = supabase.getChannels();
  return channels.map(c => ({
    topic: c.topic,
    state: c.state
  }));
})()

// 예상 출력:
[
  {
    "topic": "realtime:notifications:member-uuid",
    "state": "SUBSCRIBED"
  }
]
```

**성공 기준**:
- ✅ state: 'SUBSCRIBED'
- ✅ topic에 알림 테이블 포함

---

## Realtime 설정 확인

### Supabase 설정

```sql
-- unified_notifications 테이블에서 Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE unified_notifications;

-- 확인
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

### 클라이언트 구독 확인

```typescript
// useNotificationSubscription.ts 훅 확인
useEffect(() => {
  const channel = supabase
    .channel(`notifications_${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'unified_notifications',
      filter: `recipient_id=eq.${userId}&recipient_type=eq.${userType}`
    }, (payload) => {
      // 알림 업데이트 처리
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [userId, userType]);
```

---

## 전체 성공 기준

- ✅ Realtime 연결 정상 작동
- ✅ 관리자 액션 시 회원 측 실시간 업데이트
- ✅ 페이지 리로드 불필요
- ✅ 알림 배지 즉시 업데이트

---

## 다음 단계

- [오류 & 성능](./error-performance.md)로 이동
