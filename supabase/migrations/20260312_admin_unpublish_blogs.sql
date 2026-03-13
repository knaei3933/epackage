-- Admin function to unpublish all blog posts except stand-pouch-v2
CREATE OR REPLACE FUNCTION admin_unpublish_blogs_except_stand_pouch()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
  result JSONB;
BEGIN
  -- Update all published posts except stand-pouch-v2 to draft
  UPDATE blog_posts
  SET status = 'draft',
      updated_at = NOW()
  WHERE slug != 'stand-pouch-v2' AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  -- Ensure stand-pouch-v2 is published
  UPDATE blog_posts
  SET status = 'published',
      updated_at = NOW()
  WHERE slug = 'stand-pouch-v2';

  result := jsonb_build_object(
    'success', true,
    'updated_count', updated_count,
    'message', 'Unpublished all blogs except stand-pouch-v2'
  );

  RETURN result;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION admin_unpublish_blogs_except_stand_pouch() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_unpublish_blogs_except_stand_pouch() TO anon;
