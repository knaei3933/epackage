const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
}

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function success(message) {
  log(`✅ ${message}`, 'green')
}

function error(message) {
  log(`❌ ${message}`, 'red')
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue')
}

class BuildOptimizer {
  constructor() {
    this.projectRoot = process.cwd()
    this.buildDir = path.join(this.projectRoot, '.next')
    this.outDir = path.join(this.projectRoot, 'out')
    this.bundleAnalysisFile = path.join(this.projectRoot, 'bundle-analysis.json')
    this.performanceReport = path.join(this.projectRoot, 'performance-report.json')
  }

  async optimizeProductionBuild() {
    log('\n🚀 Starting production build optimization...', 'cyan')

    try {
      // Step 1: Clean previous builds
      await this.cleanBuild()

      // Step 2: Run production build with analysis
      await this.buildWithAnalysis()

      // Step 3: Analyze bundle size
      await this.analyzeBundle()

      // Step 4: Optimize assets
      await this.optimizeAssets()

      // Step 5: Generate performance report
      await this.generatePerformanceReport()

      // Step 6: Create deployment package
      await this.createDeploymentPackage()

      success('Production build optimization completed successfully!')
      return true
    } catch (err) {
      error(`Build optimization failed: ${err.message}`)
      return false
    }
  }

