# Epackage Lab Backend API

Express.js 기반의 Epackage Lab 백엔드 API 서버입니다.

## 기술 스택

- **Node.js 20 LTS**
- **Express 4.18+**
- **TypeScript**
- **PostgreSQL 16**
- **JWT 인증**
- **Winston 로깅**

## 주요 기능

### 🔐 인증 시스템
- JWT 기반 액세스/리프레시 토큰
- bcrypt 비밀번호 해싱
- 역할 기반 접근 제어 (RBAC)

### 📦 제품 관리
- 제품 카탈로그 조회
- 카테고리별 필터링
- 전문화된 검색 기능
- 재고 관리

### 💰 견적 시스템
- 동적 가격 계산
- PDF 견적서 생성
- 유효기간 관리
- 상태 추적

### 📦 샘플 요청
- 최대 5개 샘플 요청
- 배송 주소 관리
- 실시간 상태 추적
- 재고 확인

### 📞 문의 관리
- 다양한 문의 타입
- 우선순위 관리
- 담당자 배정
- 상태 추적

## API 엔드포인트

### 인증 (Authentication)
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/profile` - 프로필 조회

### 제품 (Products)
- `GET /api/products` - 제품 목록 조회
- `GET /api/products/:id` - 특정 제품 조회
- `GET /api/products/categories` - 카테고리 목록
- `GET /api/products/search` - 제품 검색

### 견적 (Quotations)
- `POST /api/quotations` - 견적 요청 생성
- `GET /api/quotations` - 견적 목록 조회
- `GET /api/quotations/:id` - 특정 견적 조회
- `PUT /api/quotations/:id/status` - 견적 상태 업데이트

### 샘플 요청 (Sample Requests)
- `POST /api/sample-requests` - 샘플 요청 생성
- `GET /api/sample-requests` - 샘플 요청 목록
- `GET /api/sample-requests/:id` - 특정 샘플 요청 조회
- `PUT /api/sample-requests/:id/status` - 상태 업데이트

### 문의 (Inquiries)
- `POST /api/inquiries` - 문의 생성
- `GET /api/inquiries` - 문의 목록
- `GET /api/inquiries/:id` - 특정 문의 조회
- `PUT /api/inquiries/:id/status` - 문의 상태 업데이트

## 시작 가이드

### 1. 환경 설정

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
```

### 2. 데이터베이스 설정

```bash
# PostgreSQL 데이터베이스 생성
createdb epackage_lab

# 마이그레이션 실행
npm run migrate
```

### 3. 개발 서버 시작

```bash
# 개발 모드 (nodemon)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 시작
npm start
```

## 환경 변수

```bash
# 서버 설정
PORT=3001
NODE_ENV=development

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=epackage_lab
DB_USER=epackage_user
DB_PASSWORD=your_secure_password

# JWT 설정
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=30d

# CORS 설정
CORS_ORIGIN=http://localhost:3000

# 보안 설정
BCRYPT_ROUNDS=12
```

## 데이터베이스 스키마

주요 테이블:
- `users` - 사용자 정보
- `products` - 제품 정보
- `quotations` - 견적 정보
- `quotation_items` - 견적 항목
- `sample_requests` - 샘플 요청
- `sample_request_items` - 샘플 요청 항목
- `inquiries` - 문의 내역
- `user_sessions` - 사용자 세션

## 보안 기능

- **헬멧 (Helmet)**: HTTP 보안 헤더 설정
- **CORS**: 교차 출처 요청 관리
- **비밀번호 해싱**: bcrypt를 통한 안전한 비밀번호 저장
- **JWT 토큰**: 만료 시간과 리프레시 토큰 지원
- **속도 제한**: API 요청 속도 제한
- **입력 검증**: Joi를 통한 요청 데이터 검증

## 로깅

Winston 기반 로깅 시스템:
- 개발 환경: 콘솔 출력
- 프로덕션 환경: 파일 로그
- 에러 로그: 별도 파일 관리

## 성능 최적화

- **압축**: Gzip 압축 미들웨어
- **커넥션 풀**: PostgreSQL 커넥션 풀링
- **쿼리 최적화**: 인덱스 기반 성능 최적화
- **캐싱**: 정적 리소스 캐싱

## API 응답 형식

```json
{
  "success": true,
  "message": "Success message",
  "data": {},
  "timestamp": "2024-12-08T00:00:00.000Z"
}
```

에러 응답:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error",
  "timestamp": "2024-12-08T00:00:00.000Z"
}
```

## 테스트

```bash
# 유닛 테스트
npm test

# ESLint 검사
npm run lint

# 빌드 확인
npm run build
```

## 배포

1. **환경 변수 설정**: 프로덕션 환경 변수 구성
2. **빌드**: `npm run build`
3. **데이터베이스 마이그레이션**: `npm run migrate`
4. **서버 시작**: `npm start`

## 모니터링

- **헬스 체크**: `/health` 엔드포인트
- **로그 모니터링**: Winston 로그 시스템
- **성능 메트릭**: API 응답 시간 추적

## 라이선스

MIT License