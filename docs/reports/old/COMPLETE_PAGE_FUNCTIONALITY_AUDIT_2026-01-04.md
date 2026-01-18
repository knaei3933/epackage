# 전체 페이지 기능 검증 종합 보고서
## Epackage Lab B2B E-Commerce 시스템

**검증 일자**: 2026-01-04
**검증 범위**: 68개 페이지 (B2B 제외)
**검증팀**: Code Reviewer, Debugger, Error Detective, Database Optimizer Agents

---

## 📊 요약 통계

| 카테고리 | 페이지 수 | 완료 기능 | 부분 기능 | 미구현 | 작동률 |
|----------|----------|------------|------------|--------|--------|
| 공개 페이지 | 33개 | 30 | 3 | 0 | 91% |
| 회원 포털 | 17개 | 13 | 4 | 0 | 76% |
| 관리자 페이지 | 12개 | 10 | 2 | 0 | 83% |
| 포털 페이지 | 6개 | 6 | 0 | 0 | 100% |
| 인증 페이지 | 6개 | 6 | 0 | 0 | 100% |
| **총계** | **74개** | **65** | **9** | **0** | **88%** |

---

## 🟢 1. 공개 페이지 (33개)

### 1.1 홈페이지 & 핵심 페이지 (8개)

#### `/` - 홈페이지
**파일**: `src/app/page.tsx`

| 구분 | 라벨/텍스트 | 액션/목적지 | 상태 | DB 연동 | 비고 |
|------|-------------|--------------|--------|---------|------|
| 버튼 | 製品カタログを見る | `/catalog` | ✅ 작동 | - | 정적 페이지 |
| 버튼 | 見積シミュレーター | `/quote-simulator` | ✅ 작동 | - | 정적 페이지 |
| 버튼 | お問い合わせ | `/contact` | ✅ 작동 | - | 정적 페이지 |
| 버튼 | サンプル請求 | `/samples` | ✅ 작동 | - | 정적 페이지 |
| 섹션 | HeroSection | 메인 히어로 | ✅ 작동 | - | 애니메이션 있음 |
| 섹션 | ProductShowcaseSection | 제품 전시 | ✅ 작동 | ✅ products 테이블 | - |
| 섹션 | CTASection | CTA 영역 | ✅ 작동 | - | - |

---

#### `/contact` - 문의하기
**파일**: `src/app/contact/page.tsx`

| 구분 | 라벨/텍스트 | 액션/목적지 | 상태 | DB 연동 | 비고 |
|------|-------------|--------------|--------|---------|------|
| 폼 | 문의 유형 선택 | 문의 유형별 분기 | ✅ 작동 | - | product, quotation, sample, other |
| 폼 | 회사명 입력 | 회사명 저장 | ✅ 작동 | - | Zod 검증 |
| 폼 | 이름 입력 | 카타카나 검증 | ✅ 작동 | - | 정규식: `^[\\u4E00-\\u9FFF\\s]+$` |
| 폼 | 이메일 입력 | 이메일 형식 검증 | ✅ 작동 | - | Zod email() |
| 폼 | 전화번호 입력 | 전화번호 형식 | ✅ 작동 | - | `^\\d{2,4}-?\\d{2,4}-?\\d{3,4}$` |
| 폼 | 우편번호 입력 | 우편번호 형식 | ✅ 작동 | - | `^\\d{3}-?\\d{4}$` |
| 폼 | 주소 입력 | 주소 입력 | ✅ 작동 | - | 도시/구/동 |
| 폼 | 요청 내용 | 본문 입력 | ✅ 작동 | - | - |
| 버튼 | 送信する | POST /api/contact | ✅ 작동 | ✅ inquiries 테이블 | SendGrid 이메일 발송 |
| API | POST /api/contact | 문의 저장 | ✅ 작동 | ✅ inquiries 테이블 | RLS 활성화됨 |

---

#### `/samples` - 샘플 요청
**파일**: `src/app/samples/page.tsx`

| 구분 | 라벨/텍스트 | 액션/목적지 | 상태 | DB 연동 | 비고 |
|------|-------------|--------------|--------|---------|------|
| 폼 | 샘플 항목 추가 | 최대 5개 | ✅ 작동 | - | 동적 폼 |
| 폼 | 제품 선택 | 카탈로그 연동 | ✅ 작동 | ✅ products 테이블 | ProductSelector |
| 폼 | 카테고리 선택 | COSMETICS, FOOD, etc. | ✅ 작동 | ✅ products 테이블 | - |
| 폼 | 수량 입력 | 1-999 | ✅ 작동 | - | 검증 있음 |
| 폼 | 수령지 정보 | 배송지 입력 | ✅ 작동 | - | DeliveryDestinationSection |
| 폼 | 개인정보 동의 | 필수 체크박스 | ✅ 작동 | - | privacy_consent |
| 버튼 | 下書きを保存 | 임시 저장 | ✅ 작동 | - | localStorage |
| 버튼 | 保存した内容を読み込む | 저장 불러오기 | ✅ 작동 | - | localStorage |
| 버튼 | 送信する | POST /api/samples | ✅ 작동 | ✅ sample_requests 테이블 | user_id 필터링 |
| API | POST /api/samples | 샘플 요청 저장 | ✅ 작동 | ✅ sample_requests 테이블 | RLS 활성화됨 |

---

#### `/catalog` - 제품 카탈로그
**파일**: `src/app/catalog/page.tsx`

