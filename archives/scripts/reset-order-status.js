const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ijlgpzjdfipzmjvawofp.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function resetOrderStatus() {
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'MODIFICATION_REQUESTED',
      modification_requested_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', 'a554fad1-6878-4e83-9f2c-bb9c46d8b7a7')
    .select();
  
  console.log('Result:', data);
  console.log('Error:', error);
}

resetOrderStatus();
