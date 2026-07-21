-- ============================================================
-- search_inquiries RPC
-- ============================================================
--
-- 目的: 管理者向け inquiries 全文検索。subject / message / customer_name /
--       company_name を simple 辞書で to_tsvector 化し、to_tsquery で一致判定。
--       type / status での絞り込みと LIMIT（最大 200）を併用する。
--
-- SECURITY DEFINER: 管理者用 API 経由でのみ呼出される（アプリ層で管理者認可を
--                   検証済み）。会員側は user_id = auth.uid() で個別 SELECT する
--                   ため本関数は使用しない。
--
-- 復元の経緯:
--   この関数は 2026-07-20 05:45:10 UTC にリモート（開発/本番兼用 Package-Lab）
--   へ適用済みだが、ローカル supabase/migrations/ にファイルが欠落していた。
--   同じ version（20260720054510）で復元し、supabase migration list の
--   「remote 適用済・local 未」を解消する。将来の環境再構築時に欠損しないようにする。
--   CREATE OR REPLACE で冪等（既存リモート定義と同一）。
-- ============================================================

CREATE OR REPLACE FUNCTION public.search_inquiries(
  search_term text DEFAULT NULL,
  inquiry_type_param inquiry_type DEFAULT NULL,
  status_param inquiry_status DEFAULT NULL,
  limit_count integer DEFAULT 50
)
RETURNS SETOF inquiries
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT *
  FROM inquiries
  WHERE
    (search_term IS NULL OR
     to_tsvector('simple',
       COALESCE(subject, '') || ' ' ||
       COALESCE(message, '') || ' ' ||
       COALESCE(customer_name, '') || ' ' ||
       COALESCE(company_name, ''))
     @@ to_tsquery('simple', search_term))
    AND (inquiry_type_param IS NULL OR type = inquiry_type_param)
    AND (status_param IS NULL OR status = status_param)
  ORDER BY created_at DESC
  LIMIT LEAST(limit_count, 200);
END;
$function$;
