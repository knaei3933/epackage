-- Merge multiple permissive RLS policies for admin_notifications
-- Migration: 20260108_merge_rls_policies_admin_notifications

-- Drop old policies
DROP POLICY IF EXISTS "Admins can manage all admin_notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Users can view own admin_notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Users can update own admin_notifications" ON public.admin_notifications;

-- Create merged SELECT policy for all non-service roles
CREATE POLICY "Unified access for admin_notifications"
  ON public.admin_notifications
  FOR SELECT
  TO anon, authenticated, authenticator, dashboard_user
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'ADMIN'
    )
    OR user_id = (SELECT auth.uid())
  );

-- Create merged UPDATE policy
CREATE POLICY "Unified update for admin_notifications"
  ON public.admin_notifications
  FOR UPDATE
  TO anon, authenticated, authenticator, dashboard_user
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'ADMIN'
    )
    OR user_id = (SELECT auth.uid())
  );
