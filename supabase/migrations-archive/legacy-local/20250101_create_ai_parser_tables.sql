-- =====================================================
-- AI Parser Database Schema
-- Adobe Illustrator .ai 파일 파싱을 위한 테이블 생성
-- =====================================================

-- 1. AI 파일 업로드 기록 테이블
CREATE TABLE IF NOT EXISTS ai_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('ai', 'pdf')),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 메타데이터
  original_file_name TEXT,
  mime_type TEXT,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
);

-- 2. 추출된 사양 테이블
CREATE TABLE IF NOT EXISTS ai_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL REFERENCES ai_uploads(id) ON DELETE CASCADE,

  -- 치수 정보
  envelope_type TEXT NOT NULL CHECK (envelope_type IN (
    'stand_pouch', 'box_pouch', 'flat_pouch', 'gusset', 'zipper_bag', 'three_side_seal'
  )),
  width_mm NUMERIC NOT NULL CHECK (width_mm > 0),
  height_mm NUMERIC NOT NULL CHECK (height_mm > 0),
  gusset_mm NUMERIC CHECK (gusset_mm > 0),
  has_die_line BOOLEAN DEFAULT FALSE,

  -- 노치 정보
  has_notch BOOLEAN DEFAULT FALSE,
  notch_type TEXT CHECK (notch_type IN ('circle', 'rectangle', 'v_shape')),
  notch_position_x NUMERIC,
  notch_position_y NUMERIC,
  notch_width NUMERIC,
  notch_height NUMERIC,
  notch_confidence NUMERIC CHECK (notch_confidence BETWEEN 0 AND 100),

  -- 지퍼 정보
  has_zipper BOOLEAN DEFAULT FALSE,
  zipper_type TEXT CHECK (zipper_type IN ('standard', 'slider', 'press_lock')),
  zipper_position TEXT CHECK (zipper_position IN ('top', 'side', 'bottom')),
  zipper_y NUMERIC,
  zipper_length NUMERIC,
  zipper_confidence NUMERIC CHECK (zipper_confidence BETWEEN 0 AND 100),

  -- 걸이 구멍 정보
  has_hanging_hole BOOLEAN DEFAULT FALSE,
  hanging_hole_type TEXT CHECK (hanging_hole_type IN ('round', 'euro_slot')),
  hanging_hole_diameter NUMERIC,
  hanging_hole_position_x NUMERIC,
  hanging_hole_position_y NUMERIC,
  hanging_hole_confidence NUMERIC CHECK (hanging_hole_confidence BETWEEN 0 AND 100),

  -- 소재 구조
  material_layers JSONB NOT NULL DEFAULT '[]', -- [{material: "PET", thickness: 12, function: "barrier"}, ...]
  total_thickness_um NUMERIC CHECK (total_thickness_um > 0),
  material_source TEXT CHECK (material_source IN ('text_label', 'layer_name', 'inferred', 'manual')),
  material_confidence NUMERIC CHECK (material_confidence BETWEEN 0 AND 100),

  -- 인쇄 정보
  color_type TEXT CHECK (color_type IN ('cmyk', 'spot', 'hybrid')),
  colors JSONB DEFAULT '[]', -- ["#FF0000", "PANTONE 185C", ...]
  pantone_codes JSONB DEFAULT '[]', -- ["PANTONE 185C", "PANTONE 286C", ...]
  cmyk_values JSONB DEFAULT '[]', -- [{c: 100, m: 0, y: 0, k: 0}, ...]
  color_count INTEGER DEFAULT 0,
  color_confidence NUMERIC CHECK (color_confidence BETWEEN 0 AND 100),

  -- 인쇄 영역
  print_area_x NUMERIC,
  print_area_y NUMERIC,
  print_area_width NUMERIC,
  print_area_height NUMERIC,
  print_area_margin_top NUMERIC,
  print_area_margin_right NUMERIC,
  print_area_margin_bottom NUMERIC,
  print_area_margin_left NUMERIC,

  -- 로고 정보
  logos JSONB DEFAULT '[]', -- [{type: "text", position: {x, y}, size: 10, text: "Brand", confidence: 0.9}, ...]
  logo_confidence NUMERIC CHECK (logo_confidence BETWEEN 0 AND 100),

  -- 추가 가공 정보
  has_corner_rounding BOOLEAN DEFAULT FALSE,
  corner_rounding_radius NUMERIC,
  corner_rounding_corners INTEGER CHECK (corner_rounding_corners IN (1, 2, 4)),
  corner_rounding_confidence NUMERIC CHECK (corner_rounding_confidence BETWEEN 0 AND 100),

  has_euro_slot BOOLEAN DEFAULT FALSE,
  euro_slot_position_x NUMERIC,
  euro_slot_position_y NUMERIC,
  euro_slot_width NUMERIC,
  euro_slot_height NUMERIC,
  euro_slot_confidence NUMERIC CHECK (euro_slot_confidence BETWEEN 0 AND 100),

  has_tear_notch BOOLEAN DEFAULT FALSE,
  tear_notch_type TEXT CHECK (tear_notch_type IN ('v_notch', 'circle')),
  tear_notch_position_x NUMERIC,
  tear_notch_position_y NUMERIC,
  tear_notch_width NUMERIC,
  tear_notch_height NUMERIC,
  tear_notch_confidence NUMERIC CHECK (tear_notch_confidence BETWEEN 0 AND 100),

  has_valve BOOLEAN DEFAULT FALSE,
  valve_type TEXT CHECK (valve_type IN ('degassing', 'aroma')),
  valve_position_x NUMERIC,
  valve_position_y NUMERIC,
  valve_width NUMERIC,
  valve_height NUMERIC,
  valve_confidence NUMERIC CHECK (valve_confidence BETWEEN 0 AND 100),

  -- 신뢰도 점수
  confidence_overall NUMERIC CHECK (confidence_overall BETWEEN 0 AND 100),
  confidence_dimensions NUMERIC CHECK (confidence_dimensions BETWEEN 0 AND 100),
  confidence_material NUMERIC CHECK (confidence_material BETWEEN 0 AND 100),
  confidence_printing NUMERIC CHECK (confidence_printing BETWEEN 0 AND 100),
  confidence_processing NUMERIC CHECK (confidence_processing BETWEEN 0 AND 100),

  -- 신뢰도 세부사항
  confidence_breakdown JSONB, -- {envelopeType: 90, size: 85, ...}

  -- 검증 플래그
  validation_flags JSONB DEFAULT '[]', -- [{type: "error", field: "size", message: "...", suggestion: "..."}, ...]

  -- 메타데이터
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  extraction_method TEXT CHECK (extraction_method IN ('pdf_parse', 'ocr_fallback', 'path_only', 'manual', 'hybrid')),
  processing_time_ms INTEGER,

  -- 상태
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'approved')),
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,

  -- 생성/수정일
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
);

