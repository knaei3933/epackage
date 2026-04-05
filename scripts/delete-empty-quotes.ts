import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteEmptyQuotes() {
  // 空のquotationsを削除（specificationsが空のもの）
  const { data: emptyQuotes, error: fetchError } = await supabase
    .from('quotations')
    .select('id, quotation_number, specifications')
    .is('specifications', null)
    .order('created_at', { ascending: false })
    .limit(10);

  if (fetchError) {
    console.error('Error fetching empty quotes:', fetchError);
    return;
  }

  console.log(`Found ${emptyQuotes?.length || 0} empty quotes`);

  if (emptyQuotes && emptyQuotes.length > 0) {
    const idsToDelete = emptyQuotes.map(q => q.id);
    const { error: deleteError } = await supabase
      .from('quotations')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      console.error('Error deleting quotes:', deleteError);
    } else {
      console.log(`Deleted ${idsToDelete.length} empty quotes`);
    }
  }
}

deleteEmptyQuotes();
