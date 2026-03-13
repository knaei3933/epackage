-- Unpublish all blog posts except stand-pouch-v2
UPDATE blog_posts
SET status = 'draft'
WHERE slug != 'stand-pouch-v2' AND status = 'published';

-- Ensure stand-pouch-v2 is published
UPDATE blog_posts
SET status = 'published'
WHERE slug = 'stand-pouch-v2';
