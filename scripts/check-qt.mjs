import { createClient } from '@supabase/supabase-js';

const client = createClient('https://ijlgpzjdfipzmjvawofp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbGdwempkZmlwem1qdmF3b2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU1ODI3NywiZXhwIjoyMDgyMTM0Mjc3fQ.LWSHBw-dbVkMjLMaZk3fyadfY_VrOEP7eVUMXNsvt58');

const { data: quotation } = await client
  .from('quotations')
  .select('id')
  .eq('quotation_number', 'QT20260325-7978')
  .single();

if (quotation) {
  const { data: items } = await client
    .from('quotation_items')
    .select('id, specifications')
    .eq('quotation_id', quotation.id);

  console.log('QT20260325-7978 items:', items?.length || 0);
  items.forEach(item => {
    const fcd = item.specifications?.film_cost_details;
    console.log('  ' + item.id.substring(0, 8) + ':', fcd ? 'HAS FCD' : 'NO FCD');
    if (fcd) {
      console.log('    - totalMeters:', fcd.totalMeters);
      console.log('    - layers:', fcd.materialLayerDetails?.length || 0);
    }
  });
} else {
  console.log('Quotation not found');
}
