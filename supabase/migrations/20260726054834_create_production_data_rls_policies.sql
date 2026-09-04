-- production_data の RLS policy（files テーブルの既存パターンに準拠）
-- service client（RLS bypass）でアクセスされるため、policy は cookie client 用の追加防御。
-- app 層で order_id 所有権検証済み（ai-extraction/upload 等）。

-- INSERT: 認証済みユーザー（files の "Authenticated users can upload files" と同じ緩さ）
CREATE POLICY "Authenticated users can create production_data"
ON public.production_data
FOR INSERT
TO public
WITH CHECK (auth.uid() IS NOT NULL);

-- SELECT: ADMIN または自分の order に紐づく行（files の Consolidated select と同じ構造・quotation_id 列は無し）
CREATE POLICY "Consolidated production_data select policy"
ON public.production_data
FOR SELECT
TO anon, authenticated, authenticator, dashboard_user
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'::user_role
  )
  OR order_id IN (
    SELECT orders.id FROM orders WHERE orders.user_id = auth.uid()
  )
);

-- UPDATE: ADMIN のみ（files の "Admins can update validation" と同じ）
CREATE POLICY "Admins can update production_data"
ON public.production_data
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'::user_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'::user_role
  )
);;