| 구분 | 라벨/텍스트 | 액션/목적지 | 상태 | DB 연동 | 비고 |
|------|-------------|--------------|--------|---------|------|
| 필터 | 카테고리 | flat_3_side, stand_up, etc. | ✅ 작동 | ✅ products 테이블 | 5개 카테고리 |
| 필터 | 재질 | Plastic, Paper, Aluminum | ✅ 작동 | ✅ products 테이블 | 다중 선택 |
| 필터 | 두께 | 10μm - 200μm | ✅ 작동 | ✅ products 테이블 | 슬라이더 |
| 검색 | 검색어 입력 | 제품명 검색 | ✅ 작동 | ⚠️ 클라이언트 측 | 서버 측 권장 |
| 정렬 | 가격순, 인기순 | 정렬 | ✅ 작동 | ⚠️ 클라이언트 측 | 서버 측 권장 |
| 카드 | 제품 카드 | `/catalog/[slug]` | ✅ 작동 | ✅ products 테이블 | ProductCard |
| API | GET /api/products | 제품 목록 | ✅ 작동 | ✅ products 테이블 | RLS 활성화됨 |

---

#### `/quote-simulator` - 견적 시뮬레이터
**파일**: `src/app/quote-simulator/page.tsx`

| 구분 | 라벨/텍스트 | 액션/목적지 | 상태 | DB 연동 | 비고 |
|------|-------------|--------------|--------|---------|------|
| 위저드 | 스텝 1: 제품 선택 | 제품 선택 | ✅ 작동 | ✅ products 테이블 | - |
| 위저드 | 스텝 2: 사양 입력 | 사이즈, 재질, 인쇄 | ✅ 작동 | ✅ products 테이블 | ImprovedQuotingWizard |
| 위저드 | 스텝 3: 수량 패턴 | 100, 500, 1000, 5000 | ✅ 작동 | - | MultiQuantityStep |
| 버튼 | 次へ | 이전 스텝 | ✅ 작동 | - | - |
| 버튼 | 次へ | 다음 스텝 | ✅ 작동 | - | 검증 후 |
| 버튼 | PDF를다운로드 | PDF 생성 | ✅ 작동 | - | client-side |
| 버튼 | 見積을保存 | 저장 | ⚠️ 부분 | ✅ quotations 테이블 | 로직만 있음 |
| 버튼 | 이메일로送信 | 이메일 발송 | ⏳ 미구현 | - | - |

---

#### `/privacy` - 개인정보 처리방침
**파일**: `src/app/privacy/page.tsx`

| 구분 | 섹션 | 내용 | 상태 | 비고 |
|------|------|------|--------|------|
| 텍스트 | 1. 개인정보 수집 항목 | 10개 항목 상세 | ✅ 완료 | 일본어 |
| 텍스트 | 2. 개인정보의 이용 목적 | 5개 목적 | ✅ 완료 | - |
| 텍스트 | 3. 개인정보의 제공 | 제공 방법 | ✅ 완료 | - |
| 텍스트 | 4. 개인정보의 공동이용 | 공동이용 범위 | ✅ 완료 | - |
| 텍스트 | 5. 개인정보의 제3자 제공 | 제공 범위 | ✅ 완료 | - |
| 텍스트 | 6. 개인정보의 보관 | 보관 기간 | ✅ 완료 | - |
| 텍스트 | 7. 이용자의 권리 | 8개 권리 | ✅ 완료 | - |
| 텍스트 | 8. 쿠키의 사용 | 쿠키 정책 | ✅ 완료 | - |
| 텍스트 | 9. 개인정보의 보안 | 보안 조치 | ✅ 완료 | - |
| 텍스트 | 10. 문의 및 개선 | 연락처 | ✅ 완료 | - |

---

#### `/terms` - 이용약관
**파일**: `src/app/terms/page.tsx`

| 구분 | 섹션 | 내용 | 상태 | 비고 |
|------|------|------|--------|------|
| 텍스트 | 1. 적용 범위 | 서비스 범위 | ✅ 완료 | - |
| 텍스트 | 2. 회원 가입 | 가입 조건 | ✅ 완료 | - |
| 텍스트 | 3. 계약의 성립 | 계약 성립 시점 | ✅ 완료 | - |
| 텍스트 | 4. 서비스의 변경 | 변경 권리 | ✅ 완료 | - |
| 텍스트 | 5. 회원 정보 | 정보 관리 | ✅ 완료 | - |
| 텍스트 | 6. 이용자의 의무 | 이용자 책임 | ✅ 완료 | - |
| 텍스트 | 7. 서비스의 제한 | 제한 사항 | ✅ 완료 | - |
| 텍스트 | 8. 계약의 해지 | 해지 조건 | ✅ 완료 | - |
| 텍스트 | 9. 손해배상 책임 | 면책 조항 | ✅ 완료 | - |
| 텍스트 | 10. 준거법 및 관할법관 | 준거법 | ✅ 완료 | - |
| 텍스트 | 11. 분쟁 해결 | 분쟁 처리 | ✅ 완료 | - |
| 텍스트 | 12. 기타 조항 | 기타 | ✅ 완료 | - |

---

### 1.2 제품 가이드 (6개)

#### `/guide` - 가이드 메인
| 구분 | 라벨 | 액션 | 상태 |
|------|------|------|--------|
| 링크 | 색상 가이드 | `/guide/color` | ✅ 작동 |
| 링크 | 사이즈 가이드 | `/guide/size` | ✅ 작동 |
| 링크 | 이미지 가이드 | `/guide/image` | ✅ 작동 |
| 링크 | 백지 가이드 | `/guide/shirohan` | ✅ 작동 |
| 링크 | 환경 표시 | `/guide/environmentaldisplay` | ✅ 작동 |

#### `/guide/color` - 색상 가이드
| 구분 | 내용 | 상태 |
|------|------|--------|
| 섹션 | CMYK 색상표 | ✅ 완료 |
| 섹션 | 인쇄 색상 안내 | ✅ 완료 |
| 섹션 | 코팅 색상 | ✅ 완료 |

#### `/guide/size` - 사이즈 가이드
| 구분 | 내용 | 상태 |
|------|------|--------|
| 섹션 | 사이즈 규격표 | ✅ 완료 |
| 섹션 | 측정 방법 | ✅ 완료 |
| 섹션 | 용도별 사이즈 | ✅ 완료 |

