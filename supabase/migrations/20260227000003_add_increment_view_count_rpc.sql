-- RPC function to atomically increment blog view count
-- This prevents race conditions when multiple users view a post simultaneously

CREATE OR REPLACE FUNCTION increment_blog_view_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE blog_posts 
  SET view_count = COALESCE(view_count, 0) + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_blog_view_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_blog_view_count(UUID) TO anon;
