/**
 * AI Extraction System - Core Module
 *
 * Core functionality for AI-powered product specification extraction
 * from Adobe Illustrator .ai files using multimodal AI models
 */

import {
  ExtractedProductData,
  ExtractionResult,
  ExtractionStatus,
  ExtractionMethod,
  ExtractionMetadata,
  AIExtractionValidationResult,
  ConfidenceScore,
  AIExtractionValidationError,
  AIExtractionValidationWarning,
  Suggestion,
  ExtractionError,
  ExtractionPipelineConfig,
  ProductDimensions,
  MaterialSpecification,
  ProductOptions,
  ColorSpecifications,
  DesignElements,
  LogoElement,
  AIExtractionTextElement,
  GraphicElement,
  PrintSpecifications,
  AIExtractionMaterialLayer,
  ColorSpec,
  AIModelConfig,
  ColorMode,
} from '@/types/ai-extraction';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONFIG: ExtractionPipelineConfig = {
  conversion: {
    target_format: 'png',
    dpi: 600,
    quality: 95,
  },
  ai_models: {
    primary: {
      provider: 'openai',
      model: 'gpt-4-vision-preview',
      api_key: (process.env.OPENAI_API_KEY as string | undefined) || '',
      max_tokens: 4096,
      temperature: 0.1,
      timeout_ms: 60000,
    },
    fallback: {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      api_key: (process.env.ANTHROPIC_API_KEY as string | undefined) || '',
      max_tokens: 4096,
      temperature: 0.1,
      timeout_ms: 60000,
    },
  },
  validation: {
    confidence_threshold: 0.7,
    strict_mode: false,
    auto_correct: true,
  },
  retry: {
    max_attempts: 3,
    backoff_ms: 1000,
  },
};

// ============================================================================
// Extraction Core Class
// ============================================================================

export class AIExtractionEngine {
  private config: ExtractionPipelineConfig;
  private retryCount: number = 0;

