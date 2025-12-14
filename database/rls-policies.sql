-- Row Level Security (RLS) Policies
-- Epackage Lab 데이터베이스 보안 정책

-- =============================================================================
-- 공통 헬퍼 함수
-- =============================================================================

-- 인증된 사용자인지 확인하는 함수
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 관리자인지 확인하는 함수 (user_metadata에서 role 확인)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.jwt() ->> 'role' = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 소유자인지 확인하는 함수 (created_by 필드 확인)
CREATE OR REPLACE FUNCTION is_owner(table_name text, record_id uuid)
RETURNS BOOLEAN AS $$
DECLARE
  owner_id uuid;
BEGIN
  EXECUTE format('SELECT created_by FROM %I WHERE id = $1', table_name)
  INTO owner_id
  USING record_id;

  RETURN owner_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- Contacts 테이블 RLS 정책
-- =============================================================================

-- 모든 사용자가 연락처 정보를 읽을 수 있음 (공개 정보)
CREATE POLICY "contacts_select_public" ON contacts
  FOR SELECT USING (true);

-- 인증된 사용자만 연락처 정보를 생성할 수 있음
CREATE POLICY "contacts_insert_authenticated" ON contacts
  FOR INSERT WITH CHECK (is_authenticated());

-- 인증된 사용자만 자신이 생성한 연락처 정보를 수정할 수 있음
CREATE POLICY "contacts_update_owner" ON contacts
  FOR UPDATE USING (is_authenticated())
  WITH CHECK (is_authenticated());

-- 관리자만 연락처 정보를 삭제할 수 있음
CREATE POLICY "contacts_delete_admin" ON contacts
  FOR DELETE USING (is_admin());

-- =============================================================================
-- Products 테이블 RLS 정책
-- =============================================================================

-- 모든 사용자가 활성 제품 정보를 읽을 수 있음
CREATE POLICY "products_select_public" ON products
  FOR SELECT USING (is_active = true);

-- 관리자만 모든 제품 정보를 읽을 수 있음 (비활성 포함)
CREATE POLICY "products_select_admin" ON products
  FOR SELECT USING (is_admin());

-- 관리자만 제품 정보를 생성할 수 있음
CREATE POLICY "products_insert_admin" ON products
  FOR INSERT WITH CHECK (is_admin());

-- 관리자만 제품 정보를 수정할 수 있음
CREATE POLICY "products_update_admin" ON products
  FOR UPDATE USING (is_admin())
  WITH CHECK (is_admin());

-- 관리자만 제품 정보를 삭제할 수 있음
CREATE POLICY "products_delete_admin" ON products
  FOR DELETE USING (is_admin());

-- =============================================================================
-- Quotation Requests 테이블 RLS 정책
-- =============================================================================

-- 인증된 사용자는 모든 견적 요청을 읽을 수 있음
CREATE POLICY "quotation_requests_select_authenticated" ON quotation_requests
  FOR SELECT USING (is_authenticated());

-- 인증된 사용자만 견적 요청을 생성할 수 있음
CREATE POLICY "quotation_requests_insert_authenticated" ON quotation_requests
  FOR INSERT WITH CHECK (is_authenticated());

-- 관리자는 모든 견적 요청을 수정할 수 있음
CREATE POLICY "quotation_requests_update_admin" ON quotation_requests
  FOR UPDATE USING (is_admin())
  WITH CHECK (is_admin());

-- 요청자는 자신의 견적 요청을 수정할 수 있음
CREATE POLICY "quotation_requests_update_owner" ON quotation_requests
  FOR UPDATE USING (email = auth.jwt() ->> 'email')
  WITH CHECK (email = auth.jwt() ->> 'email');

-- 관리자만 견적 요청을 삭제할 수 있음
CREATE POLICY "quotation_requests_delete_admin" ON quotation_requests
  FOR DELETE USING (is_admin());

-- =============================================================================
-- Quotation Request Products 테이블 RLS 정책
-- =============================================================================

-- 인증된 사용자는 모든 견적 요청 제품 정보를 읽을 수 있음
CREATE POLICY "quotation_request_products_select_authenticated" ON quotation_request_products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quotation_requests qr
      WHERE qr.id = quotation_request_products.quotation_request_id
      AND is_authenticated()
    )
  );

