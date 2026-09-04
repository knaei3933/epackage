-- profiles テーブルへ FAX 番号カラムを追加（任意・nullable）
-- corporate_phone / personal_phone と同じ text 型で統一
ALTER TABLE profiles ADD COLUMN fax text;;
