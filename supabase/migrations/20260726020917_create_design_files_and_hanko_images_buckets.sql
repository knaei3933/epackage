-- design-files バケット作成（private）
-- 用途: 会員デザインファイルの AI 抽出アップロード（ai-extraction/upload route）
INSERT INTO storage.buckets (id, name, public)
VALUES ('design-files', 'design-files', false)
ON CONFLICT (id) DO NOTHING;

-- hanko-images バケット作成（private）
-- 用途: 会員のはんこ画像アップロード（hanko/upload route）
INSERT INTO storage.buckets (id, name, public)
VALUES ('hanko-images', 'hanko-images', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- design-files RLS policies（production-files と同等・authenticated 全許可）
-- serviceClient で RLS bypass + アプリ層で認証・所有権検証（多層防御）
-- ============================================================
CREATE POLICY "Authenticated users can read from design-files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'design-files');

CREATE POLICY "Authenticated users can upload to design-files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'design-files');

CREATE POLICY "Authenticated users can update design-files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'design-files')
WITH CHECK (bucket_id = 'design-files');

CREATE POLICY "Authenticated users can delete from design-files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'design-files');

-- ============================================================
-- hanko-images RLS policies（同一方針）
-- アプリ層で hanko-${userId}- プレフィックスフィルタにより所有者隔離
-- ============================================================
CREATE POLICY "Authenticated users can read from hanko-images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'hanko-images');

CREATE POLICY "Authenticated users can upload to hanko-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'hanko-images');

CREATE POLICY "Authenticated users can update hanko-images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'hanko-images')
WITH CHECK (bucket_id = 'hanko-images');

CREATE POLICY "Authenticated users can delete from hanko-images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'hanko-images');;
