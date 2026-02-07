#!/usr/bin/env node
/**
 * Fix missing AnimatePresence imports
 *
 * This script adds AnimatePresence to imports if it's used in the file but not imported.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = join(fileURLToPath(import.meta.url), '../..');

const filesWithAnimatePresence = [
  'src/components/roi/EnhancedROICalculator.tsx',
  'src/components/quote/UnifiedQuoteSystem.tsx',
  'src/components/quote/UnifiedSKUQuantityStep.tsx',
  'src/components/quote/UserExperienceEnhancements.tsx',
  'src/components/roi/AdvancedPouchPriceCalculator.tsx',
  'src/components/quote/RedesignedPostProcessingWorkflow.tsx',
  'src/components/quote/QuantityPatternManager.tsx',
  'src/components/quote/QuoteWizard.tsx',
  'src/components/quote/ProductSelector.tsx',
  'src/components/quote/PriceBreakdown.tsx',
  'src/components/quote/ProcessingPreviewTrigger.tsx',
  'src/components/quote/PostProcessingCostImpact.tsx',
  'src/components/quote/PostProcessingItemReplacement.tsx',
  'src/components/quote/PostProcessingComparisonTable.tsx',
  'src/components/quote/NextGenPostProcessingSystem.tsx',
  'src/components/quote/OptimalQuantityRecommender.tsx',
  'src/components/quote/MobilePostProcessingSelector.tsx',
  'src/components/quote/ModernPostProcessingSelector.tsx',
  'src/components/quote/InteractiveQuoteSystem.tsx',
  'src/components/quote/MobileOptimizedPreview.tsx',
  'src/components/quote/InteractiveProductPreview.tsx',
  'src/components/quote/EnhancedQuantityInput.tsx',
  'src/components/quote/EnvelopePreview.tsx',
  'src/components/quote/ErrorToast.tsx',
  'src/components/quote/ConfigurationPanel.tsx',
  'src/components/quote/EnhancedPostProcessingPreview.tsx',
  'src/components/quote/EnhancedPostProcessingSelector.tsx',
  'src/components/quote/AdvancedPostProcessingPreview.tsx',
  'src/components/quote/AIRecommendationEngine.tsx',
  'src/components/comparison/CompareToggle.tsx',
  'src/components/archives/ArchivePage.tsx',
  'src/components/catalog/EnhancedProductCard.tsx',
  'src/app/catalog/CatalogClient.tsx',
];

function fixFile(filePath) {
  try {
    const fullPath = join(ROOT_DIR, filePath);
    let content = readFileSync(fullPath, 'utf-8');

    // Check if AnimatePresence is used
    if (!content.includes('AnimatePresence')) {
      return false;
    }

    // Check if AnimatePresence is already imported
    if (content.includes("import { motion, AnimatePresence }") ||
        content.includes("import { AnimatePresence")) {
      return false;
    }

    // Add AnimatePresence to existing motion import
    if (content.includes("import { motion } from 'framer-motion'")) {
      content = content.replace(
        "import { motion } from 'framer-motion'",
        "import { motion, AnimatePresence } from 'framer-motion'"
      );
      writeFileSync(fullPath, content, 'utf-8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Adding missing AnimatePresence imports...\n');

  let fixedCount = 0;

  for (const file of filesWithAnimatePresence) {
    const fixed = fixFile(file);
    if (fixed) {
      fixedCount++;
      console.log(`✅ Fixed: ${file}`);
    }
  }

  console.log(`\n✨ Added AnimatePresence to ${fixedCount} files`);
}

main();