  async cleanBuild() {
    info('🧹 Cleaning previous builds...')

    const dirsToClean = ['.next', 'out', 'dist']

    for (const dir of dirsToClean) {
      const dirPath = path.join(this.projectRoot, dir)
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true })
        success(`Cleaned ${dir}/ directory`)
      }
    }
  }

  async buildWithAnalysis() {
    info('📦 Building for production with bundle analysis...')

    try {
      // Set production environment
      process.env.NODE_ENV = 'production'
      process.env.NEXT_TELEMETRY_DISABLED = '1'

      // Build with analysis
      execSync('npm run build', {
        cwd: this.projectRoot,
        stdio: 'inherit',
        env: { ...process.env, ANALYZE: 'true' }
      })

      success('Production build completed')
    } catch (err) {
      throw new Error(`Build failed: ${err.message}`)
    }
  }

  async analyzeBundle() {
    info('📊 Analyzing bundle size...')

    try {
      // Check if .next directory exists
      if (!fs.existsSync(this.buildDir)) {
        throw new Error('Build directory not found')
      }

      const bundleStats = this.getBundleStats()

      // Save analysis results
      fs.writeFileSync(this.bundleAnalysisFile, JSON.stringify(bundleStats, null, 2))

      // Report findings
      this.reportBundleStats(bundleStats)

      // Validate against budgets
      this.validateBundleBudgets(bundleStats)
    } catch (err) {
      warning(`Bundle analysis failed: ${err.message}`)
    }
  }

  getBundleStats() {
    const stats = {
      totalSize: 0,
      jsFiles: [],
      cssFiles: [],
      assets: [],
      timestamp: new Date().toISOString()
    }

    // Scan .next directory for bundle files
    this.scanDirectory(this.buildDir, stats)

    return stats
  }

  scanDirectory(dir, stats) {
    if (!fs.existsSync(dir)) return

    const items = fs.readdirSync(dir)

    for (const item of items) {
      const itemPath = path.join(dir, item)
      const stat = fs.statSync(itemPath)

      if (stat.isDirectory()) {
        this.scanDirectory(itemPath, stats)
      } else {
        const ext = path.extname(item)
        const size = stat.size
        const relativePath = path.relative(this.projectRoot, itemPath)

        stats.totalSize += size

        if (ext === '.js') {
          stats.jsFiles.push({ path: relativePath, size })
        } else if (ext === '.css') {
          stats.cssFiles.push({ path: relativePath, size })
        } else {
          stats.assets.push({ path: relativePath, size })
        }
      }
    }
  }

  reportBundleStats(stats) {
    log('\n📈 Bundle Size Analysis:', 'cyan')

    // Sort files by size
    stats.jsFiles.sort((a, b) => b.size - a.size)
    stats.cssFiles.sort((a, b) => b.size - a.size)

    // Report JavaScript files
    if (stats.jsFiles.length > 0) {
      log('\nJavaScript Files:', 'yellow')
      stats.jsFiles.slice(0, 5).forEach(file => {
        log(`  ${file.path}: ${this.formatBytes(file.size)}`, 'white')
      })
    }

    // Report CSS files
    if (stats.cssFiles.length > 0) {
      log('\nCSS Files:', 'yellow')
      stats.cssFiles.slice(0, 5).forEach(file => {
        log(`  ${file.path}: ${this.formatBytes(file.size)}`, 'white')
      })
    }

    // Report totals
    const jsTotal = stats.jsFiles.reduce((sum, file) => sum + file.size, 0)
    const cssTotal = stats.cssFiles.reduce((sum, file) => sum + file.size, 0)

    log('\n📊 Totals:', 'magenta')
    log(`  JavaScript: ${this.formatBytes(jsTotal)}`, 'white')
    log(`  CSS: ${this.formatBytes(cssTotal)}`, 'white')
    log(`  Total: ${this.formatBytes(stats.totalSize)}`, 'white')
  }

  validateBundleBudgets(stats) {
    log('\n🎯 Bundle Budget Validation:', 'cyan')

    const budgets = {
      js: 1024 * 1024, // 1MB
      css: 100 * 1024, // 100KB
      total: 2 * 1024 * 1024 // 2MB
    }

    const jsTotal = stats.jsFiles.reduce((sum, file) => sum + file.size, 0)
    const cssTotal = stats.cssFiles.reduce((sum, file) => sum + file.size, 0)

    // Validate JavaScript
    if (jsTotal > budgets.js) {
      warning(`JavaScript bundle (${this.formatBytes(jsTotal)}) exceeds budget (${this.formatBytes(budgets.js)})`)
    } else {
      success(`JavaScript bundle (${this.formatBytes(jsTotal)}) within budget`)
    }

    // Validate CSS
    if (cssTotal > budgets.css) {
      warning(`CSS bundle (${this.formatBytes(cssTotal)}) exceeds budget (${this.formatBytes(budgets.css)})`)
    } else {
      success(`CSS bundle (${this.formatBytes(cssTotal)}) within budget`)
    }

    // Validate total
    if (stats.totalSize > budgets.total) {
      warning(`Total bundle (${this.formatBytes(stats.totalSize)}) exceeds budget (${this.formatBytes(budgets.total)})`)
    } else {
      success(`Total bundle (${this.formatBytes(stats.totalSize)}) within budget`)
    }
  }

  async optimizeAssets() {
    info('⚡ Optimizing assets...')

    try {
      // Generate critical CSS
      await this.generateCriticalCSS()

      // Optimize images
      await this.optimizeImages()

      // Generate service worker
      await this.generateServiceWorker()

      success('Asset optimization completed')
    } catch (err) {
      warning(`Asset optimization failed: ${err.message}`)
    }
  }

  async generateCriticalCSS() {
    info('🎨 Generating critical CSS...')

    try {
      execSync('npm run crit:css', { cwd: this.projectRoot, stdio: 'inherit' })
      success('Critical CSS generated')
    } catch (err) {
      warning('Critical CSS generation failed - continuing without it')
    }
  }

  async optimizeImages() {
    info('🖼️  Optimizing images...')

    try {
      execSync('npm run imagemin', { cwd: this.projectRoot, stdio: 'inherit' })
      success('Images optimized')
    } catch (err) {
      warning('Image optimization failed - continuing without it')
    }
  }

  async generateServiceWorker() {
    info('🔄 Generating service worker...')

    try {
      execSync('npm run sw:generate', { cwd: this.projectRoot, stdio: 'inherit' })
      success('Service worker generated')
    } catch (err) {
      warning('Service worker generation failed - continuing without it')
    }
  }

  async generatePerformanceReport() {
    info('📊 Generating performance report...')

    const bundleStats = fs.existsSync(this.bundleAnalysisFile)
      ? JSON.parse(fs.readFileSync(this.bundleAnalysisFile, 'utf8'))
      : {}

    const report = {
      timestamp: new Date().toISOString(),
      bundle: bundleStats,
      performance: {
        buildTime: this.getBuildTime(),
        bundleSize: bundleStats.totalSize || 0,
        chunkCount: (bundleStats.jsFiles || []).length
      },
      recommendations: this.generateRecommendations(bundleStats)
    }

    fs.writeFileSync(this.performanceReport, JSON.stringify(report, null, 2))

    // Display report
    log('\n📋 Performance Report:', 'cyan')
    log(`  Build Time: ${report.performance.buildTime}ms`, 'white')
    log(`  Bundle Size: ${this.formatBytes(report.performance.bundleSize)}`, 'white')
    log(`  Chunks: ${report.performance.chunkCount}`, 'white')

    if (report.recommendations.length > 0) {
      log('\n💡 Recommendations:', 'yellow')
      report.recommendations.forEach(rec => {
        log(`  • ${rec}`, 'white')
      })
    }
  }

  getBuildTime() {
    try {
      const buildLog = path.join(this.projectRoot, '.next', 'build.log')
      if (fs.existsSync(buildLog)) {
        const content = fs.readFileSync(buildLog, 'utf8')
        const timeMatch = content.match(/Build completed in (\d+)ms/)
        return timeMatch ? parseInt(timeMatch[1]) : 0
      }
    } catch (err) {
      // Ignore
    }
    return 0
  }

  generateRecommendations(bundleStats) {
    const recommendations = []

    if (!bundleStats.jsFiles) return recommendations

    const jsTotal = bundleStats.jsFiles.reduce((sum, file) => sum + file.size, 0)
    const cssTotal = bundleStats.cssFiles?.reduce((sum, file) => sum + file.size, 0) || 0

    if (jsTotal > 1024 * 1024) {
      recommendations.push('Consider code splitting to reduce JavaScript bundle size')
    }

    if (cssTotal > 100 * 1024) {
      recommendations.push('Consider purging unused CSS')
    }

    const largestJsFile = bundleStats.jsFiles[0]
    if (largestJsFile && largestJsFile.size > 500 * 1024) {
      recommendations.push(`Large JavaScript file detected: ${largestJsFile.path}`)
    }

    const chunkCount = bundleStats.jsFiles.length
    if (chunkCount > 20) {
      recommendations.push('Consider reducing the number of chunks for better loading performance')
    }

    return recommendations
  }

  async createDeploymentPackage() {
    info('📦 Creating deployment package...')

    try {
      // Create deployment directory
      const deployDir = path.join(this.projectRoot, 'deploy')
      if (fs.existsSync(deployDir)) {
        fs.rmSync(deployDir, { recursive: true, force: true })
      }
      fs.mkdirSync(deployDir, { recursive: true })

      // Copy essential files
      const filesToCopy = [
        'package.json',
        'package-lock.json',
        'next.config.ts',
        'public',
        '.next'
      ]

      for (const file of filesToCopy) {
        const srcPath = path.join(this.projectRoot, file)
        const destPath = path.join(deployDir, file)

        if (fs.existsSync(srcPath)) {
          fs.cpSync(srcPath, destPath, { recursive: true })
        }
      }

      // Create deployment scripts
      await this.createDeploymentScripts(deployDir)

      // Create environment template
      this.createEnvironmentTemplate(deployDir)

      success('Deployment package created')
    } catch (err) {
      warning(`Deployment package creation failed: ${err.message}`)
    }
  }

  async createDeploymentScripts(deployDir) {
    const scriptsDir = path.join(deployDir, 'scripts')
    fs.mkdirSync(scriptsDir, { recursive: true })

    // Deploy script
    const deployScript = `#!/bin/bash

set -e

echo "🚀 Starting deployment..."

# Install dependencies
npm ci --production

# Build application
npm run build:production

# Start application
npm start

echo "✅ Deployment completed!"
`

    fs.writeFileSync(path.join(scriptsDir, 'deploy.sh'), deployScript)

    // Rollback script
    const rollbackScript = `#!/bin/bash

set -e

echo "🔄 Starting rollback..."

# Stop current process
pkill -f "next start" || true

# Restore previous version if exists
if [ -d "backup" ]; then
  rm -rf .next
  mv backup/.next .next
  rm -rf backup
fi

# Start previous version
npm start

echo "✅ Rollback completed!"
`

    fs.writeFileSync(path.join(scriptsDir, 'rollback.sh'), rollbackScript)

    // Health check script
    const healthCheckScript = `#!/bin/bash

set -e

echo "🏥 Performing health check..."

# Check if application is responding
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)

if [ "$response" = "200" ]; then
  echo "✅ Health check passed"
  exit 0
else
  echo "❌ Health check failed with HTTP $response"
  exit 1
fi
`

    fs.writeFileSync(path.join(scriptsDir, 'health-check.sh'), healthCheckScript)
  }

  createEnvironmentTemplate(deployDir) {
    const envTemplate = `# Environment Variables Template
# Copy this file to .env.local and fill in the actual values

# SendGrid Configuration
SENDGRID_API_KEY=your-sendgrid-api-key-here
ADMIN_EMAIL=admin@yourdomain.com
FROM_EMAIL=noreply@yourdomain.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id
NEXT_PUBLIC_GTM_ID=your-google-tag-manager-id
`

    fs.writeFileSync(path.join(deployDir, '.env.example'), envTemplate)
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// CLI interface
async function main() {
  const command = process.argv[2]

  if (!command || command === 'build') {
    const optimizer = new BuildOptimizer()
    const success = await optimizer.optimizeProductionBuild()
    process.exit(success ? 0 : 1)
  } else if (command === 'analyze') {
    const optimizer = new BuildOptimizer()
    await optimizer.analyzeBundle()
  } else if (command === 'optimize') {
    const optimizer = new BuildOptimizer()
    await optimizer.optimizeAssets()
  } else {
    error(`Unknown command: ${command}`)
    log('Available commands:', 'yellow')
    log('  build     - Run full build optimization', 'white')
    log('  analyze   - Analyze bundle size', 'white')
    log('  optimize  - Optimize assets only', 'white')
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch(err => {
    error(`Script failed: ${err.message}`)
    process.exit(1)
  })
}

module.exports = BuildOptimizer