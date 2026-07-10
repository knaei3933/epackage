/**
 * Uploaded Files List section for OrderFileUploadSection
 */

'use client';

import { FileText, Trash2, Eye, Loader2, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface UploadedFilesListProps {
  uploadedFiles: any[];
  displayFiles: any[];
  currentPage: number;
  totalPages: number;
  handleDelete: (fileId: string, fileName: string) => void;
  deletingFileId: string | null;
  getValidationStatusBadge: (status: string) => React.ReactNode;
  getFileSkuName: (file: any) => string;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  hasAIFile: boolean;
}

export function UploadedFilesList({ uploadedFiles, displayFiles, currentPage, totalPages, handleDelete, deletingFileId, getValidationStatusBadge, getFileSkuName, setCurrentPage, hasAIFile }: UploadedFilesListProps) {
  return (
    <>
        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="border-t border-border-secondary pt-4">
            <h3 className="text-sm font-medium text-text-primary mb-3">
              アップロード済みファイル ({uploadedFiles.length})
            </h3>
            <div className="space-y-2">
              {displayFiles.map((file) => {
                const isAIFile = file.file_type.toLowerCase() === 'production_data';
                return (
                  <div
                    key={file.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isAIFile ? 'bg-green-50 border border-green-200' : 'bg-bg-secondary'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-text-primary truncate">
                          {file.file_name}
                        </p>
                        {getValidationStatusBadge(file.validation_status)}
                        {isAIFile && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ 必須データ
                          </span>
                        )}
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {getFileSkuName(file)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 mt-1 text-sm text-text-muted">
                        <span>入稿データ</span>
                        <span>•</span>
                        <span>{new Date(file.uploaded_at).toLocaleString('ja-JP')}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark text-sm"
                      >
                        ダウンロード
                      </a>
                      <button
                        onClick={() => handleDelete(file.id, file.file_name)}
                        disabled={deletingFileId === file.id}
                        className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingFileId === file.id ? '削除中...' : '削除'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    "hover:bg-muted",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-text-muted min-w-[60px] text-center">
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    "hover:bg-muted",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Show completion message when AI file is uploaded */}
            {hasAIFile && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-green-800">
                    ✓ 入稿データ（AI）がアップロードされました。追加でアップロードする場合は、上記の手順で行ってください。
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
    </>
  );
}