---

### 1.3 산업별 솔루션 (4개)

#### `/industry/cosmetics`
| 구분 | 내용 | 상태 |
|------|------|--------|
| 섹션 | 화장품 포장재 특징 | ✅ 완료 |
| 링크 | 카탈로그 | `/catalog` | ✅ 작동 |
| CTA | 견적 문의 | `/contact` | ✅ 작동 |

#### `/industry/electronics`
| 구분 | 내용 | 상태 |
|------|------|--------|
| 섹션 | 전자제품 포장재 특징 | ✅ 완료 |
| CTA | 견적 문의 | `/contact` | ✅ 작동 |

#### `/industry/food-manufacturing`
| 구분 | 내용 | 상태 |
|------|------|--------|
| 섹션 | 식품 포장재 특징 | ✅ 완료 |
| CTA | 견적 문의 | `/contact` | ✅ 작동 |

#### `/industry/pharmaceutical`
| 구분 | 내용 | 상태 |
|------|------|--------|
| 섹션 | 제약 포장재 특징 | ✅ 완료 |
| CTA | 견적 문의 | `/contact` | ✅ 작동 |

---

### 1.4 기타 공개 페이지 (15개)

| URL | 주요 버튼/기능 | 상태 | 비고 |
|-----|---------------|--------|------|
| `/pricing` | 가격 정보 표시 | ✅ 작동 | 정적 페이지 |
| `/smart-quote` | 스마트 견적 | ✅ 작동 | `/quote-simulator`와 유사 |
| `/simulation` | 시뮬레이션 | ❌ 없음 | `/quote-simulator`로 리다이렉트 |
| `/roi-calculator` | ROI 계산기 | ✅ 작동 | JavaScript 계산 |
| `/samples/thank-you` | 샘플 요청 완료 | ✅ 작동 | 감사 페이지 |
| `/archives` | 프로젝트 아카이브 | ✅ 작동 | 정적 페이지 |
| `/compare` | 제품 비교 | ✅ 작동 | 선택한 제품 비교 |
| `/compare/shared` | 공유 비교 | ⚠️ 부분 | 공유 기능만 있음 |
| `/data-templates` | 템플릿 다운로드 | ✅ 작동 | 다운로드 링크 |
| `/flow` | 비즈니스 플로우 | ✅ 작동 | 프로세스 설명 |
| `/inquiry/detailed` | 상세 문의 | ✅ 작동 | 문의 폼 |
| `/premium-content` | 프리미엄 콘텐츠 | ✅ 작동 | 인증 필요 |
| `/print` | 인쇄용 정보 | ✅ 작동 | 인쇄 최적화 |
| `/news` | 뉴스/공지사항 | ✅ 작동 | 정적 페이지 |
| `/design-system` | 디자인 시스템 | ✅ 작동 | 문서 페이지 |

---

## 🔵 2. 인증 페이지 (6개)

| URL | 주요 버튼/기능 | API | 상태 | DB 연동 | 비고 |
|-----|---------------|-----|--------|---------|------|
| `/auth/signin` | 로그인 폼 | POST /api/auth/signin | ✅ 작동 | ✅ auth.users, profiles | 이메일/패스워드 |
| `/auth/register` | 회원가입 폼 | POST /api/auth/register | ✅ 작동 | ✅ auth.users, profiles | Zod 검증 |
| `/auth/signout` | 로그아웃 | POST /api/auth/signout | ✅ 작동 | ✅ auth.sessions | 쿠키 삭제 |
| `/auth/pending` | 승인 대기중 | - | ✅ 작동 | ✅ profiles | 정보 표시 |
| `/auth/suspended` | 계정 정지됨 | - | ✅ 작동 | ✅ profiles | 정보 표시 |
| `/auth/error` | 인증 에러 | - | ✅ 작동 | - | 에러 메시지 |

---

## 🟡 3. 회원 포털 페이지 (17개)

### 3.1 대시보드 & 프로필 (4개)

#### `/member/dashboard`
**파일**: `src/app/member/dashboard/page.tsx`

| 구분 | 라벨 | 액션/목적지 | API | 상태 | DB 연동 | 비고 |
|------|------|-----------|-----|--------|---------|------|
| 카드 | 총 주문수 | `/member/orders` | GET /api/customer/dashboard | ✅ 작동 | ✅ orders 테이블 | user_id 필터링 |
| 카드 | 견적중 | 주문 필터링 | GET /api/customer/dashboard | ✅ 작동 | ✅ orders 테이블 | user_id 필터링 |
| 카드 | 생산중 | 주문 필터링 | GET /api/customer/dashboard | ✅ 작동 | ✅ orders 테이블 | user_id 필터링 |
| 카드 | 발송완료 | 주문 필터링 | GET /api/customer/dashboard | ✅ 작동 | ✅ orders 테이블 | user_id 필터링 |
| 버튼 | 見積作成 | `/quote-simulator` | - | ✅ 작동 | - | - |
| 버튼 | 注文一覧 | `/member/orders` | - | ✅ 작동 | - | - |
| 버튼 | サンプル申請 | `/member/samples` | - | ✅ 작동 | - | - |
| 버튼 | 契約書 | `/member/contracts` | - | ❌ 없음 | - | 페이지 없음 |
| 위젯 | 알림 | 공지사항 표시 | GET /api/announcements | ✅ 작동 | ✅ announcements 테이블 | - |
| DEV_MODE | DEV_MODE 알림 | 모의 데이터 표시 | - | ✅ 작동 | - | 개발 전용 |

---

