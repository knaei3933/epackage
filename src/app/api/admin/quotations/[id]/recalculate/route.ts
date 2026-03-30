import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { unifiedPricingEngine, type UnifiedQuoteParams } from '@/lib/unified-pricing-engine';
import { MATERIAL_THICKNESS_OPTIONS } from '@/lib/pricing/core/constants';

/**
 * Parse film specification string to extract material layers
 * Example: "PET 12μ + AL 7μ + PET 12μ + LLDPE 80μ" → [{materialId: 'PET', thickness: 12}, ...]
 */
function parseFilmSpecToLayers(spec: string): Array<{ materialId: string; thickness: number }> {
  const layers: Array<{ materialId: string; thickness: number }> = [];

  // Parse the specification string (e.g., "PET 12μ + AL 7μ + PET 12μ + LLDPE 80μ")
  const parts = spec.split('+').map(p => p.trim());

  for (const part of parts) {
    // Match pattern like "PET 12μ" or "AL 7μ"
    const match = part.match(/^([A-Z]+)\s+(\d+)\s*μ?$/);
    if (match) {
      const [, materialId, thicknessStr] = match;
      layers.push({ materialId, thickness: parseInt(thicknessStr, 10) });
    }
  }

  return layers;
}

/**
 * Get film layers from material ID and thickness selection
 */
function getFilmLayers(materialId: string, thicknessSelection: string): Array<{ materialId: string; thickness: number }> {
  const options = MATERIAL_THICKNESS_OPTIONS[materialId as keyof typeof MATERIAL_THICKNESS_OPTIONS];
  if (!options) {
    // Default to PET/PE structure
    return [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'PE', thickness: 80 }
    ];
  }

  const selected = options.find(opt => opt.id === thicknessSelection);
  if (!selected || !selected.specification) {
    // Use first option as fallback
    const first = options[0];
    if (first?.specification) {
      return parseFilmSpecToLayers(first.specification);
    }
    return [];
  }

  return parseFilmSpecToLayers(selected.specification);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAuth(request);
  if (!auth) return unauthorizedResponse();

  const { id: quotationId } = await params;
  const serviceClient = createServiceClient();

  // Fetch quotation items
  const { data: items, error } = await serviceClient
    .from('quotation_items')
    .select('id, specifications, quantity')
    .eq('quotation_id', quotationId);

  if (error || !items) {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }

  const updatedItems = [];

  for (const item of items) {
    const specs = item.specifications as Record<string, unknown> || {};

    const materialId = (specs.materialId as string) || 'pet_pe';
    const thicknessSelection = (specs.thicknessSelection as string) || 'medium';

    // Generate filmLayers from materialId and thicknessSelection
    const filmLayers = getFilmLayers(materialId, thicknessSelection);

    // Build UnifiedQuoteParams from specifications
    const params: UnifiedQuoteParams = {
      bagTypeId: (specs.bagTypeId as string) || 'standup_pouch',
      materialId,
      quantity: item.quantity,
      width: (specs.width as number) || 0,
      height: (specs.height as number) || 0,
      depth: (specs.depth as number) || 0,
      thickness: (specs.thickness as number) || 80,
      thicknessSelection,
      printingColors: (specs.printingColors as number) || 4,
      printingType: (specs.printingType as 'digital' | 'gravure') || 'digital',
      doubleSided: (specs.doubleSided as boolean) || false,
      postProcessingOptions: (specs.postProcessingOptions as string[]) || [],
      filmLayers,  // Include filmLayers for proper calculation
      useFilmCostCalculation: true,
      markupRate: (specs.markupRate as number) || 0.5,
      lossRate: (specs.lossRate as number) || 0.4,
    };

    // Recalculate
    const result = await unifiedPricingEngine.calculateQuote(params);
    const filmCostDetails = result.filmCostDetails || null;

    // Update specifications
    const updatedSpecs = { ...specs, film_cost_details: filmCostDetails };

    const { error: updateError } = await serviceClient
      .from('quotation_items')
      .update({ specifications: updatedSpecs })
      .eq('id', item.id);

    if (!updateError) {
      updatedItems.push({ id: item.id, filmCostDetails });
    }
  }

  return NextResponse.json({
    success: true,
    message: `Updated ${updatedItems.length} item(s)`,
    updatedItems
  });
}
