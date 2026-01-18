# Epackage Lab 비즈니스 기능 E2E 테스트 시나리오

## 문서 정보
- **작성일**: 2026-01-13
- **버전**: 1.0
- **테스트 환경**: http://localhost:3000
- **데이터베이스**: Supabase (실제 DB 사용)

## 테스트 계정 정보

### MEMBER 계정
- **이메일**: member@test.com
- **비밀번호**: Member1234!
- **대시보드**: /member/dashboard

### ADMIN 계정
- **이메일**: admin@example.com
- **비밀번호**: Admin1234!
- **대시보드**: /admin/dashboard

---

## 1. 발주 흐름 (Order Creation Flow)

### 1.1 견적 시뮬레이터 → 주문 전환

**테스트 목적**: 비회원 사용자가 견적 시뮬레이터를 통해 제품을 선택하고 견적을 생성한 후 주문으로 전환하는 전체 흐름 검증

**사전 조건**:
- 로그아웃 상태
- 견적 시뮬레이터 페이지 접근 가능

**테스트 단계**:

1. **견적 시뮬레이터 접근**
   - URL: `/quote-simulator`로 이동
   - 페이지가 정상적으로 로드되는지 확인
   - "統合見積もりシステム" 타이틀 표시 확인

2. **기본 정보 입력 (Step 1)**
   - 제품 유형 선택: スタンドパウチ (Stand-up Pouch)
   - 사이즈 선택: 중간 (150mm x 200mm)
   - 수량 입력: 1000
   - "次へ" 버튼 클릭

3. **재질 선택 (Step 2)**
   - 재질 유형: PET/AL/PE (多層フィルム) 선택
   - 두께 선택: 標準 (Standard)
   - "次へ" 버튼 클릭

4. **후가공 선택 (Step 3)**
   - 후가공 옵션 선택:
     - チャック付き (Zipper)
     - 底貼り (Bottom Seal)
   - "次へ" 버튼 클릭

5. **견적 결과 확인 (Step 4)**
   - 견적 가격이 표시되는지 확인
   - 상세 내역 확인:
     - 단가
     - 수량
     - 소계
     - 소비세 (10%)
     - 합계 금액
   - "見積を作成" 버튼 클릭

6. **견적 생성 (회원/비회원 선택)**
   - **A. 비회원으로 진행**:
     - 이름 입력: 테스트 사용자
     - 이메일 입력: test-quote-{timestamp}@testmail.cc
     - 전화번호: 090-1234-5678
     - "見積を作成してメール送信" 버튼 클릭

   - **B. 회원 로그인 후 진행**:
     - "ログインして見積を作成" 버튼 클릭
     - member@test.com / Member1234!로 로그인
     - 로그인 후 견적 정보 자동 입력 확인

7. **견적 확인**
   - "見積を受け付けました" 메시지 확인
   - 견적 번호 생성 확인 (예: QT-20260113-XXXX)
   - 견적 내역 이메일 수신 확인 (DEV_MODE: console 로그)

8. **주문으로 전환**
   - 견적 상세 페이지에서 "注文に変換" 버튼 클릭
   - 배송지 정보 입력:
     - 수령인 이름: 테스트
     - 연락처: 090-1234-5678
     - 주소: 〒100-0001 東京都千代田区千代田1-1-1
   - "注文を確定する" 버튼 클릭

9. **주문 확인**
   - "注文を受け付けました" 메시지 확인
   - 주문 번호 생성 확인 (예: ORD-20260113-XXXX)
   - 주문 상태: "pending" 확인

**예상 결과**:
- 견적 시뮬레이터 모든 단계 정상 작동
- 견적 생성 성공 및 DB 저장 확인
- 견적에서 주문 전환 성공
- 주문 상태 "pending"으로 정상 저장

**데이터베이스 검증**:
```sql
-- 견적 확인
SELECT * FROM quotations WHERE customer_email LIKE 'test-quote-%' ORDER BY created_at DESC LIMIT 1;

-- 주문 확인
SELECT * FROM orders WHERE quotation_number IN (SELECT quotation_number FROM quotations WHERE customer_email LIKE 'test-quote-%') ORDER BY created_at DESC LIMIT 1;
```

**정리 방법**:
```sql
-- 테스트 데이터 삭제
DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE quotation_number LIKE 'QT-20260113-%');
DELETE FROM orders WHERE quotation_number LIKE 'QT-20260113-%';
DELETE FROM quotations WHERE customer_email LIKE 'test-quote-%';
```

---

### 1.2 회원 주문 대시보드에서 주문 관리

**테스트 목적**: 회원이 주문 대시보드에서 주문 목록을 확인하고 필터링/검색 기능을 사용하는지 검증

**사전 조건**:
- member@test.com으로 로그인 상태
- 최소 1개 이상의 주문 존재

**테스트 단계**:

1. **주문 목록 페이지 접근**
   - URL: `/member/orders`로 이동
   - "注文一覧" 타이틀 확인
   - 주문 목록이 표시되는지 확인

