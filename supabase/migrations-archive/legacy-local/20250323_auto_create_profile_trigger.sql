-- ============================================================
-- Auto-create Profile Trigger
-- ============================================================
-- When a new user is created in auth.users, automatically create
-- a corresponding profile in the public.profiles table.
-- This eliminates race conditions and foreign key constraint violations.

-- Enable supabase extension
create extension if not exists supabase;

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_business_type text;
  user_user_type text;
begin
  -- Determine business_type and user_type from user metadata
  user_business_type := coalesce(
    new.raw_user_meta_data->>'business_type',
    'INDIVIDUAL'
  );

  user_user_type := case
    when user_business_type = 'CORPORATION' then 'B2B'
    else 'B2C'
  end;

  -- Insert into profiles table
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

  -- Create default delivery address
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

  -- Create default billing address
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

-- Drop trigger if exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- Grant necessary permissions
grant execute on function public.handle_new_user to service_role;
grant usage on schema public to anon, authenticated;
grant all on table public.profiles to service_role;
grant all on table public.delivery_addresses to service_role;
grant all on table public.billing_addresses to service_role;