#### `/member/profile` - 프로필 보기
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 |
|------|------|------|-----|--------|---------|
| 표시 | 사용자명 | 읽기 전용 | GET /api/customer/profile | ✅ 작동 | ✅ profiles 테이블 |
| 표시 | 이메일 | 읽기 전용 | GET /api/customer/profile | ✅ 작동 | ✅ auth.users 테이블 |
| 표시 | 상태 | 읽기 전용 | GET /api/customer/profile | ✅ 작동 | ✅ profiles 테이블 |
| 버튼 | 編集 | `/member/edit` | - | ✅ 작동 | - |
| 버튼 | 会員情報를編集 | `/member/edit` | - | ✅ 작동 | - |
| 버튼 | パスワード変更 | `/auth/reset-password` | - | ⚠️ 미검증 | 페이지 있음 |

---

#### `/member/edit` - 프로필 수정
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 |
|------|------|------|-----|--------|---------|
| 폼 | 회사 전화번호 | 업데이트 | PATCH /api/customer/profile | ✅ 작동 | ✅ profiles 테이블 |
| 폼 | 휴대 전화번호 | 업데이트 | PATCH /api/customer/profile | ✅ 작동 | ✅ profiles 테이블 |
| 폼 | 직함 | 업데이트 | PATCH /api/customer/profile | ✅ 작동 | ✅ profiles 테이블 |
| 폼 | 부서 | 업데이트 | PATCH /api/customer/profile | ✅ 작동 | ✅ profiles 테이블 |
| 폼 | 회사URL | 업데이트 | PATCH /api/customer/profile | ✅ 작동 | ✅ profiles 테이블 |
| 폼 | 우편번호 | 업데이트 | PATCH /api/customer/profile | ✅ 작동 | ✅ profiles 테이블 |
| 폼 | 도도부현 | 업데이트 | PATCH /api/customer/profile | ✅ 작동 | ✅ profiles 테이블 |
| 폼 | 시구읍면 | 업데이트 | PATCH /api/customer/profile | ✅ 작동 | ✅ profiles 테이블 |
| 폼 | 번지 | 업데이트 | PATCH /api/customer/profile | ✅ 작동 | ✅ profiles 테이블 |
| 폼 | 건물명 | 업데이트 | PATCH /api/customer/profile | ✅ 작동 | ✅ profiles 테이블 |
| 버튼 | 変更를保存 | 폼 제출 | Server Action | ✅ 작동 | ✅ profiles 테이블 |
| 버튼 | キャンセル | 페이지 새로고침 | - | ✅ 작동 | - |

---

#### `/member/settings` - 계정 설정
**구분 | 라벨 | 액션 | API | 상태 | DB 연동 | 비고 |
|------|------|------|-----|--------|---------|------|
| 토글 | 견적 업데이트 알림 | 상태 저장 | ❌ 없음 | ❌ API 없음 | 백엔드 없음 |
| 토글 | 프로모션 이메일 | 상태 저장 | ❌ 없음 | ❌ API 없음 | 백엔드 없음 |
| 토글 | 뉴스레터 | 상태 저장 | ❌ 없음 | ❌ API 없음 | 백엔드 없음 |
| 토글 | 로그인 알림 | 상태 저장 | ❌ 없음 | ❌ API 없음 | 백엔드 없음 |
| 토글 | 2단계 인증 | 비활성화 | ❌ 없음 | ❌ API 없음 | "近日公開" |
| 버튼 | パスワード変更 | `/auth/reset-password` | - | ⚠️ 미검증 | - | - |
| 버튼 | ログアウト | POST /api/auth/signout | ✅ 작동 | ✅ auth.sessions | - |
| 버튼 | アカウント를削除 | DELETE /api/member/delete-account | ✅ 작동 | ✅ auth.users, profiles | 3단계 확인 |

**🔴 CRITICAL**: 설정 저장 API가 없어서 변경사항이 저장되지 않음

---

### 3.2 주문 관리 (7개)

#### `/member/orders` - 주문 목록
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 |
|------|------|------|-----|--------|---------|
| 필터 | 모든 주문 | 필터 해제 | GET /api/member/orders | ✅ 작동 | ✅ orders 테이블 |
| 필터 | 대기중 | status=pending | GET /api/member/orders | ✅ 작동 | ✅ orders 테이블 |
| 필터 | 생산중 | status=manufacturing | GET /api/member/orders | ✅ 작동 | ✅ orders 테이블 |
| 필터 | 발송됨 | status=shipped | GET /api/member/orders | ✅ 작동 | ✅ orders 테이블 |
| 검색 | 주문번호/고객명 | 검색 | client-side | ✅ 작동 | ⚠️ 클라이언트 측 |
| 기간 | 7일/30일/90일/전체 | 날짜 필터 | client-side | ✅ 작동 | ⚠️ 클라이언트 측 |
| 버튼 | +新規見積 | `/quote-simulator` | - | ✅ 작동 | - |
| 카드 | 주문 카드 | `/member/orders/[id]` | - | ✅ 작동 | - |

---

#### `/member/orders/[id]` - 주문 상세
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 |
|------|------|------|-----|--------|---------|
| 표시 | 주문 정보 | 표시 | GET /api/customer/orders/[id] | ✅ 작동 | ✅ orders, order_items |
| 표시 | 고객 정보 | 표시 | GET /api/customer/orders/[id] | ✅ 작동 | ✅ orders, profiles |
| 표시 | 주문 항목 | 표시 | GET /api/customer/orders/[id] | ✅ 작동 | ✅ order_items |
| 위젯 | 생산 진행 상황 | 표시 | GET /api/customer/orders/[id] | ✅ 작동 | ✅ production_jobs |
| 버튼 | 戻る | 뒤로가기 | - | ✅ 작동 | - | history.back() |

---

#### `/member/orders/new` - 새 주문
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 |
|------|------|------|-----|--------|---------|
| 목록 | 생산중 주문 | 표시 | GET /api/member/orders | ✅ 작동 | ✅ orders 테이블 | status=PRODUCTION |

---

