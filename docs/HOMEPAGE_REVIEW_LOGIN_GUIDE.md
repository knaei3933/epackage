# 홈페이지 검토 로그인 가이드

## 📋 환경 확인

현재 `.env.local` 설정:
- `NEXT_PUBLIC_DEV_MODE=true` ✅ (개발 모드 활성화)

---

## 🚀 방법 1: DEV_MODE 모의 로그인 (가장 간단)

### 특징
- ✅ 별도의 계정 생성 불필요
- ✅ 아무 이메일/비밀번호나 로그인 가능
- ⚠️ 실제 데이터 없음 (빈 목록 표시)

### 사용 방법

#### 1. 회원 페이지 접근
```
URL: http://localhost:3000/auth/signin
```

#### 2. 아무 이메일/비밀번호 입력
```
이메일: test@test.com (아무거나)
비밀번호: 1234 (아무거나)
```

#### 3. 로그인 클릭
- DEV_MODE에서는 인증 우회로 바로 로그인 성공
- `/member/dashboard`로 이동

**⚠️ 주의**:
- 회원가입 후 바로 로그인 가능 (승인 불필요)
- 관리자 페이지 접근은 별도 설정 필요

---

## 👤 방법 2: 테스트 관리자 계정 생성 (권장)

### 스크립트로 관리자 계정 생성

#### 1. 관리자 생성 스크립트 실행
```bash
cd "C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1"

# TypeScript 버전 (권장)
npx tsx scripts/create-admin.ts

# 또는 JavaScript 버전
node scripts/create-admin.js
```

#### 2. 생성된 계정으로 로그인
```
URL: http://localhost:3000/auth/signin

이메일: admin@epackage-lab.com
비밀번호: (스크립트 실행 시 설정한 비밀번호)
```

---

## 👥 방법 3: 일반 회원가입 후 승인 (실제 프로세스)

### 1. 회원가입
```
URL: http://localhost:3000/auth/register
```

필수 정보 입력:
- 이메일: 실제 사용 가능한 이메일
- 비밀번호: 8자 이상
- 회사명: 테스트 회사
- 이름: 테스트 사용자

### 2. 가입 후 상태
- 자동으로 `/auth/pending` 페이지로 이동
- "승인 대기 중" 상태

### 3. 관리자 승인 (필요시)

#### 방법 A: Supabase 대시보드에서 직접 승인
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택: `ijlgpzjdfipzmjvawofp`
3. **Table Editor** → `profiles` 테이블
4. 해당 사용자 찾아서 `status`를 `'ACTIVE'`로 변경
5. `role`을 필요에 따라 설정:
   - `'MEMBER'`: 일반 회원
   - `'ADMIN'`: 관리자

#### 방법 B: Admin 페이지에서 승인 (관리자 계정이 있는 경우)
1. 관리자로 로그인
2. `/admin/approvals` 접속
3. 승인 대기 목록에서 해당 사용자 승인

### 4. 로그인
```
URL: http://localhost:3000/auth/signin
가입한 이메일/비밀번호로 로그인
```

---

## 🔐 각 페이지별 권장 접근 방법

### 회원 페이지 (`/member/*`)
| 방법 | 난이도 | 데이터 |
|------|--------|--------|
| **DEV_MODE 로그인** | 쉬움 | ❌ 없음 (빈 목록) |
| **회원가입 후 승인** | 보통 | ✅ 있음 (실제 데이터) |

**검토 목적에 따라**:
- UI/UX 검토만: DEV_MODE 로그인
- 데이터 흐름 검토: 회원가입 후 승인

### 관리자 페이지 (`/admin/*`)
| 방법 | 난이도 | 데이터 |
|------|--------|--------|
| **관리자 스크립트 생성** | 쉬움 | ✅ 있음 |
| **Supabase에서 ADMIN 설정** | 보통 | ✅ 있음 |

**권장**: 관리자 스크립트 실행

---

## 🎯 빠른 시작 가이드

### 1분 만에 회원 페이지 확인 (DEV_MODE)
```bash
# 1. 개발 서버 실행
npm run dev

# 2. 브라우저에서
http://localhost:3000/auth/signin

# 3. 아무 자격정보나 입력 후 로그인
이메일: a@a.com
비밀번호: 1234

# 4. 회원 페이지 접속
http://localhost:3000/member/dashboard
```

### 5분 만에 관리자 페이지 확인
```bash
# 1. 관리자 계정 생성
npx tsx scripts/create-admin.ts

# 2. 브라우저에서
http://localhost:3000/auth/signin

# 3. 생성된 계정으로 로그인
이메일: admin@epackage-lab.com
비밀번호: (스크립트 실행 시 설정)

# 4. 관리자 페이지 접속
http://localhost:3000/admin/dashboard
```

---

## 📝 로그인 상태 확인

### 로그인되어 있는지 확인
```typescript
// 브라우저 콘솔에서 실행
localStorage.getItem('sb-ijlgpzjdfipzmjvawofp-auth-token')
// 토큰이 있으면 로그인 상태
```

### 로그아웃
```
URL: http://localhost:3000/auth/signout
```

---

## ⚠️ 문제 해결

### 문제 1: "승인 대기 중" 페이지에서 벗어날 수 없음
**해결**:
1. Supabase Dashboard 접속
2. profiles 테이블에서 해당 이메일 찾기
3. status를 'ACTIVE'로 변경

### 문제 2: 관리자 페이지 접근 거부
**해결**:
1. profiles 테이블에서 role 확인
2. 'ADMIN'으로 변경
3. 로그아웃 후 재로그인

### 문제 3: DEV_MODE에서 데이터가 안 보임
**해결**: 정상입니다. DEV_MODE는 UI 검토용입니다.
- 실제 데이터를 보려면 회원가입 후 승인 프로세스 진행

---

## 📞 추가 도움이 필요하시면

1. **빠른 테스트**: DEV_MODE 사용
2. **실제 데이터 확인**: 회원가입 후 승인
3. **관리자 기능**: 스크립트로 계정 생성

각 방법의 장단점을 고려하여 목적에 맞게 선택하세요!
