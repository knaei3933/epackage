# admin/leads

**시나리오**: admin/leads
**시작 시간**: 2026-01-22T15:19:46.378Z
**종료 시간**: 2026-01-22T15:19:58.463Z
**소요 시간**: 12.1s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 13 |
| 성공 | ✅ 11 |
| 실패 | ❌ 2 |
| 성공률 | 84.6% |

## 단계별 결과

### 단계 0: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:46.378Z

**설명**: navigate  {"url":"http://localhost:3000/admin/leads"}

**실제 결과**: Navigated to http://localhost:3000/admin/leads

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:47.017Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 2: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:50.535Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\results\screenshots\admin\leads_step2.png)

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:51.233Z

**설명**: click on 신규만 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:51.747Z

**설명**: click on 전체 보기 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 5: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:52.263Z

**설명**: click on 새 리드 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 6: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:19:52.775Z

**설명**: type on 氏名 {"text":"홍길동"}

**에러**:
```
Element not found: 氏名
```

---

### 단계 7: type

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:53.289Z

**설명**: type on メールアドレス {"text":"hong@example.com"}

**실제 결과**: Typed "hong@example.com" on メールアドレス

---

### 단계 8: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:19:53.862Z

**설명**: type on 会社電話番号 {"text":"02-9876-5432"}

**에러**:
```
Element not found: 会社電話番号
```

---

### 단계 9: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:54.378Z

**설명**: click on 리드 출처 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 10: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:54.891Z

**설명**: click on 웹사이트 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 11: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:55.418Z

**설명**: click on 저장 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 12: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:55.943Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---