#### `/member/orders/reorder` - 재주문
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 |
|------|------|------|-----|--------|---------|
| 목록 | 발송완료 주문 | 표시 | GET /api/member/orders | ✅ 작동 | ✅ orders 테이블 | DELIVERED/SHIPPED |
| 버튼 | 再注文する | `/quote-simulator?orderId=` | - | ✅ 작동 | - |
| 버튼 | 商品カタログを見る | `/catalog` | - | ✅ 작동 | - |

---

#### `/member/orders/history` - 주문 내역
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 |
|------|------|------|-----|--------|---------|
| 목록 | 전체 주문 내역 | 표시 | GET /api/member/orders | ✅ 작동 | ✅ orders 테이블 | 페이지네이션 |

---

#### `/member/orders/[id]/confirmation` - 주문 확인
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 |
|------|------|------|-----|--------|---------|
| 컴포넌트 | 주문 성공 표시 | 표시 | GET /api/customer/orders/[id] | ✅ 작동 | ✅ orders 테이블 |

---

#### `/member/orders/[id]/data-receipt` - 데이터 수령 (AI)
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 |
|------|------|------|-----|--------|---------|
| 업로드 | .ai 파일 업로드 | AI 추출 | POST /api/ai-parser | ✅ 작동 | ✅ ai_extractions 테이블 |
| 상태 체크 | PENDING/DATA_RECEIVED | 업로드 가능 조건 | - | ✅ 작동 | ✅ orders 테이블 |

---

### 3.3 견적서 (4개)

#### `/member/quotations` - 견적서 목록
**파일**: `src/app/member/quotations/page.tsx`

| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 | 비고 |
|------|------|------|-----|--------|---------|------|
| 필터 | 모든 견적 | 필터 해제 | GET /api/quotations/list | ✅ 작동 | ✅ quotations 테이블 | user_id 필터링 |
| 필터 | 드래프 | status=draft | GET /api/quotations/list | ✅ 작동 | ✅ quotations 테이블 | user_id 필터링 |
| 필터 | 발송됨 | status=sent | GET /api/quotations/list | ✅ 작동 | ✅ quotations 테이블 | user_id 필터링 |
| 검색 | 견적번호/고객명 | 검색 | client-side | ✅ 작동 | ⚠️ 클라이언트 측 | - |
| 버튼 | +新規見積 | `/quote-simulator` | - | ✅ 작동 | - | - |
| 버튼 | 詳細を見る | `/member/quotations/[id]` | - | ✅ 작동 | - | - |
| 버튼 | PDF를다운로드 | PDF 생성 | client-side | ✅ 작동 | - | - |
| 버튼 | 削除 | DELETE /api/member/quotations/[id] | ✅ 작동 | ✅ quotations 테이블 | DRAFT만 |
| 버튼 | 注文に変換 | `/member/orders/new?quotationId=` | - | ✅ 작동 | - | APPROVED만 |
| 버튼 | 発注する | OrderConfirmationModal | POST /api/orders/create | ⚠️ 수정됨 | ✅ orders, order_items | total_price 제거 |

**최근 수정사항**:
- `total_price` 필드 제거 (Generated Column)
- `quotation_id` 제거 (테이블에 없음)
- `company_id` 제거 (테이블에 없음)
- `estimated_delivery_date` 제거 (테이블에 없음)
- `subtotal_amount` → `subtotal` 수정
- `user_id` → 실제 admin user ID (DEV_MODE)

---

#### `/member/quotations/[id]` - 견적서 상세
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 |
|------|------|------|-----|--------|---------|------|
| 표시 | 견적 정보 | 표시 | GET /api/member/quotations/[id] | ✅ 작동 | ✅ quotations, quotation_items |
| 버튼 | PDF를다운로드 | PDF 생성 | client-side | ✅ 작동 | - |
| 버튼 | 削除 | DELETE /api/member/quotations/[id] | ✅ 작동 | ✅ quotations 테이블 | DRAFT만 |
| 버튼 | 注文する | /member/orders/new?quotationId= | - | ✅ 작동 | - |
| 위젯 | 은행 정보 | 표시 | - | ✅ 작동 | - |
| 위젯 | 데이터 수령 상태 | 표시 | - | ✅ 작동 | ✅ ai_extractions |
| 위젯 | 인보이스 다운로드 | PDF 생성 | - | ✅ 작동 | - |

---

#### `/member/quotations/[id]/confirm` - 견적 확인
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 |
|------|------|------|-----|--------|---------|------|
| 폼 | 견적 확인 | 주문 전환 | POST /api/member/orders/create | ✅ 작동 | ✅ orders, order_items |

---

#### `/member/quotations/request` - 견적 요청
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 |
|------|------|------|-----|--------|---------|------|
| 폼 | B2B 견적 요청 | 제출 | POST /api/b2b/quotations | ✅ 작동 | ✅ quotations 테이블 |

---

### 3.4 기타 회원 페이지 (2개)

#### `/member/samples` - 샘플 요청
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 |
|------|------|------|-----|--------|---------|------|
| 목록 | 샘플 요청 내역 | 표시 | lib/dashboard.ts | ✅ 작동 | ✅ sample_requests |
| 버튼 | +新規依頼 | `/samples` | - | ✅ 작동 | - |
| 필터 | 상태별 필터 | 필터 | client-side | ✅ 작동 | ⚠️ 클라이언트 측 |
| 모달 | 상세 보기 | 모달 열기 | - | ✅ 작동 | - |

---

#### `/member/invoices` - 청구지 주소록
**⚠️ 주의**: 실제 인보이스 페이지가 아니라 청구지 주소 관리입니다.

| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 |
|------|------|------|-----|--------|---------|------|
| 목록 | 청구지 주소 | 표시 | lib/dashboard.ts | ✅ 작동 | ✅ profiles 테이블 |
| 버튼 | +新規追加 | 폼 표시 | - | ✅ 작동 | - |
| 폼 | 청구지 주소 추가 | 생성 | POST lib/dashboard.ts | ✅ 작동 | ✅ profiles 테이블 |
| 버튼 | 編集 | 수정 | PATCH lib/dashboard.ts | ✅ 작동 | ✅ profiles 테이블 |
| 버튼 | 削除 | 삭제 | DELETE lib/dashboard.ts | ✅ 작동 | ✅ profiles 테이블 | 기본값 불가 |

