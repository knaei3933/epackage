/**
 * Debug Script for File Download Issues
 *
 * 入稿ファイルダウンロード問題のデバッグ用スクリプト
 *
 * Usage:
 *   npx tsx scripts/debug-file-download.ts <orderId>
 *
 * This script will:
 * 1. Query the files table for the order
 * 2. Display file_path, file_url, and other metadata
 * 3. Verify if files exist in Supabase Storage
 * 4. Test signed URL generation
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create service role client (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface FileRecord {
  id: string;
  order_id: string;
  file_type: string;
  original_filename: string;
  file_path: string;
  file_url: string;
  file_size_bytes: number | null;
  uploaded_at: string;
  uploaded_by: string;
}

async function debugFileDownload(orderId: string) {
  console.log('\n🔍 File Download Debug Tool');
  console.log('='.repeat(60));
  console.log(`Order ID: ${orderId}`);
  console.log('='.repeat(60) + '\n');

  // Step 1: Get files from database
  console.log('📂 Step 1: Fetching files from database...');
  const { data: files, error: filesError } = await supabase
    .from('files')
    .select('*')
    .eq('order_id', orderId)
    .order('uploaded_at', { ascending: false });

  if (filesError) {
    console.error('❌ Error fetching files:', filesError);
    return;
  }

  if (!files || files.length === 0) {
    console.log('⚠️  No files found for this order');
    return;
  }

  console.log(`✅ Found ${files.length} file(s)\n`);

  // Step 2: Analyze each file
  for (const file of files as FileRecord[]) {
    console.log('─'.repeat(60));
    console.log(`📄 File: ${file.original_filename}`);
    console.log('─'.repeat(60));

    console.log('\n📋 Database Record:');
    console.log(`  ID:              ${file.id}`);
    console.log(`  File Type:       ${file.file_type}`);
    console.log(`  Original Name:   ${file.original_filename}`);
    console.log(`  File Path:       ${file.file_path}`);
    console.log(`  File URL:        ${file.file_url}`);
    console.log(`  Size:            ${file.file_size_bytes ? `${file.file_size_bytes} bytes` : 'N/A'}`);
    console.log(`  Uploaded At:     ${file.uploaded_at}`);
    console.log(`  Uploaded By:     ${file.uploaded_by}`);

    // Step 3: Parse and analyze file_path
    console.log('\n🔍 File Path Analysis:');
    const filePath = file.file_path;
    const bucket = 'production-files';

    console.log(`  Bucket:          ${bucket}`);
    console.log(`  Storage Path:    ${filePath}`);

    // Check if path starts with bucket name
    if (filePath.startsWith('production-files/')) {
      console.log(`  ⚠️  Warning: file_path starts with bucket name!`);
      console.log(`  Corrected Path:  ${filePath.replace('production-files/', '')}`);
    }

    // Extract components
    const parts = filePath.split('/');
    console.log(`  Path Components: ${parts.length > 0 ? parts.join(' / ') : 'empty'}`);

    // Step 4: Test signed URL generation
    console.log('\n🔐 Testing Signed URL Generation...');
    const storagePath = filePath.startsWith('production-files/')
      ? filePath.replace('production-files/', '')
      : filePath;

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, 60);

    if (signedUrlError) {
      console.error(`  ❌ Signed URL Error: ${signedUrlError.message}`);
      console.log(`  Error Code: ${signedUrlError.statusCode || 'N/A'}`);

      // Try public URL as fallback
      console.log('\n🌐 Trying Public URL...');
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(storagePath);

      console.log(`  Public URL: ${publicUrlData.publicUrl}`);
    } else {
      console.log(`  ✅ Signed URL generated successfully`);
      console.log(`  URL: ${signedUrlData.signedUrl.substring(0, 100)}...`);
    }

    // Step 5: Test file access
    console.log('\n🌍 Testing File Access...');

    try {
      if (signedUrlData?.signedUrl) {
        const response = await fetch(signedUrlData.signedUrl, { method: 'HEAD' });
        console.log(`  HTTP Status: ${response.status}`);
        console.log(`  Content-Type: ${response.headers.get('content-type') || 'N/A'}`);
        console.log(`  Content-Length: ${response.headers.get('content-length') || 'N/A'}`);

        if (response.ok) {
          console.log(`  ✅ File is accessible!`);
        } else {
          console.log(`  ❌ File access failed`);
        }
      }
    } catch (fetchError) {
      console.error(`  ❌ Fetch Error: ${fetchError}`);
    }

    console.log('\n');
  }

  // Step 6: Summary and recommendations
  console.log('='.repeat(60));
  console.log('📊 Summary & Recommendations');
  console.log('='.repeat(60));

  const aiFiles = files.filter((f: FileRecord) =>
    f.original_filename.toLowerCase().endsWith('.ai')
  );

  if (aiFiles.length > 0) {
    console.log('\n✅ AI Files Found:');
    aiFiles.forEach((file: FileRecord) => {
      console.log(`  - ${file.original_filename}`);
      console.log(`    Path: ${file.file_path}`);
    });
  } else {
    console.log('\n⚠️  No AI files found in this order');
  }

  console.log('\n💡 Next Steps:');
  console.log('1. Check Supabase Dashboard > Storage > production-files bucket');
  console.log('2. Verify the file path structure matches the storage structure');
  console.log('3. If file_path contains bucket name, remove it');
  console.log('4. Test download from browser using the signed URL above');
  console.log('5. Check browser console for download errors');

  console.log('\n🔧 Common Fixes:');
  console.log('If file_path contains "production-files/" prefix:');
  console.log('  UPDATE files SET file_path = REPLACE(file_path, \'production-files/\', \'\')');
  console.log('  WHERE file_path LIKE \'production-files/%\';');

  console.log('\n');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('\nUsage: npx tsx scripts/debug-file-download.ts <orderId>');
    console.log('\nExample:');
    console.log('  npx tsx scripts/debug-file-download.ts 123e4567-e89b-12d3-a456-426614174000\n');
    process.exit(1);
  }

  const orderId = args[0];

  try {
    await debugFileDownload(orderId);
  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { debugFileDownload };
