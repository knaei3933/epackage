/**
 * Send for Signature Modal
 *
 * Modal dialog for initiating electronic signature requests
 * Supports multiple providers (DocuSign, HelloSign, Local)
 */

'use client';

import React, { useState, useCallback } from 'react';
import { X, Users, Calendar, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SignatureStatusBadge } from './SignatureStatusBadge';

export interface Signer {
  email: string;
  name: string;
  order: number;
  role?: 'signer' | 'cc' | 'witness';
  language?: 'ja' | 'en' | 'zh';
}

export interface SendForSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentName: string;
  onSend: (data: SignatureRequestData) => Promise<SignatureResponse>;
  className?: string;
}

export interface SignatureRequestData {
  documentId: string;
  documentName: string;
  documentContent: string;
  documentType: 'pdf' | 'docx' | 'html';
  signers: Signer[];
  subject: string;
  message: string;
  expiresAt?: string;
  signatureType?: 'handwritten' | 'hanko' | 'mixed';
  provider?: 'docusign' | 'hellosign' | 'local';
}

export interface SignatureResponse {
  success: boolean;
  envelopeId?: string;
  status?: string;
  signingUrl?: string;
  error?: string;
}

export function SendForSignatureModal({
  isOpen,
  onClose,
  documentId,
  documentName,
  onSend,
  className,
}: SendForSignatureModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SignatureResponse | null>(null);
  const [signers, setSigners] = useState<Signer[]>([
    { email: '', name: '', order: 1, language: 'ja' },
  ]);
  const [subject, setSubject] = useState('署名をお願いいたします (Please sign this document)');
  const [message, setMessage] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [signatureType, setSignatureType] = useState<'handwritten' | 'hanko' | 'mixed'>('handwritten');
  const [provider, setProvider] = useState<'docusign' | 'hellosign' | 'local'>('local');

  // Add signer
  const addSigner = useCallback(() => {
    const newOrder = signers.length + 1;
    setSigners([...signers, { email: '', name: '', order: newOrder, language: 'ja' }]);
  }, [signers]);

  // Remove signer
  const removeSigner = useCallback((index: number) => {
    if (signers.length <= 1) return;
    const updated = signers.filter((_, i) => i !== index);
    // Reorder remaining signers
    const reordered = updated.map((signer, i) => ({ ...signer, order: i + 1 }));
    setSigners(reordered);
  }, [signers]);

  // Update signer
  const updateSigner = useCallback((index: number, field: keyof Signer, value: any) => {
    const updated = [...signers];
    updated[index] = { ...updated[index], [field]: value };
    setSigners(updated);
  }, [signers]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    // Validation
    const invalidSigner = signers.find(s => !s.email || !s.name);
    if (invalidSigner) {
      setResult({ success: false, error: 'すべての署名者のメールアドレスと名前を入力してください' });
      return;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const requestData: SignatureRequestData = {
      documentId,
      documentName,
      documentContent: '', // Will be populated by parent
      documentType: 'pdf',
      signers: signers.sort((a, b) => a.order - b.order),
      subject,
      message,
      expiresAt: expiresAt.toISOString(),
      signatureType,
      provider,
    };

    setIsLoading(true);
    setResult(null);

    try {
      const response = await onSend(requestData);
      setResult(response);

      if (response.success) {
        // Auto-close after 3 seconds on success
        setTimeout(() => {
          onClose();
          // Reset form
          setSigners([{ email: '', name: '', order: 1, language: 'ja' }]);
          setSubject('署名をお願いいたします (Please sign this document)');
          setMessage('');
          setResult(null);
        }, 3000);
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : '署名送信中にエラーが発生しました',
      });
    } finally {
      setIsLoading(false);
    }
  }, [signers, subject, message, expiresInDays, signatureType, provider, documentId, documentName, onSend, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50',
        className
      )}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold">署名リクエスト送信</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{documentName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Provider selection */}
          <div>
            <label className="block text-sm font-medium mb-2">署名プロバイダ (Signature Provider)</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            >
              <option value="local">ローカル署名 (Local)</option>
              <option value="docusign">DocuSign</option>
              <option value="hellosign">HelloSign</option>
            </select>
          </div>

          {/* Signature type */}
          <div>
            <label className="block text-sm font-medium mb-2">署名タイプ (Signature Type)</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="handwritten"
                  checked={signatureType === 'handwritten'}
                  onChange={(e) => setSignatureType(e.target.value as any)}
                  className="text-blue-600"
                />
                <span>手書き署名</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="hanko"
                  checked={signatureType === 'hanko'}
                  onChange={(e) => setSignatureType(e.target.value as any)}
                  className="text-blue-600"
                />
                <span>はんこ・印鑑</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="mixed"
                  checked={signatureType === 'mixed'}
                  onChange={(e) => setSignatureType(e.target.value as any)}
                  className="text-blue-600"
                />
                <span>混合</span>
              </label>
            </div>
          </div>

          {/* Signers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">
                署名者
              </label>
              <button
                type="button"
                onClick={addSigner}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                + 追加
              </button>
            </div>

            <div className="space-y-3">
              {signers.map((signer, index) => (
                <div key={index} className="flex items-end gap-2 p-3 border dark:border-gray-700 rounded-md">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        順序
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={signer.order}
                        onChange={(e) => updateSigner(index, 'order', parseInt(e.target.value))}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        言語
                      </label>
                      <select
                        value={signer.language}
                        onChange={(e) => updateSigner(index, 'language', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      >
                        <option value="ja">日本語</option>
                        <option value="en">English</option>
                        <option value="zh">中文</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        名前 *
                      </label>
                      <input
                        type="text"
                        value={signer.name}
                        onChange={(e) => updateSigner(index, 'name', e.target.value)}
                        placeholder="山田 太郎"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        メールアドレス *
                      </label>
                      <input
                        type="email"
                        value={signer.email}
                        onChange={(e) => updateSigner(index, 'email', e.target.value)}
                        placeholder="example@company.com"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSigner(index)}
                    disabled={signers.length <= 1}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium mb-2">
              件名
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium mb-2">
              メッセージ (オプション)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              placeholder="追加のメッセージを入力してください..."
            />
          </div>

          {/* Expiration */}
          <div>
            <label className="block text-sm font-medium mb-2">
              有効期限
            </label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <input
                type="number"
                min="1"
                max="365"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
                className="w-20 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
              <span>日後</span>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div
              className={cn(
                'p-4 rounded-md',
                result.success
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
              )}
            >
              {result.success ? (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-medium">署名リクエストを送信しました！</span>
                </div>
              ) : (
                <div>
                  <div className="font-medium mb-1">エラーが発生しました</div>
                  <div className="text-sm">{result.error}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || result?.success}
            className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            送信する
          </button>
        </div>
      </div>
    </div>
  );
}