  constructor(config?: Partial<ExtractionPipelineConfig>) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      ai_models: {
        ...DEFAULT_CONFIG.ai_models,
        ...config?.ai_models,
      },
    };
  }

  // ============================================================================
  // Public Methods
  // ============================================================================

  /**
   * Main extraction method - processes uploaded file and extracts product data
   */
  async extractFromFile(
    file: File,
    orderId: string,
    fileId: string
  ): Promise<ExtractionResult> {
    const startTime = Date.now();
    let status: ExtractionStatus = 'processing';

    try {
      // Step 1: Convert .ai to image (PDF -> PNG)
      const imageUrl = await this.convertFileToImage(file);

      // Step 2: Extract data using AI
      const extractedData = await this.extractWithAI(imageUrl);

      // Step 3: Validate extracted data
      const validation = await this.validateExtractedData(extractedData);

      // Step 4: Calculate confidence score
      const confidence = this.calculateConfidence(extractedData, validation);

      // Create result
      const result: ExtractionResult = {
        id: this.generateId(),
        file_id: fileId,
        order_id: orderId,
        status: confidence.overall >= this.config.validation.confidence_threshold
          ? 'completed'
          : 'needs_revision',
        data: extractedData,
        validation: {
          ...validation,
          confidence,
        },
        metadata: {
          extracted_at: new Date().toISOString(),
          extraction_method: 'ai_vision',
          ai_model: this.config.ai_models.primary.model,
          processing_time_ms: Date.now() - startTime,
          api_cost_usd: this.estimateAPICost(),
          retry_count: this.retryCount,
        },
      };

      // Update status based on validation
      if (validation.errors.some(e => e.severity === 'critical')) {
        result.status = 'failed';
        result.error = {
          name: 'ExtractionError',
          code: 'EXTRACTION_VALIDATION_FAILED',
          message: 'Critical validation errors detected',
          stage: 'validation',
          retryable: true,
        } as ExtractionError;
      }

      return result;
    } catch (error) {
      status = 'failed';
      return this.handleError(error, fileId, orderId, startTime);
    }
  }

  /**
   * Validate and potentially correct extracted data with manual input
   */
  async validateWithManualInput(
    extractedData: ExtractedProductData,
    manualData: Partial<ExtractedProductData>
  ): Promise<AIExtractionValidationResult> {
    const mergedData = this.mergeData(extractedData, manualData);
    const validation = await this.validateExtractedData(mergedData);
    const confidence = this.calculateConfidence(mergedData, validation);
    return {
      ...validation,
      confidence,
    };
  }

  /**
   * Re-extract file with updated configuration or model
   */
  async reextract(
    file: File,
    orderId: string,
    fileId: string,
    options?: { useFallback?: boolean; forceReextract?: boolean }
  ): Promise<ExtractionResult> {
    this.retryCount++;

    if (options?.useFallback && this.config.ai_models.fallback) {
      // Swap primary and fallback for retry
      const temp = this.config.ai_models.primary;
      this.config.ai_models.primary = this.config.ai_models.fallback;
      if (this.config.ai_models.ensemble) {
        this.config.ai_models.fallback = temp;
      }
    }

    return await this.extractFromFile(file, orderId, fileId);
  }

  // ============================================================================
  // Private Methods - File Conversion
  // ============================================================================

  /**
   * Convert .ai file to image for AI analysis
   */
  private async convertFileToImage(file: File): Promise<string> {
    const { target_format, dpi, quality } = this.config.conversion;

    // In production, this would call:
    // 1. Adobe Illustrator CLI/Server for .ai -> PDF
    // 2. PDF processing library for PDF -> PNG
    // 3. Upload to Supabase Storage

    // For now, return mock URL
    // In real implementation:
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', target_format);
    formData.append('dpi', dpi.toString());
    formData.append('quality', quality.toString());

    // Call conversion service (CloudConvert or self-hosted)
    // const response = await fetch('/api/convert', { method: 'POST', body: formData });
    // const { url } = await response.json();

    // Mock implementation
    return URL.createObjectURL(file);
  }

  // ============================================================================
  // Private Methods - AI Extraction
  // ============================================================================

  /**
   * Extract product data using AI vision model
   */
  private async extractWithAI(imageUrl: string): Promise<ExtractedProductData> {
    const model = this.config.ai_models.primary as AIModelConfig;
    const fallbackConfig = this.config.ai_models.fallback as AIModelConfig | null;

    // Prepare prompt for AI model (needed for both try and catch)
    const prompt = this.buildExtractionPrompt();

    try {
      // Call AI model (OpenAI GPT-4 Vision or Anthropic Claude)
      const response = await this.callAIModel(model, imageUrl, prompt);

      // Parse response into structured data
      return this.parseAIResponse(response);
    } catch (error) {
      // Try fallback model if available
      if (fallbackConfig) {
        console.warn('Primary AI model failed, trying fallback:', error);
        const response = await this.callAIModel(fallbackConfig, imageUrl, prompt);
        return this.parseAIResponse(response);
      }
      throw error;
    }
  }

  /**
   * Build detailed extraction prompt for AI model
   */
  private buildExtractionPrompt(): string {
    return `
You are an expert at analyzing packaging design files and extracting product specifications.

Analyze this packaging design image and extract the following information in JSON format:

1. DIMENSIONS:
   - Width (mm)
   - Height (mm)
   - Gusset/Bottom fold (mm, if applicable)

2. MATERIALS:
   - Material structure (e.g., PET12μ+AL7μ+PET12μ+LLDPE60μ)
   - Individual layers with thickness

3. OPTIONS:
   - Zipper/closure (yes/no, type)
   - Notch (V/U/round/none)
   - Corner round (R5/R10/none)
   - Hang hole (yes/no, type)
   - Valve (yes/no)

4. COLORS:
   - Color mode (CMYK/PANTONE/spot)
   - Front colors with names and CMYK values
   - Back colors (if visible)
   - Total color count

5. DESIGN ELEMENTS:
   - Logos (position, size)
   - Text elements (content, font, size)
   - Graphics/icons

6. PRINT SPECIFICATIONS:
   - Resolution (DPI)
   - Bleed (mm)
   - Print type (flexographic/rotogravure/digital)

Respond ONLY with valid JSON in this format:
{
  "dimensions": { "width_mm": number, "height_mm": number, "gusset_mm": number },
  "materials": { "raw": string, "layers": [...], "total_thickness_microns": number },
  "options": { "zipper": boolean, "notch": string, "corner_round": string, "hang_hole": boolean },
  "colors": { "mode": string, "front_colors": [...], "color_stations": number },
  "design_elements": { "logos": [...], "text": [...], "graphics": [...] },
  "print_specifications": { "resolution_dpi": number, "color_mode": string, "bleed_mm": number }
}

If any information is not visible or unclear, set it to null and add to a "notes" field.
Be precise with measurements - they are critical for production.
`.trim();
  }

  /**
   * Call AI model (OpenAI or Anthropic)
   */
  private async callAIModel(
    config: AIModelConfig,
    imageUrl: string,
    prompt: string
  ): Promise<unknown> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout_ms);

    try {
      if (config.provider === 'openai') {
        return await this.callOpenAI(config, imageUrl, prompt, controller.signal);
      } else if (config.provider === 'anthropic') {
        return await this.callAnthropic(config, imageUrl, prompt, controller.signal);
      } else {
        throw new Error(`Unsupported AI provider: ${config.provider}`);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Call OpenAI GPT-4 Vision API
   */
  private async callOpenAI(
    config: AIModelConfig,
    imageUrl: string,
    prompt: string,
    signal: AbortSignal
  ): Promise<unknown> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.api_key}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: config.max_tokens,
        temperature: config.temperature,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  /**
   * Call Anthropic Claude API
   */
  private async callAnthropic(
    config: AIModelConfig,
    imageUrl: string,
    prompt: string,
    signal: AbortSignal
  ): Promise<unknown> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.api_key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.max_tokens,
        temperature: config.temperature,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image',
                source: {
                  type: 'url',
                  url: imageUrl,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.content[0].text);
  }

  /**
   * Parse AI response into ExtractedProductData
   */
  private parseAIResponse(response: unknown): ExtractedProductData {
    const data = response as Record<string, unknown>;

    return {
      dimensions: this.normalizeDimensions(data.dimensions),
      materials: this.normalizeMaterials(data.materials),
      options: this.normalizeOptions(data.options),
      colors: this.normalizeColors(data.colors),
      design_elements: this.normalizeDesignElements(data.design_elements),
      print_specifications: this.normalizePrintSpecs(data.print_specifications),
      notes: data.notes as string | undefined,
    };
  }

  // ============================================================================
  // Private Methods - Data Normalization
  // ============================================================================

  private normalizeDimensions(dimensions: unknown): ProductDimensions {
    const dims = dimensions as Record<string, unknown>;
    return {
      width_mm: this.toNumber(dims.width_mm, 130),
      height_mm: this.toNumber(dims.height_mm, 130),
      gusset_mm: dims.gusset_mm ? this.toNumber(dims.gusset_mm, 60) : undefined,
    };
  }

  private normalizeMaterials(materials: unknown): MaterialSpecification {
    const mats = materials as Record<string, unknown>;
    const layers = (mats.layers as unknown[] || []).map((layer, idx) => ({
      type: (layer as Record<string, unknown>).type as AIExtractionMaterialLayer['type'],
      thickness_microns: this.toNumber((layer as Record<string, unknown>).thickness_microns, 12),
      position: idx + 1,
    }));

    return {
      raw: mats.raw as string || '',
      layers,
      total_thickness_microns: layers.reduce((sum, l) => sum + l.thickness_microns, 0),
    };
  }

  private normalizeOptions(options: unknown): ProductOptions {
    const opts = options as Record<string, unknown>;
    return {
      zipper: Boolean(opts.zipper),
      zipper_type: opts.zipper_type as ProductOptions['zipper_type'],
      notch: opts.notch as ProductOptions['notch'] || 'none',
      corner_round: opts.corner_round as ProductOptions['corner_round'] || 'none',
      hang_hole: Boolean(opts.hang_hole),
      hang_hole_type: opts.hang_hole_type as ProductOptions['hang_hole_type'],
      valve: opts.valve ? Boolean(opts.valve) : undefined,
    };
  }

  private normalizeColors(colors: unknown): ColorSpecifications {
    const cols = colors as Record<string, unknown>;
    const frontColors = (cols.front_colors as unknown[] || []).map(c => ({
      name: (c as Record<string, unknown>).name as string,
      cmyk: (c as Record<string, unknown>).cmyk as [number, number, number, number],
      spot_color: (c as Record<string, unknown>).spot_color as string | undefined,
    }));

    return {
      mode: cols.mode as ColorSpecifications['mode'] || 'CMYK',
      front_colors: frontColors,
      back_colors: cols.back_colors as ColorSpec[] | undefined,
      color_stations: this.toNumber(cols.color_stations, frontColors.length),
      varnish: cols.varnish as ColorSpecifications['varnish'],
    };
  }

  private normalizeDesignElements(elements: unknown): DesignElements {
    const elems = elements as Record<string, unknown>;
    return {
      logos: (elems.logos as LogoElement[]) || [],
      text: (elems.text as AIExtractionTextElement[]) || [],
      graphics: (elems.graphics as GraphicElement[]) || [],
    };
  }

  private normalizePrintSpecs(specs: unknown): PrintSpecifications {
    const spec = specs as Record<string, unknown>;
    return {
      resolution_dpi: this.toNumber(spec.resolution_dpi, 350),
      color_mode: spec.color_mode as ColorMode || 'CMYK',
      bleed_mm: this.toNumber(spec.bleed_mm, 3),
      print_type: spec.print_type as PrintSpecifications['print_type'] || 'flexographic',
      plate_info: spec.plate_info as PrintSpecifications['plate_info'],
    };
  }

  private toNumber(value: unknown, defaultValue: number): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
  }

  // ============================================================================
  // Private Methods - Validation
  // ============================================================================

  /**
   * Validate extracted product data
   */
  private async validateExtractedData(
    data: ExtractedProductData
  ): Promise<Omit<AIExtractionValidationResult, 'confidence'>> {
    const errors: AIExtractionValidationError[] = [];
    const warnings: AIExtractionValidationWarning[] = [];
    const suggestions: Suggestion[] = [];
    const missingFields: string[] = [];

    // Validate dimensions
    const dimensionErrors = this.validateDimensions(data.dimensions);
    errors.push(...dimensionErrors.errors);
    warnings.push(...dimensionErrors.warnings);
    if (dimensionErrors.missingFields.length > 0) {
      missingFields.push(...dimensionErrors.missingFields);
    }

    // Validate materials
    const materialErrors = this.validateMaterials(data.materials);
    errors.push(...materialErrors.errors);
    warnings.push(...materialErrors.warnings);
    suggestions.push(...materialErrors.suggestions);
    if (materialErrors.missingFields.length > 0) {
      missingFields.push(...materialErrors.missingFields);
    }

    // Validate options
    const optionErrors = this.validateOptions(data.options);
    errors.push(...optionErrors.errors);
    warnings.push(...optionErrors.warnings);

    // Validate colors
    const colorErrors = this.validateColors(data.colors);
    errors.push(...colorErrors.errors);
    warnings.push(...colorErrors.warnings);
    suggestions.push(...colorErrors.suggestions);

    // Validate print specs
    const printErrors = this.validatePrintSpecs(data.print_specifications);
    errors.push(...printErrors.errors);
    warnings.push(...printErrors.warnings);

    // Determine overall status
    let status: AIExtractionValidationResult['status'] = 'valid';
    if (errors.some(e => e.severity === 'critical')) {
      status = 'invalid';
    } else if (errors.length > 0 || warnings.length > 5) {
      status = 'needs_revision';
    } else if (warnings.length > 0) {
      status = 'valid'; // Valid but with warnings
    }

    return {
      status,
      missing_fields: missingFields,
      errors,
      warnings,
      suggestions,
    };
  }

  private validateDimensions(dimensions: ProductDimensions) {
    const errors: AIExtractionValidationError[] = [];
    const warnings: AIExtractionValidationWarning[] = [];
    const missingFields: string[] = [];

    if (!dimensions.width_mm) missingFields.push('dimensions.width_mm');
    if (!dimensions.height_mm) missingFields.push('dimensions.height_mm');

    if (dimensions.width_mm < 30 || dimensions.width_mm > 500) {
      errors.push(new AIExtractionValidationError(
        'dimensions.width_mm',
        'Width must be between 30mm and 500mm',
        dimensions.width_mm,
        '30-500'
      ));
    }

    if (dimensions.height_mm < 30 || dimensions.height_mm > 500) {
      errors.push(new AIExtractionValidationError(
        'dimensions.height_mm',
        'Height must be between 30mm and 500mm',
        dimensions.height_mm,
        '30-500'
      ));
    }

    if (dimensions.gusset_mm && (dimensions.gusset_mm < 0 || dimensions.gusset_mm > 200)) {
      warnings.push({
        field: 'dimensions.gusset_mm',
        message: 'Gusset outside standard range',
        severity: 'warning',
        recommendation: 'Confirm with customer',
      });
    }

    return { errors, warnings, missingFields };
  }

  private validateMaterials(materials: MaterialSpecification) {
    const errors: AIExtractionValidationError[] = [];
    const warnings: AIExtractionValidationWarning[] = [];
    const suggestions: Suggestion[] = [];
    const missingFields: string[] = [];

    if (!materials.raw) missingFields.push('materials.raw');
    if (!materials.layers || materials.layers.length === 0) {
      missingFields.push('materials.layers');
    }

    if (materials.total_thickness_microns < 40 || materials.total_thickness_microns > 200) {
      warnings.push({
        field: 'materials.total_thickness_microns',
        message: 'Thickness outside typical range (40-200μ)',
        severity: 'warning',
        recommendation: 'Verify material structure',
      });
    }

    const validTypes = ['PET', 'AL', 'CPP', 'PE', 'NY', 'PAPER', 'OTHER'];
    materials.layers.forEach((layer, idx) => {
      if (!validTypes.includes(layer.type)) {
        warnings.push({
          field: `materials.layers[${idx}].type`,
          message: `Unknown material type: ${layer.type}`,
          severity: 'warning',
        });
      }
    });

    return { errors, warnings, suggestions, missingFields };
  }

  private validateOptions(options: ProductOptions) {
    const errors: AIExtractionValidationError[] = [];
    const warnings: AIExtractionValidationWarning[] = [];
    const suggestions: Suggestion[] = [];

    if (options.zipper && !options.zipper_type) {
      suggestions.push({
        field: 'options.zipper_type',
        message: 'Zipper type not specified',
        suggested_value: 'standard',
        reason: 'Standard zipper is most common',
      });
    }

    if (options.hang_hole && !options.hang_hole_type) {
      suggestions.push({
        field: 'options.hang_hole_type',
        message: 'Hang hole type not specified',
        suggested_value: 'round',
        reason: 'Round hang hole is standard',
      });
    }

    return { errors, warnings, suggestions };
  }

  private validateColors(colors: ColorSpecifications) {
    const errors: AIExtractionValidationError[] = [];
    const warnings: AIExtractionValidationWarning[] = [];
    const suggestions: Suggestion[] = [];

    if (colors.front_colors.length === 0) {
      errors.push(new AIExtractionValidationError(
        'colors.front_colors',
        'No front colors specified',
        []
      ));
    }

    colors.front_colors.forEach((color, idx) => {
      if (color.cmyk.some(v => v < 0 || v > 100)) {
        errors.push(new AIExtractionValidationError(
          `colors.front_colors[${idx}].cmyk`,
          'CMYK values must be between 0 and 100',
          color.cmyk,
          '[0-100, 0-100, 0-100, 0-100]'
        ));
      }
    });

    return { errors, warnings, suggestions };
  }

  private validatePrintSpecs(specs: PrintSpecifications) {
    const errors: AIExtractionValidationError[] = [];
    const warnings: AIExtractionValidationWarning[] = [];

    if (specs.resolution_dpi < 150 || specs.resolution_dpi > 600) {
      warnings.push({
        field: 'print_specifications.resolution_dpi',
        message: 'Resolution outside typical range (150-600 DPI)',
        severity: 'warning',
        recommendation: '350 DPI is standard for flexographic printing',
      });
    }

    if (specs.bleed_mm < 0 || specs.bleed_mm > 10) {
      warnings.push({
        field: 'print_specifications.bleed_mm',
        message: 'Bleed outside typical range (0-10mm)',
        severity: 'warning',
        recommendation: '3mm is standard',
      });
    }

    return { errors, warnings };
  }

  // ============================================================================
  // Private Methods - Confidence Scoring
  // ============================================================================

  /**
   * Calculate confidence score for extraction results
   */
  private calculateConfidence(
    data: ExtractedProductData,
    validation: Omit<AIExtractionValidationResult, 'confidence'>
  ): ConfidenceScore {
    const fields: ConfidenceScore['fields'] = {};

    // Dimension confidence (based on standard ranges)
    fields.dimensions = this.calculateDimensionConfidence(data.dimensions);

    // Material confidence (based on completeness)
    fields.materials = this.calculateMaterialConfidence(data.materials);

    // Options confidence
    fields.options = this.calculateOptionsConfidence(data.options);

    // Color confidence
    fields.colors = this.calculateColorConfidence(data.colors);

    // Design elements confidence
    fields.design_elements = this.calculateDesignElementsConfidence(data.design_elements);

    // Print specs confidence
    fields.print_specs = this.calculatePrintSpecsConfidence(data.print_specifications);

    // Overall confidence (average of field confidences, penalized by errors)
    const fieldValues = Object.values(fields).filter(f => f !== undefined) as number[];
    const averageConfidence = fieldValues.reduce((sum, f) => sum + f, 0) / fieldValues.length;

    const errorPenalty = validation.errors.filter(e => e.severity === 'critical').length * 0.1;
    const warningPenalty = validation.warnings.length * 0.02;

    const overall = Math.max(0, Math.min(1, averageConfidence - errorPenalty - warningPenalty));

    return {
      overall,
      fields,
      method_confidence: this.config.ai_models.primary.model.includes('gpt-4') ? 0.9 : 0.8,
    };
  }

  private calculateDimensionConfidence(dimensions: ProductDimensions): number {
    let confidence = 0.7;

    if (dimensions.width_mm >= 50 && dimensions.width_mm <= 300) confidence += 0.1;
    if (dimensions.height_mm >= 50 && dimensions.height_mm <= 300) confidence += 0.1;
    if (dimensions.gusset_mm !== undefined) confidence += 0.1;

    return Math.min(1, confidence);
  }

  private calculateMaterialConfidence(materials: MaterialSpecification): number {
    let confidence = 0.6;

    if (materials.raw) confidence += 0.1;
    if (materials.layers.length > 0) confidence += 0.1;
    if (materials.total_thickness_microns > 0) confidence += 0.1;
    if (materials.layers.every(l => ['PET', 'AL', 'CPP', 'PE', 'NY', 'PAPER'].includes(l.type))) {
      confidence += 0.1;
    }

    return Math.min(1, confidence);
  }

  private calculateOptionsConfidence(options: ProductOptions): number {
    let confidence = 0.5;

    const fields = Object.keys(options).length;
    confidence += fields * 0.1;

    return Math.min(1, confidence);
  }

  private calculateColorConfidence(colors: ColorSpecifications): number {
    let confidence = 0.6;

    if (colors.front_colors.length > 0) confidence += 0.1;
    if (colors.front_colors.every(c => c.name && c.cmyk)) confidence += 0.2;
    if (colors.mode) confidence += 0.1;

    return Math.min(1, confidence);
  }

  private calculateDesignElementsConfidence(elements: DesignElements): number {
    const totalElements = elements.logos.length + elements.text.length + elements.graphics.length;
    return Math.min(1, 0.3 + totalElements * 0.1);
  }

  private calculatePrintSpecsConfidence(specs: PrintSpecifications): number {
    let confidence = 0.5;

    if (specs.resolution_dpi) confidence += 0.2;
    if (specs.color_mode) confidence += 0.2;
    if (specs.bleed_mm) confidence += 0.1;

    return Math.min(1, confidence);
  }

  // ============================================================================
  // Private Methods - Utilities
  // ============================================================================

  private mergeData(
    extracted: ExtractedProductData,
    manual: Partial<ExtractedProductData>
  ): ExtractedProductData {
    return {
      dimensions: { ...extracted.dimensions, ...manual.dimensions },
      materials: { ...extracted.materials, ...manual.materials },
      options: { ...extracted.options, ...manual.options },
      colors: { ...extracted.colors, ...manual.colors },
      design_elements: { ...extracted.design_elements, ...manual.design_elements },
      print_specifications: { ...extracted.print_specifications, ...manual.print_specifications },
      notes: manual.notes || extracted.notes,
    };
  }

  private handleError(error: unknown, fileId: string, orderId: string, startTime: number): ExtractionResult {
    const isExtractionError = error instanceof ExtractionError;
    const isRetryable = isExtractionError ? error.retryable : true;

    return {
      id: this.generateId(),
      file_id: fileId,
      order_id: orderId,
      status: 'failed',
      data: null,
      validation: {
        status: 'invalid',
        confidence: { overall: 0, fields: {}, method_confidence: 0 },
        missing_fields: [],
        errors: [],
        warnings: [],
        suggestions: [],
      },
      metadata: {
        extracted_at: new Date().toISOString(),
        extraction_method: 'ai_vision',
        ai_model: this.config.ai_models.primary.model,
        processing_time_ms: Date.now() - startTime,
        retry_count: this.retryCount,
      },
      error: {
        name: 'ExtractionError',
        code: isExtractionError ? error.code : 'EXTRACTION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        stage: isExtractionError ? error.stage : 'extraction',
        retryable: isRetryable,
      } as ExtractionError,
    };
  }

  private generateId(): string {
    return `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private estimateAPICost(): number {
    // OpenAI GPT-4 Vision: ~$0.01-0.03 per image
    // Anthropic Claude: ~$0.015-0.075 per image
    if (this.config.ai_models.primary.provider === 'openai') {
      return 0.02;
    }
    return 0.03;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a new AI extraction engine with default configuration
 */
export function createExtractionEngine(config?: Partial<ExtractionPipelineConfig>): AIExtractionEngine {
  return new AIExtractionEngine(config);
}
