/**
 * Google Drive Integration Library
 *
 * 구글 드라이브 파일 업로드 기능
 * - OAuth 2.0 인증
 * - 파일 업로드
 * - 폴더 관리
 */

interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  uploadFolderId: string;
  correctionFolderId: string;
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface UploadedFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
}

// ============================================================
// OAuth Helper Functions
// ============================================================

/**
 * 구글 OAuth 인증 URL 생성
 * 고객이 직접 로그인하지 않고 관리자의 토큰을 사용
 */
export function getGoogleAuthUrl(state?: string): string {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000';

  const scope = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly'
  ].join(' ');

  const params = new URLSearchParams({
    client_id: clientId || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scope,
    access_type: 'offline',
    prompt: 'consent',
    state: state || 'google_auth_state'
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * 인증 코드로 액세스 토큰 받기
 */
export async function exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000';

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId || '',
      client_secret: clientSecret || '',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for token: ${error}`);
  }

  return await response.json();
}

/**
 * 리프레시 토큰으로 액세스 토큰 갱신
 */
export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokenResponse> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId || '',
      client_secret: clientSecret || '',
      grant_type: 'refresh_token'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  return await response.json();
}

// ============================================================
// File Upload Functions
// ============================================================

/**
 * 구글 드라이브에 파일 업로드
 */
export async function uploadFileToDrive(
  file: File | Buffer,
  fileName: string,
  mimeType: string,
  folderId: string,
  accessToken: string
): Promise<UploadedFile> {
  // 메타데이터 생성
  const metadata = {
    name: fileName,
    parents: [folderId]
  };

  // multipart/form-data 생성
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const body = [
    delimiter,
    'Content-Type: application/json; charset=UTF-8',
    '\r\n',
    JSON.stringify(metadata),
    delimiter,
    `Content-Type: ${mimeType}`,
    '\r\n'
  ].join('');

  // 파일 내용
  let fileContent: Buffer;
  if (file instanceof Buffer) {
    fileContent = file;
  } else {
    const arrayBuffer = await file.arrayBuffer();
    fileContent = Buffer.from(arrayBuffer);
  }

  const fullBody = Buffer.concat([
    Buffer.from(body, 'utf-8'),
    fileContent,
    Buffer.from(closeDelimiter, 'utf-8')
  ]);

  // 업로드 요청
  const response = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: fullBody
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload file: ${error}`);
  }

  const result = await response.json();

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

/**
 * 폴더 생성 (필요한 경우)
 */
export async function createFolder(
  folderName: string,
  parentFolderId: string,
  accessToken: string
): Promise<string> {
  const response = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create folder: ${error}`);
  }

  const result = await response.json();
  return result.id;
}

// ============================================================
// Token Management
// ============================================================

/**
 * 데이터베이스에 토큰 저장 (서비스 롤 필요)
 */
export async function saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
  // 데이터베이스에 사용자별 리프레시 토큰 저장
  // 이 기능은 admin 사용자의 토큰만 저장하면 됩니다
  const { createServiceClient } = await import('@/lib/supabase');
  const serviceClient = createServiceClient();

  const { error } = await serviceClient
    .from('user_google_tokens')
    .upsert({
      user_id: userId,
      refresh_token: refreshToken,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error('Failed to save refresh token:', error);
    throw new Error('리프레시 토큰 저장에 실패했습니다.');
  }
}

/**
 * 데이터베이스에서 토큰 조회
 */
export async function getRefreshToken(userId: string): Promise<string | null> {
  const { createServiceClient } = await import('@/lib/supabase');
  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient
    .from('user_google_tokens')
    .select('refresh_token')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.refresh_token;
}

/**
 * 현재 유효한 액세스 토큰 반환
 * (리프레시 토큰에서 가져오거나 캐시된 것 사용)
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const refreshToken = await getRefreshToken(userId);

  if (!refreshToken) {
    throw new Error('구글 드라이브 연결이 필요합니다. 관리자에게 문의하세요.');
  }

  // 토큰 갱신
  const tokenResponse = await refreshAccessToken(refreshToken);

  // 새로운 리프레시 토큰이 있으면 저장
  if (tokenResponse.refresh_token) {
    await saveRefreshToken(userId, tokenResponse.refresh_token);
  }

  return tokenResponse.access_token;
}