2. **주문 필터링**
   - 상태 필터 테스트:
     - "すべて" (모든 주문)
     - "保留中" (대기 중)
     - "データ受領" (데이터 수령)
     - "製造中" (제조 중)
     - "発送済み" (발송 완료)
   - 각 필터 선택 후 해당 상태의 주문만 표시되는지 확인

3. **날짜 범위 필터**
   - "過去7日間" (최근 7일)
   - "過去30日間" (최근 30일)
   - "過去90日間" (최근 90일)
   - 날짜 범위 내의 주문만 표시되는지 확인

4. **검색 기능**
   - 주문 번호로 검색:
     - 특정 주문 번호 입력
     - 해당 주문만 표시되는지 확인
   - 견적 번호로 검색:
     - 특정 견적 번호 입력
     - 연결된 주문 표시되는지 확인

5. **정렬 기능**
   - "新しい順" (최신순) 선택
   - "古い順" (오래된순) 선택
   - "金額が高い順" (높은 금액순) 선택
   - "金額が低い順" (낮은 금액순) 선택
   - 정렬이 올바르게 적용되는지 확인

6. **주문 상세 보기**
   - 특정 주문의 "詳細を見る" 버튼 클릭
   - 주문 상세 페이지로 이동하는지 확인
   - 주문 정보, 제품 정보, 배송 정보 확인

**예상 결과**:
- 모든 필터가 정상 작동
- 검색 기능이 올바르게 동작
- 정렬이 올바르게 적용됨
- 주문 상세 페이지 정상 표시

**정리 방법**: 필요 없음 (기존 데이터 사용)

---

## 2. 고객 관리 흐름 (Customer Management Flow)

### 2.1 신규 회원가입 → 관리자 승인 → 로그인

**테스트 목적**: 신규 회원이 가입 신청을 하고 관리자가 승인/거부하는 전체 흐름 검증

**사전 조건**:
- 로그아웃 상태
- 관리자 계정 존재 (admin@example.com)

**테스트 단계**:

#### 2.1.1 신규 회원가입

1. **회원가입 페이지 접근**
   - URL: `/auth/register`로 이동
   - "会員登録" 타이틀 확인

2. **기본 정보 입력**
   - 이메일: test-new-member-{timestamp}@testmail.cc
   - 비밀번호: NewMember123!
   - 비밀번호 확인: NewMember123!
   - "次へ" 버튼 클릭

3. **개인 정보 입력**
   - 성(漢字): 테スト
   - 이름(漢字): ユーザー
   - 성(カタカナ): テスト
   - 이름(カタカナ): ユーザー
   - 전화번호: 080-1234-5678
   - "次へ" 버튼 클릭

4. **회원 유형 선택**
   - 유형: "法人会員" (법인 회원) 선택
   - "次へ" 버튼 클릭

5. **회사 정보 입력**
   - 회사명: テスト株式会社
   - 법인 유형: 株式会社
   - 법인 번호: 1234567890123
   - 설립년도: 2020
   - 자본금: 1,000万円
   - 대표자명: テスト代表
   - 담당자 직책: 部長
   - 부서: 営業部
   - 업종: その他
   - "次へ" 버튼 클릭

6. **주소 정보 입력**
   - 우편번호: 1000001
   - 도도부현: 東京都
   - 시구군: 千代田区
   - 번지: 千代田1-1-1
   - 건물명: テストビル10F
   - "次へ" 버튼 클릭

7. **약관 동의 및 가입 신청**
   - 이용약관 동의 체크
   - 개인정보 처리방침 동의 체크
   - "会員登録を申請する" 버튼 클릭

8. **가입 신청 완료 확인**
   - "会員登録を申請しました" 메시지 확인
   - "承認までお待ちください" (승인까지 기다려주세요) 메시지 확인

**예상 결과**:
- 가입 신청이 완료됨
- 회원 상태: "PENDING" (승인 대기)
- 관리자 승인 전 로그인 불가

#### 2.1.2 관리자 승인

1. **관리자 로그인**
   - URL: `/auth/signin`으로 이동
   - admin@example.com / Admin1234!로 로그인

2. **승인 대기 목록 접근**
   - URL: `/admin/approvals`로 이동
   - "会員承認待ち" 타이틀 확인

3. **대기 회원 확인**
   - 방금 가입한 회원이 목록에 표시되는지 확인
   - 상태: "承認待ち" (승인 대기)
   - 회원 정보 확인:
     - 이메일: test-new-member-{timestamp}@testmail.cc
     - 회사명: テスト株式会社
     - 법인 번호: 1234567890123
     - 담당자: テスト ユーザー

4. **회원 승인**
   - "承認" 버튼 클릭
   - "会員を承認しました" 메시지 확인
   - 목록에서 회원이 사라지는지 확인

**예상 결과**:
- 회원이 승인됨
- 회원 상태: "ACTIVE"
- 승인된 회원으로 로그인 가능

#### 2.1.3 승인 후 로그인 확인

1. **로그아웃**
   - 관리자 로그아웃

2. **승인된 회원으로 로그인**
   - URL: `/auth/signin`으로 이동
   - test-new-member-{timestamp}@testmail.cc / NewMember123!로 로그인