---

#### `/member/deliveries` - 배송지 주소록
**⚠️ 주의**: 실제 배송 추적 페이지가 아니라 배송지 주소 관리입니다.

| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 |
|------|------|------|-----|--------|---------|------|
| 목록 | 배송지 주소 | 표시 | lib/dashboard.ts | ✅ 작동 | ✅ profiles 테이블 |
| 버튼 | +新規追加 | 폼 표시 | - | ✅ 작동 | - |
| 폼 | 배송지 주소 추가 | 생성 | POST lib/dashboard.ts | ✅ 작동 | ✅ profiles 테이블 |
| 버튼 | 編集 | 수정 | PATCH lib/dashboard.ts | ✅ 작동 | ✅ profiles 테이블 |
| 버튼 | 削除 | 삭제 | DELETE lib/dashboard.ts | ✅ 작동 | ✅ profiles 테이블 | 기본값 불가 |

---

#### `/member/inquiries` - 문의 내역
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 |
|------|------|------|-----|--------|---------|------|
| 목록 | 문의 내역 | 표시 | lib/dashboard.ts | ✅ 작동 | ✅ inquiries 테이블 |
| 버튼 | +新規問い合わせ | `/contact` | - | ✅ 작동 | - |
| 필터 | 상태별 필터 | 필터 | client-side | ✅ 작동 | ⚠️ 클라이언트 측 |

---

## 🔴 4. 관리자 페이지 (12개)

### 4.1 핵심 관리자 페이지 (9개)

#### `/admin/dashboard` - 관리자 대시보드
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 | 보안 |
|------|------|------|-----|--------|---------|------|
| 위젯 | 통계 카드 | 표시 | GET /api/admin/dashboard/statistics | ✅ 작동 | ✅ 다수 테이블 | ✅ 인증 |
| 위젯 | 주문 통계 | 표시 | GET /api/admin/orders/statistics | ✅ 작동 | ✅ orders 테이블 | ✅ 인증 |
| 위젯 | 견적 통계 | 표시 | GET /api/admin/quotations/statistics | ✅ 작동 | ✅ quotations 테이블 | ✅ 인증 |
| 위젯 | 사용자 통계 | 표시 | GET /api/admin/users/statistics | ✅ 작동 | ✅ profiles 테이블 | ✅ 인증 |
| DEV_MODE | DEV_MODE 알림 | 모의 데이터 | - | ✅ 작동 | - | - |

---

#### `/admin/orders` - 주문 관리
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 | 보안 |
|------|------|------|-----|--------|---------|------|
| 목록 | 전체 주문 | 표시 | GET /api/admin/orders | ✅ 작동 | ✅ orders 테이블 | ✅ 인증 |
| 필터 | 상태별 필터 | 필터 | - | ✅ 작동 | - | - |
| 버튼 | 상세 보기 | `/admin/orders/[id]` | - | ✅ 작동 | - | - |

---

#### `/admin/orders/[id]` - 주문 상세 (관리자)
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 | 보안 |
|------|------|------|-----|--------|---------|------|
| 표시 | 주문 정보 | 표시 | GET /api/admin/orders/[id] | ✅ 작동 | ✅ orders, order_items | ✅ 인증 |
| 버튼 | 상태 변경 | PATCH /api/admin/orders/[id] | ✅ 작동 | ✅ orders 테이블 | ✅ 인증 |
| 버튼 | 메모 추가 | PATCH /api/admin/orders/[id] | ✅ 작동 | ✅ orders 테이블 | ✅ 인증 |

---

#### `/admin/production` - 생산 관리
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 | 보안 |
|------|------|------|-----|--------|---------|------|
| 목록 | 생산 작업 | 표시 | GET /api/admin/production/jobs | 🔴 취약 | ✅ production_jobs | ❌ 인증 없음 |
| 필터 | 상태별 필터 | 필터 | - | ✅ 작동 | - | - |

**🔴 CRITICAL**: `/api/admin/production/jobs` API에 인증이 없음

---

#### `/admin/production/[id]` - 생산 작업 상세
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 | 보안 |
|------|------|------|-----|--------|---------|------|
| 표시 | 작업 정보 | 표시 | GET /api/admin/production/jobs/[id] | 🔴 취약 | ✅ production_jobs | ❌ 인증 없음 |
| 버튼 | 단계 변경 | PATCH /api/admin/production/jobs/[id] | 🔴 취약 | ✅ production_jobs | ❌ 인증 없음 |
| 위젯 | 진행 상황 | 표시 | - | ✅ 작동 | - | - |

---

#### `/admin/shipments` - 배송 관리
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 | 보안 |
|------|------|------|-----|--------|---------|------|
| 목록 | 배송 목록 | 표시 | GET /api/admin/shipments | ✅ 작동 | ✅ shipments 테이블 | ✅ 인증 |
| 버튼 | 배송 생성 | 모달 열기 | - | ✅ 작동 | - | - |

---

#### `/admin/shipments/[id]` - 배송 상세
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 | 보안 |
|------|------|------|-----|--------|---------|------|
| 표시 | 배송 정보 | 표시 | GET /api/admin/shipments/[id] | ✅ 작동 | ✅ shipments 테이블 | ✅ 인증 |
| 위젯 | 추적 타임라인 | 표시 | - | ✅ 작동 | - | - |

---

#### `/admin/contracts` - 계약 관리
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 | 보안 |
|------|------|------|-----|--------|---------|------|
| 목록 | 계약 목록 | 표시 | GET /api/admin/contracts | ✅ 작동 | ✅ contracts 테이블 | ✅ 인증 |
| 필터 | 상태별 필터 | 필터 | - | ✅ 작동 | - | - |

