/**
 * Customer Contact History API
 *
 * Manages contact history entries for customers
 * including emails, calls, and notes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// =====================================================
// GET - Fetch contact history for a customer
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const supabase = createServiceClient();
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;

    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check if customer_contacts table exists, if not return empty array
    const { data: contactHistory, error } = await supabase
      .from('customer_contacts')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      // Table might not exist yet, return empty array
      console.log('Customer contacts table may not exist:', error.message);
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No contact history found',
      });
    }

    return NextResponse.json({
      success: true,
      data: contactHistory || [],
    });
  } catch (error) {
    console.error('Contact history fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Add new contact history entry
// =====================================================

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const supabase = createServiceClient();
    const { id } = await params;
    const body = await request.json();

    const { type, subject, content, createdBy } = body;

    if (!type || !content) {
      return NextResponse.json(
        { success: false, error: 'Type and content are required' },
        { status: 400 }
      );
    }

    // Create contact history entry
    const { data: newContact, error } = await supabase
      .from('customer_contacts')
      .insert({
        customer_id: id,
        type,
        subject: subject || null,
        content,
        created_by: createdBy || 'System',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // Table might not exist, try to create it
      console.log('Error creating contact entry, table may not exist:', error.message);
      return NextResponse.json(
        { success: false, error: 'Contact history feature not available' },
        { status: 501 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newContact,
      message: 'Contact history entry added successfully',
    });
  } catch (error) {
    console.error('Contact history creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