-- 3. 파싱 로그 테이블
CREATE TABLE IF NOT EXISTS ai_parse_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL REFERENCES ai_uploads(id) ON DELETE CASCADE,

  stage TEXT NOT NULL CHECK (stage IN (
    'FILE_UPLOAD',
    'PDF_CONVERSION',
    'STRUCTURE_PARSE',
    'DIMENSION_EXTRACT',
    'MATERIAL_EXTRACT',
    'PRINTING_EXTRACT',
    'PROCESSING_EXTRACT',
    'CONFIDENCE_CALC'
  )),

  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'recovered')),
  duration_ms INTEGER,
  memory_used_mb NUMERIC,
  error_message TEXT,
  error_details JSONB,
  recovery_method TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
);

-- 4. 체크포인트 테이블 (롤백 지원)
CREATE TABLE IF NOT EXISTS ai_parser_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  stage TEXT NOT NULL,
  data JSONB NOT NULL,
  rollback_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(task_id, stage)
);

-- 5. 성능 메트릭 테이블
CREATE TABLE IF NOT EXISTS ai_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES ai_uploads(id) ON DELETE SET NULL,

  stage TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  memory_used_bytes BIGINT,
  success BOOLEAN NOT NULL,
  error_message TEXT,

  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
);

-- =====================================================
-- 인덱스 생성
-- =====================================================

-- ai_uploads 인덱스
CREATE INDEX IF NOT EXISTS idx_ai_uploads_user_id ON ai_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_uploads_status ON ai_uploads(processing_status);
CREATE INDEX IF NOT EXISTS idx_ai_uploads_created_at ON ai_uploads(uploaded_at DESC);

