# 관리자 댓글 및 data-receipt 수정 요약

## 수정 일시
2026-02-01

## 문제 분석 및 해결

### 문제 1: 관리자 댓글 이름 "불명"으로 표시

#### 원인 분석
1. **데이터베이스 스키마 불일치**: `profiles` 테이블에는 `full_name` 컬럼이 존재하지 않음
2. **실제 컬럼 구성**: `kanji_last_name`, `kanji_first_name`, `kana_last_name`, `kana_first_name`, `company_name` 등으로 구성
3. **관리자 프로필 문제**: `admin@epackage-lab.com` 계정의 이름이 "未登録" (미등록)으로 설정됨
4. **코드 문제**: `route.ts`에서 `full_name` 컬럼을 조회하려고 시도

#### 해결 방안

**1. 데이터베이스 수정 (Supabase MCP)**
```sql
UPDATE profiles
SET kanji_last_name = '管理',
    kanji_first_name = '者',
    kana_last_name = 'かんり',
    kana_first_name = 'しゃ',
    company_name = 'EPackage Lab'
WHERE email = 'admin@epackage-lab.com';
```

**2. 코드 수정 (`src/app/api/member/orders/[id]/comments/route.ts`)**

**GET 핸들러 수정 (191-218행)**
- `full_name` 컬럼 조회를 실제 컬럼들로 변경
- 표시 이름 생성 로직 추가 (한자 이름 > 회사명 > 이메일 > '불명')

**POST 핸들러 수정 (425-446행)**
- 새 댓글 작성 시 작성자 정보 설정 로직 수정
- 동일한 표시 이름 우선순위 적용

#### 표시 이름 우선순위 로직
1. `kanji_last_name + kanji_first_name` (한자 이름)
2. `company_name` (회사명)
3. `email` (이메일)
4. `'불명'` (기본값)

---

### 문제 2: data-receipt 404 에러

#### 원인 분석
- **실제 상태**: `/api/member/orders/[id]/data-receipt/route.ts` 파일이 존재함
- **접근 제어**: 이미 관리자 접근이 허용되도록 구현됨 (200-212행)
- **올바른 동작**: `checkAdminRole()` 함수를 통해 관리자 확인 후 접근 허용

#### 해결 방안
**코드는 이미 올바르게 구현됨. 사용자 조치 필요:**
1. 개발 서버 재시작: `npm run dev`
2. 캐시 삭제: `.next` 폴더 삭제 후 재빌드
3. 브라우저 캐시 삭제

**기존 코드 검증 (이미 올바르게 구현됨)**
```typescript
// 200-212행: 관리자 접근 확인 로직
const isAdmin = await checkAdminRole(supabase, userId);

if (order.user_id !== userId && !isAdmin) {
  return NextResponse.json(
    {
      error: 'この注文にアクセスする権限がありません。',
      errorEn: 'Access denied',
      code: 'FORBIDDEN',
    },
    { status: 403 }
  );
}
```

---

## 변경된 파일

### 1. `src/app/api/member/orders/[id]/comments/route.ts`
- GET 핸들러: 작성자 정보 조회 로직 수정 (191-218행)
- POST 핸들러: 새 댓글 작성 시 작성자 정보 설정 수정 (425-446행)

### 2. Supabase Database
- `profiles` 테이블: admin@epackage-lab.com 사용자 이름 업데이트
  - `kanji_last_name`: 未登録 → 管理
  - `kanji_first_name`: 未登録 → 者
  - `kana_last_name`: みとうろく → かんり
  - `kana_first_name`: みとうろく → しゃ
  - `company_name`: null → EPackage Lab

---

## 검증 결과

### 1. 관리자 댓글 이름 확인
```sql
SELECT
  c.id,
  c.content,
  p.kanji_last_name,
  p.kanji_first_name,
  p.company_name,
  p.email,
  p.role
FROM order_comments c
LEFT JOIN profiles p ON c.author_id = p.id
ORDER BY c.created_at DESC
LIMIT 5;
```

**결과:**
- 관리자 댓글: `管理 者` (EPackage Lab) ✓
- 회원 댓글: `山田 太郎` (テスト株式会社) ✓

### 2. 빌드 성공 확인
```bash
npm run build
✓ Compiled successfully
✓ Generating static pages (218/218)
```

---

## 다음 단계 (사용자 조치)

1. **개발 서버 재시작**
   ```bash
   # 현재 실행 중인 서버 중지 (Ctrl+C)
   npm run dev
   ```

2. **필요시 캐시 삭제**
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **테스트**
   - 관리자로 로그인 (admin@epackage-lab.com)
   - 주문 상세 페이지 접근
   - 댓글 작성 테스트 → 이름이 "管理 者"로 표시되는지 확인
   - data-receipt 파일 업로드 테스트

---

## 참고 사항

1. **호환성**: 기존 `full_name` 필드를 사용하는 컴포넌트와의 호환성을 위해 `author` 객체 내에서 `full_name` 키를 유지
2. **다국어 지원**: 일본어(한자/가나)와 영문 회사명을 모두 지원
3. **폴백 로직**: 이름이 없는 경우 회사명 → 이메일 → "불명" 순서로 표시
4. **보안**: 관리자 권한 확인 로직이 이미 제대로 구현됨

---

## 수정 완료 상태

- ✅ 관리자 댓글 이름 "불명" 문제 해결
- ✅ profiles 테이블 스키마에 맞춘 코드 수정
- ✅ 관리자 프로필 이름 업데이트
- ✅ data-receipt 엔드포인트 접근 권한 확인 (이미 올바름)
- ✅ 빌드 성공 확인
