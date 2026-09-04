-- ============================================================
-- designer_task_assignments に Staff(ADMIN/OPERATOR) 用 UPDATE policy を追加
-- ============================================================
-- 背景:
--   従来の UPDATE policy は "Designers can update own task assignments"
--   (designer_id = auth.uid()) のみだった。
--   cancelDesignerTask は createClient(@/lib/supabase/server = anon+RLS) を
--   使用するため、admin が他人のタスクをキャンセルすると
--   auth.uid() = admin's id ≠ designer_id で UPDATE が拒否され、
--   affected = 0 → cancel API が 404 を返す機能欠陥があった。
--
-- 是正:
--   SELECT policy "Staff can view all designer task assignments" と対称に、
--   UPDATE も Staff(ADMIN/OPERATOR) を許可する。
--   KOREA_DESIGNER は閲覧のみ(SELECT policy)で十分。UPDATE は自分の分
--   (designer_id = auth.uid()) のみ許可しており、他人のタスク編集権限は不要。
-- ============================================================

CREATE POLICY "Staff can update designer task assignments"
  ON public.designer_task_assignments
  FOR UPDATE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('ADMIN'::user_role, 'OPERATOR'::user_role)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('ADMIN'::user_role, 'OPERATOR'::user_role)
    )
  );