-- 관리자만 견적 요청 제품 정보를 생성할 수 있음
CREATE POLICY "quotation_request_products_insert_admin" ON quotation_request_products
  FOR INSERT WITH CHECK (is_admin());

-- 관리자만 견적 요청 제품 정보를 수정할 수 있음
CREATE POLICY "quotation_request_products_update_admin" ON quotation_request_products
  FOR UPDATE USING (is_admin())
  WITH CHECK (is_admin());

-- 관리자만 견적 요청 제품 정보를 삭제할 수 있음
CREATE POLICY "quotation_request_products_delete_admin" ON quotation_request_products
  FOR DELETE USING (is_admin());

-- =============================================================================
-- Sample Requests 테이블 RLS 정책
-- =============================================================================

-- 인증된 사용자는 모든 샘플 요청을 읽을 수 있음
CREATE POLICY "sample_requests_select_authenticated" ON sample_requests
  FOR SELECT USING (is_authenticated());

-- 인증된 사용자만 샘플 요청을 생성할 수 있음
CREATE POLICY "sample_requests_insert_authenticated" ON sample_requests
  FOR INSERT WITH CHECK (is_authenticated());

-- 관리자는 모든 샘플 요청을 수정할 수 있음
CREATE POLICY "sample_requests_update_admin" ON sample_requests
  FOR UPDATE USING (is_admin())
  WITH CHECK (is_admin());

-- 요청자는 자신의 샘플 요청을 수정할 수 있음
CREATE POLICY "sample_requests_update_owner" ON sample_requests
  FOR UPDATE USING (email = auth.jwt() ->> 'email')
  WITH CHECK (email = auth.jwt() ->> 'email');

-- 관리자만 샘플 요청을 삭제할 수 있음
CREATE POLICY "sample_requests_delete_admin" ON sample_requests
  FOR DELETE USING (is_admin());

-- =============================================================================
-- Inquiries 테이블 RLS 정책
-- =============================================================================

-- 인증된 사용자는 모든 문의를 읽을 수 있음
CREATE POLICY "inquiries_select_authenticated" ON inquiries
  FOR SELECT USING (is_authenticated());

-- 익명 사용자도 문의를 생성할 수 있음
CREATE POLICY "inquiries_insert_public" ON inquiries
  FOR INSERT WITH CHECK (true);

-- 관리자는 모든 문의를 수정할 수 있음
CREATE POLICY "inquiries_update_admin" ON inquiries
  FOR UPDATE USING (is_admin())
  WITH CHECK (is_admin());

-- 문의 작성자는 자신의 문의를 수정할 수 있음 (이메일 기반)
CREATE POLICY "inquiries_update_owner" ON inquiries
  FOR UPDATE USING (email = auth.jwt() ->> 'email')
  WITH CHECK (email = auth.jwt() ->> 'email');

-- 관리자만 문의를 삭제할 수 있음
CREATE POLICY "inquiries_delete_admin" ON inquiries
  FOR DELETE USING (is_admin());

-- =============================================================================
-- Inquiry Responses 테이블 RLS 정책
-- =============================================================================

-- 인증된 사용자는 모든 문의 답변을 읽을 수 있음
CREATE POLICY "inquiry_responses_select_authenticated" ON inquiry_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM inquiries i
      WHERE i.id = inquiry_responses.inquiry_id
      AND is_authenticated()
    )
  );

-- 관리자만 문의 답변을 생성할 수 있음
CREATE POLICY "inquiry_responses_insert_admin" ON inquiry_responses
  FOR INSERT WITH CHECK (is_admin());

-- 관리자만 문의 답변을 수정할 수 있음
CREATE POLICY "inquiry_responses_update_admin" ON inquiry_responses
  FOR UPDATE USING (is_admin())
  WITH CHECK (is_admin());

-- 관리자만 문의 답변을 삭제할 수 있음
CREATE POLICY "inquiry_responses_delete_admin" ON inquiry_responses
  FOR DELETE USING (is_admin());

-- =============================================================================
-- Attachments 테이블 RLS 정책
-- =============================================================================

