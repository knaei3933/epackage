# Epackage Lab 홈페이지 수정사항 PRD

## Executive Summary

Epackage Lab 웹사이트 홈페이지의 사용자 경험을 개선하고 일본어 비즈니스 환경에 맞춘 로컬라이제이션을 완료하기 위한 수정사항 목록입니다. 총 10개의 주요 수정사항이 정의되었습니다.

### Project Overview
- **Project Name**: Epackage Lab 홈페이지 수정사항
- **Target Language**: Japanese (일본어)
- **Primary Focus**: UI/UX 개선, 로컬라이제이션, 기능 통합
- **Expected Timeline**: 2-3일 내 완료
- **Development Server**: localhost:3004

---

## Detailed Requirements

### Requirement 1: 초록색 하이라이팅 적용
**Priority**: High
**Description**: 메인 홈페이지의 "最適な包装で輝かせる" 부분을 박스 초록색과 같은 색으로 변경해야 합니다.
**Technical Requirements**:
- 현재 brixa 색상 대신 초록색 컬러 코드 적용
- 시각적 일관성 유지
- 반응형 디자인 호환성
**Target Files**: `src/app/page.tsx`

### Requirement 2: 핵심 박스 중앙 정렬
**Priority**: High
**Description**: 21일 최단납기, 100%검품합격률, 30%코스트삭감 박스를 메인홈페이지 정가운데 정렬로 배치해야 합니다.
**Technical Requirements**:
- 현재 2x2 그리드에서 중앙 단일 행으로 변경
- 반응형 레이아웃 구현
- 동일한 간격과 간격 유지
**Target Files**: `src/app/page.tsx`

### Requirement 3: 제품 솔루션 섹션 일본어 변경
**Priority**: High
**Description**: "あなたの製品に最適なパッケージソリューション"의 각 박스들이 한국어로 표기되어 있으므로 일본어로 변경해야 합니다.
**Technical Requirements**:
- 모든 제품 관련 텍스트 일본어 번역
- 기존 디자인 레이아웃 유지
- 일관된 일본어 표현 사용
**Target Files**: Product 관련 컴포넌트

### Requirement 4: 제조 서비스 섹션 일본어 변경 및 이미지 수정
**Priority**: High
**Description**: "일관된 파우치 제작 서비스" 섹션의 "인쇄, 라미네이터, 슬리팅, 파우치 가공" 텍스트가 한국어로 되어있으며, 각 이미지들이 누락되었으므로 수정해야 합니다.
**Technical Requirements**:
- 모든 한국어 텍스트를 일본어로 변경
- 누락된 이미지 복구 또는 대체
- 이미지 경로 확인 및 수정
- 반응형 이미지 최적화
**Target Files**: ManufacturingProcess 컴포넌트

### Requirement 5: 풋터 설치
**Priority**: High
**Description**: 메인홈페이지에 풋터가 없으므로 풋터를 신설해야 합니다.
**Technical Requirements**:
- 회사 정보 포함: 주소, 전화번호, 이메일
- 일관된 브랜드 디자인
- 반응형 레이아웃
- 모든 페이지에 일관된 푸터 표시
**Footer 기본 정보**:
- 주소: 〒673-0846　兵庫県明石市上ノ丸2-11-21-102
- 전화: 080-6942-7235
- 이메일: info@package-lab.com
**Target Files**: 레이아웃 컴포넌트, 푸터 컴포넌트

### Requirement 6: 제품 카테고리 페이지 일본어 변경
**Priority**: Medium
**Description**: 제품 카테고리 페이지(/catalog)의 각 박스들이 한국어로 구성되어 있으므로 일본어로 변경해야 합니다.
**Technical Requirements**:
- 모든 제품 이름과 설명 일본어로 변경
- 카테고리 구조 유지
- 검색 기능과 호환성
**Target Files**: `/catalog` 페이지 관련 컴포넌트

### Requirement 7: Flow 페이지 제조공정 이미지 복구
**Priority**: Medium
**Description**: Flow 페이지의 제조공정 1~4번 사진이 누락되어 있으므로 복구해야 합니다.
**Technical Requirements**:
- 누락된 이미지 파일 확인
- 기존 이미지 경로에서 복구 또는 새로운 이미지로 대체
- 이미지 로딩 오류 처리
- 이미지 최적화
**Target Files**: `/flow` 페이지, 이미지 폴더

