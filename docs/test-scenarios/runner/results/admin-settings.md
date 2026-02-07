# admin/settings

**시나리오**: admin/settings
**시작 시간**: 2026-01-24T07:49:27.421Z
**종료 시간**: 2026-01-24T07:49:44.176Z
**소요 시간**: 16.8s

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
**시간**: 2026-01-24T07:49:27.421Z

**설명**: navigate  {"url":"http://localhost:3002/admin/settings"}

**실제 결과**: Navigated to http://localhost:3002/admin/settings

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:28.783Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 2: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:32.296Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\admin\settings_step2.png)

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:32.982Z

**설명**: click on 価格設定 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:33.493Z

**설명**: wait  {"time":1000}

**실제 결과**: Waited 1000ms

---

### 단계 5: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:35.006Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\admin\settings_step5.png)

---

### 단계 6: evaluate

**상태**: ❌ Failed
**시간**: 2026-01-24T07:49:35.696Z

**설명**: evaluate  {"script":"function=\"() => document.querySelectorAll('input[type=number]').length\""}

**에러**:
```
page.evaluate: SyntaxError: Unexpected token '='
    at eval (<anonymous>)
    at UtilityScript.evaluate (<anonymous>:290:30)
    at UtilityScript.<anonymous> (<anonymous>:1:44)
```

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\admin\settings_step6_error.png)

---

### 단계 7: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:36.271Z

**설명**: click on 配送 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 8: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:36.786Z

**설명**: wait  {"time":1000}

**실제 결과**: Waited 1000ms

---

### 단계 9: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:38.301Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\admin\settings_step9.png)

---

### 단계 10: evaluate

**상태**: ❌ Failed
**시간**: 2026-01-24T07:49:38.973Z

**설명**: evaluate  {"script":"function=\"() => document.querySelectorAll('input[type=number]').length\""}

**에러**:
```
page.evaluate: SyntaxError: Unexpected token '='
    at eval (<anonymous>)
    at UtilityScript.evaluate (<anonymous>:290:30)
    at UtilityScript.<anonymous> (<anonymous>:1:44)
```

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\admin\settings_step10_error.png)

---

### 단계 11: navigate

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:39.553Z

**설명**: navigate  {"url":"http://localhost:3002/admin/settings"}

**실제 결과**: Navigated to http://localhost:3002/admin/settings

---

### 단계 12: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:40.958Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 13: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:43.486Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\admin\settings_step13.png)

---
