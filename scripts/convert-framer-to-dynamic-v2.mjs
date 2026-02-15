#!/usr/bin/env node

/**
 * Convert all framer-motion static imports to next/dynamic imports
 * This reduces initial bundle size by loading framer-motion only when needed
 */

import { readFileSync, writeFileSync } from 'fs';

// All 59 files that need conversion
const filesToConvert = [
  'src/components/quote/InteractiveQuoteSystem.tsx',
  'src/app/catalog/CatalogClient.tsx',
  'src/components/catalog/EnhancedProductCard.tsx',
  'src/components/quote/AIRecommendationEngine.tsx',
  'src/app/news/NewsClient.tsx',
  'src/components/quote/PriceBreakdown.tsx',
  'src/components/comparison/CompareToggle.tsx',
  'src/components/quote/UserExperienceEnhancements.tsx',
  'src/components/quote/RedesignedPostProcessingWorkflow.tsx',
  'src/components/quote/ProcessingPreviewTrigger.tsx',
  'src/components/quote/PostProcessingItemReplacement.tsx',
  'src/components/quote/PostProcessingSelectionCounter.tsx',
  'src/components/quote/PostProcessingExport.tsx',
  'src/components/quote/PostProcessingCostImpact.tsx',
  'src/components/quote/PostProcessingComparisonTable.tsx',
  'src/components/quote/NextGenPostProcessingSystem.tsx',
  'src/components/quote/ModernPostProcessingSelector.tsx',
  'src/components/quote/MobileOptimizedPreview.tsx',
  'src/components/quote/EnhancedPostProcessingPreview.tsx',
  'src/components/quote/BeforeAfterPreview.tsx',
  'src/components/home/EnhancedQuoteSimulator.tsx',
  'src/components/home/PremiumPricingGuide.tsx',
  'src/components/quote/ConfigurationPanel.tsx',
  'src/components/quote/AdvancedPostProcessingPreview.tsx',
  'src/components/roi/EnhancedROICalculator.tsx',
  'src/components/roi/AdvancedPouchPriceCalculator.tsx',
  'src/components/quote/SmartRecommendations.tsx',
  'src/components/quote/RealTimePreviewEngine.tsx',
  'src/components/quote/ProductSelector.tsx',
  'src/components/quote/MobilePostProcessingSelector.tsx',
  'src/components/home/HeroSection.tsx',
  'src/components/quote/QuoteWizard.tsx',
  'src/components/quote/EnhancedPostProcessingSelector.tsx',
  'src/components/quote/UnifiedQuoteSystem.tsx',
  'src/components/quote/InteractiveProductPreview.tsx',
  'src/components/quote/MultiQuantityComparisonTable.tsx',
  'src/components/quote/QuantityPatternManager.tsx',
  'src/components/quote/OptimalQuantityRecommender.tsx',
  'src/components/quote/EnhancedQuantityInput.tsx',
  'src/components/service/ServicePage.tsx',
  'src/components/archives/ArchivePage.tsx',
  'src/components/admin/CatalogDownloadAdmin.tsx',
  'src/components/quote/sections/DeliveryStep.tsx',
  'src/components/quote/ErrorToast.tsx',
  'src/components/quote/SKUSelectionStep.tsx',
  'src/components/quote/ImprovedQuotingWizard.tsx',
  'src/components/quote/MultiQuantityStep.tsx',
  'src/components/quote/UnifiedSKUQuantityStep.tsx',
  'src/components/quote/EnvelopePreview.tsx',
  'src/components/quote/ParallelProductionOptions.tsx',
  'src/components/quote/EconomicQuantityProposal.tsx',
  'src/components/quote/OrderSummarySection.tsx',
  'src/components/quote/QuantityOptionsGrid.tsx',
  'src/components/catalog/ProductListItem.tsx',
  'src/components/quote/sections/ResultStep.tsx',
  'src/lib/animations.tsx',
  'src/components/ui/PageTransition.tsx',
  'src/components/ui/MotionWrapper.tsx',
  'src/components/ui/GlassCard.tsx'
];

/**
 * Convert framer-motion import patterns
 */
function convertImports(content, filePath) {
  let converted = content;

  // Special handling for animations.tsx - use type imports for types
  if (filePath.endsWith('animations.tsx')) {
    if (converted.includes("import { motion, Variants, MotionProps } from 'framer-motion'")) {
      converted = converted.replace(
        "import { motion, Variants, MotionProps } from 'framer-motion'",
        `import type { Variants, MotionProps } from 'framer-motion'\nimport dynamic from 'next/dynamic'\nconst motion = dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion })), { ssr: false })`
      );
      return { content: converted, hasChanges: true };
    }
  }

  // Pattern 1: Single line with motion and AnimatePresence
  // Match: import { motion, AnimatePresence } from 'framer-motion'
  const pattern1 = /import\s*\{\s*motion\s*,\s*AnimatePresence\s*\}\s*from\s*['"]framer-motion['"]/g;
  if (pattern1.test(converted)) {
    converted = converted.replace(
      pattern1,
      `import dynamic from 'next/dynamic'\nconst motion = dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion })), { ssr: false })\nconst AnimatePresence = dynamic(() => import('framer-motion').then(mod => ({ default: mod.AnimatePresence })), { ssr: false })`
    );
    return { content: converted, hasChanges: true };
  }

  // Pattern 2: Single line with just motion
  // Match: import { motion } from 'framer-motion'
  const pattern2 = /import\s*\{\s*motion\s*\}\s*from\s*['"]framer-motion['"]/g;
  if (pattern2.test(converted)) {
    converted = converted.replace(
      pattern2,
      `import dynamic from 'next/dynamic'\nconst motion = dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion })), { ssr: false })`
    );
    return { content: converted, hasChanges: true };
  }

  return { content: converted, hasChanges: false };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const { content: newContent, hasChanges } = convertImports(content, filePath);

    if (hasChanges) {
      writeFileSync(filePath, newContent, 'utf-8');
      return { success: true, file: filePath };
    }

    return { success: false, file: filePath, message: 'No changes needed' };
  } catch (error) {
    return { success: false, file: filePath, error: error.message };
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Converting framer-motion imports to dynamic imports...\n');

  const results = {
    converted: [],
    skipped: [],
    errors: []
  };

  for (const file of filesToConvert) {
    const result = processFile(file);

    if (result.success) {
      results.converted.push(file);
      console.log(`✅ Converted: ${file}`);
    } else if (result.error) {
      results.errors.push({ file: result.file, error: result.error });
      console.log(`❌ Error: ${file} - ${result.error}`);
    } else {
      results.skipped.push(file);
      console.log(`⏭️  Skipped: ${file} - ${result.message}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 CONVERSION SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Successfully converted: ${results.converted.length} files`);
  console.log(`⏭️  Already converted/skipped: ${results.skipped.length} files`);
  console.log(`❌ Errors: ${results.errors.length} files`);
  console.log('='.repeat(80));

  if (results.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    results.errors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
  }

  if (results.converted.length > 0) {
    console.log('\n🎉 All files converted successfully!');
    console.log('\n💡 Next steps:');
    console.log('  1. Run: npm run build to verify no TypeScript errors');
    console.log('  2. Test the application to ensure animations work correctly');
    console.log('  3. Check bundle size reduction with: npm run build -- --analyze');
  }

  return results;
}

// Run the conversion
main();
