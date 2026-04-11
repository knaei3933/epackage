#!/bin/bash

ORDER_ID="87615c70-bd89-411f-aaf9-9611e72d13a3"
TOKEN="9NldQDVQKypz2VdPuv5QQFvLaqMfFeASXZEI3OkQEGQ"

# Get first file ID
FILE_ID=$(node -e "
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const { data } = await supabase
    .from('order_file_uploads')
    .select('id')
    .eq('order_id', '$ORDER_ID')
    .limit(1);
  if (data && data.length > 0) {
    console.log(data[0].id);
  }
})();
")

echo "File ID: $FILE_ID"
echo "Deleting file..."

# Delete the file
curl -X DELETE \
  "http://localhost:3000/api/designer/orders/$ORDER_ID/data-receipt/$FILE_ID?token=$TOKEN" \
  -H "Content-Type: application/json" \
  -v
