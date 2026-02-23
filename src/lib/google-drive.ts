import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ============================================================
// Type Definitions
// ============================================================

export interface UploadedFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
}

// ============================================================
// Token Management
// ============================================================

/**
 * 사용자별 refresh 토큰 반환
 */
export async function getRefreshToken(userId: string): Promise<string> {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from('user_google_tokens')
    .select('refresh_token')
    .eq('user_id', userId)
    .single();

  if (error || !data?.refresh_token) {
    throw new Error(`Google token not found for user: ${userId}`);
  }

  return data.refresh_token;
}

/**
 * 유효한 access 토큰 반환 (만료 시 갱신)
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const refreshToken = await getRefreshToken(userId);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * 파일 업로드용 관리자 액세스 토큰 반환
 * 모든 파일 업로드는 관리자의 Google Drive 토큰을 사용
 */
export async function getAdminAccessTokenForUpload(): Promise<string> {
  const adminUserId = process.env.GOOGLE_DRIVE_ADMIN_USER_ID;
  console.log('[getAdminAccessTokenForUpload] Admin User ID:', adminUserId);

  if (!adminUserId) {
    console.error('[getAdminAccessTokenForUpload] GOOGLE_DRIVE_ADMIN_USER_ID not set');
    throw new Error('GOOGLE_DRIVE_ADMIN_USER_ID 환경 변수가 설정되지 않았습니다.');
  }

  try {
    return await getValidAccessToken(adminUserId);
  } catch (error) {
    console.error('[getAdminAccessTokenForUpload] Failed to get token:', error);
    throw error;
  }
}

// ============================================================
// File Upload
// ============================================================

/**
 * 구글 드라이브에 파일 업로드
 *
 * Google Drive API v3 multipart upload 방식 사용
 * FormData를 사용하여 multipart/related 요청을 자동으로 구성
 */
export async function uploadFileToDrive(
  file: File | Buffer,
  fileName: string,
  mimeType: string,
  folderId: string,
  accessToken: string
): Promise<UploadedFile> {
  console.log('[uploadFileToDrive] Starting upload:', { fileName, mimeType, folderId });

  // FormData를 사용하여 multipart/related 요청 구성
  const formData = new FormData();

  // 메타데이터 파트
  const metadata = {
    name: fileName,
    parents: [folderId]
  };

  // Google Drive API는 multipart 업로드 시 특정 형식 요구
  // 첫 번째 파트: JSON 메타데이터
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json; charset=UTF-8' }));

  // 두 번째 파트: 파일 데이터
  let fileBlob: Blob;
  if (file instanceof Blob) {
    fileBlob = file;
  } else if (file instanceof Buffer) {
    fileBlob = new Blob([file], { type: mimeType });
  } else {
    const arrayBuffer = await file.arrayBuffer();
    fileBlob = new Blob([arrayBuffer], { type: mimeType });
  }
  formData.append('file', fileBlob, fileName);

  console.log('[uploadFileToDrive] File size:', fileBlob.size, 'bytes');

  // Google Drive API v3에 업로드
  const response = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
        // Content-Type은 FormData에 의해 자동으로 설정됨 (multipart/form-data)
      },
      body: formData
    }
  );

  console.log('[uploadFileToDrive] Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[uploadFileToDrive] Error response:', errorText);
    throw new Error(`Failed to upload file (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  console.log('[uploadFileToDrive] Upload successful:', result.id);

  return {
    id: result.id,
    name: result.name,
    webViewLink: result.webViewLink,
    webContentLink: result.webContentLink
  };
}

/**
 * 여러 파일 업로드
 */
export async function uploadMultipleFiles(
  files: Array<{ file: File | Buffer; name: string; mimeType: string }>,
  folderId: string,
  accessToken: string
): Promise<UploadedFile[]> {
  const uploadPromises = files.map(({ file, name, mimeType }) =>
    uploadFileToDrive(file, name, mimeType, folderId, accessToken)
  );

  return await Promise.all(uploadPromises);
}

// ============================================================
// Folder Management
// ============================================================

/**
 * 입고 데이터용 폴더 ID 반환
 */
export function getUploadFolderId(): string {
  return process.env.GOOGLE_DRIVE_UPLOAD_FOLDER_ID || '';
}

/**
 * 교정 데이터용 폴더 ID 반환
 */
export function getCorrectionFolderId(): string {
  return process.env.GOOGLE_DRIVE_CORRECTION_FOLDER_ID || '';
}

// ============================================================
// Google OAuth Helper Functions
// ============================================================

/**
 * Google OAuth 인증 URL 생성
 *
 * @param userId - 사용자 ID
 * @returns Google OAuth 인증 URL
 */
export function getGoogleAuthUrl(userId: string): string {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;

  const scopes = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive'
  ].join(' ');

  const state = userId;

  const params = new URLSearchParams({
    client_id: clientId || '',
    redirect_uri: redirectUri || '',
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    prompt: 'consent',
    state: state
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * 인증 코드를 액세스 토큰으로 교환
 *
 * @param code - 인증 코드
 * @returns 토큰 응답 (access_token, refresh_token, etc.)
 */
export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId || '',
      client_secret: clientSecret || '',
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri || ''
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for token: ${error}`);
  }

  return await response.json();
}

/**
 * 리프레시 토큰을 데이터베이스에 저장
 *
 * @param userId - 사용자 ID
 * @param refreshToken - 리프레시 토큰
 */
export async function saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { error } = await supabase
    .from('user_google_tokens')
    .upsert({
      user_id: userId,
      refresh_token: refreshToken,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    throw new Error(`Failed to save refresh token: ${error.message}`);
  }
}
