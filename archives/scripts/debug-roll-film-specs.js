/**
 * Debug Roll Film Specifications Script
 *
 * This script checks actual quotation data in the database to understand
 * how roll film products store their specifications, particularly focusing on
 * post-processing options (実幅, 封入方向, etc.) which should only appear
 * for pouch products, not roll film products.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase credentials not found in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Pretty print JSON with depth limit
 */
function prettyPrint(obj, indent = 0, maxDepth = 5) {
  if (indent > maxDepth) return '[Max depth reached]';
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (typeof obj === 'string') return `"${obj}"`;
  if (typeof obj !== 'object') return String(obj);

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    const items = obj.map(item => '  '.repeat(indent + 1) + prettyPrint(item, indent + 1, maxDepth));
    return `[\n${items.join(',\n')}\n${'  '.repeat(indent)}]`;
  }

  const keys = Object.keys(obj);
  if (keys.length === 0) return '{}';
  const entries = keys.map(key => {
    const value = prettyPrint(obj[key], indent + 1, maxDepth);
    return `${'  '.repeat(indent + 1)}"${key}": ${value}`;
  });
  return `{\n${entries.join(',\n')}\n${'  '.repeat(indent)}}`;
}

/**
 * Analyze specifications structure
 */
function analyzeSpecs(specs, productName) {
  console.log(`\n  Specifications Analysis for: ${productName}`);
  console.log('  ' + '='.repeat(80));

  if (!specs) {
    console.log('  ⚠️  No specifications data');
    return;
  }

  const keys = Object.keys(specs);
  console.log(`  Total fields: ${keys.length}`);
  console.log('  ');

  // Categorize fields
  const categories = {
    basicDimensions: ['width', 'length', 'depth', 'gusset', 'sideWeld'],
    material: ['material', 'thickness', 'structure'],
    postProcessing: ['postProcessingOptions', 'postProcessingSelected', 'finish'],
    rollFilmSpecific: ['rollWidth', 'rollLength', 'coreDiameter', 'windingDirection', 'printDirection'],
    pouchSpecific: ['zipper', 'spout', 'hangHole', 'notch'],
    quantity: ['quantity', 'totalQuantity'],
    pricing: ['unitPrice', 'totalPrice', 'subtotal', 'total'],
    metadata: ['productId', 'productName', 'category', 'productType']
  };

  const categorized = {
    basicDimensions: [],
    material: [],
    postProcessing: [],
    rollFilmSpecific: [],
    pouchSpecific: [],
    quantity: [],
    pricing: [],
    metadata: [],
    other: []
  };

  keys.forEach(key => {
    let found = false;
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(kw => key.toLowerCase().includes(kw.toLowerCase()))) {
        categorized[category].push(key);
        found = true;
        break;
      }
    }
    if (!found) {
      categorized.other.push(key);
    }
  });

  // Print categorized results
  Object.entries(categorized).forEach(([category, fields]) => {
    if (fields.length > 0) {
      console.log(`  📁 ${category}:`);
      fields.forEach(field => {
        const value = specs[field];
        const valuePreview = typeof value === 'object'
          ? (Array.isArray(value) ? `Array(${value.length})` : `Object`)
          : `${JSON.stringify(value).substring(0, 50)}`;
        console.log(`     - ${field}: ${valuePreview}`);
      });
    }
  });

  // Check for post-processing issues
  console.log('\n  🔍 Post-Processing Check:');
  const hasPostProcessing = specs.postProcessingOptions || specs.postProcessingSelected;
  if (hasPostProcessing) {
    console.log('  ⚠️  POST-PROCESSING OPTIONS FOUND!');
    if (specs.postProcessingOptions) {
      console.log('     postProcessingOptions:', JSON.stringify(specs.postProcessingOptions, null, 6).split('\n').join('\n     '));
    }
    if (specs.postProcessingSelected) {
      console.log('     postProcessingSelected:', JSON.stringify(specs.postProcessingSelected, null, 6).split('\n').join('\n     '));
    }
  } else {
    console.log('  ✓ No post-processing options (good for roll film)');
  }

  // Check product type
  console.log('\n  🏷️  Product Type Check:');
  if (specs.productType || specs.category || specs.productId) {
    console.log(`     productType: ${specs.productType || 'N/A'}`);
    console.log(`     category: ${specs.category || 'N/A'}`);
    console.log(`     productId: ${specs.productId || 'N/A'}`);
  }

  console.log('  ' + '='.repeat(80));
}

