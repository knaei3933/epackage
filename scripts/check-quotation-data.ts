/**
 * Check Quotation Data Script
 * 見積データ確認スクリプト
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// .env.localを読み込む
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkQuotationData() {
  console.log('見積もりデータ確認開始...');

  // quotationsテーブルを確認
  const { data: quotations, error: quotationsError } = await supabase
    .from('quotations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (quotationsError) {
    console.error('見積データ取得エラー:', quotationsError);
    return;
  }

  console.log(`見積もり件数: ${quotations?.length || 0}`);

  if (quotations && quotations.length > 0) {
    console.log('見積もりリスト:');
    quotations.forEach((q, index) => {
      console.log(`\n[${index + 1}] 見積番号: ${q.quotation_number || '(未設定)'}`);
      console.log(`    ステータス: ${q.quotation_status || '(未設定)'}`);
      console.log(`    合計金額: ¥${q.total_amount?.toLocaleString() || 'N/A'}`);
      console.log(`    顧客名: ${q.customer_name || '(未設定)'}`);
      console.log(`    顧客Email: ${q.customer_email || '(未設定)'}`);
      console.log(`    作成日時: ${q.created_at}`);
      console.log(`    ユーザーID: ${q.user_id || 'null (ゲスト)'}`);
    });
  } else {
    console.log('見積もりデータが見つかりませんでした');
  }

  // pdf_downloadsテーブルも確認
  const { data: pdfDownloads, error: pdfError } = await supabase
    .from('pdf_downloads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (pdfError) {
    console.error('\nPDFダウンロードデータ取得エラー:', pdfError);
  } else {
    console.log(`\nPDFダウンロード件数: ${pdfDownloads?.length || 0}`);

    if (pdfDownloads && pdfDownloads.length > 0) {
      console.log('PDFダウンロードリスト:');
      pdfDownloads.forEach((pdf, index) => {
        console.log(`\n[${index + 1}] ID: ${pdf.id}`);
        console.log(`    見積番号: ${pdf.quote_number}`);
        console.log(`    作成日時: ${pdf.created_at}`);
      });
    }
  }
}

checkQuotationData()
  .then(() => {
    console.log('\n完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('エラー:', error);
    process.exit(1);
  });
