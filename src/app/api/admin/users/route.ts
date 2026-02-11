/**
 * Admin User Management API
 *
 * 管理者ユーザー管理API
 * - GET: ユーザーリスト取得 (検索、フィルター、ソート)
 * - PATCH: ユーザー情報更新
 * - DELETE: ユーザー削除
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { Database } from '@/types/database';
import { z } from 'zod';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

// ============================================================
// Types
// ============================================================

interface UserListQuery {
  page?: string;
  limit?: string;
  status?: string;
  role?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface UserListResponse {
  success: boolean;
  data?: {
    users: Array<{
      id: string;
      email: string;
      nameKanji: string;
      nameKana: string;
      companyName?: string;
      role: string;
      status: string;
      createdAt: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
  code?: string;
}

interface UpdateUserRequestBody {
  status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  role?: 'ADMIN' | 'MEMBER';
  company_name?: string;
  position?: string;
  department?: string;
}

// ============================================================
// Validation Schema
// ============================================================

const updateUserSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED']).optional(),
  role: z.enum(['ADMIN', 'MEMBER']).optional(),
  company_name: z.string().max(200).optional(),
  position: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
});

// ============================================================
// Helper Functions
// ============================================================

/**
 * Check if current user is admin
 */
async function isAdmin(
  supabase: any,
  userId: string
): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return profile?.role?.toLowerCase() === 'admin';
}

/**
 * Build Supabase query with filters
 */
function buildQuery(
  supabase: any,
  query: UserListQuery
) {
  let dbQuery = supabase
    .from('profiles')
    .select('*', { count: 'exact' });

  // Status filter
  if (query.status) {
    dbQuery = dbQuery.eq('status', query.status);
  }

  // Role filter
  if (query.role) {
    dbQuery = dbQuery.eq('role', query.role);
  }

  // Search (email, name, company)
  if (query.search) {
    dbQuery = dbQuery.or(
      `email.ilike.%${query.search}%,kanji_last_name.ilike.%${query.search}%,kanji_first_name.ilike.%${query.search}%,company_name.ilike.%${query.search}%`
    );
  }

  // Sorting
  const sortBy = query.sortBy || 'created_at';
  const sortOrder = query.sortOrder || 'desc';
  dbQuery = dbQuery.order(sortBy, { ascending: sortOrder === 'asc' });

  // Pagination
  const page = parseInt(query.page || '1');
  const limit = parseInt(query.limit || '20');
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  dbQuery = dbQuery.range(from, to);

  return { dbQuery, page, limit };
}

// ============================================================
// GET Handler - List Users
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }
const { client: supabase } = await createSupabaseSSRClient($$$ARGS);
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query: UserListQuery = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      status: searchParams.get('status') || undefined,
      role: searchParams.get('role') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    // Build and execute query
    const { dbQuery, page, limit } = buildQuery(supabase, query);

    const { data: users, error, count } = await dbQuery;

    if (error) {
      console.error('User list query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users', code: 'QUERY_ERROR' },
        { status: 500 }
      );
    }

    // Format response
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const response: UserListResponse = {
      success: true,
      data: {
        users: (users || []).map((u) => ({
          id: u.id,
          email: u.email,
          nameKanji: `${u.kanji_last_name} ${u.kanji_first_name}`,
          nameKana: `${u.kana_last_name} ${u.kana_first_name}`,
          companyName: u.company_name || undefined,
          role: u.role,
          status: u.status,
          createdAt: u.created_at,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('User list error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

