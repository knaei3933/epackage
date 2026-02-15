-- Epackage Lab Database Schema
-- PostgreSQL 스키마 정의

-- 고객 정보 테이블
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  position VARCHAR(100),
  industry VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 제품 정보 테이블
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  specifications JSONB,
  min_order_quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 견적 요청 테이블
CREATE TABLE quotation_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  company VARCHAR(255),
  contact_person VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  project_description TEXT NOT NULL,
  requirements JSONB,
  budget_range VARCHAR(100),
  timeline VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, cancelled
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  estimated_delivery_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 견적 요청 제품 링크 테이블
CREATE TABLE quotation_request_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_request_id UUID REFERENCES quotation_requests(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2),
  total_price DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 샘플 요청 테이블
CREATE TABLE sample_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  company VARCHAR(255),
  contact_person VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  product_category VARCHAR(100) NOT NULL,
  sample_description TEXT,
  purpose VARCHAR(255),
  shipping_address JSONB,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  tracking_number VARCHAR(100),
  shipping_date DATE,
  expected_delivery_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 일반 문의 테이블
CREATE TABLE inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  inquiry_type VARCHAR(50) DEFAULT 'general', -- general, technical, partnership, complaint
  status VARCHAR(50) DEFAULT 'new', -- new, in_progress, resolved, closed
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  assigned_to UUID, -- 담당자 ID (나중에 users 테이블 추가 가능)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 문의 답변 테이블
CREATE TABLE inquiry_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE,
  responder_name VARCHAR(255) NOT NULL,
  response TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- 내부 메모인지 여부
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 첨부파일 테이블 (공용)
CREATE TABLE attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL, -- 어떤 테이블에 연결되었는지
  record_id UUID NOT NULL, -- 해당 테이블의 레코드 ID
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL, -- Supabase Storage 경로
  file_size BIGINT,
  file_type VARCHAR(100),
  uploaded_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 업데이트 타임스탬프 자동 설정 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 설정
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotation_requests_updated_at BEFORE UPDATE ON quotation_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sample_requests_updated_at BEFORE UPDATE ON sample_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 생성
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_company ON contacts(company);
CREATE INDEX idx_quotation_requests_status ON quotation_requests(status);
CREATE INDEX idx_quotation_requests_created_at ON quotation_requests(created_at);
CREATE INDEX idx_sample_requests_status ON sample_requests(status);
CREATE INDEX idx_sample_requests_created_at ON sample_requests(created_at);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_inquiry_type ON inquiries(inquiry_type);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at);
CREATE INDEX idx_attachments_table_record ON attachments(table_name, record_id);
CREATE INDEX idx_quotation_request_products_request_id ON quotation_request_products(quotation_request_id);
CREATE INDEX idx_quotation_request_products_product_id ON quotation_request_products(product_id);

-- 제품 카테고리 ENUM 타입
CREATE TYPE product_category AS ENUM (
  'packaging_materials',
  'containers',
  'labels',
  'sealing_solutions',
  'custom_packaging',
  'eco_friendly',
  'industrial_packaging',
  'consumer_goods',
  'other'
);

-- 상태 ENUM 타입
CREATE TYPE request_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'shipped',
  'delivered',
  'cancelled',
  'on_hold'
);

-- 우선순위 ENUM 타입
CREATE TYPE priority_level AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

-- 제품 카테고리 제약 조건 추가
ALTER TABLE products ADD CONSTRAINT check_product_category
  CHECK (category = ANY(ARRAY['packaging_materials', 'containers', 'labels', 'sealing_solutions', 'custom_packaging', 'eco_friendly', 'industrial_packaging', 'consumer_goods', 'other']));

-- 견적 요청 상태 제약 조건
ALTER TABLE quotation_requests ADD CONSTRAINT check_quotation_status
  CHECK (status = ANY(ARRAY['pending', 'processing', 'completed', 'cancelled']));

-- 샘플 요청 상태 제약 조건
ALTER TABLE sample_requests ADD CONSTRAINT check_sample_status
  CHECK (status = ANY(ARRAY['pending', 'processing', 'shipped', 'delivered', 'cancelled']));

-- 문의 상태 제약 조건
ALTER TABLE inquiries ADD CONSTRAINT check_inquiry_status
  CHECK (status = ANY(ARRAY['new', 'in_progress', 'resolved', 'closed']));

-- 우선순위 제약 조건
ALTER TABLE quotation_requests ADD CONSTRAINT check_quotation_priority
  CHECK (priority = ANY(ARRAY['low', 'normal', 'high', 'urgent']));

ALTER TABLE sample_requests ADD CONSTRAINT check_sample_priority
  CHECK (priority = ANY(ARRAY['low', 'normal', 'high', 'urgent']));

ALTER TABLE inquiries ADD CONSTRAINT check_inquiry_priority
  CHECK (priority = ANY(ARRAY['low', 'normal', 'high', 'urgent']));

-- RLS 활성화
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_request_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- RLS 정책은 다음 단계에서 설정