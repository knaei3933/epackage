# member/deliveries

**시나리오**: member/deliveries
**시작 시간**: 2026-01-24T07:42:57.381Z
**종료 시간**: 2026-01-24T07:43:24.516Z
**소요 시간**: 27.1s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 14 |
| 성공 | ✅ 13 |
| 실패 | ❌ 1 |
| 성공률 | 92.9% |

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
**시간**: 2026-01-24T07:42:57.381Z

**설명**: navigate  {"url":"http://localhost:3002/member/deliveries"}

**실제 결과**: Navigated to http://localhost:3002/member/deliveries

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:42:58.411Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 2: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:01.926Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\member\deliveries_step2.png)

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:02.583Z

**설명**: click on 새 납품처 버튼 ""

**실제 결과**: Clicked on 새 납품처 버튼

---

### 단계 4: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:03.676Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 5: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:06.199Z

**설명**: type on 納入先名 {"text":"서울 지사"}

**실제 결과**: Typed "서울 지사" on 納入先名

---

### 단계 6: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:06.790Z

**설명**: type on 連絡先 {"text":"02-5555-6666"}

**실제 결과**: Typed "02-5555-6666" on 連絡先

---

### 단계 7: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:07.381Z

**설명**: type on 郵便番号 {"text":"134-857"}

**실제 결과**: Typed "134-857" on 郵便番号

---

### 단계 8: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:43:07.943Z

**설명**: type on 都道府県 {"text":"서울특별시"}

**에러**:
```
locator.selectOption: Timeout 10000ms exceeded.
Call log:
[2m  - waiting for getByTestId('prefecture-select').first()[22m
[2m    - locator resolved to <select data-testid="prefecture-select" class="w-full px-3 py-2 border border-border-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">…</select>[22m
[2m  - attempting select option action[22m
[2m    2 × waiting for element to be visible and enabled[22m
[2m      - did not find some options[22m
[2m    - retrying select option action[22m
[2m    - waiting 20ms[22m
[2m    2 × waiting for element to be visible and enabled[22m
[2m      - did not find some options[22m
[2m    - retrying select option action[22m
[2m      - waiting 100ms[22m
[2m    20 × waiting for element to be visible and enabled[22m
[2m       - did not find some options[22m
[2m     - retrying select option action[22m
[2m       - waiting 500ms[22m

```

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\member\deliveries_step8_error.png)

---

### 단계 9: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:18.578Z

**설명**: type on 市区町村 {"text":"강남구"}

**실제 결과**: Typed "강남구" on 市区町村

---

### 단계 10: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:19.152Z

**설명**: type on 番地・建物名 {"text":"테헌로 123"}

**실제 결과**: Typed "테헌로 123" on 番地・建物名

---

### 단계 11: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:19.727Z

**설명**: click on 기본 납품처 ""

**실제 결과**: Clicked on 기본 납품처

---

### 단계 12: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:20.868Z

**설명**: click on 저장 버튼 ""

**실제 결과**: Clicked on 저장 버튼

---

### 단계 13: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:22.007Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---
