# homepage/contact-form

**시나리오**: homepage/contact-form
**시작 시간**: 2026-01-24T07:41:08.267Z
**종료 시간**: 2026-01-24T07:41:14.956Z
**소요 시간**: 6.7s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 8 |
| 성공 | ✅ 8 |
| 실패 | 0 |
| 성공률 | 100.0% |

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
**시간**: 2026-01-24T07:41:08.267Z

**설명**: navigate  {"url":"http://localhost:3002/contact"}

**실제 결과**: Navigated to http://localhost:3002/contact

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:08.900Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 2: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:11.428Z

**설명**: click on 제품 문의 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 3: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:11.957Z

**설명**: type on 氏名 {"text":"테스트 사용자"}

**실제 결과**: Typed "테스트 사용자" on 氏名

---

### 단계 4: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:12.570Z

**설명**: type on メールアドレス {"text":"test@example.com"}

**실제 결과**: Typed "test@example.com" on メールアドレス

---

### 단계 5: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:13.163Z

**설명**: type on 会社名 {"text":"테스트 주식회사"}

**실제 결과**: Typed "테스트 주식회사" on 会社名

---

### 단계 6: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:13.755Z

**설명**: type on お問い合わせ内容 {"text":"견적 문의입니다. 스탠드 파우치 200x300mm 500개 견적 부탁드립니다."}

**실제 결과**: Typed "견적 문의입니다. 스탠드 파우치 200x300mm 500개 견적 부탁드립니다." on お問い合わせ内容

---

### 단계 7: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:14.363Z

**설명**: click on 제출 버튼 ""

**실제 결과**: Page loaded (click fallback)

---