3. **회원 대시보드 확인**
   - URL: `/member/dashboard`로 자동 이동
   - "ようこそ" 메시지 확인
   - 회원 정보 표시 확인

**예상 결과**:
- 승인된 회원이 정상적으로 로그인됨
- 회원 대시보드 접근 가능

**데이터베이스 검증**:
```sql
-- 회원 상태 확인
SELECT id, email, user_type, status, created_at
FROM profiles
WHERE email LIKE 'test-new-member-%'
ORDER BY created_at DESC
LIMIT 1;
```

**정리 방법**:
```sql
-- 테스트 회원 삭제
DELETE FROM profiles WHERE email LIKE 'test-new-member-%';
-- 사용자 인증 정보 삭제 (Supabase Auth)
-- admin.supabase.com에서 수동 삭제 필요
```

---

### 2.2 회원 거부 테스트

**테스트 목적**: 관리자가 회원가입을 거부하는 시나리오 검증

**테스트 단계**:

1. **2.1.1 절차대로 회원가입 신청** (다른 이메일 사용)

2. **관리자 로그인 후 거부 처리**
   - URL: `/admin/approvals`로 이동
   - 방금 가입한 회원 찾기
   - "拒否" 버튼 클릭

3. **거부 사유 입력**
   - 거부 사유 입력: "테스트 거부입니다"
   - "拒否する" 버튼 클릭
   - "会員を拒否しました" 메시지 확인

4. **거부된 회원 로그인 시도**
   - 거부된 계정으로 로그인 시도
   - 로그인 실패 메시지 확인: "承認されていないアカウントです" 또는 "회원 승인이 필요합니다"

**예상 결과**:
- 회원이 거부됨
- 회원 상태: "DELETED" 또는 "REJECTED"
- 거부된 계정으로 로그인 불가

**데이터베이스 검증**:
```sql
-- 거부된 회원 확인
SELECT id, email, status FROM profiles WHERE email LIKE 'test-new-member-%' AND status = 'DELETED';
```

---

## 3. 견적 요청 흐름 (Quotation Request Flow)

### 3.1 회원 견적 요청 → 관리자 승인

**테스트 목적**: 회원이 견적을 요청하고 관리자가 검토/승인하는 흐름 검증

**사전 조건**:
- member@test.com으로 로그인 상태

**테스트 단계**:

#### 3.1.1 견적 요청

1. **견적 요청 페이지 접근**
   - URL: `/member/quotations/request`로 이동
   - "見積依頼" 타이틀 확인

2. **견적 정보 입력**
   - 제품 유형: スタンドパウチ
   - 사이즈: 200mm x 300mm
   - 수량: 5000
   - 재질: PET/AL/PE
   - 희망 납기: 2026-02-01
   - 특이사항: テスト用見積依頼です

3. **견적 요청 제출**
   - "見積依頼を送信" 버튼 클릭
   - "見積依頼を受け付けました" 메시지 확인

**예상 결과**:
- 견적 요청이 생성됨
- 상태: "draft" 또는 "pending"
- 관리자에게 알림 전송

#### 3.1.2 관리자 검토 및 승인

1. **관리자 로그인**
   - admin@example.com / Admin1234!로 로그인

2. **견적 관리 페이지 접근**
   - URL: `/admin/quotations`로 이동
   - 방금 요청한 견적이 목록에 표시되는지 확인

3. **견적 상세 보기**
   - 견적 클릭하여 상세 정보 확인
   - 고객 정보, 제품 사양, 수량 확인

4. **견적 금액 계산**
   - 단가 입력: 150円
   - 수량: 5000
   - 합계 자동 계산: 750,000円
   - 소비세 (10%): 75,000円
   - 총액: 825,000円

5. **견적 승인 및 전송**
   - "見積を承認して送信" 버튼 클릭
   - PDF 견적서 생성 확인
   - "見積を送信しました" 메시지 확인

**예상 결과**:
- 견적이 승인됨
- 상태: "approved" 또는 "sent"
- 견적서 PDF 생성됨
- 고객에게 이메일 전송됨

#### 3.1.3 회원 견적 확인

1. **회원으로 로그인**
   - member@test.com으로 다시 로그인

2. **견적 목록 확인**
   - URL: `/member/quotations`로 이동
   - 승인된 견적이 표시되는지 확인
   - 상태: "承認済み" (승인 완료)

3. **견적 상세 보기**
   - 견적 클릭하여 상세 확인
   - 견적서 PDF 다운로드 가능한지 확인
   - "注文に変換" 버튼 표시 확인

**데이터베이스 검증**:
```sql
-- 견적 확인
SELECT * FROM quotations
WHERE user_id = (SELECT id FROM profiles WHERE email = 'member@test.com')
ORDER BY created_at DESC
LIMIT 1;
```

**정리 방법**:
```sql
-- 테스트 견적 삭제
DELETE FROM quotations WHERE user_id = (SELECT id FROM profiles WHERE email = 'member@test.com') AND notes LIKE '%テスト用%';
```

---

## 4. 샘플 요청 흐름 (Sample Request Flow)

