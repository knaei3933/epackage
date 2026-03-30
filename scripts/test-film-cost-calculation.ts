/**
 * Test script to calculate film cost details for QT20260325-7978
 */

async function main() {
  // Import the unified pricing engine
  const { unifiedPricingEngine } = await import('../src/lib/unified-pricing-engine.ts');

  // Parameters from the quotation item (0fb9b034-abde-4097-99f1-a2492d6c0e2a)
  const postProcessingOptions = [
    'corner-round', 'glossy', 'hang-hole-6mm', 'machi-printing-no',
    'notch-yes', 'top-open', 'valve-no', 'zipper-yes'
  ];

  // Film structure for pet_al + medium: PET 12μ + AL 7μ + PET 12μ + LLDPE 80μ
  const filmLayers = [
    { materialId: 'PET', thickness: 12 },
    { materialId: 'AL', thickness: 7 },
    { materialId: 'PET', thickness: 12 },
    { materialId: 'LLDPE', thickness: 80 }
  ];

  const params = {
    bagTypeId: 'stand_up',
    materialId: 'pet_al',
    quantity: 5000,
    width: 130,
    height: 180,
    depth: 30,
    thicknessSelection: 'medium',
    thickness: 91,  // Calculated: 12 + 7 + 12 + 80 = 91 (or use 91 from medium)
    printingColors: 1,
    printingType: 'digital' as const,
    doubleSided: false,
    postProcessingOptions,
    filmLayers,
    useFilmCostCalculation: true,
    markupRate: 0.5,
    lossRate: 0.4,
  };

  console.log('Calculating film cost details with params:', JSON.stringify(params, null, 2));

  try {
    const result = await unifiedPricingEngine.calculateQuote(params);

    console.log('\n=== RESULT ===');
    console.log('filmCostDetails:', JSON.stringify(result.filmCostDetails, null, 2));

    // Also log the complete breakdown
    console.log('\n=== BREAKDOWN ===');
    console.log('breakdown:', JSON.stringify(result.breakdown, null, 2));

    // Generate the SQL update statement
    if (result.filmCostDetails) {
      const filmCostDetailsJSON = JSON.stringify(result.filmCostDetails).replace(/'/g, "''");
      console.log('\n=== SQL UPDATE STATEMENT ===');
      console.log(`UPDATE quotation_items SET specifications = jsonb_set(specifications, '{film_cost_details}', '${filmCostDetailsJSON}') WHERE id = '0fb9b034-abde-4097-99f1-a2492d6c0e2a';`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);
