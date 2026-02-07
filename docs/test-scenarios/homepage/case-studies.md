# 도입 사례 시나리오

**작성일**: 2026-01-21
**목적**: 게스트 사용자가 도입 사례를 확인

---

## 도입 사례 확인

**목표**: 도입 사례 페이지에서 사례 확인

**전제 조건**:
- 게스트 사용자 (비로그인 상태)

**테스트 단계**:

```bash
# 1. 사례 페이지 접속
[Browser_navigate] http://localhost:3002/archives

# 2. 페이지 로딩 확인
[Browser_wait_for] time: 2

# 3. 사례 카드 확인
[Browser_snapshot]

# 4. 사례 필터 테스트
[Browser_click] element="식품 산업 필터"]

# 5. 사례 카드 클릭
[Browser_click] element="사례 카드"]

# 6. Before/After 확인
[Browser_click] element="Before 탭"]
[Browser_click] element="After 탭"]
```

**API 확인**:

```bash
# GET /api/archives?industry=food
[
  {
    "id": "archive-001",
    "title": "OO식품 포장솔루션",
    "industry": "food",
    "customerName": "OO주식회사"
  }
]
```

**성공 기준**:
- ✅ 최소 1개 이상의 사례가 표시됨
- ✅ Before/After 이미지가 로딩됨

---

*이 시나리오는 [카탈로그 둘러보기](./catalog-browsing.md#4-도입-사례)에 포함되어 있습니다.*