### 4.1 비회원 샘플 요청

**테스트 목적**: 비회원이 최대 5개의 샘플을 요청하는 전체 흐름 검증

**사전 조건**:
- 로그아웃 상태

**테스트 단계**:

1. **샘플 요청 페이지 접근**
   - URL: `/samples`로 이동
   - "パウチサンプルご依頼" 타이틀 확인

2. **고객 정보 입력**
   - 성(漢字): テスト
   - 이름(漢字): 顧客
   - 성(カタカナ): テスト
   - 이름(カタカナ): コキャク
   - 회사명: テスト会社
   - 이메일: test-sample-{timestamp}@testmail.cc
   - 전화번호: 090-9876-5432
   - FAX: 03-1234-5678 (선택)

3. **배송지 정보 입력**
   - 배송 유형: "一般配送" (일반 배송)
   - 수령인: テスト 顧客
   - 연락처: 090-9876-5432
   - 우편번호: 1500001
   - 주소: 東京都渋谷区神宮前1-2-3

4. **샘플 선택 (최대 5개)**
   - 샘플 1: スタンドパウチ (透明) x 1
   - 샘플 2: スタンドパウチ (アルミバリア) x 1
   - 샘플 3: ピローパウチ (透明) x 1
   - 샘플 4: ピローパウチ (アルミバリア) x 1
   - 샘플 5: ガゼットパウチ (透明) x 1

5. **문의 내용 입력**
   - 메시지: サンプル請求テストです。10文字以上入力しています。品質確認のためお送りください。よろしくお願いいたします。

6. **동의 및 제출**
   - 개인정보 처리방침 동의 체크
   - "サンプルを請求する" 버튼 클릭

7. **요청 완료 확인**
   - "サンプルリクエストを受け付けました" 메시지 확인
   - "確認メールをお送りしました" 메시지 확인
   - 요청 번호 생성 확인 (예: SMP-XXXXXXXX-XXXX)

**예상 결과**:
- 샘플 요청이 성공적으로 생성됨
- 상태: "pending"
- 최대 5개 샘플 요청 가능
- 이메일 확인 전송됨 (DEV_MODE: console 로그)

**데이터베이스 검증**:
```sql
-- 샘플 요청 확인
SELECT sr.*, si.product_name, si.quantity
FROM sample_requests sr
LEFT JOIN sample_items si ON sr.id = si.sample_request_id
WHERE sr.request_id LIKE 'SMP-%'
ORDER BY sr.created_at DESC
LIMIT 5;
```

**정리 방법**:
```sql
-- 테스트 샘플 요청 삭제
DELETE FROM sample_items WHERE sample_request_id IN (
  SELECT id FROM sample_requests WHERE request_id LIKE 'SMP-%'
);
DELETE FROM sample_requests WHERE request_id LIKE 'SMP-%';
```

---

### 4.2 회원 샘플 요청 (자동 정보 입력)

**테스트 목적**: 회원이 샘플 요청 시 자동으로 회원 정보가 입력되는지 검증

**사전 조건**:
- member@test.com으로 로그인 상태

**테스트 단계**:

1. **로그인 상태 확인**
   - member@test.com으로 로그인

2. **샘플 요청 페이지 접근**
   - URL: `/samples`로 이동

3. **자동 입력된 정보 확인**
   - 이름: 회원 프로필 정보 자동 입력됨
   - 회사명: 회원 프로필 정보 자동 입력됨
   - 이메일: 회원 이메일 자동 입력됨
   - 전화번호: 회원 전화번호 자동 입력됨
   - 주소: 회사 주소 자동 입력됨 (필요시)

4. **샘플 선택 및 제출**
   - 3개 샘플 선택
   - 메시지 입력
   - 동의 체크
   - "サンプルを請求する" 버튼 클릭

5. **요청 완료 확인**
   - 성공 메시지 확인

**예상 결과**:
- 회원 정보가 자동으로 입력됨
- 수정 가능해야 함
- 샘플 요청 성공

---

### 4.3 관리자 샘플 요청 확인

**테스트 목적**: 관리자가 샘플 요청을 확인하고 처리하는지 검증

**사전 조건**:
- admin@example.com으로 로그인
- 샘플 요청 1개 이상 존재

**테스트 단계**:

1. **관리자 로그인**
   - admin@example.com / Admin1234!로 로그인

2. **샘플 요청 목록 접근**
   - URL: `/admin/samples`로 이동 (또는 리드/문의 관리 페이지)
   - 샘플 요청 목록 표시 확인

3. **샘플 요청 상세 보기**
   - 특정 요청 클릭
   - 요청 정보 확인:
     - 고객 정보
     - 샘플 목록
     - 배송지 정보
     - 문의 내용

4. **샘플 발송 처리**
   - 상태 변경: "pending" → "processing" → "shipped"
   - 송장 번호 입력: 123456789012
   - 배송업체: ヤマト運輸
   - "発送を完了" 버튼 클릭

5. **발송 완료 확인**
   - "発送を完了しました" 메시지 확인
   - 상태: "shipped"로 변경됨