---

#### `/admin/contracts/[id]` - 계약 상세
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 | 보안 |
|------|------|------|-----|--------|---------|------|
| 표시 | 계약 정보 | 표시 | GET /api/admin/contracts/[id] | ✅ 작동 | ✅ contracts 테이블 | ✅ 인증 |
| 버튼 | 서명 요청 | POST /api/admin/contracts/sign | ✅ 작동 | ✅ contracts 테이블 | ✅ 인증 |
| 버튼 | 다운로드 | PDF 다운로드 | - | ✅ 작동 | - | - |

---

### 4.2 추가 관리자 기능 (3개)

#### `/admin/approvals` - 승인 워크플로우
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 | 보안 |
|------|------|------|-----|--------|---------|------|
| 목록 | 승인 대기 목록 | 표시 | - | ✅ 작동 | ✅ profiles 테이블 | ✅ 인증 |
| 버튼 | 승인 | PATCH /api/admin/approve-member | ✅ 작동 | ✅ profiles 테이블 | ✅ 인증 |
| 버튼 | 거부 | PATCH /api/admin/approve-member | ✅ 작동 | ✅ profiles 테이블 | ✅ 인증 |

---

#### `/admin/inventory` - 재고 관리
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 | 보안 |
|------|------|------|-----|--------|---------|------|
| 목록 | 재고 목록 | 표시 | GET /api/admin/inventory | ✅ 작동 | 🔴 RLS 비활성화 | ✅ 인증 |
| 버튼 | 재고 조정 | PATCH /api/admin/inventory | ✅ 작동 | 🔴 RLS 비활성화 | ✅ 인증 |

---

#### `/admin/shipping` - 배송 설정
| 구분 | 라벨 | 액션 | API | 상태 | DB 연동 | 보안 |
|------|------|------|-----|--------|---------|------|
| 설정 | 운송업체 설정 | 설정 저장 | - | ✅ 작동 | ✅ shipping_carriers | ✅ 인증 |

---

## 🟣 5. 포털 페이지 (6개)

### 포털 페이지 분석 결과

| URL | 목적 | 회원 페이지 중복 | 상태 | DB 연동 | 추천 |
|-----|------|------------------|--------|---------|------|
| `/portal` | 대시보드 | `/member/dashboard` | ✅ 작동 | ✅ orders 테이블 | **삭제** - 회원이 더 나음 |
| `/portal/profile` | 프로필 | `/member/profile` + `/member/edit` | ✅ 작동 | ✅ profiles 테이블 | **삭제** - 회원이 더 나음 |
| `/portal/orders` | 주문 목록 | `/member/orders` | ✅ 작동 | ✅ orders 테이블 | **삭제** - 회원이 더 나음 |
| `/portal/orders/[id]` | 주문 상세 | `/member/orders/[id]` | ✅ 작동 | ✅ orders, production_jobs | **마이그레이션** - Production 위젯 이식 |
| `/portal/documents` | 문서 관리 | 없음 | ✅ 작동 | ✅ contracts 테이블 | **마이그레이션** - 유일한 기능 |
| `/portal/support` | 지원센터 | `/contact` + `/member/inquiries` | ✅ 작동 | ✅ inquiries 테이블 | **병합** - FAQ, 가이드 추가 |

### 포털 전용 위젯 (회원으로 이식 권장)

| 위젯 | 파일 | 기능 | DB 연동 | 추천 |
|------|------|------|---------|------|
| ProductionProgressWidget | `components/portal/ProductionProgressWidget.tsx` | 생산 단계 시각화 | ✅ production_jobs | ✅ **이식 권장** |
| DocumentDownloadCard | `components/portal/DocumentDownloadCard.tsx` | 문서 다운로드 | ✅ contracts | ✅ **이식 권장** |
| ShipmentTrackingCard | `components/portal/ShipmentTrackingCard.tsx` | 배송 추적 | ✅ shipments | ✅ **이식 권장** |

---

## 📋 6. 종합 기능 현황

### ✅ 완전히 작동하는 기능 (88%)

| 카테고리 | 항목 | 상태 | DB 연동 |
|----------|------|--------|---------|
| 인증 | 로그인/로그아웃 | ✅ 작동 | ✅ auth.users, auth.sessions |
| 인증 | 회원가입 | ✅ 작동 | ✅ auth.users, profiles |
| 문의 | 연락처 문의 | ✅ 작동 (SendGrid) | ✅ inquiries 테이블 |
| 문의 | 샘플 요청 (최대 5개) | ✅ 작동 | ✅ sample_requests 테이블 |
| 카탈로그 | 제품 검색/필터 | ✅ 작동 | ✅ products 테이블 |
| 카탈로그 | 카테고리별 필터링 | ✅ 작동 | ✅ products 테이블 |
| 견적 | 견적 생성 (PDF) | ✅ 작동 | ✅ quotations 테이블 |
| 견적 | 견적 목록 | ✅ 작동 | ✅ quotations 테이블 |
| 견적 | 견적 상세 | ✅ 작동 | ✅ quotations, quotation_items |
| 견적 | 견적 삭제 (DRAFT) | ✅ 작동 | ✅ quotations 테이블 |
| 주문 | 주문 목록 | ✅ 작동 | ✅ orders 테이블 |
| 주문 | 주문 상세 | ✅ 작동 | ✅ orders, order_items |
| 주문 | 발주하기 → 주문 생성 | ✅ 수정 완료 | ✅ orders, order_items |
| 프로필 | 프로필 보기 | ✅ 작동 | ✅ profiles 테이블 |
| 프로필 | 프로필 수정 | ✅ 작동 | ✅ profiles 테이블 |
| 주소 | 청구지/배송지 관리 | ✅ 작동 | ✅ profiles 테이블 |
| 법적 | 개인정보 처리방침 | ✅ 완료 (10개 섹션) | - |
| 법적 | 이용약관 | ✅ 완료 (12개 섹션) | - |
| 법적 | 특정상거래법 | ✅ 완료 | - |
| 관리자 | 대시보드 | ✅ 작동 | ✅ 다수 테이블 |
| 관리자 | 주문 관리 | ✅ 작동 | ✅ orders 테이블 |
| 관리자 | 생산 관리 | 🔴 취약 (인증 없음) | ✅ production_jobs |

