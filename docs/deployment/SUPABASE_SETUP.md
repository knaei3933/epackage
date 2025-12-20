# Epackage Lab - Supabase 데이터베이스 설정 가이드

## 1. Supabase 프로젝트 생성

### 1.1. 웹 대시보드에서 프로젝트 생성
1. [Supabase](https://supabase.com)에 접속하여 계정 로그인
2. "New Project" 클릭
3. GitHub 계정으로 연동 또는 이메일로 가입
4. 조직(Organization) 선택 또는 생성
5. 프로젝트 정보 입력:
   - **Project Name**: `epackage-lab-web`
   - **Database Password**: 강력한 비밀번호 생성 (저장 필요)
   - **Region**: 가장 가까운 지역 선택 (예: `ap-northeast-1` - Seoul)
   - **Pricing Plan**: Free Plan 선택

### 1.2. CLI를 사용한 프로젝트 설정
```bash
# Supabase CLI 설치 (npm)
npm install -g supabase

# 프로젝트 디렉토리로 이동
cd "C:\Users\kanei\SynologyDrive\Homepage_Dev\birza\epackage-lab-web"

# Supabase 초기화
supabase init

# 프로젝트 연결
supabase link --project-ref YOUR_PROJECT_REF

# 로그인
supabase login
```

## 2. 프로젝트 정보 확인 및 환경 변수 설정

### 2.1. 프로젝트 정보 확인
Supabase 대시보드에서 다음 정보를 확인하세요:
- **Project URL**: `https://[project-ref].supabase.co`
- **Anon Key**: 공개 키
- **Service Role Key**: 서비스 키 (서버 전용)

### 2.2. 환경 변수 파일 생성
프로젝트 루트에 `.env.local` 파일 생성:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 3. 의존성 설치

### 3.1. Supabase 클라이언트 설치
```bash
npm install @supabase/supabase-js
```

### 3.2. TypeScript 타입 설치 (CLI용)
```bash
npm install -D supabase
```

## 4. 데이터베이스 스키마 설계

### 4.1. 테이블 설계
Epackage Lab 프로젝트를 위한 주요 테이블:

1. **contacts** - 고객 정보
2. **quotation_requests** - 견적 요청
3. **sample_requests** - 샘플 요청
4. **products** - 제품 정보
5. **inquiries** - 일반 문의

### 4.2. 마이그레이션 파일 생성
```bash
# 마이그레이션 파일 생성
supabase migration new create_initial_schema
```

## 5. Row Level Security (RLS) 설정

### 5.1. RLS 활성화
모든 테이블에 대해 RLS를 활성화하여 보안을 강화합니다.

### 5.2. 정책 설정
- 인증된 사용자는 자신의 데이터에 접근 가능
- 익명 사용자는 제한적인 접근만 허용
- 관리자는 모든 데이터에 접근 가능

## 6. TypeScript 타입 생성

### 6.1. 자동 타입 생성
```bash
# 데이터베이스 타입 생성
supabase gen types typescript --project-id your-project-ref --schema public > types/supabase.ts
```

### 6.2. 수동 타입 정의
자동 생성된 타입을 프로젝트에 맞게 커스터마이징합니다.

## 7. 다음 단계

1. 데이터베이스 스키마 생성 (`supabase db push`)
2. TypeScript 타입 설정
3. Supabase 클라이언트 구성
4. API 테스트
5. RLS 정책 설정

## 주의사항

- **보안**: 서비스 키는 클라이언트 노출 금지
- **백업**: 정기적인 데이터베이스 백업 필요
- **환경 변수**: `.env.local` 파일은 .gitignore에 추가되어야 함
- **권한**: 최소 권한 원칙 적용