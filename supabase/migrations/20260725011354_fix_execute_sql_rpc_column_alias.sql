-- 修正: jsonb_array_elements_text の列名は value（elem で参照すると 42703 エラー）
-- 列 alias AS t(e) で明示的に参照する
CREATE OR REPLACE FUNCTION public.execute_sql(
  sql_query text,
  sql_params jsonb DEFAULT '[]'::jsonb
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  params_arr text[];
  first_kw text;
  trimmed_query text;
  fmt_query text;
  final_query text;
BEGIN
  -- SQL コメント（-- と /* */）と前後空白を除去して最初の実質キーワードを判定
  trimmed_query := regexp_replace(sql_query, '--[^\n]*', ' ', 'g');
  trimmed_query := regexp_replace(trimmed_query, '/\*.*?\*/', ' ', 'g');
  trimmed_query := btrim(trimmed_query);
  first_kw := upper(split_part(trimmed_query, ' ', 1));

  -- jsonb 配列を text 配列に展開（NULL は SQL NULL として保持）
  SELECT array_agg(e) INTO params_arr
  FROM jsonb_array_elements_text(sql_params) AS t(e);

  -- $1, $2, ... を format の %L（リテラル）に置換
  -- ※ 呼び出し元クエリは $N が昇順・各1回出現を前提（supabase-mcp.ts / supabase-sql.ts は全て該当）
  fmt_query := regexp_replace(sql_query, '\$\d+(?![0-9])', '%L', 'g');

  -- %L に params をリテラル展開（quote_nullable 相当・インジェクション対策）
  final_query := format(fmt_query, VARIADIC COALESCE(params_arr, ARRAY[]::text[]));

  IF first_kw IN ('SELECT', 'WITH') THEN
    -- 結果セットを JSON 配列で返す（0行なら []）
    EXECUTE format(
      'SELECT COALESCE(json_agg(row_to_json(q)), ''[]''::json) FROM (%s) q',
      final_query
    ) INTO result;
    RETURN result;
  ELSE
    -- UPDATE / INSERT / DELETE 等: 副作用のみ実行（結果行は返さない）
    EXECUTE final_query;
    RETURN '[]'::json;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.execute_sql(text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.execute_sql(text, jsonb) TO service_role;;
