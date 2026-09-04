-- production_logs RLS 有効化（files テーブルと同一パターン・多層防御）
ALTER TABLE public.production_logs ENABLE ROW LEVEL SECURITY;

-- owner 条件: orders.user_id 経由のみ（assigned_to は NULL 許容のため owner 条件に使わない）
-- ADMIN/OPERATOR は全レコード操作可（ワークオーダー生成・在庫入庫のため）
-- MEMO: 5 route 中4 route は service client（RLS bypass）・tracking route（cookie client）のみ本 policy が効く実質防御

-- SELECT policy
CREATE POLICY production_logs_select ON public.production_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = production_logs.order_id AND orders.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN'::user_role, 'OPERATOR'::user_role))
  );

-- INSERT policy
CREATE POLICY production_logs_insert ON public.production_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = production_logs.order_id AND orders.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN'::user_role, 'OPERATOR'::user_role))
  );

-- UPDATE policy
CREATE POLICY production_logs_update ON public.production_logs
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = production_logs.order_id AND orders.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN'::user_role, 'OPERATOR'::user_role))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = production_logs.order_id AND orders.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN'::user_role, 'OPERATOR'::user_role))
  );

-- DELETE policy
CREATE POLICY production_logs_delete ON public.production_logs
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = production_logs.order_id AND orders.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN'::user_role, 'OPERATOR'::user_role))
  );;
