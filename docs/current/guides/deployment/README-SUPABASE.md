# Epackage Lab - Supabase 데이터베이스 설정 완료 안내

## 📋 설정 완료 목록

✅ **프로젝트 구조 분석 완료**
- Next.js 16.0.3 프로젝트 확인
- TypeScript 환경 구성 확인
- 기존 디렉토리 구조 분석

✅ **Supabase 프로젝트 생성 가이드**
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 파일 생성
- 웹 대시보드 및 CLI를 통한 설정 방법 안내
- 환경 변수 설정 방법 포함

✅ **데이터베이스 스키마 설계**
- [database/schema.sql](./database/schema.sql) 파일 생성
- 8개 주요 테이블 설계:
  - `contacts` - 고객 정보
  - `products` - 제품 정보
  - `quotation_requests` - 견적 요청
  - `quotation_request_products` - 견적-제품 연결
  - `sample_requests` - 샘플 요청
  - `inquiries` - 일반 문의
  - `inquiry_responses` - 문의 답변
  - `attachments` - 첨부파일

✅ **TypeScript 타입 정의**
- [types/database.ts](./types/database.ts) 파일 생성
- 완전한 타입 안전성 보장
- API 요청/응답 타입 정의
- 폼 데이터 및 통계 타입 포함

✅ **Supabase 클라이언트 설정**
- [lib/supabase.ts](./lib/supabase.ts) 파일 생성
- 자동 타입 추론 지원
- 서버/클라이언트 별도 설정
- 유틸리티 함수 포함

✅ **Row Level Security (RLS) 정책**
- [database/rls-policies.sql](./database/rls-policies.sql) 파일 생성
- 보안 정책 완벽 설정
- 인증 기반 접근 제어
- 관리자 권한 분리

✅ **API 테스트 기능**
- [lib/api-test.ts](./lib/api-test.ts) 파일 생성
- 전체 CRUD 작업 구현
- 페이지네이션 및 필터링 지원
- 통계 조회 기능 포함

✅ **환경 설정**
- [.env.local.example](./.env.local.example) 템플릿 생성
- package.json에 의존성 추가

## 🚀 다음 단계

### 1. Supabase 프로젝트 생성
```bash
# [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 참고
```

### 2. 환경 변수 설정
```bash
# .env.local.example을 .env.local로 복사
cp .env.local.example .env.local

# 실제 값으로 수정
```

### 3. 의존성 설치
```bash
npm install
```

### 4. 데이터베이스 스키마 적용
```bash
# Supabase 대시보드에서 SQL 실행
# 또는 CLI를 사용한 마이그레이션
supabase db push
```

### 5. API 테스트 실행
```typescript
// 테스트 함수 실행
import { runApiTests, testDatabaseConnection } from './lib/api-test'

// 데이터베이스 연결 테스트
await testDatabaseConnection()

// 전체 API 테스트
await runApiTests()
```

## 📁 생성된 파일 구조

```
epackage-lab-web/
├── .env.local.example                 # 환경 변수 템플릿
├── SUPABASE_SETUP.md                  # Supabase 설정 가이드
├── README-SUPABASE.md                 # 현재 파일
├── database/
│   ├── schema.sql                     # 데이터베이스 스키마
│   └── rls-policies.sql              # RLS 보안 정책
├── types/
│   └── database.ts                    # TypeScript 타입 정의
├── lib/
│   ├── supabase.ts                    # Supabase 클라이언트 설정
│   └── api-test.ts                    # API 테스트 함수
└── package.json                       # 업데이트된 의존성
```

## 🔧 주요 기능

### 데이터베이스 기능
- **연락처 관리**: 고객 정보 CRUD
- **견적 요청**: 제품 견적 요청 및 관리
- **샘플 요청**: 제품 샘플 요청 처리
- **문의 관리**: 고객 문의 및 답변 시스템
- **파일 관리**: 첨부파일 업로드/다운로드

### 보안 기능
- **RLS 정책**: 행 수준 보안 정책
- **인증 기반 접근**: 사용자 권한에 따른 접근 제어
- **관리자 권한**: 관리자 전용 기능 분리
- **데이터 암호화**: 민감 정보 보호

### API 기능
- **RESTful API**: 표준 REST API 구현
- **타입 안전**: 완전한 TypeScript 지원
- **에러 처리**: 체계적인 에러 처리
- **페이지네이션**: 대용량 데이터 처리
- **실시간 구독**: 실시간 데이터 동기화

## 🛠 개발 팁

### 1. 타입 사용 예시
```typescript
import type { Contact, CreateContactRequest } from '@/types/database'

const newContact: CreateContactRequest = {
  name: '홍길동',
  email: 'hong@example.com',
  company: '테스트 회사'
}

const { data, error } = await createContact(newContact)
```

### 2. API 호출 예시
```typescript
import { getQuotationRequests } from '@/lib/api-test'

const quotations = await getQuotationRequests({
  page: 1,
  limit: 10,
  status: 'pending',
  search: '포장'
})
```

### 3. 실시간 구독 예시
```typescript
import { createSubscription } from '@/lib/supabase'

const subscription = createSubscription(
  'quotation_changes',
  '*',
  'quotation_requests',
  (payload) => {
    console.log('새로운 견적 요청:', payload)
  }
)
```

## 📝 주의사항

1. **환경 변수 보안**: `.env.local` 파일은 절대 Git에 커밋하지 마세요
2. **서비스 키**: `SUPABASE_SERVICE_ROLE_KEY`는 서버에서만 사용하세요
3. **RLS 정책**: 운영 환경에서는 RLS 정책을 반드시 활성화하세요
4. **백업**: 정기적인 데이터베이스 백업을 수행하세요
5. **테스트**: 운영 적용 전 충분한 테스트를 진행하세요

## 🆘 문제 해결

### 일반적인 오류
- **인증 오류**: 환경 변수 확인
- **연결 오류**: Supabase URL 및 키 확인
- **권한 오류**: RLS 정책 확인
- **타입 오류**: TypeScript 타입 정의 확인

### 디버깅 팁
1. 브라우저 개발자 도그에서 네트워크 요청 확인
2. Supabase 대시보드에서 로그 확인
3. `console.log`를 통한 데이터 흐름 확인
4. TypeScript 컴파일 오류 확인

## 📞 지원

추가적인 도움이 필요하시면:
- [Supabase 공식 문서](https://supabase.com/docs)
- [Next.js 문서](https://nextjs.org/docs)
- 프로젝트 이슈 트래커