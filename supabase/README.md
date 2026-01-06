# Supabase Migrations

This directory contains SQL migrations for the Epackage Lab authentication system.

## Migration Files

### `20250125000000_create_profiles_table.sql`
- Creates the `profiles` table extending Supabase Auth
- Sets up custom types (business_type, product_category, user_role, user_status)
- Configures Row Level Security (RLS) policies
- Creates helper functions for user management
- Sets up triggers for automatic profile creation

## Applying Migrations

### Option 1: Supabase Dashboard (Recommended for Initial Setup)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `20250125000000_create_profiles_table.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration

### Option 2: Supabase CLI (Recommended for Development)

First, install the Supabase CLI:

```bash
npm install -g supabase
```

Then link your project:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Apply migrations:

```bash
supabase db push
```

### Option 3: Direct API Call

Use the Supabase REST API to execute the migration:

```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/rest/v1/rpc/exec' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "COPY PASTE SQL HERE"}'
```

## Verification

After applying the migration, verify the setup:

1. **Check Table Creation**:
   - Go to **Table Editor** in Supabase dashboard
   - You should see the `profiles` table

2. **Check RLS Policies**:
   - Go to **Authentication** → **Policies**
   - You should see policies for `profiles` table

3. **Test Helper Functions**:
   ```sql
   -- Test profile creation
   SELECT get_user_profile('user-uuid-here');

   -- Test active user check
   SELECT is_user_active('user-uuid-here');
   ```

## Environment Configuration

Make sure your `.env.local` has the correct Supabase configuration:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Troubleshooting

### Error: "relation \"profiles\" does not exist"
- Ensure migration was applied successfully
- Check Supabase logs for errors

### Error: "permission denied for table profiles"
- Verify RLS policies are correctly set
- Check that service role key is used for admin operations

### Error: "column \"xxx\" does not exist"
- Re-run the migration from scratch
- Drop existing profiles table first: `DROP TABLE IF EXISTS profiles CASCADE;`

## Migration Rollback

To rollback the migration:

```sql
-- Drop trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS get_user_profile(UUID);
DROP FUNCTION IF EXISTS is_user_active(UUID);
DROP FUNCTION IF EXISTS update_last_login(UUID);

-- Drop policies
DROP POLICY IF EXISTS "Public profiles by email are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;

-- Drop table
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop types
DROP TYPE IF EXISTS business_type;
DROP TYPE IF EXISTS product_category;
DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS user_status;
```

## Next Steps

After migration is complete:

1. Configure email templates in Supabase Auth settings
2. Set up initial admin user
3. Test registration flow
4. Verify API endpoints work correctly

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Review the API endpoints in `src/app/api/auth/`
- Check the authentication types in `src/types/auth.ts`
