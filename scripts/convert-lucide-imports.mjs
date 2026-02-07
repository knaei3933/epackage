#!/usr/bin/env node

/**
 * Script to convert lucide-react barrel imports to direct imports for tree-shaking
 *
 * This script automatically converts:
 * FROM: import { Icon1, Icon2 } from 'lucide-react'
 * TO:   import { Icon1 } from 'lucide-react/dist/esm/icons/lucide-icons-Icon1'
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of files to process
const filesToProcess = [
  'src/components/home/PremiumPricingGuide.tsx',
  'src/components/home/PremiumProductShowcase.tsx',
  'src/components/home/QuoteSimulator.tsx',
  'src/components/home/EnhancedQuoteSimulator.tsx',
  'src/components/home/CTASection.tsx',
  'src/components/industry/ContactExpertSection.tsx',
  'src/components/ProductLineupSection.tsx',
  'src/components/QualitySection.tsx',
  'src/components/TrustSignalsSection.tsx',
  'src/components/WhyKoreaSection.tsx',
  'src/components/ComplianceSection.tsx',
  'src/components/JapanBusinessSupport.tsx',
  'src/components/CertificationBadges.tsx',
  'src/components/CaseStudySection.tsx',
  'src/components/quote/BeforeAfterPreview.tsx',
  'src/components/quote/DataTemplateGuide.tsx',
  'src/components/quote/EnhancedPostProcessingPreview.tsx',
  'src/components/quote/MobileOptimizedPreview.tsx',
  'src/components/quote/ModernPostProcessingSelector.tsx',
  'src/components/quote/NextGenPostProcessingSystem.tsx',
  'src/components/quote/PostProcessingComparisonTable.tsx',
  'src/components/quote/PostProcessingCostImpact.tsx',
  'src/components/quote/PostProcessingExport.tsx',
  'src/components/quote/PostProcessingItemReplacement.tsx',
  'src/components/quote/PostProcessingSelectionCounter.tsx',
  'src/components/quote/ProcessingPreviewTrigger.tsx',
  'src/components/quote/RedesignedPostProcessingWorkflow.tsx',
  'src/components/quote/UserExperienceEnhancements.tsx',
  'src/components/comparison/CompareToggle.tsx',
  'src/components/quote/PriceBreakdown.tsx',
  'src/components/seo/BreadcrumbList.tsx',
  'src/components/cart/CartItem.tsx',
  'src/app/catalog/CatalogClient.tsx',
  'src/app/compare/ComparisonClient.tsx',
  'src/app/contact/thank-you/page.tsx',
  'src/app/csr/page.tsx',
  'src/app/data-templates/page.tsx',
  'src/app/guide/layout.tsx',
  'src/app/guide/page.tsx',
  'src/app/legal/page.tsx',
  'src/app/news/NewsClient.tsx',
  'src/app/print/page.tsx',
  'src/app/samples/thank-you/page.tsx'
];

// Icon name to import path mapping
const iconImportMap = {
  // Navigation icons
  'ArrowRight': "import { ArrowRight } from 'lucide-react/dist/esm/icons/lucide-icons-ArrowRight'",
  'ArrowLeft': "import { ArrowLeft } from 'lucide-react/dist/esm/icons/lucide-icons-ArrowLeft'",
  'ChevronRight': "import { ChevronRight } from 'lucide-react/dist/esm/icons/lucide-icons-ChevronRight'",
  'ChevronLeft': "import { ChevronLeft } from 'lucide-react/dist/esm/icons/lucide-icons-ChevronLeft'",
  'ChevronDown': "import { ChevronDown } from 'lucide-react/dist/esm/icons/lucide-icons-ChevronDown'",
  'ChevronUp': "import { ChevronUp } from 'lucide-react/dist/esm/icons/lucide-icons-ChevronUp'",

  // UI icons
  'X': "import { X } from 'lucide-react/dist/esm/icons/lucide-icons-X'",
  'Check': "import { Check } from 'lucide-react/dist/esm/icons/lucide-icons-Check'",
  'CheckCircle': "import { CheckCircle } from 'lucide-react/dist/esm/icons/lucide-icons-CheckCircle'",
  'Circle': "import { Circle } from 'lucide-react/dist/esm/icons/lucide-icons-Circle'",
  'Info': "import { Info } from 'lucide-react/dist/esm/icons/lucide-icons-Info'",
  'AlertCircle': "import { AlertCircle } from 'lucide-react/dist/esm/icons/lucide-icons-AlertCircle'",
  'AlertTriangle': "import { AlertTriangle } from 'lucide-react/dist/esm/icons/lucide-icons-AlertTriangle'",
  'HelpCircle': "import { HelpCircle } from 'lucide-react/dist/esm/icons/lucide-icons-HelpCircle'",
  'Settings': "import { Settings } from 'lucide-react/dist/esm/icons/lucide-icons-Settings'",

  // Action icons
  'Plus': "import { Plus } from 'lucide-react/dist/esm/icons/lucide-icons-Plus'",
  'Minus': "import { Minus } from 'lucide-react/dist/esm/icons/lucide-icons-Minus'",
  'Search': "import { Search } from 'lucide-react/dist/esm/icons/lucide-icons-Search'",
  'Filter': "import { Filter } from 'lucic-react/dist/esm/icons/lucide-icons-Filter'",
  'Sort': "import { Sort } from 'lucide-react/dist/esm/icons/lucide-icons-Sort'",
  'Download': "import { Download } from 'lucide-react/dist/esm/icons/lucide-icons-Download'",
  'Upload': "import { Upload } from 'lucide-react/dist/esm/icons/lucide-icons-Upload'",
  'Share2': "import { Share2 } from 'lucide-react/dist/esm/icons/lucide-icons-Share2'",
  'Link': "import { Link } from 'lucide-react/dist/esm/icons/lucide-icons-Link'",
  'ExternalLink': "import { ExternalLink } from 'lucide-react/dist/esm/icons/lucide-icons-ExternalLink'",
  'Copy': "import { Copy } from 'lucide-react/dist/esm/icons/lucide-icons-Copy'",

  // Communication icons
  'Mail': "import { Mail } from 'lucide-react/dist/esm/icons/lucide-icons-Mail'",
  'Phone': "import { Phone } from 'lucide-react/dist/esm/icons/lucide-icons-Phone'",
  'PhoneCall': "import { PhoneCall } from 'lucide-react/dist/esm/icons/lucide-icons-PhoneCall'",
  'MessageSquare': "import { MessageSquare } from 'lucide-react/dist/esm/icons/lucide-icons-MessageSquare'",
  'MessageCircle': "import { MessageCircle } from 'lucide-react/dist/esm/icons/lucide-icons-MessageCircle'",
  'Send': "import { Send } from 'lucide-react/dist/esm/icons/lucide-icons-Send'",
  'Paperclip': "import { Paperclip } from 'lucide-react/dist/esm/icons/lucide-icons-Paperclip'",

  // User icons
  'User': "import { User } from 'lucide-react/dist/esm/icons/lucide-icons-User'",
  'Users': "import { Users } from 'lucide-react/dist/esm/icons/lucide-icons-Users'",
  'UserPlus': "import { UserPlus } from 'lucide-react/dist/esm/icons/lucide-icons-UserPlus'",
  'UserCheck': "import { UserCheck } from 'lucide-react/dist/esm/icons/lucide-icons-UserCheck'",
  'Shield': "import { Shield } from 'lucide-react/dist/esm/icons/lucide-icons-Shield'",
  'Lock': "import { Lock } from 'lucide-react/dist/esm/icons/lucide-icons-Lock'",
  'Unlock': "import { Unlock } from 'lucide-react/dist/esm/icons/lucide-icons-Unlock'",

  // Business icons
  'Building': "import { Building } from 'lucide-react/dist/esm/icons/lucide-icons-Building'",
  'Briefcase': "import { Briefcase } from 'lucide-react/dist/esm/icons/lucide-icons-Briefcase'",
  'Calculator': "import { Calculator } from 'lucide-react/dist/esm/icons/lucide-icons-Calculator'",
  'DollarSign': "import { DollarSign } from 'lucide-react/dist/esm/icons/lucide-icons-DollarSign'",
  'CreditCard': "import { CreditCard } from 'lucide-react/dist/esm/icons/lucide-icons-CreditCard'",
  'TrendingUp': "import { TrendingUp } from 'lucide-react/dist/esm/icons/lucide-icons-TrendingUp'",
  'TrendingDown': "import { TrendingDown } from 'lucide-react/dist/esm/icons/lucide-icons-TrendingDown'",
  'BarChart': "import { BarChart } from 'lucide-react/dist/esm/icons/lucide-icons-BarChart'",
  'PieChart': "import { PieChart } from 'lucide-react/dist/esm/icons/lucide-icons-PieChart'",
  'Activity': " import { Activity } from 'lucide-react/dist/esm/icons/lucide-icons-Activity'",
  'Target': "import { Target } from 'lucide-react/dist/esm/icons/lucide-icons-Target'",

  // Product icons
  'Package': "import { Package } from 'lucide-react/dist/esm/icons/lucide-icons-Package'",
  'Box': "import { Box } from 'lucide-react/dist/esm/icons/lucide-icons-Box'",
  'ShoppingCart': "import { ShoppingCart } from 'lucide-react/dist/esm/icons/lucide-icons-ShoppingCart'",
  'ShoppingBag': "import { ShoppingBag } from 'lucide-react/dist/esm/icons/lucide-icons-ShoppingBag'",
  'Cart': "import { Cart } from 'lucide-react/dist/esm/icons/lucide-icons-Cart'",

  // Status icons
  'Star': "import { Star } from 'lucide-react/dist/esm/icons/lucide-icons-Star'",
  'Heart': "import { Heart } from 'lucide-react/dist/esm/icons/lucide-icons-Heart'",
  'Award': "import { Award } from 'lucide-react/dist/esm/icons/lucide-icons-Award'",
  'Medal': "import { Medal } from 'lucide-react/dist/esm/icons/lucide-icons-Medal'",
  'Crown': "import { Crown } from 'lucide-react/dist/esm/icons/lucide-icons-Crown'",
  'Gem': "import { Gem } from 'lucide-react/dist/esm/icons/lucide-icons-Gem'",
  'Diamond': "import { Diamond } from 'lucide-react/dist/esm/icons/lucide-icons-Diamond'",
  'Flame': "import { Flame } from 'lucide-react/dist/esm/icons/lucide-icons-Flame'",
  'Zap': "import { Zap } from 'lucide-react/dist/esm/icons/lucide-icons-Zap'",
  'Sparkles': "import { Sparkles } from 'lucide-react/dist/esm/icons/lucide-icons-Sparkles'",
  'Lightbulb': "import { Lightbulb } from 'lucide-react/dist/esm/icons/lucide-icons-Lightbulb'",
  'Idea': "import { Idea } from 'lucide-react/dist/esm/icons/lucide-icons-Idea'",
  'Bulb': "import { Bulb } from 'lucide-react/dist/esm/icons/lucide-icons-Bulb'",

  // Time icons
  'Clock': "import { Clock } from 'lucide-react/dist/esm/icons/lucide-icons-Clock'",
  'Calendar': "import { Calendar } from 'lucide-react/dist/esm/icons/lucide-icons-Calendar'",
  'Timer': "import { Timer } from 'lucide-react/dist/esm/icons/lucide-icons-Timer'",
  'Hourglass': "import { Hourglass } from 'lucide-react/dist/esm/icons/lucide-icons-Hourglass'",

  // Media icons
  'Image': "import { Image } from 'lucide-react/dist/esm/icons/lucide-icons-Image'",
  'Video': "import { Video } from 'lucide-react/dist/esm/icons/lucide-icons-Video'",
  'Camera': "import { Camera } from 'lucide-react/dist/esm/icons/lucide-icons-Camera'",
  'Mic': "import { Mic } from 'lucide-react/dist/esm/icons/lucide-icons-Mic'",
  'Volume2': "import { Volume2 } from 'lucide-react/dist/esm/icons/lucide-icons-Volume2'",
  'VolumeX': "import { VolumeX } from 'lucide-react/dist/esm/icons/lucide-icons-VolumeX'",
  'Volume1': "import { Volume1 } from 'lucide-react/dist/esm/icons/lucide-icons-Volume1'",
  'Volume': "import { Volume } from 'lucide-react/dist/esm/icons/lucide-icons-Volume'",

  // File icons
  'File': "import { File } from 'lucide-react/dist/esm/icons/lucide-icons-File'",
  'FileText': "import { FileText } from 'lucide-react/dist/esm/icons/lucide-icons-FileText'",
  'FileCheck': "import { FileCheck } from 'lucide-react/dist/esm/icons/lucide-icons-FileCheck'",
  'Folder': "import { Folder } from 'lucide-react/dist/esm/icons/lucide-icons-Folder'",
  'FolderOpen': "import { FolderOpen } from 'lucide-react/dist/esm/icons/lucide-icons-FolderOpen'",

  // Layout icons
  'Layout': "import { Layout } from 'lucide-react/dist/esm/icons/lucide-icons-Layout'",
  'Grid': "import { Grid } from 'lucide-react/dist/esm/icons/lucide-icons-Grid'",
  'List': "import { List } from 'lucide-react/dist/esm/icons/lucide-icons-List'",
  'Columns': "import { Columns } from 'lucide-react/dist/esm/icons/lucide-icons-Columns'",
  'Layers': "import { Layers } from 'lucide-react/dist/esm/icons/lucide-icons-Layers'",
  'Move3d': "import { Move3d } from 'lucide-react/dist/esm/icons/lucide-icons-Move3d'",
  'Maximize2': "import { Maximize2 } from 'lucide-react/dist/esm/icons/lucide-icons-Maximize2'",
  'Minimize2': "import { Minimize2 } from 'lucide-react/dist/esm/icons/lucide-icons-Minimize2'",
  'Fullscreen': "import { Fullscreen } from 'lucide-react/dist/esm/icons/lucide-icons-Fullscreen'",

  // Edit icons
  'Edit': "import { Edit } from 'lucide-react/dist/esm/icons/lucide-icons-Edit'",
  'Trash2': "import { Trash2 } from 'lucide-react/dist/esm/icons/lucide-icons-Trash2'",
  'Trash': "import { Trash } from 'lucide-react/dist/esm/icons/lucide-icons-Trash'",
  'Save': "import { Save } from 'lucide-react/dist/esm/icons/lucide-icons-Save'",
  'RefreshCw': "import { RefreshCw } from 'lucide-react/dist/esm/icons/lucide-icons-RefreshCw'",
  'RotateCw': "import { RotateCw } from 'lucide-react/dist/esm/icons/lucide-icons-RotateCw'",
  'Eye': "import { Eye } from 'lucide-react/dist/esm/icons/lucide-icons-Eye'",
  'EyeOff': "import { EyeOff } from 'lucide-react/dist/esm/icons/lucide-icons-EyeOff'",
  'Visibility': "import { Visibility } from 'lucide-react/dist/esm/icons/lucide-icons-Visibility'",
  'VisibilityOff': "import { VisibilityOff } from 'lucide-react/dist/esm/icons/lucide-icons-VisibilityOff'",

  // Transportation
  'Truck': "import { Truck } from 'lucide-react/dist/esm/icons/lucide-icons-Truck'",
  'Car': "import { Car } from 'lucide-react/dist/esm/icons/lucide-icons-Car'",
  'Plane': "import { Plane } from 'lucide-react/dist/esm/icons/lucide-icons-Plane'",
  'Ship': "import { Ship } from 'lucide-react/dist/esm/icons/lucide-icons-Ship'",
  'Bike': "import { Bike } from 'lucide-react/dist/esm/icons/lucide-icons-Bike'",

  // Location
  'MapPin': "import { MapPin } from 'lucide-react/dist/esm/icons/lucide-icons-MapPin'",
  'Navigation': "import { Navigation } from 'lucide-react/dist/esm/icons/lucide-icons-Navigation'",
  'Compass': "import { Compass } from 'lucide-react/dist/esm/icons/lucide-icons-Compass'",
  'Globe': "import { Globe } from 'lucide-react/dist/esm/icons/lucide-icons-Globe'",

  // Misc icons
  'Play': "import { Play } from 'lucide-react/dist/esm/icons/lucide-icons-Play'",
  'Pause': "import { Pause } from 'lucide-react/dist/esm/icons/lucide-icons-Pause'",
  'SkipForward': "import { SkipForward } from 'lucide-react/dist/esm/icons/lucide-icons-SkipForward'",
  'SkipBack': "import { SkipBack } from 'lucide-react/dist/esm/icons/lucide-icons-SkipBack'",
  'MoreHorizontal': "import { MoreHorizontal } from 'lucide-react/dist/esm/icons/lucide-icons-MoreHorizontal'",
  'MoreVertical': "import { MoreVertical } from 'lucide-react/dist/esm/icons/lucide-icons-MoreVertical'",
  'Ellipsis': "import { Ellipsis } from 'lucide-react/dist/esm/icons/lucide-icons-Ellipsis'",
  'Menu': "import { Menu } from 'lucide-react/dist/esm/icons/lucide-icons-Menu'",
  'AlignLeft': "import { AlignLeft } from 'lucide-react/dist/esm/icons/lucide-icons-AlignLeft'",
  'AlignCenter': "import { AlignCenter } from 'lucide-react/dist/esm/icons/lucide-icons-AlignCenter'",
  'AlignRight': "import { AlignRight } from 'lucide-react/dist/esm/icons/lucide-icons-AlignRight'",
  'Quote': "import { Quote } from 'lucide-react/dist/esm/icons/lucide-icons-Quote'",
  'Code': "import { Code } from 'lucide-react/dist/esm/icons/lucide-icons-Code'",
  'Terminal': "import { Terminal } from 'lucide-react/dist/esm/icons/lucide-icons-Terminal'",
  'Cpu': "import { Cpu } from 'lucide-react/dist/esm/icons/lucide-icons-Cpu'",
  'Database': "import { Database } from 'lucide-react/dist/esm/icons/lucide-icons-Database'",
  'Server': "import { Server } from 'lucide-react/dist/esm/icons/lucide-icons-Server'",
  'HardDrive': "import { HardDrive } from 'lucide-react/dist/esm/icons/lucide-icons-HardDrive'",
  'Wifi': "import { Wifi } from 'lucide-react/dist/esm/icons/lucide-icons-Wifi'",
  'Battery': "import { Battery } from 'lucide-react/dist/esm/icons/lucide-icons-Battery'",
  'Bluetooth': "import { Bluetooth } from 'lucide-react/dist/esm/icons/lucide-icons-Bluetooth'",
  'Monitor': "import { Monitor } from 'lucide-react/dist/esm/icons/lucide-icons-Monitor'",
  'Smartphone': "import { Smartphone } from 'lucide-react/dist/esm/icons/lucide-icons-Smartphone'",
  'Tablet': "import { Tablet } from 'lucide-react/dist/esm/icons/lucide-icons-Tablet'",
  'Sun': "import { Sun } from 'lucide-react/dist/esm/icons/lucide-icons-Sun'",
  'Moon': "import { Moon } from 'lucide-react/dist/esm/icons/lucide-icons-Moon'",
  'Cloud': "import { Cloud } from 'lucide-react/dist/esm/icons/lucide-icons-Cloud'",
  'CloudSun': "import { CloudSun } from 'lucide-react/dist/esm/icons/lucide-icons-CloudSun'",
  'CloudRain': "import { CloudRain } from 'lucide-react/dist/esm/icons/lucide-icons-CloudRain'",
  'Snowflake': "import { Snowflake } from 'lucide-react/dist/esm/icons/lucide-icons-Snowflake'",
  'Umbrella': "import { Umbrella } from 'lucide-react/dist/esm/icons/lucide-icons-Umbrella'",
  'Wind': "import { Wind } from 'lucide-react/dist/esm/icons/lucide-icons-Wind'",
  'Flag': "import { Flag } from 'lucide-react/dist/esm/icons/lucide-icons-Flag'",
  'Bookmark': "import { Bookmark } from 'lucide-react/dist/esm/icons/lucide-icons-Bookmark'",
  'BookmarkCheck': "import { BookmarkCheck } from 'lucide-react/dist/esm/icons/lucide-icons-BookmarkCheck'",
  'Hash': "import { Hash } from 'lucide-react/dist/esm/icons/lucide-icons-Hash'",
  'Command': "import { Command } from 'lucide-react/dist/esm/icons/lucide-icons-Command'",
  'Home': "import { Home } from 'lucide-react/dist/esm/icons/lucide-icons-Home'",
  'LogIn': "import { LogIn } from 'lucide-react/dist/esm/icons/lucide-icons-LogIn'",
  'LogOut': "import { LogOut } from 'lucide-react/dist/esm/icons/lucide-icons-LogOut'",
  'UserPlus': "import { UserPlus } from 'lucide-react/dist/esm/icons/lucide-icons-UserPlus'",
  'LogOut': "import { LogOut } from 'lucide-react/dist/esm/icons/lucide-icons-LogOut'"
};

/**
 * Convert a single file's lucide-react imports from barrel to direct imports
 */
function convertFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already converted (check for dist/esm pattern)
    if (content.includes('lucide-react/dist/esm/icons/')) {
      return { converted: false, reason: 'Already converted' };
    }

    // Find all lucide-react import statements
    const importRegex = /import\s*{\s*([\s\S]+?)\s*}\s*from\s*['"]lucide-react['"]\s*;?/g;

    let hasChanges = false;

    content = content.replace(importRegex, (match, iconsList) => {
      // Extract individual icon names
      const iconNames = iconsList.split(',').map(name => name.trim());

      // Generate direct imports
      const directImports = iconNames
        .filter(name => name && !name.startsWith('//')) // skip comments
        .map(name => {
          const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
          // Handle aliases like "Image as ImageIcon"
          const actualName = name.includes(' as ') ? name.split(' as ')[0] : name;
          const capitalizedNameActual = actualName.charAt(0).toUpperCase() + actualName.slice(1);

          if (iconImportMap[capitalizedNameActual]) {
            return iconImportMap[capitalizedNameActual];
          }

          // If not in map, create the import path
          return `import { ${capitalizedNameActual} } from 'lucide-react/dist/esm/icons/lucide-icons-${capitalizedNameActual}'`;
        })
        .filter(Boolean);

      if (directImports.length === 0) {
        return match; // No valid icons found
      }

      hasChanges = true;
      return directImports.join('\n') + '\n';
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      return { converted: true, icons: content.match(/from 'lucide-react\/dist\/esm\/icons\/lucide-icons-[\w]+' /g)?.length || 0 };
    }

    return { converted: false, reason: 'No barrel imports found' };
  } catch (error) {
    return { converted: false, reason: error.message };
  }
}

/**
 * Process all files
 */
function main() {
  console.log('🔄 Converting lucide-react imports to direct imports...\n');

  let converted = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of filesToProcess) {
    const filePath = path.resolve(__dirname, '..', file);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${file}`);
      skipped++;
      continue;
    }

    const result = convertFile(filePath);

    if (result.converted) {
      console.log(`✅ Converted: ${file} (${result.icons} icons)`);
      converted++;
    } else {
      console.log(`⏭️  Skipped: ${file} - ${result.reason}`);
      skipped++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Converted: ${converted} files`);
  console.log(`   ⏭️  Skipped: ${skipped} files`);
  console.log(`   ❌ Errors: ${errors} files`);
  console.log(`\n✨ Conversion complete!`);
}

// Run the conversion
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} else {
  main();
}
