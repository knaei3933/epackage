# データベーストリガー設定手順

## 問題
`profiles_id_fkey` 外部キー制約違反により、会員登録後にプロフィール作成が失敗していました。

## 解決策
ユーザー作成時に自動的にプロフィールを作成するデータベーストリガーを設定します。

## 実行手順

### 1. Supabaseダッシュボードにアクセス
https://supabase.com/dashboard/project/ijlgpzjdfipzmjvawofp

### 2. SQL Editorを開く
左側メニュー → 「SQL Editor」 → 「New query」

### 3. 以下のSQLを実行

```sql
-- ============================================================
-- Auto-create Profile Trigger
-- ============================================================
-- ユーザー作成時に自動的にプロフィールを作成するトリガー

-- supabase拡張機能を有効化
create extension if not exists supabase;

-- ユーザー作成ハンドラー関数
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_business_type text;
  user_user_type text;
begin
  -- business_type と user_type を決定
  user_business_type := coalesce(
    new.raw_user_meta_data->>'business_type',
    'INDIVIDUAL'
  );

  user_user_type := case
    when user_business_type = 'CORPORATION' then 'B2B'
    else 'B2C'
  end;

  -- プロフィールを作成
  insert into public.profiles (
    id,
    email,
    kanji_last_name,
    kanji_first_name,
    kana_last_name,
    kana_first_name,
    corporate_phone,
    personal_phone,
    business_type,
    user_type,
    company_name,
    legal_entity_number,
    position,
    department,
    company_url,
    product_category,
    acquisition_channel,
    postal_code,
    prefecture,
    city,
    street,
    role,
    status,
    created_at,
    updated_at
  ) values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'kanji_last_name', ''),
    coalesce(new.raw_user_meta_data->>'kanji_first_name', ''),
    coalesce(new.raw_user_meta_data->>'kana_last_name', ''),
    coalesce(new.raw_user_meta_data->>'kana_first_name', ''),
    new.raw_user_meta_data->>'corporate_phone',
    new.raw_user_meta_data->>'personal_phone',
    user_business_type,
    user_user_type,
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'legal_entity_number',
    new.raw_user_meta_data->>'position',
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'company_url',
    coalesce(new.raw_user_meta_data->>'product_category', 'OTHER'),
    new.raw_user_meta_data->>'acquisition_channel',
    new.raw_user_meta_data->>'postal_code',
    new.raw_user_meta_data->>'prefecture',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'street',
    'MEMBER',
    'PENDING',
    now(),
    now()
  );

  -- デフォルト配送先住所を作成
  insert into public.delivery_addresses (
    user_id,
    name,
    postal_code,
    prefecture,
    city,
    address,
    building,
    phone,
    is_default
  ) values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'company_name',
      coalesce(new.raw_user_meta_data->>'kanji_last_name', '') || ' ' || coalesce(new.raw_user_meta_data->>'kanji_first_name', '')
    ),
    coalesce(new.raw_user_meta_data->>'postal_code', ''),
    coalesce(new.raw_user_meta_data->>'prefecture', ''),
    coalesce(new.raw_user_meta_data->>'city', ''),
    coalesce(new.raw_user_meta_data->>'street', ''),
    '',
    coalesce(
      new.raw_user_meta_data->>'corporate_phone',
      new.raw_user_meta_data->>'personal_phone',
      ''
    ),
    true
  );

  -- デフォルト請求先住所を作成
  insert into public.billing_addresses (
    user_id,
    company_name,
    postal_code,
    prefecture,
    city,
    address,
    building,
    email,
    is_default
  ) values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'company_name',
      coalesce(new.raw_user_meta_data->>'kanji_last_name', '') || ' ' || coalesce(new.raw_user_meta_data->>'kanji_first_name', '')
    ),
    coalesce(new.raw_user_meta_data->>'postal_code', ''),
    coalesce(new.raw_user_meta_data->>'prefecture', ''),
    coalesce(new.raw_user_meta_data->>'city', ''),
    coalesce(new.raw_user_meta_data->>'street', ''),
    '',
    new.email,
    true
  );

  return new;
end;
$$ language plpgsql security definer;

-- 既存のトリガーを削除（存在する場合）
drop trigger if exists on_auth_user_created on auth.users;

-- トリガーを作成
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- 必要な権限を付与
grant execute on function public.handle_new_user to service_role;
grant usage on schema public to anon, authenticated;
grant all on table public.profiles to service_role;
grant all on table public.delivery_addresses to service_role;
grant all on table public.billing_addresses to service_role;
```

### 4. 実行ボタンをクリック（▶️）

## 確認方法
1. 新しいユーザーで会員登録
2. メール認証を完了
3. `/auth/pending` ページが自動的に「承認待ち」状態に移行することを確認

## 備考
- このトリガーにより、`auth.users` にユーザーが作成されると同時に `profiles`、`delivery_addresses`、`billing_addresses` テーブルにもレコードが作成されます
- 外部キー制約違反が解決し、レースコンディションも回避されます
- 既存の `/api/auth/register/create-profile` APIはトリガーが作成したプロフィールを検出して、正常に完了します
