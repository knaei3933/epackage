-- Add additional blog categories to match TypeScript definitions
INSERT INTO blog_categories (id, name_ja, name_en, sort_order) VALUES
  ('product-intro', '製品紹介', 'Product Introduction', 10),
  ('practical-tips', '実践的ノウハウ', 'Practical Tips', 11),
  ('customer-stories', '導入事例', 'Customer Stories', 12),
  ('printing-tech', '印刷技術', 'Printing Technology', 13)
ON CONFLICT (id) DO NOTHING;