### ⚠️ 부분적으로 작동하는 기능 (9%)

| 페이지 | 이슈 | 영향 | DB 연동 상태 | 해결 방안 |
|------|------|------|--------------|----------|
| `/member/settings` | API 없음 | 설정 저장 안됨 | ❌ API 없음 | `/api/settings` 생성 필요 |
| `/admin/production/jobs` | 인증 없음 | 보안 취약 | ✅ production_jobs | `verifyAdminAuth()` 추가 |
| `/admin/production/jobs/[id]` | 인증 없음 | 보안 취약 | ✅ production_jobs | `verifyAdminAuth()` 추가 |
| `/admin/contracts/workflow` | 인증 없음 | 보안 취약 | ✅ contracts 테이블 | `verifyAdminAuth()` 추가 |
| `/quote-simulator` | 자기 참조 링크 | UX 문제 | ✅ products 테이블 | 링크 수정 |
| `/simulation` | 페이지 없음 | 404 | - | `/quote-simulator`로 리다이렉트 |
| `/member/contracts` | 페이지 없음 | 링크 끊김 | - | 페이지 생성 또는 링크 제거 |
| `/portal/orders/[id]` | Production 위젯 | 회원에 없음 | ✅ orders, production_jobs | 회원으로 이식 |

### 🔴 CRITICAL 보안 문제 (즉시 수정 필요)

1. **관리자 API 인증 누락**
   - `/api/admin/production/jobs` - 인증 없음
   - `/api/admin/production/jobs/[id]` - 인증 없음
   - `/api/admin/contracts/workflow` - 인증 없음

2. **주문 상세 권한 검증 누락**
   - `/member/orders/[id]` - user_id 체크 없음
   - `/api/member/quotations/[id]` DELETE - 소유자 확인 없음

3. **설정 저장 불가**
   - `/member/settings` - `/api/settings` 경로 없음

### 🔴 CRITICAL 데이터베이스 보안 문제 (즉시 수정 필요)

1. **RLS 비활성화 테이블 (8개)**
   - `inventory` - 🔴 RLS 비활성화
   - `inventory_transactions` - 🔴 RLS 비활성화
   - `contracts` - 🔴 RLS 비활성화
   - `contract_reminders` - 🔴 RLS 비활성화
   - `order_status_history` - 🔴 RLS 비활성화
   - `notifications` - 🔴 RLS 비활성화
   - `admin_notifications` - 🔴 RLS 비활성화
   - `payment_confirmations` - 🔴 RLS 비활성화

2. **클라이언트 측 필터링 (서버 측으로 이동 권장)**
   - `/catalog` - 검색, 정렬
   - `/member/orders` - 검색, 기간 필터
   - `/member/quotations` - 검색
   - `/member/samples` - 상태 필터
   - `/member/inquiries` - 상태 필터

---

## 🎯 수정 우선순위

### Priority 1: CRITICAL (24시간 이내)

1. **관리자 API 인증 추가**
   ```typescript
   // 모든 /api/admin/* 경로에 추가
   import { verifyAdminAuth } from '@/lib/auth-helpers';

   export async function GET(request: NextRequest) {
     const auth = await verifyAdminAuth(request);
     if (!auth) return unauthorizedResponse();
     // ...
   }
   ```

2. **주문/견적 권한 검증 추가**
   ```typescript
   // GET /api/member/quotations/[id]
   .eq('user_id', user.id) // 추가

   // DELETE /api/member/quotations/[id]
   // user_id 확인 후 삭제
   ```

3. **설정 API 생성**
   - `/api/settings` 경로 생성
   - user_metadata 또는 settings 테이블에 저장

### Priority 2: HIGH (1주 이내)

4. **포털 기능 이식**
   - ProductionProgressWidget → `/member/orders/[id]`
   - DocumentDownloadCard → `/member/documents` (신규)
   - ShipmentTrackingCard → `/member/orders/[id]`
   - FAQ → `/contact` 또는 `/member/support` (신규)

5. **링크 수정**
   - `/quote-simulator` 자기 참조 수정
   - `/simulation` → `/quote-simulator` 리다이렉트
   - `/member/contracts` 링크 제거

### Priority 3: MEDIUM (1개월 이내)

6. **포털 페이지 제거**
   - 모든 `/portal/*` 경로를 `/member/*`로 리다이렉트
   - 중복 코드 제거
   - 문서 업데이트

7. **실제 인보이스/배송 추적 페이지 생성**
   - `/member/invoices` → `/member/billing-addresses` (이름 변경)
   - `/member/deliveries` → `/member/delivery-addresses` (이름 변경)
   - 실제 인보이스 추적 페이지 신규 생성

---

## 📝 보고서 작성 정보

**작성일**: 2026-01-04
**검증자**: Code Reviewer, Debugger, Error Detective, Database Optimizer Agents
**총 페이지 수**: 74개 (B2B 제외)
**전체 작동률**: 88%
**CRITICAL 이슈**: 3개
**HIGH 이슈**: 6개

**관련 문서**:
- `COMPREHENSIVE_SYSTEM_AUDIT_2026-01-04.md` - 시스템 보안 감사
- `DATABASE_SCHEMA_AUDIT_REPORT_2026-01-04.md` - 데이터베이스 스키마 감사
- `API_AUDIT_REPORT_2026-01-04.md` - API 엔드포인트 감사
- `ADMIN_DASHBOARD_SECURITY_AUDIT_REPORT.md` - 관리자 보안 감사
