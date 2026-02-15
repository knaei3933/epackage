# Google Drive Integration Guide

This guide will help you set up Google Drive API for file storage in Epackage Lab.

## Prerequisites

- Google Account (gmail address)
- Epackage Lab project access

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Create Project** (or select existing project)
3. Project name: `epackage-lab-storage` (or any name you prefer)
4. Click **Create**

## Step 2: Enable Google Drive API

1. In the left sidebar, go to **APIs & Services** > **Library**
2. Search for "Google Drive API"
3. Click on **Google Drive API**
4. Click **Enable**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** (for testing)
3. Fill in:
   - App name: `Epackage Lab Storage`
   - User support email: `your-email@gmail.com`
   - Developer contact: `your-email@gmail.com`
4. Click **Save and Continue**

### Add Scopes
Add the following OAuth scopes:
- `https://www.googleapis.com/auth/drive.file`
- `https://www.googleapis.com/auth/drive.appdata`

Click **Add** and **Save and Continue**

## Step 4: Create OAuth 2.0 Client ID

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Application type: **Web application**
4. Name: `Epackage Lab Web Client`
5. Authorized redirect URIs:
   ```
   http://localhost:3000
   https://www.package-lab.com
   https://epackage-lab.com
   ```
6. Click **Create**
7. Copy your **Client ID** and **Client Secret**

## Step 5: Environment Variables

Add the following to your `.env.local` file:

```bash
# Google Drive OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://www.package-lab.com
```

## Step 6: Install Dependencies

```bash
npm install googleapis@latest
```

## Security Notes

⚠️ **Important**: Never commit your `Client Secret` to version control!
- Add `.env.local` to `.gitignore`
- Keep `Client Secret` secure on your server

## Testing

After setup, you can test the integration:

1. Start your development server
2. Navigate to the upload page
3. First upload will trigger Google OAuth login
4. Grant permissions to your app
5. Files will be saved to your Google Drive

---

## File Organization in Google Drive

Files will be organized in a dedicated folder:
- Root folder: `Epackage Lab Uploads`
- Subfolders by order ID: `{order_id}/`
- Files named: `{timestamp}_{original_name}`

Example structure:
```
Epackage Lab Uploads/
  ├── order-abc123/
  │   ├── 1704096000000_design_file.ai
  │   ├── 1704096001000_production_data.pdf
  │   └── 1704096002000_specification.xlsx
  └── order-def456/
      └── ...
```

---

## Troubleshooting

### Error: "Redirect URI mismatch"
- Make sure your production URL is added to Authorized redirect URIs
- Local development uses http://localhost:3000

### Error: "Insufficient permission"
- Make sure all scopes are added to OAuth consent screen
- Re-authenticate if scopes were changed

### Error: "Invalid credentials"
- Verify Client ID and Secret are correct in `.env.local`
- Restart dev server after updating environment variables

---

## Next Steps

After completing this guide:

1. Run:
   ```bash
   npm install googleapis
   ```

2. Update `.env.local` with your credentials

3. Restart the development server

4. The Google Drive integration will be ready to use!