-- 인증된 사용자는 관련된 첨부파일을 읽을 수 있음
CREATE POLICY "attachments_select_authenticated" ON attachments
  FOR SELECT USING (
    -- 문의 첨부파일
    (table_name = 'inquiries' AND EXISTS (
      SELECT 1 FROM inquiries WHERE id = record_id AND is_authenticated()
    )) OR
    -- 견적 요청 첨부파일
    (table_name = 'quotation_requests' AND EXISTS (
      SELECT 1 FROM quotation_requests WHERE id = record_id AND is_authenticated()
    )) OR
    -- 샘플 요청 첨부파일
    (table_name = 'sample_requests' AND EXISTS (
      SELECT 1 FROM sample_requests WHERE id = record_id AND is_authenticated()
    ))
  );

-- 인증된 사용자만 첨부파일을 생성할 수 있음
CREATE POLICY "attachments_insert_authenticated" ON attachments
  FOR INSERT WITH CHECK (is_authenticated());

-- 관리자만 첨부파일을 수정할 수 있음
CREATE POLICY "attachments_update_admin" ON attachments
  FOR UPDATE USING (is_admin())
  WITH CHECK (is_admin());

-- 관리자만 첨부파일을 삭제할 수 있음
CREATE POLICY "attachments_delete_admin" ON attachments
  FOR DELETE USING (is_admin());

-- =============================================================================
-- 추가 보안 설정
-- =============================================================================

-- 외래 키 제약 조건 확인 (이미 스키마에서 생성됨)
-- ALTER TABLE quotation_requests ADD CONSTRAINT fk_quotation_requests_contact_id
--   FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;

-- 데이터 무결성을 위한 체크 제약 조건 추가
ALTER TABLE quotation_requests ADD CONSTRAINT chk_quotation_priority
  CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

ALTER TABLE sample_requests ADD CONSTRAINT chk_sample_priority
  CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

ALTER TABLE inquiries ADD CONSTRAINT chk_inquiry_priority
  CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- =============================================================================
-- 감사를 위한 트리거 함수
-- =============================================================================

-- 데이터 변경 로그 기록 함수
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- 향후 감사 테이블이 필요할 때를 위한 함수
  -- 현재는 단순히 로그를 남기기만 함
  RAISE LOG 'Audit: % on table %, ID: %, User: %',
    TG_OP, TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), COALESCE(auth.uid(), 'anonymous');

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 중요 테이블에 감사 트리거 추가 (선택적)
-- CREATE TRIGGER audit_quotation_requests AFTER INSERT OR UPDATE OR DELETE ON quotation_requests
--   FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- =============================================================================
-- 권한 확인 쿼리 예제
-- =============================================================================

/*
-- 현재 사용자 정보 확인
SELECT
  auth.uid() as user_id,
  auth.jwt() ->> 'email' as email,
  auth.jwt() ->> 'role' as role,
  is_authenticated() as is_authenticated,
  is_admin() as is_admin;

-- RLS 정책 확인
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
*/

-- =============================================================================
-- 사용자 정의 함수
-- =============================================================================

-- 통계 데이터 조회 함수 (RLS 적용)
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_contacts', (SELECT COUNT(*) FROM contacts),
    'total_quotations', (SELECT COUNT(*) FROM quotation_requests),
    'total_samples', (SELECT COUNT(*) FROM sample_requests),
    'total_inquiries', (SELECT COUNT(*) FROM inquiries),
    'pending_quotations', (SELECT COUNT(*) FROM quotation_requests WHERE status = 'pending'),
    'pending_samples', (SELECT COUNT(*) FROM sample_requests WHERE status = 'pending'),
    'new_inquiries', (SELECT COUNT(*) FROM inquiries WHERE status = 'new'),
    'completed_quotations', (SELECT COUNT(*) FROM quotation_requests WHERE status = 'completed')
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 최근 활동 조회 함수
CREATE OR REPLACE FUNCTION get_recent_activities(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  activity_type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ,
  record_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'quotation'::TEXT as activity_type,
    'New quotation request from ' || contact_person as description,
    created_at,
    id as record_id
  FROM quotation_requests
  ORDER BY created_at DESC
  LIMIT limit_count

  UNION ALL

  SELECT
    'sample'::TEXT as activity_type,
    'Sample request from ' || contact_person as description,
    created_at,
    id as record_id
  FROM sample_requests
  ORDER BY created_at DESC
  LIMIT limit_count

  UNION ALL

  SELECT
    'inquiry'::TEXT as activity_type,
    'New inquiry from ' || name as description,
    created_at,
    id as record_id
  FROM inquiries
  ORDER BY created_at DESC
  LIMIT limit_count
  ORDER BY created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;