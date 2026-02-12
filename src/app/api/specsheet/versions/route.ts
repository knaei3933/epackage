/**
 * Specification Sheet Versions API
 *
 * 仕様書バージョン管理API
 * - GET: 仕様書のバージョン履歴を取得
 * - POST: 新しいバージョンを作成
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import type { SpecSheetData } from '@/types/specsheet';

// ============================================================
// Types
// ============================================================

interface VersionResponse {
  success: boolean;
  versions?: SpecSheetVersion[];
  version?: SpecSheetVersion;
  error?: string;
}

interface SpecSheetVersion {
  id: string;
  specNumber: string;
  revision: string;
  issueDate: string;
  status: SpecSheetData['status'];
  title: string;
  description?: string;
  createdAt: string;
  createdBy: string;
  data: SpecSheetData;
}

// ============================================================
// Supabase Client
// ============================================================

function getSupabaseClient(userId: string) {
  // Use authenticated service client with audit logging
  return createAuthenticatedServiceClient({
    operation: 'spec_sheet_versions',
    userId,
    route: '/api/specsheet/versions',
  });
}

// ============================================================
// GET Handler - Fetch Versions
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // ✅ STEP 1: Check authentication (SECURE: using getUser() instead of getSession())
    // Initialize Supabase client using modern @supabase/ssr pattern
    const { client: supabaseAuth } = await createSupabaseSSRClient($$$ARGS);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: '認証されていません。ログインしてください。',
        } as VersionResponse,
        { status: 401 }
      );
    }

    // ✅ STEP 2: Verify user is active member
    const { data: profile } = await supabaseAuth
      .from('profiles')
      .select('id, role, status')
      .eq('id', user.id)
      .single();

    if (!profile || profile.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          error: '有効なアカウントではありません。',
        } as VersionResponse,
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const specNumber = searchParams.get('specNumber');
    const revision = searchParams.get('revision');

    if (!specNumber) {
      return NextResponse.json(
        {
          success: false,
          error: 'specNumberパラメータが必要です',
        } as VersionResponse,
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient(user.id);

    let query = supabase
      .from('spec_sheets')
      .select('*')
      .eq('spec_number', specNumber);

    if (revision) {
      query = query.eq('revision', revision);
    }

    // Order by revision (descending for newer versions first)
    query = query.order('revision', { ascending: false });

    const { data: sheets, error } = await query;

    if (error) {
      throw error;
    }

    // Transform to version format
    const versions: SpecSheetVersion[] = (sheets || []).map((sheet: any) => ({
      id: sheet.id,
      specNumber: sheet.spec_number,
      revision: sheet.revision,
      issueDate: sheet.issue_date,
      status: sheet.status,
      title: sheet.title,
      description: sheet.description,
      createdAt: sheet.created_at,
      createdBy: sheet.created_by || 'System',
      data: {
        specNumber: sheet.spec_number,
        revision: sheet.revision,
        issueDate: sheet.issue_date,
        validUntil: sheet.valid_until,
        status: sheet.status,
        category: sheet.category,
        title: sheet.title,
        description: sheet.description,
        customer: sheet.customer,
        product: sheet.product,
        production: sheet.production,
        design: sheet.design,
        pricing: sheet.pricing,
        remarks: sheet.remarks,
      } as SpecSheetData,
    }));

    return NextResponse.json({
      success: true,
      versions,
    } as VersionResponse);
  } catch (error) {
    console.error('Fetch versions error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'バージョン履歴の取得に失敗しました',
      } as VersionResponse,
      { status: 500 }
    );
  }
}

// ============================================================
// POST Handler - Create New Version
// ============================================================

interface CreateVersionBody {
  data: SpecSheetData;
  createdBy: string;
  comment?: string;
}

export async function POST(request: NextRequest) {
  try {
    // ✅ STEP 1: Check authentication (SECURE: using getUser() instead of getSession())
    // Initialize Supabase client using modern @supabase/ssr pattern
    const { client: supabaseAuth } = await createSupabaseSSRClient($$$ARGS);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: '認証されていません。ログインしてください。',
        } as VersionResponse,
        { status: 401 }
      );
    }

    // ✅ STEP 2: Verify user is active member
    const { data: profile } = await supabaseAuth
      .from('profiles')
      .select('id, role, status')
      .eq('id', user.id)
      .single();

    if (!profile || profile.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          error: '有効なアカウントではありません。',
        } as VersionResponse,
        { status: 403 }
      );
    }

    const body = (await request.json()) as CreateVersionBody;

    if (!body.data || !body.createdBy) {
      return NextResponse.json(
        {
          success: false,
          error: '必須パラメータが不足しています',
        } as VersionResponse,
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient(user.id);

    // Check if spec sheet with this number and revision exists
    const { data: existing } = await supabase
      .from('spec_sheets')
      .select('id')
      .eq('spec_number', body.data.specNumber)
      .eq('revision', body.data.revision)
      .single();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'この仕様書番号と版数の組み合わせは既に存在します',
        } as VersionResponse,
        { status: 409 }
      );
    }

    // Insert new version
    const { data: newSheet, error: insertError } = await supabase
      .from('spec_sheets')
      .insert({
        spec_number: body.data.specNumber,
        revision: body.data.revision,
        issue_date: body.data.issueDate,
        valid_until: body.data.validUntil,
        status: body.data.status,
        category: body.data.category,
        title: body.data.title,
        description: body.data.description,
        customer: body.data.customer,
        product: body.data.product,
        production: body.data.production,
        design: body.data.design,
        pricing: body.data.pricing,
        remarks: body.data.remarks,
        created_by: body.createdBy,
        version_comment: body.comment,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    const version: SpecSheetVersion = {
      id: newSheet.id,
      specNumber: newSheet.spec_number,
      revision: newSheet.revision,
      issueDate: newSheet.issue_date,
      status: newSheet.status,
      title: newSheet.title,
      description: newSheet.description,
      createdAt: newSheet.created_at,
      createdBy: newSheet.created_by,
      data: body.data,
    };

    // Update previous versions status to 'superseded'
    if (body.data.status === 'active') {
      await supabase
        .from('spec_sheets')
        .update({ status: 'superseded' })
        .eq('spec_number', body.data.specNumber)
        .neq('revision', body.data.revision);
    }

    return NextResponse.json({
      success: true,
      version,
    } as VersionResponse);
  } catch (error) {
    console.error('Create version error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'バージョンの作成に失敗しました',
      } as VersionResponse,
      { status: 500 }
    );
  }
}
