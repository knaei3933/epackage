/**
 * Simple test to check film_cost_details
 */

async function main() {
  const { unifiedPricingEngine } = await import('../src/lib/unified-pricing-engine.ts');

  const params = {
    bagTypeId: 'stand_up',
    materialId: 'pet_al',
    quantity: 5000,
    width: 130,
    height: 180,
    depth: 30,
    thicknessSelection: 'medium',
    thickness: 91,
    printingColors: 1,
    printingType: 'digital' as const,
    doubleSided: false,
    postProcessingOptions: ['corner-round', 'glossy', 'hang-hole-6mm', 'machi-printing-no', 'notch-yes', 'top-open', 'valve-no', 'zipper-yes'],
    filmLayers: [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: 80 }
    ],
    useFilmCostCalculation: true,
    markupRate: 0.5,
    lossRate: 0.4,
  };

  try {
    const result = await unifiedPricingEngine.calculateQuote(params);
    const fcd = result.filmCostDetails;

    if (fcd) {
      console.log('=== filmCostDetails ===');
      console.log('totalMeters:', fcd.totalMeters);
      console.log('materialLayerDetails count:', fcd.materialLayerDetails?.length || 0);
      console.log('areaM2:', fcd.areaM2);
      console.log('materialWidthMM:', fcd.materialWidthMM);

      if (fcd.materialLayerDetails) {
        fcd.materialLayerDetails.forEach((layer: any, i: number) => {
          console.log(`Layer ${i+1}: ${layer.nameJa} ${layer.thicknessMicron}μm - weightKg: ${layer.weightKg.toFixed(2)}kg, costJPY: ¥${layer.costJPY}`);
        });
      }

      // Generate SQL
      const fcdJson = JSON.stringify(fcd).replace(/'/g, "''");
      console.log('\n=== SQL UPDATE ===');
      console.log(`UPDATE quotation_items SET specifications = jsonb_set(specifications, '{film_cost_details}', '${fcdJson}') WHERE id = '0fb9b034-abde-4097-99f1-a2492d6c0e2a';`);
    } else {
      console.log('ERROR: filmCostDetails is null/undefined');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);