**데이터베이스 검증**:
```sql
-- 샘플 요청 상태 확인
SELECT * FROM sample_requests WHERE status = 'shipped' ORDER BY updated_at DESC LIMIT 1;
```

---

## 5. 생산 관리 흐름 (Production Management Flow)

### 5.1 주문 생산 상태 관리

**테스트 목적**: 관리자가 주문의 생산 상태를 관리하고 진행률을 업데이트하는지 검증

**사전 조건**:
- admin@example.com으로 로그인
- "pending" 또는 "processing" 상태의 주문 1개 이상 존재

**테스트 단계**:

1. **생산 관리 페이지 접근**
   - URL: `/admin/production`로 이동
   - "生産管理" 타이틀 확인

2. **생산 작업 목록 확인**
   - 진행 중인 주문 목록 표시
   - 각 주문의 현재 상태 확인:
     - データ受領 (데이터 수령)
     - 処理中 (처리 중)
     - 製造中 (제조 중)
     - 品質検査 (품질 검사)
     - 入庫待 (입고 대기)

3. **생산 상태 변경**
   - 특정 주문 선택
   - 현재 상태: "pending" → "data_received"로 변경
   - "ステータスを更新" 버튼 클릭

4. **진행률 업데이트**
   - 진행률 입력: 25%
   - 코멘트 입력: データを受領しました
   - "進捗を更新" 버튼 클릭

5. **상태 변경 확인**
   - 상태: "データ受領"로 변경됨
   - 진행률: 25% 표시
   - 타임라인에 업데이트 기록 확인

6. **다음 단계로 진행**
   - 상태: "processing"으로 변경
   - 진행률: 50%
   - 상태: "manufacturing"으로 변경
   - 진행률: 75%
   - 상태: "quality_check"로 변경
   - 진행률: 90%

7. **생산 완료**
   - 상태: "stock_in" (입고 완료)로 변경
   - 진행률: 100%
   - "生産完了" 메시지 확인

**예상 결과**:
- 상태 변경이 정상적으로 저장됨
- 진행률이 올바르게 업데이트됨
- 타임라인에 모든 변경 기록이 표시됨
- 고객에게 알림 전송됨 (이메일/대시보드)

**데이터베이스 검증**:
```sql
-- 생산 작업 상태 확인
SELECT * FROM production_jobs
ORDER BY updated_at DESC
LIMIT 1;

-- 주문 상태 확인
SELECT id, order_number, status, progress_percentage
FROM orders
WHERE status IN ('processing', 'manufacturing', 'quality_check', 'stock_in')
ORDER BY updated_at DESC
LIMIT 1;
```

**정리 방법**:
```sql
-- 테스트 생산 작업 상태 복원
UPDATE orders SET status = 'pending', progress_percentage = 0 WHERE id = 'test-order-id';
```

---

## 6. 배송 관리 흐름 (Shipping Management Flow)

### 6.1 출하 처리 및 배송 추적

**테스트 목적**: 관리자가 출하를 처리하고 배송 추적 번호를 등록하는지 검증

**사전 조건**:
- admin@example.com으로 로그인
- "stock_in" (입고 완료) 상태의 주문 1개 이상 존재

**테스트 단계**:

1. **출하 관리 페이지 접근**
   - URL: `/admin/shipping`로 이동
   - "出荷管理" 타이틀 확인

2. **출하 대상 목록 확인**
   - 입고 완료된 주문 목록 표시
   - "出荷待ち" (출하 대기) 상태 주문 확인

3. **출하 처리**
   - 특정 주문의 "出荷処理" 버튼 클릭
   - 출하 모달 표시 확인

4. **배송 정보 입력**
   - 배송업체: ヤマト運輸 (Yamato Transport)
   - 송장 번호: 123456789012
   - 배송 서비스: クール宅急便
   - 예정 배송일: 2026-01-20
   - 포장 개수: 1
   - 무게: 5kg

5. **송장 파일 업로드** (선택)
   - 송장 PDF 파일 업로드
   - 파일 업로드 성공 확인

6. **출하 완료**
   - "出荷を完了" 버튼 클릭
   - "出荷を完了しました" 메시지 확인

7. **배송 상태 확인**
   - 주문 상태: "shipped"로 변경됨
   - 배송 추적 번호 표시됨
   - 배송업체 표시됨

**예상 결과**:
- 출하 정보가 정상적으로 저장됨
- 송장 번호가 등록됨
- 주문 상태가 "shipped"로 변경됨
- 고객에게 배송 알림 전송됨
- 배송 추적이 가능해짐

**데이터베이스 검증**:
```sql
-- 배송 정보 확인
SELECT s.*, o.order_number
FROM shipments s
JOIN orders o ON s.order_id = o.id
WHERE s.tracking_number = '123456789012';

-- 주문 상태 확인
SELECT id, order_number, status
FROM orders
WHERE status = 'shipped'
ORDER BY updated_at DESC
LIMIT 1;
```

**정리 방법**:
```sql
-- 테스트 배송 정보 삭제
DELETE FROM shipments WHERE tracking_number = '123456789012';
UPDATE orders SET status = 'stock_in' WHERE id = 'test-order-id';
```

