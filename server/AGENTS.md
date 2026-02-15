<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-08 | Updated: 2026-02-08 -->

# Server - Backend API

## Purpose
Express.js 기반의 Epackage Lab 백엔드 API 서버. 제품 관리, 견적 시스템, 샘플 요청, 문의 관리, JWT 인증 등 B2B包装資材 플랫폼을 위한 RESTful API를 제공합니다.

## Key Files

| File | Description |
|------|-------------|
| `src/index.ts` | 서버 진입점 (Express app, 미들웨어, 라우팅) |
| `package.json` | 의존성 및 스크립트 |
| `tsconfig.json` | TypeScript 설정 (path aliases 포함) |
| `jest.config.js` | Jest 테스트 설정 |
| `.env.example` | 환경변수 템플릿 |
| `README.md` | 서버 문서 |
| `DEPLOYMENT.md` | 배포 가이드 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | TypeScript 소스코드 |
| `dist/` | 컴파일된 JavaScript 출력 |
| `logs/` | Winston 로그 파일 |
| `src/config/` | 설정 파일 (DB, JWT, CORS 등) |
| `src/controllers/` | 요청 처리 로직 |
| `src/routes/` | API 라우트 정의 |
| `src/middleware/` | Express 미들웨어 |
| `src/models/` | 데이터 모델 (PostgreSQL) |
| `src/services/` | 비즈니스 로직 서비스 |
| `src/database/` | DB 스키마 및 마이그레이션 |
| `src/utils/` | 유틸리티 (JWT, Logger, Response) |
| `src/types/` | TypeScript 타입 정의 |
| `src/test/` | 테스트 설정 |

## For AI Agents

### Working In This Directory

**환경 설정:**
```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일에 DB, JWT 설정 입력

# 개발 서버 (nodemon + ts-node)
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

**개발 요구사항:**
- Node.js >= 20.0.0
- PostgreSQL 16
- TypeScript 5.x (Strict Mode)

**API 구조:**
- Base URL: `http://localhost:3001/api`
- Health Check: `/health`
- 주요 엔드포인트: `/auth`, `/products`, `/quotations`, `/sample-requests`, `/inquiries`

**경로 별칭 (tsconfig paths):**
- `@/*` → `src/*`
- `@/config/*` → `src/config/*`
- `@/controllers/*` → `src/controllers/*`
- `@/middleware/*` → `src/middleware/*`
- `@/models/*` → `src/models/*`
- `@/routes/*` → `src/routes/*`
- `@/services/*` → `src/services/*`
- `@/utils/*` → `src/utils/*`
- `@/types/*` → `src/types/*`

### Testing Requirements

```bash
# 유닛 테스트 (Jest + ts-jest)
npm test

# ESLint 체크
npm run lint

# 빌드 검증
npm run build

# DB 마이그레이션
npm run migrate
```

**테스트 커버리지:** >80% 목표

### Common Patterns

**컨트롤러 패턴:**
```typescript
import { Request, Response } from 'express';
import logger from '@/utils/logger';

export const createQuotation = async (req: Request, res: Response) => {
  try {
    // 비즈니스 로직
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    logger.error('Error creating quotation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
```

**미들웨어 체인:**
1. Helmet (Security headers)
2. CORS
3. Compression
4. Body parsing (JSON, urlencoded)
5. Rate limiting
6. Request logging
7. Route handlers
8. Error handling

**에러 응답 형식:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error",
  "timestamp": "2024-12-08T00:00:00.000Z"
}
```

### Database Schema

**주요 테이블:**
- `users` - 사용자 정보 (이메일, 비밀번호, 역할)
- `products` - 제품 카탈로그
- `quotations` - 견적 정보
- `quotation_items` - 견적 항목
- `sample_requests` - 샘플 요청
- `sample_request_items` - 샘플 항목
- `inquiries` - 문의 내역
- `user_sessions` - 세션 관리

**인덱스 전략:**
- users: email, is_active
- products: category, is_active
- quotations: user_id, status
- inquiries: user_id, status, type

## Dependencies

### Runtime (production)

- **express 4.18+** - 웹 프레임워크
- **pg 8.11+** - PostgreSQL 클라이언트
- **bcryptjs 2.4+** - 비밀번호 해싱
- **jsonwebtoken 9.0+** - JWT 인증
- **cors 2.8+** - CORS 미들웨어
- **helmet 7.1+** - 보안 헤더
- **dotenv 16.3+** - 환경변수
- **joi 17.11+** - 스키마 검증
- **winston 3.11+** - 로깅
- **rate-limiter-flexible 5.0+** - 속도 제한
- **compression 1.7+** - Gzip 압축
- **express-validator 7.0+** - 요청 검증

### Dev Dependencies

- **typescript 5.2+** - TypeScript 컴파일러
- **ts-node 10.9+** - TypeScript 실행
- **nodemon 3.0+** - 개발 서버 핫리로드
- **jest 29.7+** - 테스트 프레임워크
- **ts-jest 29.1+** - TypeScript Jest 프리셋
- **@types/*** - TypeScript 타입 정의
- **eslint 8.52+** - 린터

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - 회원가입
- `POST /login` - 로그인
- `POST /logout` - 로그아웃
- `GET /profile` - 프로필 조회

### Products (`/api/products`)
- `GET /` - 제품 목록
- `GET /:id` - 제품 상세
- `GET /categories` - 카테고리 목록
- `GET /search` - 검색

### Quotations (`/api/quotations`)
- `POST /` - 견적 생성
- `GET /` - 견적 목록
- `GET /:id` - 견적 상세
- `PUT /:id/status` - 상태 업데이트

### Sample Requests (`/api/sample-requests`)
- `POST /` - 샘플 요청
- `GET /` - 요청 목록
- `GET /:id` - 요청 상세
- `PUT /:id/status` - 상태 업데이트

### Inquiries (`/api/inquiries`)
- `POST /` - 문의 생성
- `GET /` - 문의 목록
- `GET /:id` - 문의 상세
- `PUT /:id/status` - 상태 업데이트

<!-- MANUAL: 서버 특정 설정 및 주의사항을 여기에 추가 -->