/**
 * Main function to check roll film quotation items
 */
async function checkRollFilmSpecs() {
  console.log('🔍 Starting Roll Film Specifications Debug');
  console.log('='.repeat(100));

  try {
    // First, get roll film product IDs from products table
    console.log('\n📦 Step 1: Fetching roll film products from products table...');
    const { data: rollFilmProducts, error: productsError } = await supabase
      .from('products')
      .select('id, name_ja, category')
      .eq('category', 'roll_film');

    if (productsError) {
      console.error('Error fetching roll film products:', productsError);
    } else {
      console.log(`✓ Found ${rollFilmProducts?.length || 0} roll film products`);
      if (rollFilmProducts && rollFilmProducts.length > 0) {
        rollFilmProducts.forEach(p => {
          console.log(`  - ${p.name_ja} (ID: ${p.id})`);
        });
      }
    }

    // Get recent quotation items that might be roll film
    console.log('\n📋 Step 2: Fetching recent quotation items...');
    const { data: quotationItems, error: itemsError } = await supabase
      .from('quotation_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (itemsError) {
      console.error('Error fetching quotation items:', itemsError);
      return;
    }

    console.log(`✓ Found ${quotationItems?.length || 0} recent quotation items`);

    if (!quotationItems || quotationItems.length === 0) {
      console.log('⚠️  No quotation items found');
      return;
    }

    // Filter and analyze roll film items
    const rollFilmItems = quotationItems.filter(item => {
      const specs = item.specifications;
      if (!specs) return false;
      // Check if product name contains roll film indicators
      const productName = item.product_name || '';
      const isRollFilm = productName.toLowerCase().includes('roll') ||
                         productName.includes('ロール') ||
                         specs.category === 'roll_film' ||
                         specs.productType === 'roll_film';
      return isRollFilm;
    });

    console.log(`\n🎯 Step 3: Analyzing roll film items (${rollFilmItems.length} found)`);
    console.log('='.repeat(100));

    if (rollFilmItems.length === 0) {
      console.log('⚠️  No roll film items found in recent quotations');
      console.log('\n📊 Analyzing all items instead to help identify roll film:');
      quotationItems.forEach((item, index) => {
        console.log(`\n[${index + 1}] ${item.product_name}`);
        if (item.specifications) {
          const specs = item.specifications;
          console.log(`    - productType: ${specs.productType || 'N/A'}`);
          console.log(`    - category: ${specs.category || 'N/A'}`);
          console.log(`    - Has postProcessingOptions: ${!!specs.postProcessingOptions}`);
        }
      });
    } else {
      rollFilmItems.forEach((item, index) => {
        console.log(`\n${'='.repeat(100)}`);
        console.log(`📦 Roll Film Item #${index + 1}`);
        console.log('='.repeat(100));
        console.log(`ID: ${item.id}`);
        console.log(`Quotation ID: ${item.quotation_id}`);
        console.log(`Product Name: ${item.product_name}`);
        console.log(`Quantity: ${item.quantity}`);
        console.log(`Unit Price: ¥${item.unit_price?.toLocaleString() || 'N/A'}`);
        console.log(`Total Price: ¥${item.total_price?.toLocaleString() || 'N/A'}`);
        console.log(`Created At: ${item.created_at}`);

        // Analyze specifications
        if (item.specifications) {
          analyzeSpecs(item.specifications, item.product_name);
        } else {
          console.log('\n  ⚠️  No specifications data');
        }
      });
    }

    // Summary
    console.log('\n' + '='.repeat(100));
    console.log('📊 SUMMARY');
    console.log('='.repeat(100));
    console.log(`Total quotation items checked: ${quotationItems.length}`);
    console.log(`Roll film items identified: ${rollFilmItems.length}`);

    // Check for post-processing issues
    const itemsWithPostProcessing = quotationItems.filter(item =>
      item.specifications?.postProcessingOptions ||
      item.specifications?.postProcessingSelected
    );

    console.log(`\nItems with post-processing options: ${itemsWithPostProcessing.length}`);

    if (itemsWithPostProcessing.length > 0) {
      console.log('\n⚠️  WARNING: Post-processing options found in:');
      itemsWithPostProcessing.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.product_name} (ID: ${item.id})`);
        console.log(`     - productType: ${item.specifications?.productType || 'N/A'}`);
        console.log(`     - category: ${item.specifications?.category || 'N/A'}`);
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
checkRollFilmSpecs()
  .then(() => {
    console.log('\n✅ Debug script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
