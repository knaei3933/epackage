-- Unpublish stand-pouch-v2 blog post
UPDATE blog_posts 
SET status = 'draft' 
WHERE slug = 'stand-pouch-v2';
