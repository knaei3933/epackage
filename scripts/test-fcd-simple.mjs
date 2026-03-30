import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine.js';

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
  printingType: 'digital',
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

const result = await unifiedPricingEngine.calculateQuote(params);
const fcd = result.filmCostDetails;
if (fcd) {
  console.log('FCD_OK ' + fcd.totalMeters + 'm layers=' + (fcd.materialLayerDetails?.length || 0));
  if (fcd.materialLayerDetails) {
    fcd.materialLayerDetails.forEach((l, i) => {
      console.log('  Layer ' + (i+1) + ': ' + l.nameJa + ' ' + l.thicknessMicron + 'μm ¥' + l.costJPY);
    });
  }
} else {
  console.log('FCD_NULL');
}
