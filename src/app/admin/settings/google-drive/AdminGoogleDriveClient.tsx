/**
 * Google Drive Settings Page
 *
 * Google Drive連携設定ページ
 * - OAuth認証状態の表示
 * - 再認証リンク
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Cloud,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface TokenStatus {
  adminUserId: string | null;
  hasTokenInDb: boolean;
  refreshToken: string | null;
}

interface StatusData {
  tokenStatus: TokenStatus;
  envVars: {
    uploadFolderId: string;
    correctionFolderId: string;
    clientIdSet: boolean;
    clientSecretSet: boolean;
    redirectUriSet: boolean;
  };
}

export default function AdminGoogleDriveClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Check for OAuth callback result
  const authSuccess = searchParams.get('google_auth') === 'success';
  const authError = searchParams.get('google_auth_error');

  useEffect(() => {
    loadStatus();

    // Clear URL params after showing message
    if (authSuccess || authError) {
      setTimeout(() => {
        router.replace('/admin/settings/google-drive');
      }, 5000);
    }
  }, [authSuccess, authError]);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/google-drive/status');
      if (response.ok) {
        const result = await response.json();
        setStatus(result.data);
      }
    } catch (error) {
      console.error('Failed to load status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const response = await fetch('/api/auth/google');
      const result = await response.json();

      if (result.success && result.data.authUrl) {
        setAuthUrl(result.data.authUrl);
        // Redirect to Google OAuth
        window.location.href = result.data.authUrl;
      }
    } catch (error) {
      console.error('Failed to get auth URL:', error);
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const isConnected = status?.tokenStatus?.hasTokenInDb ?? false;
  const envConfigured = status?.envVars?.clientIdSet && status?.envVars?.clientSecretSet;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Cloud className="w-7 h-7 text-blue-600" />
                Google Drive連携
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Google Driveへのファイルアップロード設定
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Auth Success/Error Messages */}
        {authSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-800">Google連携が完了しました</p>
              <p className="text-sm text-green-700">リフレッシュトークンが保存されました</p>
            </div>
          </div>
        )}

        {authError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">Google連携エラー</p>
              <p className="text-sm text-red-700">{decodeURIComponent(authError)}</p>
            </div>
          </div>
        )}

        {/* Connection Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-900">接続状態</h2>
          </div>

          <div className="p-6">
            {!envConfigured ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">環境変数が設定されていません</p>
                  <p className="text-sm text-amber-700 mt-1">
                    以下の環境変数を設定してください:
                  </p>
                  <ul className="text-sm text-amber-700 mt-2 space-y-1 font-mono">
                    <li>• NEXT_PUBLIC_GOOGLE_CLIENT_ID</li>
                    <li>• GOOGLE_CLIENT_SECRET</li>
                    <li>• NEXT_PUBLIC_GOOGLE_REDIRECT_URI</li>
                    <li>• GOOGLE_DRIVE_CORRECTION_FOLDER_ID</li>
                    <li>• GOOGLE_DRIVE_ADMIN_USER_ID</li>
                  </ul>
                </div>
              </div>
            ) : isConnected ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-green-800">Google Driveに接続済み</p>
                  <p className="text-sm text-green-700 mt-1">
                    Admin User ID: {status?.tokenStatus?.adminUserId}
                  </p>
                  <p className="text-sm text-green-700">
                    リフレッシュトークン: 保存済み
                  </p>
                </div>
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      接続中...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      再認証
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-red-800">未接続</p>
                  <p className="text-sm text-red-700 mt-1">
                    Google Driveへの認証が必要です
                  </p>
                </div>
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      接続中...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Google連携
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Environment Config Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-900">環境設定</h2>
          </div>

          <div className="p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <dt className="text-sm text-gray-600">Client ID</dt>
                <dd className="text-sm font-medium">
                  {status?.envVars?.clientIdSet ? (
                    <span className="text-green-600">設定済み</span>
                  ) : (
                    <span className="text-red-600">未設定</span>
                  )}
                </dd>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <dt className="text-sm text-gray-600">Client Secret</dt>
                <dd className="text-sm font-medium">
                  {status?.envVars?.clientSecretSet ? (
                    <span className="text-green-600">設定済み</span>
                  ) : (
                    <span className="text-red-600">未設定</span>
                  )}
                </dd>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <dt className="text-sm text-gray-600">Redirect URI</dt>
                <dd className="text-sm font-medium">
                  {status?.envVars?.redirectUriSet ? (
                    <span className="text-green-600">設定済み</span>
                  ) : (
                    <span className="text-red-600">未設定</span>
                  )}
                </dd>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <dt className="text-sm text-gray-600">Upload Folder ID</dt>
                <dd className="text-sm font-mono text-xs">
                  {status?.envVars?.uploadFolderId || '-'}
                </dd>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <dt className="text-sm text-gray-600">Correction Folder ID</dt>
                <dd className="text-sm font-mono text-xs">
                  {status?.envVars?.correctionFolderId || '-'}
                </dd>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <dt className="text-sm text-gray-600">Admin User ID</dt>
                <dd className="text-sm font-mono text-xs">
                  {status?.tokenStatus?.adminUserId || '-'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Help Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-900">ヘルプ</h2>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">初回接続時の注意点</h3>
              <p className="text-sm text-gray-600">
                初めて接続する際、Googleから以下の権限を要求されます:
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
                <li>Google Driveへのファイルアクセス</li>
                <li>指定したフォルダへのファイルアップロード</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">リフレッシュトークンが取得できない場合</h3>
              <p className="text-sm text-gray-600">
                以前にこのアプリを承認した場合、Googleはリフレッシュトークンを返さないことがあります。
                その場合は以下の手順で再認証してください:
              </p>
              <ol className="text-sm text-gray-600 mt-2 space-y-1 list-decimal list-inside">
                <li>
                  <a
                    href="https://myaccount.google.com/permissions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Googleアカウントの権限ページ
                  </a>
                  を開く
                </li>
                <li>このアプリ（Epackage Lab）の権限を削除</li>
                <li>再度「Google連携」ボタンをクリック</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
