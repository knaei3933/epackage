/**
 * Verify PDF Data Mapping
 * Directly tests the excelDataMapper functions
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Mock the extractProductSpecifications and extractProcessingOptions functions
function extractProductSpecifications(specsJson) {
  const specs = typeof specsJson === 'string' ? JSON.parse(specsJson) : specsJson || {};
  const productType = specs.bagType || specs.productType || 'stand_pouch';
  const isRollFilm = productType === 'roll_film';

  const postProcessing = specs.postProcessing || [];
  const finishOption = postProcessing.find((opt) => opt === 'glossy' || opt === 'matte');
  const surfaceFinish = finishOption === 'glossy' ? '光沢仕上げ' : finishOption === 'matte' ? 'マット仕上げ' : '光沢仕上げ';

  const baseSpecs = {
    specNumber: specs.specNumber || 'L',
    pouchType: specs.pouchType || 'スタンドパウチ',
    pouchTypeEn: specs.pouchTypeEn || 'Stand Pouch',
    productType: productType,
    contents: specs.contents || '',
    size: specs.size || '',
    material: specs.material || '',
    surfaceFinish: surfaceFinish
  };

  if (isRollFilm) {
    return {
      ...baseSpecs,
      sealWidth: '',
      fillDirection: '',
      notchShape: '',
      notchPosition: '',
      hangingHole: false,
      hangingPosition: '',
      ziplockPosition: '',
      cornerRadius: ''
    };
  }

  return {
    ...baseSpecs,
    sealWidth: specs.sealWidth || '',
    fillDirection: specs.fillDirection || '上',
    notchShape: specs.notchShape || '',
    notchPosition: specs.notchPosition || '指定位置',
    hangingHole: specs.hangingHole || false,
    hangingPosition: specs.hangingPosition || '指定位置',
    ziplockPosition: specs.ziplockPosition || '指定位置',
    cornerRadius: specs.cornerRadius || ''
  };
}

function extractProcessingOptions(items) {
  const firstItem = items[0];
  if (!firstItem?.specifications) {
    return {
      ziplock: false,
      notch: false,
      hangingHole: false,
      cornerRound: false,
      gasVent: false,
      easyCut: false,
      embossing: false
    };
  }

  const specs = typeof firstItem.specifications === 'string'
    ? JSON.parse(firstItem.specifications)
    : firstItem.specifications;

  const postProcessingOptions = specs.postProcessingOptions || specs.postProcessing || [];

  const result = {
    ziplock: false,
    notch: false,
    hangingHole: false,
    cornerRound: false,
    gasVent: false,
    easyCut: false,
    embossing: false
  };

  for (const optionId of postProcessingOptions) {
    if (optionId === 'zipper-yes') {
      result.ziplock = true;
    } else if (optionId === 'notch-yes') {
      result.notch = true;
    } else if (optionId === 'hang-hole-6mm' || optionId === 'hang-hole-8mm') {
      if (!optionId.includes('hang-hole-no')) {
        result.hangingHole = true;
      }
    } else if (optionId === 'corner-round') {
      result.cornerRound = true;
    } else if (optionId === 'valve-yes') {
      if (!optionId.includes('valve-no')) {
        result.gasVent = true;
      }
    } else if (optionId === 'tear-notch') {
      result.easyCut = true;
    } else if (optionId === 'die-cut-window') {
      result.embossing = true;
    }
  }

  return result;
}

async function verifyPDFMapping() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const quotationNumber = 'QT20260203-6904';

  // Get quotation
  const { data: quotation } = await supabase
    .from('quotations')
    .select('id')
    .eq('quotation_number', quotationNumber)
    .single();

  if (!quotation) {
    console.log('Quotation not found');
    return;
  }

  // Get quotation items
  const { data: items } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quotation.id);

  if (!items || items.length === 0) {
    console.log('No items found');
    return;
  }

  console.log('=== Original Data ===');
  const specs = typeof items[0].specifications === 'string'
    ? JSON.parse(items[0].specifications)
    : items[0].specifications;

  console.log('postProcessingOptions:', JSON.stringify(specs.postProcessingOptions, null, 2));

  console.log('\n=== Extracted Specifications ===');
  const specifications = extractProductSpecifications(items[0].specifications);
  console.log(JSON.stringify(specifications, null, 2));

  console.log('\n=== Extracted Processing Options ===');
  const options = extractProcessingOptions(items);
  console.log(JSON.stringify(options, null, 2));

  console.log('\n=== Expected PDF Display ===');
  console.log('製品タイプ:', specifications.pouchType);
  console.log('サイズ:', specifications.size);
  console.log('素材:', specifications.material);
  console.log('表面処理:', specifications.surfaceFinish);

  if (specifications.productType !== 'roll_film') {
    console.log('\n追加仕様:');
    console.log('  ジッパー付き:', options.ziplock ? '○' : '-');
    console.log('  ノッチ付き:', options.notch ? '○' : '-');
    console.log('  吊り下げ穴 (6mm):', options.hangingHole ? '○' : '-');
    console.log('  角丸:', options.cornerRound ? '○' : '-');
    console.log('  ガス抜きバルブ:', options.gasVent ? '○' : '-');
  }

  console.log('\n=== Validation ===');
  const expectedOptions = {
    ziplock: true,      // zipper-yes
    notch: true,        // notch-yes
    hangingHole: true,  // hang-hole-6mm
    cornerRound: true,  // corner-round
    gasVent: false      // valve-no
  };

  console.log('Expected:', JSON.stringify(expectedOptions, null, 2));
  console.log('Actual:  ', JSON.stringify(options, null, 2));

  const errors = [];
  if (options.ziplock !== expectedOptions.ziplock) {
    errors.push('ziplock mismatch');
  }
  if (options.notch !== expectedOptions.notch) {
    errors.push('notch mismatch');
  }
  if (options.hangingHole !== expectedOptions.hangingHole) {
    errors.push('hangingHole mismatch');
  }
  if (options.cornerRound !== expectedOptions.cornerRound) {
    errors.push('cornerRound mismatch');
  }
  if (options.gasVent !== expectedOptions.gasVent) {
    errors.push('gasVent mismatch');
  }

  if (errors.length === 0) {
    console.log('\n✅ All mappings are correct!');
  } else {
    console.log('\n❌ Errors found:', errors.join(', '));
  }
}

verifyPDFMapping().catch(console.error);
