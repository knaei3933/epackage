# 보안 개선 구현 계획

## 사용자 선택 사항

- **MCP 통합 방식**: 옵션 A - 직접 MCP 통합 (추천)
- **보안 수정 일정**: 계획적으로 2주 내 진행

---

## Week 1: 치명적 보안 수정

### Day 1-2: SQL 인젝션 방지
- [ ] `src/lib/supabase-sql.ts`의 `insertQuotationItems` 함수 수정
- [ ] 매개변수화 쿼리로 교체
- [ ] SQL 인젝션 테스트 추가

### Day 3: MCP API 보안
- [ ] `/api/supabase-mcp/execute` 라우트에 인증 추가
- [ ] 관리자 권한 확인
- [ ] SQL 쿼리 검증 (위험 키워드 필터링)

### Day 4-5: 개발 모드 강화
- [ ] `src/lib/env-validation.ts` 생성
- [ ] 다중 환경 검증 구현
- [ ] 프로덕션 안전장치 확인

## Week 2: MCP 직접 통합

### Day 1-3: MCP 클라이언트 유틸리티
- [ ] `src/lib/supabase-mcp-client.ts` 생성
- [ ] 서버사이드에서 MCP 도구 직접 호출
- [ ] 타입 안전한 SQL 실행

### Day 4-5: 통합 테스트
- [ ] MCP 연결 테스트
- [ ] SQL 실행 테스트
- [ ] 성능 벤치마크 테스트
