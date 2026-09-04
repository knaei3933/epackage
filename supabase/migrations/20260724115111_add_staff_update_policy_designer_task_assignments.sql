-- designer_task_assignments に Staff(ADMIN/OPERATOR) 用 UPDATE policy を追加。
-- 従来は designer_id = auth.uid() のみで、admin が createClient(anon+RLS) 経由で
-- 他人のタスクをキャンセル(cancelDesignerTask)すると拒否され 404 になる機能欠陥があった。
-- SELECT policy "Staff can view all..." と対称。
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
  );;