---

### 6.2 배송 추적 및 완료

**테스트 목적**: 고객이 주문의 배송 추적 정보를 확인하고 배송 완료 처리가 되는지 검증

**사전 조건**:
- member@test.com으로 로그인
- "shipped" 상태의 주문 1개 이상 존재

**테스트 단계**:

1. **회원 주문 목록 접근**
   - URL: `/member/orders`로 이동

2. **배송 중인 주문 확인**
   - 상태: "発送済み" (발송 완료)인 주문 찾기
   - 배송업체 및 송장 번호 표시 확인

3. **주문 상세 보기**
   - 주문 클릭하여 상세 페이지로 이동
   - 배송 추적 섹션 확인:
     - 배송업체: ヤマト運輸
     - 송장 번호: 123456789012
     - 배송 추적 버튼/링크

4. **배송 추적 링크 클릭** (선택)
   - 배송업체 추적 페이지로 새 탭에서 열리는지 확인
   - 또는 모달에서 추적 정보 표시

**관리자 배송 완료 처리**:

5. **관리자 로그인**
   - admin@example.com으로 로그인

6. **배송 완료 처리**
   - URL: `/admin/shipping`로 이동
   - 배송 중인 주문 찾기
   - "配達を完了" 버튼 클릭
   - 실제 배송 완료 일자: 2026-01-20
   - "配達を完了しました" 메시지 확인

7. **배송 완료 확인**
   - 주문 상태: "delivered"로 변경됨
   - 타임라인에 배송 완료 기록 추가

**회원 배송 완료 확인**:

8. **회원으로 다시 로그인**
   - member@test.com으로 로그인

9. **배송 완료 확인**
   - URL: `/member/orders`로 이동
   - 주문 상태: "配達済み" (배송 완료) 확인
   - 완료 날짜 표시 확인

**예상 결과**:
- 고객이 배송 추적 정보를 확인할 수 있음
- 관리자가 배송 완료 처리 가능
- 주문 상태가 "delivered"로 변경됨
- 배송 완료 알림 전송됨

**데이터베이스 검증**:
```sql
-- 배송 완료 확인
SELECT o.order_number, o.status, s.carrier_name, s.tracking_number, s.delivered_at
FROM orders o
LEFT JOIN shipments s ON o.id = s.order_id
WHERE o.status = 'delivered'
ORDER BY o.updated_at DESC
LIMIT 1;
```

---

## 7. 데이터 영수증(Data Receipt) 흐름

### 7.1 고객 데이터 입稿 → AI 추출 → 관리자 승인

**테스트 목적**: 고객이 디자인 파일을 업로드하고 AI가 자동으로 추출한 후 관리자가 승인하는 흐름 검증

**사전 조건**:
- member@test.com으로 로그인
- "data_received" 상태가 될 주문 1개 이상 존재

**테스트 단계**:

#### 7.1.1 고객 데이터 입稿

1. **주문 상세 페이지 접근**
   - URL: `/member/orders/{order-id}`로 이동
   - 주문 상태: "データ受領待ち" (데이터 수령 대기) 확인

2. **데이터 업로드 섹션 확인**
   - "データ入稿" (데이터 입고) 섹션 표시 확인
   - 지원 파일 형식 안내: AI, PDF, PSD, CDR 등

3. **파일 업로드**
   - "ファイルを選択" 버튼 클릭
   - 테스트 파일 선택 (예: design-test.ai)
   - 파일 업로드 진행률 표시 확인

4. **업로드 완료**
   - "ファイルをアップロードしました" 메시지 확인
   - 파일명 표시: design-test.ai
   - 업로드 일시 표시

5. **AI 추출 대기**
   - "AI抽出中..." 메시지 표시
   - 추출 진행률 표시

**예상 결과**:
- 파일이 성공적으로 업로드됨
- AI 추출이 시작됨
- 추출 결과가 준비될 때까지 대기

#### 7.1.2 AI 추출 결과 확인

6. **추출 완료 알림**
   - "AI抽出が完了しました" 메시지
   - "抽出結果を確認してください" 알림

7. **추출 결과 보기**
   - "抽出結果を表示" 버튼 클릭
   - 추출된 데이터 표시:
     - 제품 사이즈
     - 재질 정보
     - 후가공 옵션
     - 디자인 요소
     - 특이사항

8. **결과 승인 또는 수정**
   - 추출 결과가 정확하면 "承認" 버튼 클릭
   - 오류가 있으면 "修正を依頼" 버튼 클릭

**예상 결과**:
- AI 추출이 성공적으로 완료됨
- 추출 결과가 표시됨
- 고객이 승인/수정 요청 가능

#### 7.1.3 관리자 검토

9. **관리자 로그인**
   - admin@example.com으로 로그인

10. **AI 추출 관리 페이지 접근**
    - URL: `/admin/ai-extraction`로 이동
    - 추출 대기 목록 표시

11. **추출 결과 검토**
    - 특정 주문 클릭
    - AI 추출 결과와 원본 파일 비교
    - 추출 정확도 확인

