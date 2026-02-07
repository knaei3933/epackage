# member/notifications

**시나리오**: member/notifications
**시작 시간**: 2026-01-24T07:44:57.978Z
**종료 시간**: 2026-01-24T07:45:32.272Z
**소요 시간**: 34.3s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 29 |
| 성공 | ✅ 28 |
| 실패 | ❌ 1 |
| 성공률 | 96.6% |

## 데이터베이스 상태 변화

| 테이블 | Before | After | 변화 |
|--------|--------|-------|------|
| quotations | 0 | 0 | 0 |
| orders | 0 | 0 | 0 |
| contracts | 0 | 0 | 0 |
| users | 0 | 0 | 0 |
| notifications | 0 | 0 | 0 |
| samples | 0 | 0 | 0 |

## 단계별 결과

### 단계 0: navigate

**상태**: ✅ Passed
**시간**: 2026-01-24T07:44:57.978Z

**설명**: navigate  {"url":"http://localhost:3002/member/notifications"}

**실제 결과**: Navigated to http://localhost:3002/member/notifications

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:44:59.638Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 2: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:03.168Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\member\notifications_step2.png)

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:03.837Z

**설명**: click on 미읽음만 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:04.353Z

**설명**: click on 전체 보기 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 5: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:04.868Z

**설명**: click on 알림 아이템 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 6: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:05.384Z

**설명**: wait  {"time":1000}

**실제 결과**: Waited 1000ms

---

### 단계 7: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:06.910Z

**설명**: click on 읽음으로 표시 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 8: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:07.422Z

**설명**: wait  {"time":1000}

**실제 결과**: Waited 1000ms

---

### 단계 9: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:08.942Z

**설명**: click on 모두 읽음 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 10: navigate

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:09.459Z

**설명**: navigate  {"url":"http://localhost:3002/auth/signin"}

**실제 결과**: Navigated to http://localhost:3002/auth/signin

---

### 단계 11: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:10.084Z

**설명**: type on メールアドレス {"text":"admin@test.epac.co.jp"}

**실제 결과**: Typed "admin@test.epac.co.jp" on メールアドレス

---

### 단계 12: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:10.676Z

**설명**: type on パスワード {"text":"Admin1234!"}

**실제 결과**: Typed "Admin1234!" on パスワード

---

### 단계 13: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:11.253Z

**설명**: click on ログイン ボタン ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 14: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:11.768Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 15: navigate

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:15.292Z

**설명**: navigate  {"url":"http://localhost:3002/admin/orders"}

**실제 결과**: Navigated to http://localhost:3002/admin/orders

---

### 단계 16: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:16.695Z

**설명**: click on 주문 승인 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 17: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:17.228Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 18: navigate

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:19.753Z

**설명**: navigate  {"url":"http://localhost:3002/auth/signin"}

**실제 결과**: Navigated to http://localhost:3002/auth/signin

---

### 단계 19: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:20.424Z

**설명**: type on メールアドレス {"text":"member@test.epac.co.jp"}

**실제 결과**: Typed "member@test.epac.co.jp" on メールアドレス

---

### 단계 20: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:21.017Z

**설명**: type on パスワード {"text":"Member1234!"}

**실제 결과**: Typed "Member1234!" on パスワード

---

### 단계 21: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:21.592Z

**설명**: click on ログイン ボタン ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 22: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:22.107Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 23: navigate

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:25.636Z

**설명**: navigate  {"url":"http://localhost:3002/member/notifications"}

**실제 결과**: Navigated to http://localhost:3002/member/notifications

---

### 단계 24: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:26.687Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 25: verify_text_visible

**상태**: ❌ Failed
**시간**: 2026-01-24T07:45:29.215Z

**설명**: verify_text_visible  {"text":"주문이 승인되었습니다."}

**실제 결과**: Text "주문이 승인되었습니다." not found

---

### 단계 26: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:29.730Z

**설명**: click on 알림 아이템 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 27: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:30.246Z

**설명**: click on 읽음으로 표시 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 28: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:30.761Z

**설명**: wait  {"time":1000}

**실제 결과**: Waited 1000ms

---
