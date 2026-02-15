/**
 * Google Drive Service
 *
 * Google Drive API integration for file storage
 * Handles OAuth 2.0 flow and file operations
 *
 * @module lib/google-drive
 */

import { drive_v3 } from 'googleapis';

export interface DriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
}

export interface UploadResult {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
  size: string;
  folderId: string;
}

// =====================================================
// OAuth Configuration
// =====================================================

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata',
];

// =====================================================
// Helper Functions
// =====================================================

/**
 * Create OAuth2 client from credentials
 */
function createOAuth2Client() {
  const { OAuth2Client } = require('google-auth-library');

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!;

  return new OAuth2Client(
    clientId,
    clientSecret,
    redirectUri
  );
}

/**
 * Generate OAuth authorization URL
 */
export function getAuthUrl(state: string): string {
  const oAuth2Client = createOAuth2Client();

  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: state,
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokens(code: string) {
  const oAuth2Client = createOAuth2Client();

  const { tokens } = await oAuth2Client.getToken(code);

  return tokens;
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string) {
  const oAuth2Client = createOAuth2Client();

  oAuth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oAuth2Client.refreshAccessToken();

  return credentials;
}

/**
 * Create Drive client with OAuth2 credentials
 */
async function createDriveClient(accessToken: string) {
  const oAuth2Client = createOAuth2Client();

  oAuth2Client.setCredentials({
    access_token: accessToken,
  });

  const drive = drive_v3({
    version: 'v3',
    auth: oAuth2Client,
  });

  return drive;
}

// =====================================================
// Server-Side Admin Token Management
// =====================================================

/**
 * Get admin access token using refresh token from environment
 * This is used for server-side uploads without user OAuth
 */
export async function getAdminAccessToken(): Promise<string> {
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

  if (!refreshToken) {
    throw new Error('Google Drive refresh token not configured');
  }

  const oAuth2Client = createOAuth2Client();
  oAuth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oAuth2Client.refreshAccessToken();

  if (!credentials.access_token) {
    throw new Error('Failed to obtain access token');
  }

  return credentials.access_token as string;
}

/**
 * Create Drive client with admin credentials
 */
async function createAdminDriveClient() {
  const accessToken = await getAdminAccessToken();
  return createDriveClient(accessToken);
}

// =====================================================
// Folder Management
// =====================================================

/**
 * Get or create customer upload folder
 * Format: 会社名_日付_注文番号
 */
async function getOrCreateCustomerFolder(
  drive: any,
  parentFolderId: string,
  companyName: string,
  orderNumber: string,
  date: string
): Promise<string> {
  const folderName = `${companyName}_${date}_${orderNumber}`;

  // Search for existing folder
  const response = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed=false`,
    fields: 'files(id, name)',
  });

  if (response.data.files?.length > 0) {
    return response.data.files[0].id!;
  }

  // Create new folder
  const folder = await drive.files.create({
    resource: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    },
    fields: 'id',
  });

  return folder.data.id!;
}

// =====================================================
// File Operations - Data Receipt (Customer Upload)
// =====================================================

/**
 * Upload data receipt file to Google Drive
 * File name format: 製品名_入稿データ_会社名_日付
 * Uses admin credentials (server-side only, no user OAuth required)
 */
export async function uploadDataReceiptToDrive(
  file: File,
  orderId: string,
  productName: string,
  companyName: string,
  orderNumber: string
): Promise<UploadResult> {
  // Use admin Drive client
  const drive = await createAdminDriveClient();

  // Get upload folder ID from environment
  const uploadFolderId = process.env.GOOGLE_DRIVE_UPLOAD_FOLDER_ID!;

  // Format date: YYYY-MM-DD
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');

  // Create customer folder: 会社名_日付_注文番号
  const customerFolderId = await getOrCreateCustomerFolder(
    drive,
    uploadFolderId,
    companyName,
    orderNumber,
    date
  );

  // Create filename: 製品名_入稿データ_会社名_日付
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileExtension = sanitizedName.includes('.') ? sanitizedName.split('.').pop() : '';
  const baseName = sanitizedName.replace(/\.[^/.]+$/, '');
  const fileName = `${productName}_入稿データ_${companyName}_${date}.${fileExtension}`;

  // Upload file
  const media = {
    mimeType: file.type,
    body: file,
  };

  const fileMetadata = {
    name: fileName,
    parents: [customerFolderId],
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id,name,webViewLink,webContentLink,size',
  });

  return {
    id: response.data.id!,
    name: response.data.name!,
    webViewLink: response.data.webViewLink!,
    webContentLink: response.data.webContentLink!,
    size: response.data.size!,
    folderId: customerFolderId,
  };
}

// =====================================================
// File Operations - Correction Data (Admin Upload)
// =====================================================

/**
 * Upload correction file to Google Drive
 * Links to the original data receipt folder
 * File name format: 製品名_校正データ_会社名_日付
 * Uses admin credentials (server-side only)
 */
export async function uploadCorrectionToDrive(
  file: File,
  sourceFileId: string,
  productName: string,
  companyName: string
): Promise<UploadResult> {
  // Use admin Drive client
  const drive = await createAdminDriveClient();

  // Get source file info to find the customer folder
  const sourceFile = await drive.files.get({
    fileId: sourceFileId,
    fields: 'parents',
  });

  const customerFolderId = sourceFile.data.parents?.[0];
  if (!customerFolderId) {
    throw new Error('Source file parent folder not found');
  }

  // Format date
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');

  // Create filename: 製品名_校正データ_会社名_日付
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileExtension = sanitizedName.includes('.') ? sanitizedName.split('.').pop() : '';
  const fileName = `${productName}_校正データ_${companyName}_${date}.${fileExtension}`;

  // Upload file to customer folder (linked to data receipt)
  const media = {
    mimeType: file.type,
    body: file,
  };

  const fileMetadata = {
    name: fileName,
    parents: [customerFolderId],
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id,name,webViewLink,webContentLink,size',
  });

  return {
    id: response.data.id!,
    name: response.data.name!,
    webViewLink: response.data.webViewLink!,
    webContentLink: response.data.webContentLink!,
    size: response.data.size!,
    folderId: customerFolderId,
  };
}

/**
 * Delete file from Google Drive
 */
export async function deleteFileFromDrive(fileId: string, accessToken: string): Promise<void> {
  const drive = await createDriveClient(accessToken);

  await drive.files.delete({
    fileId: fileId,
  });
}

/**
 * Get file info
 */
export async function getFileInfo(fileId: string, accessToken: string): Promise<DriveFile> {
  const drive = await createDriveClient(accessToken);

  const response = await drive.files.get({
    fileId: fileId,
    fields: 'id,name,webViewLink,webContentLink,size,createdTime,modifiedTime',
  });

  return response.data as DriveFile;
}

/**
 * List files in an order folder
 */
export async function listOrderFiles(
  orderId: string,
  accessToken: string
): Promise<DriveFile[]> {
  const drive = await createDriveClient(accessToken);

  // Get order folder
  const rootFolderId = await getOrCreateRootFolder(drive);
  const orderFolderId = await getOrderFolder(drive, rootFolderId, orderId);

  // List files in order folder
  const response = await drive.files.list({
    q: `'${orderFolderId}' in parents and trashed=false`,
    fields: 'files(id,name,webViewLink,webContentLink,size,createdTime,modifiedTime)',
    orderBy: 'createdTime desc',
  });

  return response.data.files as DriveFile[];
}
