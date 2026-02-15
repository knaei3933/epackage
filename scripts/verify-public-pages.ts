#!/usr/bin/env tsx

/**
 * Public Pages Verification Script
 *
 * This script verifies that all public pages (About, Privacy, Terms) are:
 * 1. Properly exported
 * 2. Have correct metadata
 * 3. Are included in sitemap
 * 4. Have proper navigation links
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const PAGES = [
  { name: 'About', path: 'src/app/about/page.tsx', url: '/about' },
  { name: 'Privacy', path: 'src/app/privacy/page.tsx', url: '/privacy' },
  { name: 'Terms', path: 'src/app/terms/page.tsx', url: '/terms' },
]

const SITEMAP_PATH = 'src/app/sitemap.ts'
const FOOTER_PATH = 'src/components/layout/Footer.tsx'
const NAVIGATION_PATH = 'src/components/layout/Navigation.tsx'

console.log('🔍 Verifying Public Pages Implementation\n')

let allChecksPassed = true

// Check 1: Page files exist
console.log('✓ Check 1: Page Files Exist')
PAGES.forEach(page => {
  const fullPath = join(process.cwd(), page.path)
  if (existsSync(fullPath)) {
    console.log(`  ✅ ${page.name}: ${page.path}`)
  } else {
    console.log(`  ❌ ${page.name}: NOT FOUND - ${page.path}`)
    allChecksPassed = false
  }
})

// Check 2: Metadata present
console.log('\n✓ Check 2: Metadata Present')
PAGES.forEach(page => {
  const fullPath = join(process.cwd(), page.path)
  if (existsSync(fullPath)) {
    const content = readFileSync(fullPath, 'utf-8')
    const hasMetadata = content.includes('Metadata') && content.includes('title')
    const hasDescription = content.includes('description')

    if (hasMetadata && hasDescription) {
      console.log(`  ✅ ${page.name}: Has metadata`)
    } else {
      console.log(`  ⚠️  ${page.name}: Missing metadata`)
      allChecksPassed = false
    }
  }
})

// Check 3: Sitemap inclusion
console.log('\n✓ Check 3: Sitemap Inclusion')
const sitemapPath = join(process.cwd(), SITEMAP_PATH)
if (existsSync(sitemapPath)) {
  const sitemapContent = readFileSync(sitemapPath, 'utf-8')
  PAGES.forEach(page => {
    const isInSitemap = sitemapContent.includes(`url: '${page.url.replace('/', '')}'`)
    if (isInSitemap) {
      console.log(`  ✅ ${page.name}: In sitemap`)
    } else {
      console.log(`  ❌ ${page.name}: NOT in sitemap`)
      allChecksPassed = false
    }
  })
} else {
  console.log(`  ⚠️  Sitemap not found: ${SITEMAP_PATH}`)
}

// Check 4: Footer links
console.log('\n✓ Check 4: Footer Navigation Links')
const footerPath = join(process.cwd(), FOOTER_PATH)
if (existsSync(footerPath)) {
  const footerContent = readFileSync(footerPath, 'utf-8')
  const privacyLink = footerContent.includes("href='/privacy'")
  const termsLink = footerContent.includes("href='/terms'")

  if (privacyLink) {
    console.log(`  ✅ Privacy: Footer link exists`)
  } else {
    console.log(`  ❌ Privacy: NO Footer link`)
    allChecksPassed = false
  }

  if (termsLink) {
    console.log(`  ✅ Terms: Footer link exists`)
  } else {
    console.log(`  ❌ Terms: NO Footer link`)
    allChecksPassed = false
  }

  // About page link is optional in footer (it's in main navigation)
  const aboutLink = footerContent.includes("href='/about'")
  if (aboutLink) {
    console.log(`  ✅ About: Footer link exists`)
  } else {
    console.log(`  ℹ️  About: Not in footer (check main navigation)`)
  }
}

// Check 5: Navigation links
console.log('\n✓ Check 5: Main Navigation Links')
const navigationPath = join(process.cwd(), NAVIGATION_PATH)
if (existsSync(navigationPath)) {
  const navContent = readFileSync(navigationPath, 'utf-8')
  const aboutLink = navContent.includes("href: '/about/'") || navContent.includes("href:'/about/'")

  if (aboutLink) {
    console.log(`  ✅ About: Navigation link exists`)
  } else {
    console.log(`  ❌ About: NO Navigation link`)
    allChecksPassed = false
  }
}

// Check 6: Japanese content
console.log('\n✓ Check 6: Japanese Content')
PAGES.forEach(page => {
  const fullPath = join(process.cwd(), page.path)
  if (existsSync(fullPath)) {
    const content = readFileSync(fullPath, 'utf-8')
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF]/.test(content)

    if (hasJapanese) {
      console.log(`  ✅ ${page.name}: Contains Japanese text`)
    } else {
      console.log(`  ❌ ${page.name}: NO Japanese text`)
      allChecksPassed = false
    }
  }
})

// Check 7: Responsive design classes
console.log('\n✓ Check 7: Responsive Design')
PAGES.forEach(page => {
  const fullPath = join(process.cwd(), page.path)
  if (existsSync(fullPath)) {
    const content = readFileSync(fullPath, 'utf-8')
    const hasResponsive = content.includes('md:') || content.includes('lg:')

    if (hasResponsive) {
      console.log(`  ✅ ${page.name}: Responsive classes`)
    } else {
      console.log(`  ⚠️  ${page.name}: Limited responsive design`)
    }
  }
})

// Final summary
console.log('\n' + '='.repeat(50))
if (allChecksPassed) {
  console.log('✅ ALL CHECKS PASSED - Public pages are properly implemented!')
} else {
  console.log('⚠️  SOME CHECKS FAILED - Please review the issues above')
}
console.log('='.repeat(50))

// Print access URLs
console.log('\n📱 Access URLs:')
const baseUrl = 'http://localhost:3000'
PAGES.forEach(page => {
  console.log(`  - ${page.name}: ${baseUrl}${page.url}`)
})

process.exit(allChecksPassed ? 0 : 1)
