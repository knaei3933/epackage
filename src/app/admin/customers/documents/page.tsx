/**
 * Customer Documents Library Page
 * ドキュメントライブラリページ
 *
 * Displays all downloadable documents with filtering by type
 *
 * Migrated from /portal/documents to /admin/customers/documents
 */

import React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase';
import { DOCUMENT_TYPE_LABELS } from '@/types/portal';

// Force dynamic rendering - this page requires authentication and cannot be pre-rendered
export const dynamic = 'force-dynamic';

async function getDocuments(searchParams: { type?: string }) {
  // Use service client for admin pages
  const supabase = createServiceClient();

  let query = supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });

  // Apply type filter if specified
  if (searchParams.type) {
    query = query.eq('type', searchParams.type);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Documents fetch error:', error);
    return { documents: [] };
  }

  return { documents: data || [] };
}

export default async function CustomerDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const { documents } = await getDocuments(params);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          ドキュメント
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          見積書、契約書、請求書などのドキュメントをダウンロードできます
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            フィルター:
          </span>
          <Link
            href="/admin/customers/documents"
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg border transition-colors',
              !params.type
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-medium'
                : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
            )}
          >
            すべて
          </Link>
          {Object.entries(DOCUMENT_TYPE_LABELS).map(([type, info]) => (
            <Link
              key={type}
              href={`/admin/customers/documents?type=${type}`}
              className={cn(
                'px-3 py-1.5 text-sm rounded-lg border transition-colors flex items-center gap-1.5',
                params.type === type
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-medium'
                  : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
              )}
            >
              <span>{info.icon === 'file-text' && '📄'}</span>
              <span>{info.icon === 'file-signature' && '✍️'}</span>
              <span>{info.icon === 'receipt' && '🧾'}</span>
              <span>{info.icon === 'palette' && '🎨'}</span>
              <span>{info.icon === 'package' && '📦'}</span>
              <span>{info.icon === 'clipboard-list' && '📋'}</span>
              <span>{info.icon === 'check-circle' && '✅'}</span>
              {info.ja}
            </Link>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      {documents.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc: any) => (
            <div key={doc.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white truncate">
                    {doc.name_ja || doc.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {new Date(doc.created_at).toLocaleDateString('ja-JP')}
                  </p>
                  {doc.file_url ? (
                    <a
                      href={doc.file_url}
                      download
                      className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      ダウンロード
                    </a>
                  ) : (
                    <span className="inline-block mt-3 text-sm text-slate-500 dark:text-slate-400">
                      準備中
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            ドキュメントがありません
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {params.type
              ? `${DOCUMENT_TYPE_LABELS[params.type as keyof typeof DOCUMENT_TYPE_LABELS]?.ja || params.type}のドキュメントはありません`
              : 'まだダウンロード可能なドキュメントがありません'}
          </p>
        </div>
      )}
    </div>
  );
}