### Requirement 8: Flow 페이지 버튼 레이아웃 수정
**Priority**: Medium
**Description**: Flow 페이지의 "ご相談申し込み" 버튼이 두 줄로 나뉘어 있으므로 한 줄로 변경해야 합니다.
**Technical Requirements**:
- 버튼 텍스트 한 줄 표시
- 반응형 버튼 크기 조정
- 버튼 아이콘과 텍스트 정렬
**Target Files**: `/flow` 페이지

### Requirement 9: 견적 시스템 통합
**Priority**: High
**Description**: 헤더 견적 탭에 여러 가지 옵션이 있으나 견적 기능은 하나로 통합해야 합니다.
**Technical Requirements**:
- 디자인은 quote-simulator/ 스타일 채택
- 기능은 roi-calculator/ 통합
- 사이즈 설정: 드래그 + 수동 입력 모두 지원
- 단가 및 추가요금 표시 숨김
- 단일 견적 경험 제공
**Target Files**: 헤더 컴포넌트, 견적 관련 페이지

### Requirement 10: 후처리 프리뷰 시스템 강화
**Priority**: High
**Description**: 견적 시스템에 후처리 프리뷰 기능을 통합하여 고객이 어떤 가공이 이루어지는지 확인할 수 있도록 해야 합니다.
**Technical Requirements**:
- `/images/post-processing/` 폴더 이미지 활용
- 선택 전후 프리뷰 제공
- 가공 옵션 시각적 설명
- 견적 워크플로우에 통합
- 상호작용형 프리뷰 구현
**Target Files**: 견적 시스템 컴포넌트

---

## Technical Specifications

### Brand Guidelines
- 일관된 브랜드 색상 유지
- 전문적인 일본어 비즈니스 표현
- 현대적이고 깔끔한 UI/UX 디자인

### Performance Requirements
- 반응형 디자인 (모바일 우선)
- 빠른 로딩 속도 최적화
- 이미지 최적화 및 지연 로딩

### Accessibility Standards
- WCAG 2.1 AA 준수
- 키보드 내비게이션 지원
- 스크린 리더 호환성

---

## Acceptance Criteria

### Design Standards
- [ ] 모든 텍스트가 정확한 일본어로 번역됨
- [ ] 일관된 디자인 시스템 적용됨
- [ ] 모든 페이지 반응형 디자인 완료

### Functionality
- [ ] 모든 링크와 버튼이 정상 작동
- [ ] 견적 시스템이 단일화됨
- [ ] 후처리 프리뷰 기능 구현됨

### Performance
- [ ] 페이지 로딩 속도 3초 미만
- [ ] 모든 이미지 최적화됨
- [ ] 모바일 성능 최적화

### Content
- [ ] 회사 정보가 정확히 표시됨
- [ ] 제조 공정 이미지가 모두 표시됨
- [ ] 일관된 일본어 비즈니스 용어 사용

---

## Testing Requirements

### Cross-browser Testing
- Chrome, Firefox, Safari 최신 버전
- 모바일 브라우저 호환성

### Device Testing
- 데스크톱, 태블릿, 스마트폰
- 다양한 화면 크기 테스트

### Functional Testing
- 모든 네비게이션 요소 작동 확인
- 견적 시스템 기능 테스트
- 후처리 프리뷰 기능 검증

---

## Success Metrics

### User Experience
- 사용자 경험 만족도 향상
- 일본어 사용자 이해도 개선
- 사이트 탐색 용이성 향상

### Business Objectives
- 일본 시장 진출 준비 완료
- 전문적인 웹사이트 인상
- 고객 문의 전환율 개선

---

## Risk Assessment

### Technical Risks
- 이미지 파일 누락으로 인한 디자인 영향
- 일본어 로컬라이제이션의 정확성
- 통합 견적 시스템의 복잡성

### Mitigation Strategies
- 이미지 백업 및 대체 안 마련
- 전문 일본어 검토 프로세스
- 단계적 통합 및 테스트

---

## Implementation Timeline

### Phase 1: 핵심 수정사항 (1-2일)
1. 초록색 하이라이팅 적용
2. 핵심 박스 중앙 정렬
3. 푸터 설치 및 회사 정보 추가
4. 제품 솔루션 섹션 일본어 변경

### Phase 2: 시스템 통합 (1일)
1. 견적 시스템 통합
2. 후처리 프리뷰 시스템 강화

### Phase 3: 세부 수정사항 (1일)
1. 제조 서비스 섹션 수정
2. 카테고리 페이지 일본어 변경
3. Flow 페이지 수정
4. 최종 테스트 및 검증