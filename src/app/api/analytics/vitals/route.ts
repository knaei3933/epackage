/**
 * Analytics API - Web Vitals Logging
 *
 * Core Web Vitals metrics logging endpoint
 * POST /api/analytics/vitals - Log web vitals metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import type { Database } from '@/types/database';

// ============================================================
// Types
// ============================================================

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  status: 'good' | 'needs-improvement' | 'poor';
  url: string;
  userAgent: string;
  timestamp: string;
}

// ============================================================
// POST: Log Web Vitals
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Only log in production or when explicitly enabled
    if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_ENABLE_VITALS_LOGGING !== 'true') {
      return NextResponse.json({
        success: true,
        message: 'Web Vitals logging is disabled',
        skipped: true,
      });
    }

    const body: WebVitalsMetric = await request.json();

    const { name, value, rating, status, url, userAgent, timestamp } = body;

    // Validate required fields
    if (!name || value === undefined || !rating || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Store in web_vitals table
    // Using type assertion for Supabase .from() limitation
    const { data, error } = await (supabase as any)
      .from('web_vitals')
      .insert({
        metric_name: name,
        value,
        rating,
        page: url, // mapped to page field
        metadata: {
          userAgent,
          measuredAt: timestamp,
        } as Database['public']['Tables']['web_vitals']['Insert']['metadata'],
        device_type: null,
        connection_type: null,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      // If table doesn't exist, log to console but don't fail
      console.warn('[Analytics API] web_vitals table may not exist:', error.message);
      return NextResponse.json({
        success: true,
        message: 'Metric logged to console only',
        warning: 'Database table not configured',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Web Vitals metric logged successfully',
      data: { id: data?.id },
    });
  } catch (error) {
    console.error('[Analytics API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to log Web Vitals metric',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// GET: Check API Status
// ============================================================

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Analytics API is working',
    enabled: process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_VITALS_LOGGING === 'true',
    timestamp: new Date().toISOString(),
  });
}
