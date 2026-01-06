/**
 * Document Download Card Component
 * ドキュメントダウンロードカード
 *
 * Displays downloadable documents with download actions
 */

'use client';

import React, { useState } from 'react';
import { type DownloadableDocument, getDocumentTypeLabel } from '@/types/portal';
import { cn } from '@/lib/utils';

interface DocumentDownloadCardProps {
  documents: DownloadableDocument[];
  onDownload?: (document: DownloadableDocument) => Promise<void>;
}

export function DocumentDownloadCard({ documents, onDownload }: DocumentDownloadCardProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (document: DownloadableDocument) => {
    if (downloadingId) return;

    setDownloadingId(document.id);
    try {
      await onDownload?.(document);
    } finally {
      setDownloadingId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 text-center">
        <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-slate-600 dark:text-slate-400">ダウンロード可能なドキュメントはありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white">ドキュメント</h3>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {documents.map((document) => {
          const label = getDocumentTypeLabel(document.type, 'ja');
          const isDownloading = downloadingId === document.id;

          return (
            <div key={document.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center gap-3">
                {/* File Icon */}
                <div className="w-10 h-10 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {document.name_ja}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                      {label}
                    </span>
                    {document.file_size && (
                      <span>{(document.file_size / 1024 / 1024).toFixed(2)} MB</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Download Button */}
              {document.is_available ? (
                <button
                  onClick={() => handleDownload(document)}
                  disabled={isDownloading || !document.file_url}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    'hover:bg-blue-50 dark:hover:bg-blue-900/20',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                  title="ダウンロード"
                >
                  {isDownloading ? (
                    <svg className="w-5 h-5 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  )}
                </button>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1">
                  準備中
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
