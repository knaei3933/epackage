# 회원정보 편집 시나리오

**작성일**: 2026-01-21
**목적**: 회원이 자신의 정보를 수정

---

## 회원정보 편집

**목표**: 회원 기본 정보 수정

**전제 조건**:
- 회원으로 로그인된 상태

**테스트 단계**:

```bash
# 1. 회원정보 편집 페이지 접속
[Browser_navigate] http://localhost:3002/member/edit

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 2

# 3. 현재 정보 확인
[Browser_snapshot]

# 4. 정보 수정 (실제 페이지 구조에 맞게 수정)
[Browser_type] element="会社電話番号" text="03-9876-5432"
[Browser_type] element="携帯電話" text="090-1234-5678"]

# 5. 저장
[Browser_click] element="저장 버튼"]
[Browser_wait_for] time: 2
```

**API 확인**:

```bash
# PUT /api/member/profile
{
  "companyName": "수정된 회사명",
  "representativeName": "수정된 담당자",
  "phoneNumber": "03-9876-5432"
}
```

---

## 비밀번호 변경

**목표**: 회원 비밀번호 변경

### 테스트 단계

```bash
# 1. 비밀번호 변경 섹션
[Browser_click] element="비밀번호 변경 탭"]

# 1.5. 폼 표시 대기
[Browser_wait_for] time: 1

# 2. 현재 비밀번호 입력
[Browser_type] element="現在のパスワード" text="Member1234!"]

# 3. 새 비밀번호 입력
[Browser_type] element="新しいパスワード" text="NewMember1234!"]

# 4. 비밀번호 확인
[Browser_type] element="パスワード確認" text="NewMember1234!"]

# 5. 변경
[Browser_click] element="비밀번호 변경 버튼"]
[Browser_wait_for] time: 2
```

---

## 데이터베이스 검증

```sql
-- 회원정보 업데이트 확인
SELECT company_name, representative_name, phone_number, updated_at
FROM profiles
WHERE id = 'member-uuid';
```

---

## 다음 단계

- [설정](./settings.md)로 이동