-- ai_specs 인덱스
CREATE INDEX IF NOT EXISTS idx_ai_specs_upload_id ON ai_specs(upload_id);
CREATE INDEX IF NOT EXISTS idx_ai_specs_status ON ai_specs(status);
CREATE INDEX IF NOT EXISTS idx_ai_specs_envelope_type ON ai_specs(envelope_type);
CREATE INDEX IF NOT EXISTS idx_ai_specs_confidence ON ai_specs(confidence_overall);
CREATE INDEX IF NOT EXISTS idx_ai_specs_created_at ON ai_specs(created_at DESC);

-- ai_parse_logs 인덱스
CREATE INDEX IF NOT EXISTS idx_ai_parse_logs_upload_id ON ai_parse_logs(upload_id);
CREATE INDEX IF NOT EXISTS idx_ai_parse_logs_stage ON ai_parse_logs(stage);
CREATE INDEX IF NOT EXISTS idx_ai_parse_logs_status ON ai_parse_logs(status);
CREATE INDEX IF NOT EXISTS idx_ai_parse_logs_created_at ON ai_parse_logs(created_at DESC);

-- ai_parser_checkpoints 인덱스
CREATE INDEX IF NOT EXISTS idx_ai_parser_checkpoints_task_id ON ai_parser_checkpoints(task_id);
CREATE INDEX IF NOT EXISTS idx_ai_parser_checkpoints_stage ON ai_parser_checkpoints(stage);

-- ai_performance_metrics 인덱스
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_upload_id ON ai_performance_metrics(upload_id);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_stage ON ai_performance_metrics(stage);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_recorded_at ON ai_performance_metrics(recorded_at DESC);

-- =====================================================
-- RLS (Row Level Security) 정책
-- =====================================================

-- ai_uploads 테이블
ALTER TABLE ai_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own uploads"
  ON ai_uploads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own uploads"
  ON ai_uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can do anything"
  ON ai_uploads TO service_role
  USING (true)
  WITH CHECK (true);

-- ai_specs 테이블
ALTER TABLE ai_specs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view specs from their uploads"
  ON ai_specs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_uploads
      WHERE ai_uploads.id = ai_specs.upload_id
      AND ai_uploads.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can do anything"
  ON ai_specs TO service_role
  USING (true)
  WITH CHECK (true);

-- ai_parse_logs 테이블
ALTER TABLE ai_parse_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logs from their uploads"
  ON ai_parse_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_uploads
      WHERE ai_uploads.id = ai_parse_logs.upload_id
      AND ai_uploads.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can do anything"
  ON ai_parse_logs TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 함수 및 트리거
-- =====================================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ai_specs 테이블에 updated_at 트리거 추가
CREATE TRIGGER update_ai_specs_updated_at
  BEFORE UPDATE ON ai_specs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 뷰 생성
-- =====================================================

-- 사용자별 파싱 요약 뷰
CREATE OR REPLACE VIEW user_parsing_summary AS
SELECT
  u.user_id,
  COUNT(*) as total_uploads,
  COUNT(CASE WHEN u.processing_status = 'completed' THEN 1 END) as completed_count,
  COUNT(CASE WHEN u.processing_status = 'failed' THEN 1 END) as failed_count,
  AVG(s.confidence_overall) as avg_confidence,
  MAX(u.uploaded_at) as last_upload_at
FROM ai_uploads u
LEFT JOIN ai_specs s ON u.id = s.upload_id
GROUP BY u.user_id;

-- =====================================================
-- 초기 데이터 (선택사항)
-- =====================================================

-- 표준 소재 구조 라이브러리 (예시)
COMMENT ON TABLE ai_specs IS '추출된 제품 사양 정보';
COMMENT ON COLUMN ai_specs.material_layers IS '소재 레이어 배열: [{material: "PET", thickness: 12, function: "barrier"}, ...]';
COMMENT ON COLUMN ai_specs.confidence_breakdown IS '신뢰도 세부사항: {envelopeType: 90, size: 85, gusset: 80, ...}';
COMMENT ON COLUMN ai_specs.validation_flags IS '검증 플래그 배열: [{type: "error", field: "size", message: "...", suggestion: "..."}, ...]';
