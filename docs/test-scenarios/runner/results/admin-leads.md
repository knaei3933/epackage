# admin/leads

**시나리오**: admin/leads
**시작 시간**: 2026-01-24T07:48:41.280Z
**종료 시간**: 2026-01-24T07:48:55.637Z
**소요 시간**: 14.4s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 14 |
| 성공 | ✅ 12 |
| 실패 | ❌ 2 |
| 성공률 | 85.7% |

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
**시간**: 2026-01-24T07:48:41.280Z

**설명**: navigate  {"url":"http://localhost:3002/admin/leads"}

**실제 결과**: Navigated to http://localhost:3002/admin/leads

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:42.668Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 2: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:46.180Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\admin\leads_step2.png)

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:46.868Z

**설명**: click on 신규만 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:47.382Z

**설명**: click on 전체 보기 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 5: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:47.899Z

**설명**: click on 새 리드 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 6: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:48.415Z

**설명**: wait  {"time":1000}

**실제 결과**: Waited 1000ms

---

### 단계 7: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:48:49.943Z

**설명**: type on 氏名 {"text":"홍길동"}

**에러**:
```
Element not found: 氏名
```

---

### 단계 8: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:50.456Z

**설명**: type on メールアドレス {"text":"hong@example.com"}

**실제 결과**: Typed "hong@example.com" on メールアドレス

---

### 단계 9: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:48:51.050Z

**설명**: type on 会社電話番号 {"text":"02-9876-5432"}

**에러**:
```
Element not found: 会社電話番号
```

---

### 단계 10: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:51.565Z

**설명**: click on 리드 출처 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 11: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:52.078Z

**설명**: click on 웹사이트 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 12: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:52.597Z

**설명**: click on 저장 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 13: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:53.111Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---
