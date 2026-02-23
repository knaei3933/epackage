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
 * - uploadType=multipart: 메타데이터와 파일을 함께 전송
 * - Content-Type: multipart/related 사용 (Google API 표준)
 */
export async function uploadFileToDrive(
  file: File | Buffer,
  fileName: string,
  mimeType: string,
  folderId: string,
  accessToken: string
): Promise<UploadedFile> {
  console.log('[uploadFileToDrive] Starting upload:', { fileName, mimeType, folderId });

  // 파일 내용을 Buffer로 변환
  let fileContent: Buffer;
  if (file instanceof Buffer) {
    fileContent = file;
  } else {
    const arrayBuffer = await file.arrayBuffer();
    fileContent = Buffer.from(arrayBuffer);
  }

  console.log('[uploadFileToDrive] File size:', fileContent.length, 'bytes');

  // 메타데이터 생성
  const metadata = {
    name: fileName,
    parents: [folderId]
  };

  // multipart/related 생성 (Google Drive API 표준)
  const boundary = '-------boundary_' + Math.random().toString(36).substring(2);

  // 메타데이터 파트
  const metadataPart = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    ''
  ].join('\r\n');

  // 파일 파트
  const filePartHeader = [
    `--${boundary}`,
    `Content-Type: ${mimeType}`,
    ''
  ].join('\r\n');

  // 전체 바디 조합 (파일 헤더와 내용 사이에 빈 줄 필요)
  const metadataBuffer = Buffer.from(metadataPart, 'utf-8');
  const fileHeaderBuffer = Buffer.from(filePartHeader, 'utf-8');
  const fileBlankLine = Buffer.from('\r\n', 'utf-8');  // 빈 줄 추가
  const fileBuffer = fileContent;
  const closingBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');

  const fullBody = Buffer.concat([
    metadataBuffer,
    fileHeaderBuffer,
    fileBlankLine,  // 헤더와 내용 사이의 빈 줄
    fileBuffer,
    closingBuffer
  ]);

  console.log('[uploadFileToDrive] Request body size:', fullBody.length, 'bytes');
  console.log('[uploadFileToDrive] Content-Type:', `multipart/related; boundary=${boundary}`);

  // 업로드 요청 (webViewLinkとwebContentLink를取得するためfieldsパ라メータ追加)
  // Node.js 환경에서 fetch가 Buffer를 처리할 수 있도록 Uint8Array로 변환
  const response = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      // Vercel環境ではBuffer.buffer (ArrayBuffer) を使用
      body: fullBody.buffer || fullBody
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
