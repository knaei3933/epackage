# 생산 관리 시나리오

**작성일**: 2026-01-21
**목적**: 관리자가 생산 작업을 할당 및 진척 관리

---

## 생산 작업 목록

**목표**: 모든 생산 작업 조회 및 상태별 필터링

**전제 조건**:
- 관리자로 로그인된 상태

**테스트 단계**:

```bash
# 1. 생산 관리 페이지 접속
[Browser_navigate] http://localhost:3002/admin/production

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 3

# 3. 작업 목록 확인
[Browser_snapshot]

# 4. 필터 테스트
[Browser_click] element="진행중만"]
```

**API 확인**:

```bash
# GET /api/admin/production/jobs
{
  "jobs": [
    {
      "id": "job-uuid",
      "jobNumber": "JOB-20260121-001",
      "orderNumber": "ORD-20260121-001",
      "productType": "stand_pouch",
      "quantity": 500,
      "status": "in_progress",
      "progressPercentage": 25,
      "assignedTo": "operator-uuid"
    }
  ]
}
```

**생산 상태**:

| 상태 | 설명 |
|------|------|
| pending | 대기 |
| assigned | 할당됨 |
| in_progress | 진행중 |
| completed | 완료 |
| on_hold | 일시중지 |
| cancelled | 취소 |

---

## 작업 할당

**목표**: 주문을 생산 라인에 할당

**테스트 단계**:

```bash
# 1. 할당 가능한 주문 선택
[Browser_click] element="할당 가능 주문"]

# 2. 생산 라인 선택
[Browser_click] element="생산 라인 1"]

# 3. 담당자 선택
[Browser_click] element="담당자 선택"]
[Browser_click] element="操作担当者A"]

# 4. 할당
[Browser_click] element="생산 할당 버튼"]
[Browser_wait_for] time: 2
```

---

## 진척 업데이트

**목표**: 생산 진척률 업데이트

**테스트 단계**:

```bash
# 1. 생산 작업 선택
[Browser_click] element="생산 작업"]

# 1.5. 폼 표시 대기
[Browser_wait_for] time: 1]

# 2. 진척률 입력
[Browser_type] element="進捗率" text="50"]

# 3. 작업 메모 입력
[Browser_type] element="作業メモ" text="재료 절단 완료, 인쇄 시작"]

# 4. 업데이트
[Browser_click] element="진척 업데이트 버튼"]
[Browser_wait_for] time: 2
```

---

## 데이터베이스 검증

```sql
-- 생산 작업 확인
SELECT job_number, status, progress_percentage, assigned_to
FROM production_jobs
ORDER BY created_at DESC;
```

---

## 다음 단계

- [재고 관리](./inventory.md)로 이동