12. **승인 또는 수정 요청**
    - 결과가 정확하면 "承認" 버튼 클릭
    - 수정 필요시 "修正を依頼" 버튼 클릭
    - 수정 사유 입력

**예상 결과**:
- 관리자가 추출 결과를 검토할 수 있음
- 승인/수정 요청이 가능함
- 고객에게 알림 전송됨

**데이터베이스 검증**:
```sql
-- 데이터 영수증 확인
SELECT * FROM data_receipts
WHERE order_id = 'test-order-id'
ORDER BY created_at DESC
LIMIT 1;

-- AI 추출 결과 확인
SELECT * FROM ai_extraction_results
WHERE data_receipt_id IN (SELECT id FROM data_receipts WHERE order_id = 'test-order-id')
ORDER BY created_at DESC
LIMIT 1;
```

**정리 방법**:
```sql
-- 테스트 데이터 삭제
DELETE FROM ai_extraction_results WHERE data_receipt_id IN (
  SELECT id FROM data_receipts WHERE order_id = 'test-order-id'
);
DELETE FROM data_receipts WHERE order_id = 'test-order-id';
```

---

## 8. 재주문(Reorder) 흐름

### 8.1 기존 주문 재주문

**테스트 목적**: 고객이 기존 주문을 기반으로 재주문하는지 검증

**사전 조건**:
- member@test.com으로 로그인
- 이전 주문 1개 이상 존재

**테스트 단계**:

1. **주문 목록 접근**
   - URL: `/member/orders`로 이동
   - 주문 목록 표시 확인

2. **재주문할 주문 선택**
   - 특정 주문 찾기
   - "再注文" 버튼 클릭

3. **재주문 확인 모달**
   - 모달 표시: "この注文を再注文しますか？"
   - 주문 내역 표시:
     - 제품명
     - 수량
     - 금액
   - 배송지 정보 표시 (기존과 동일)

4. **배송지 수정** (선택)
   - "配送先を変更" 체크
   - 새로운 배송지 입력:
     - 수령인: テスト 新配送先
     - 주소: 〒1500002 東京都渋谷区渋谷1-1-1

5. **재주문 확정**
   - "再注文を確定" 버튼 클릭
   - "再注文を受け付けました" 메시지 확인

6. **새 주문 확인**
   - 새 주문 번호 생성 확인
   - 주문 상태: "pending"
   - 기존 주문 정보가 복사되었는지 확인

**예상 결과**:
- 재주문이 성공적으로 생성됨
- 기존 주문 정보가 복사됨
- 새 주문 번호가 부여됨
- 배송지 수정 가능

**데이터베이스 검증**:
```sql
-- 재주문 확인
SELECT * FROM orders
WHERE user_id = (SELECT id FROM profiles WHERE email = 'member@test.com')
ORDER BY created_at DESC
LIMIT 2;
-- 2개의 주문이 동일한 내용인지 확인
```

**정리 방법**:
```sql
-- 테스트 재주문 삭제
DELETE FROM order_items WHERE order_id IN (
  SELECT id FROM orders WHERE order_number LIKE 'ORD-20260113-%'
);
DELETE FROM orders WHERE order_number LIKE 'ORD-20260113-%';
```

---

## 9. 통합 테스트 시나리오

### 9.1 완전한 주문 생애주기 (End-to-End)

**테스트 목적**: 단일 주문이 견적 생성부터 배송 완료까지의 전체 생애주차를 검증

**사전 조건**:
- 모든 시스템 정상 작동
- 테스트 계정 존재

**테스트 단계** (순서대로 실행):

1. **회원가입 → 승인** (선택, 기존 회원 사용 가능)
2. **견적 시뮬레이터 → 견적 생성**
3. **견적 → 주문 전환**
4. **주문 접수 (pending)**
5. **데이터 입고 (data_received)**
6. **AI 추출 및 승인**
7. **작업 지시서 생성**
8. **제조 시작 (manufacturing)**
9. **품질 검사 (quality_check)**
10. **입고 완료 (stock_in)**
11. **출하 처리 (shipped)**
12. **배송 추적**
13. **배송 완료 (delivered)**

**각 단계별 검증 포인트**:
- 상태 변경 정확성
- 이메일 알림 전송
- 타임라인 기록
- 진행률 업데이트
- 고객 대시보드 반영

**예상 결과**:
- 모든 단계가 순차적으로 완료됨
- 상태 변경이 올바르게 저장됨
- 모든 알림이 전송됨
- 최종적으로 "delivered" 상태가 됨

**전체 데이터베이스 검증**:
```sql
-- 전체 주정 흐름 확인
SELECT
  o.order_number,
  o.status,
  o.progress_percentage,
  o.created_at,
  o.updated_at,
  json_agg(
    json_build_object(
      'status', oh.new_status,
      'updated_at', oh.created_at,
      'note', oh.notes
    ) ORDER BY oh.created_at
  ) as status_history
FROM orders o
LEFT JOIN order_history oh ON o.id = oh.order_id
WHERE o.order_number = 'TEST-ORDER-001'
GROUP BY o.id;
```

---

## 10. 에러 핸들링 테스트

### 10.1 유효성 검사 테스트

**테스트 목적**: 각 입력 폼의 유효성 검사가 올바르게 동작하는지 검증

**테스트 케이스**:

#### 10.1.1 견적 시뮬레이터
- 수량에 음수 입력
- 사이즈 범위 초과
- 필수 필드 미입력
- 잘못된 이메일 형식

#### 10.1.2 샘플 요청
- 6개 이상 샘플 선택
- 메시지 10자 미만
- 개인정보 동의 미체크
- 잘못된 전화번호 형식

#### 10.1.3 회원가입
- 비밀번호 불일치
- 필수 필드 미입력
- 중복 이메일
- 약관 미동의

**예상 결과**:
- 각 경우에 적절한 에러 메시지 표시
- 제출 불가능해야 함
- 에러 발생 시 입력값 유지

---

### 10.2 권한 테스트

**테스트 목적**: 페이지 접근 권한이 올바르게 제어되는지 검증

**테스트 케이스**:

1. **비회원이 회원 전용 페이지 접근**
   - `/member/dashboard` → 로그인 페이지로 리다이렉트
   - `/member/orders` → 로그인 페이지로 리다이렉트
   - `/member/quotations` → 로그인 페이지로 리다이렉트

2. **회원이 관리자 페이지 접근**
   - `/admin/dashboard` → 403 Forbidden 또는 홈으로 리다이렉트
   - `/admin/orders` → 접근 거부
   - `/admin/approvals` → 접근 거부

3. **미승인 회원이 회원 기능 사용**
   - 로그인 가능하지만 대시보드 접근 제한
   - "承認をお待ちください" 메시지 표시

**예상 결과**:
- 권한 없는 페이지 접근 시 적절한 처리
- 리다이렉트 또는 에러 메시지 표시

---

## 11. 성능 테스트

### 11.1 대량 데이터 처리

**테스트 목적**: 대량의 주문/견적/샘플이 존재할 때의 성능 검증

**테스트 단계**:

1. **테스트 데이터 생성** (DB에 직접 삽입)
   - 100개의 주문 생성
   - 50개의 견적 생성
   - 30개의 샘플 요청 생성

2. **목록 페이지 로드**
   - 주문 목록 페이지 로드 시간 측정
   - 필터링 응답 시간 측정
   - 검색 응답 시간 측정

3. **상세 페이지 로드**
   - 대량의 항목이 있는 주문 상세 페이지 로드
   - 타임라인 렌더링 시간 측정

**예상 결과**:
- 페이지 로드 시간 < 3초
- 필터링 응답 < 1초
- 검색 응답 < 1초

---

## 테스트 실행 가이드

### Prerequisites
- Node.js 18+ 설치
- Playwright 설치: `npm install -D @playwright/test`
- 브라우저 설치: `npx playwright install`

### 환경 설정
```bash
# .env.local 파일 확인
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 테스트 실행
```bash
# 개발 서버 시작 (별도 터미널)
npm run dev

# 모든 E2E 테스트 실행
npm run test:e2e

# 특정 테스트 파일 실행
npx playwright test tests/e2e/order-flow.spec.ts

# UI 모드로 실행
npm run test:e2e:ui

# 헤드리스 모드로 실행
npx playwright test --project=chromium --headed
```

### 테스트 데이터 정리
```bash
# 테스트 후 데이터 정리 스크립트 실행
node scripts/cleanup-test-data.js
```

---

## 알림: 테스트 실행 전 주의사항

1. **데이터베이스 백업**: 테스트 실행 전 프로덕션 데이터베이스 백업 권장
2. **테스트 환경 분리**: 가능하면 별도의 테스트 DB 사용
3. **이메일 설정**: DEV_MODE=true로 설정하여 실제 이메일 전송 방지
4. **속도 제한**: 테스트 중 레이트 리밋트리거 방지 주의
5. **동시성**: 병렬 테스트 실행 시 데이터 충돌 방지

---

## 참고 자료

### 관련 문서
- `CLAUDE.md` - 프로젝트 개요 및 아키텍처
- `docs/current/architecture/database-schema-v2.md` - 데이터베이스 스키마
- `tests/fixtures/test-data.ts` - 테스트 데이터 유틸리티

### 관련 API 문서
- `/api/quotations/route.ts` - 견적 API
- `/api/samples/route.ts` - 샘플 요청 API
- `/api/admin/orders/route.ts` - 관리자 주문 API
- `/api/admin/production/route.ts` - 생산 관리 API

### UI 컴포넌트
- `/src/components/quote/ImprovedQuotingWizard.tsx` - 견적 마법사
- `/src/components/contact/SampleRequestForm.tsx` - 샘플 요청 폼
- `/src/app/admin/approvals/page.tsx` - 관리자 승인 페이지
- `/src/app/member/orders/page.tsx` - 회원 주문 목록

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.0 | 2026-01-13 | 초기 버전 작성 | Claude Code |

---

## 문의 사항

테스트 시나리오와 관련된 문의사항이나 개선 제안은 프로젝트 관리자에게 문의하시기 바랍니다.
