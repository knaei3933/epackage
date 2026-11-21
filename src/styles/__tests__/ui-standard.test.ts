/* global describe, it, expect */
/**
 * Epackage UI 基準 v1（src/styles/DESIGN_STANDARD.md）の適合テスト。
 *
 * 基準を適用ずみの範囲だけを見る。適用を広げたら、下の GOVERNED_* に足す。
 * 目的: 「効かない書き方」と「禁止の飾り」を、レビューの目ではなく機械で止める。
 * 規則の本体は scripts/ui-standard-rules.js（コマンド scripts/check-ui-standard.js と共通）。
 */
import * as fs from 'node:fs'
import * as path from 'node:path'

type Rule = { id: string; message: string; pattern: RegExp }
// 規則は scripts/ui-standard-rules.js（コマンド scripts/check-ui-standard.js と共通）。
// このリポジトリの ESLint は src/ の .js を扱えないため、scripts/ に置いている。
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { CORE_RULES, PAGE_RULES, scanFile } = require('../../../scripts/ui-standard-rules.js')

const ROOT = process.cwd()

/** 丸ごと見るフォルダ（__tests__ は除く）。CORE の規則を当てる */
const GOVERNED_DIRS = ['src/components/ui', 'src/components/chat']

/** 個別に見るファイル。CORE の規則を当てる */
const GOVERNED_FILES = [
  'src/components/layout/Header.tsx',
  'src/components/layout/HeaderWrapper.tsx',
  'src/components/layout/Footer.tsx',
  'src/components/layout/PageHeader.tsx',
  'src/components/auth/UserMenu.tsx',
]

/**
 * 公開ページとして仕上げたファイル。CORE + PAGE の規則を当てる。
 * 公開ページを変換したら、ここに足す（変換の担当者が最終報告に一覧を書く）。
 */
const GOVERNED_PAGE_FILES: string[] = [
  // src/app（ページ）
  'src/app/about/page.tsx',
  'src/app/auth/error/page.tsx',
  'src/app/auth/forgot-password/page.tsx',
  'src/app/auth/pending/PendingClient.tsx',
  'src/app/auth/register/page.tsx',
  'src/app/auth/reset-password/page.tsx',
  'src/app/auth/signin/form-post/page.tsx',
  'src/app/auth/signin/page.tsx',
  'src/app/auth/signout/page.tsx',
  'src/app/auth/suspended/page.tsx',
  'src/app/blog/[slug]/page.tsx',
  'src/app/blog/category/[category]/page.tsx',
  'src/app/blog/page.tsx',
  'src/app/blog/tag/[tag]/page.tsx',
  'src/app/cart/CartPageClient.tsx',
  'src/app/catalog/CatalogClient.tsx',
  'src/app/catalog/[slug]/ProductDetailClient.tsx',
  'src/app/catalog/[slug]/loading.tsx',
  'src/app/compare/ComparisonClient.tsx',
  'src/app/compare/shared/page.tsx',
  'src/app/contact/page.tsx',
  'src/app/contact/thank-you/page.tsx',
  'src/app/csr/page.tsx',
  'src/app/data-templates/page.tsx',
  'src/app/designer-order/[token]/DesignerOrderTokenClient.tsx',
  'src/app/designer-order/[token]/page.tsx',
  'src/app/designer-order/invalid/page.tsx',
  'src/app/designer/DesignerDashboardClient.tsx',
  'src/app/designer/DesignerOrderDetailClient.tsx',
  'src/app/designer/layout.tsx',
  'src/app/designer/login/page.tsx',
  'src/app/error.tsx',
  'src/app/flow/page.tsx',
  'src/app/global-error.tsx',
  'src/app/guide/GuideSidebarNav.tsx',
  'src/app/guide/color/page.tsx',
  'src/app/guide/environmentaldisplay/page.tsx',
  'src/app/guide/image/page.tsx',
  'src/app/guide/layout.tsx',
  'src/app/guide/page.tsx',
  'src/app/guide/shirohan/page.tsx',
  'src/app/guide/size/page.tsx',
  'src/app/industry/[slug]/loading.tsx',
  'src/app/inquiry/detailed/page.tsx',
  'src/app/legal/page.tsx',
  'src/app/news/NewsClient.tsx',
  'src/app/not-found.tsx',
  'src/app/premium-content/page.tsx',
  'src/app/print/page.tsx',
  'src/app/privacy/page.tsx',
  'src/app/quote-simulator/page.tsx',
  'src/app/samples/MemberSampleConfirmation.tsx',
  'src/app/samples/SampleRequestFormWrapper.tsx',
  'src/app/samples/page.tsx',
  'src/app/samples/thank-you/page.tsx',
  'src/app/terms/page.tsx',
  'src/app/upload/[token]/TokenUploadClient.tsx',
  'src/app/upload/[token]/page.tsx',
  'src/app/upload/invalid/page.tsx',
  // src/components/archives
  'src/components/archives/ArchiveDetailModal.tsx',
  'src/components/archives/ArchiveFilters.tsx',
  'src/components/archives/ArchiveGrid.tsx',
  'src/components/archives/ArchivePage.tsx',
  'src/components/archives/ArchivePageClient.tsx',
  'src/components/archives/Pagination.tsx',
  'src/components/archives/SearchBar.tsx',
  // src/components/auth
  'src/components/auth/AuthModal.tsx',
  'src/components/auth/AuthShell.tsx',
  'src/components/auth/ForgotPasswordForm.tsx',
  'src/components/auth/InactivityWarningModal.tsx',
  'src/components/auth/LoginForm.server.tsx',
  'src/components/auth/LoginForm.tsx',
  'src/components/auth/ProtectedRoute.tsx',
  'src/components/auth/RegistrationForm.tsx',
  'src/components/auth/ResetPasswordForm.tsx',
  // src/components/blog
  'src/components/blog/ArticleCTA.tsx',
  'src/components/blog/BlogCard.tsx',
  'src/components/blog/RelatedPosts.tsx',
  'src/components/blog/ShareButtons.tsx',
  'src/components/blog/TableOfContents.tsx',
  // src/components/cart
  'src/components/cart/CartItem.tsx',
  'src/components/cart/CartSidebar.tsx',
  // src/components/catalog
  'src/components/catalog/AdvancedFilters.tsx',
  'src/components/catalog/CatalogFilters.tsx',
  'src/components/catalog/CatalogGrid.tsx',
  'src/components/catalog/DownloadButton.tsx',
  'src/components/catalog/EnhancedProductCard.tsx',
  'src/components/catalog/ProductCard.tsx',
  'src/components/catalog/ProductCardSkeleton.tsx',
  'src/components/catalog/ProductCertifications.tsx',
  'src/components/catalog/ProductDetailModal.tsx',
  'src/components/catalog/ProductDownloads.tsx',
  'src/components/catalog/ProductFAQ.tsx',
  'src/components/catalog/ProductListItem.tsx',
  'src/components/catalog/ProductRelatedCases.tsx',
  // src/components/contact
  'src/components/contact/ContactCTA.tsx',
  'src/components/contact/ContactForm.tsx',
  'src/components/contact/ContactTrust.tsx',
  'src/components/contact/CustomerInfoSection.tsx',
  'src/components/contact/DeliveryDestinationSection.tsx',
  'src/components/contact/MessageSection.tsx',
  'src/components/contact/PrivacySection.tsx',
  'src/components/contact/SampleItemsSection.tsx',
  'src/components/contact/SampleRequestForm.tsx',
  'src/components/contact/SampleRequestModal.tsx',
  'src/components/contact/SampleRequestSuccess.tsx',
  // src/components/designer
  'src/components/designer/DesignerLoginForm.tsx',
  'src/components/designer/PostProcessingPositionInput.tsx',
  // src/components/home
  'src/components/home/AnnouncementBanner.tsx',
  'src/components/home/BeforeAfterSection.tsx',
  'src/components/home/CTASection.tsx',
  'src/components/home/HeroSection.tsx',
  'src/components/home/HomePageProductCard.tsx',
  'src/components/home/IndustryShowcase.tsx',
  'src/components/home/ManufacturingProcessShowcase.tsx',
  'src/components/home/ProductShowcaseSection.tsx',
  // src/components/industry
  'src/components/industry/CaseStudiesSection.tsx',
  'src/components/industry/ContactExpertSection.tsx',
  'src/components/industry/CosmeticsContent.tsx',
  'src/components/industry/ElectronicsContent.tsx',
  'src/components/industry/FoodManufacturingContent.tsx',
  'src/components/industry/HeaderSection.tsx',
  'src/components/industry/IndustryCalculator.tsx',
  'src/components/industry/IndustryNavigation.tsx',
  'src/components/industry/IndustrySolutionTemplate.tsx',
  'src/components/industry/PharmaceuticalContent.tsx',
  'src/components/industry/ROISection.tsx',
  'src/components/industry/TechnicalSpecsSection.tsx',
  // src/components/inquiry
  'src/components/inquiry/DetailedInquiryForm.tsx',
  'src/components/inquiry/steps/AdditionalInfoStep.tsx',
  'src/components/inquiry/steps/BasicInfoStep.tsx',
  'src/components/inquiry/steps/CompanyInfoStep.tsx',
  'src/components/inquiry/steps/ProjectRequirementsStep.tsx',
  'src/components/inquiry/steps/TechnicalRequirementsStep.tsx',
  // src/components/lp
  'src/components/lp/StrongCTA.tsx',
  'src/components/lp/TrustSignals.tsx',
  // src/components/premium-content
  'src/components/premium-content/PremiumContentSection.tsx',
  // src/components/quote
  'src/components/quote/sections/PageHeaderSection.tsx',
  'src/components/quote/sections/QuickActionsSection.tsx',
  'src/components/quote/sections/QuoteSimulatorHeader.tsx',
  'src/components/quote/shared/DataTemplateGuide.tsx',
  'src/components/quote/shared/ResponsiveStepIndicators.tsx',
  'src/components/quote/wizards/ImprovedQuotingWizard.tsx',
  // src/components/seo
  'src/components/seo/BreadcrumbNav.tsx',
  // src/components/service
  'src/components/service/ServicePage.tsx',
  // src/components/upload
  'src/components/upload/BilingualText.tsx',
  'src/components/upload/CommentSection.tsx',
  'src/components/upload/SKUCardGrid.tsx',
  'src/components/upload/SKUUploadCard.tsx',
  'src/components/upload/TokenUploadForm.tsx',
]

function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`
    if (entry.isDirectory()) {
      if (entry.name !== '__tests__') out.push(...walk(rel))
    } else if (entry.name.endsWith('.tsx')) {
      out.push(rel)
    }
  }
  return out
}

const CORE_FILES = [...GOVERNED_DIRS.flatMap(walk), ...GOVERNED_FILES, ...GOVERNED_PAGE_FILES].sort()

function violations(files: string[], rule: Rule): string[] {
  return files.flatMap(f =>
    scanFile(path.join(ROOT, f), [rule], f).map(h => `${h.file}:${h.line}  ${h.text}`)
  )
}

describe('Epackage UI 基準 v1 の適合（適用ずみの範囲）', () => {
  it('見る範囲が空になっていない', () => {
    expect(CORE_FILES.length).toBeGreaterThan(30)
    expect(GOVERNED_PAGE_FILES.length).toBeGreaterThan(0)
  })

  it('見るファイルが、すべて実在する', () => {
    const missing = [...GOVERNED_FILES, ...GOVERNED_PAGE_FILES].filter(f => !fs.existsSync(path.join(ROOT, f)))
    expect(missing).toEqual([])
  })

  describe('全体の規則（CORE）', () => {
    it.each((CORE_RULES as Rule[]).map(r => [r.id, r] as const))('%s', (_id, rule) => {
      expect(violations(CORE_FILES, rule)).toEqual([])
    })
  })

  describe('公開ページの規則（PAGE）', () => {
    it.each((PAGE_RULES as Rule[]).map(r => [r.id, r] as const))('%s', (_id, rule) => {
      expect(violations(GOVERNED_PAGE_FILES, rule)).toEqual([])
    })
  })
})

// 規則そのものが、悪い書き方を止め、良い書き方を止めないこと（規則が黙って効かなくなるのを防ぐ）
describe('規則の自己確認', () => {
  const find = (id: string) => (CORE_RULES as Rule[]).find(r => r.id === id) as Rule

  it('same-color-text: 面と文字が同じトークンなら止める（順序は問わない）', () => {
    const { pattern } = find('same-color-text')
    expect(pattern.test('<Badge className="bg-brand text-brand">')).toBe(true)
    expect(pattern.test('<div className="py-2 text-error bg-error">')).toBe(true)
  })

  it('same-color-text: 対になる文字色や、-muted の面は止めない', () => {
    const { pattern } = find('same-color-text')
    expect(pattern.test('<Badge className="bg-brand text-on-brand">')).toBe(false)
    expect(pattern.test('<Badge className="bg-brand-muted text-on-brand-muted">')).toBe(false)
    expect(pattern.test('<div className="hover:bg-brand text-brand">')).toBe(false)
    expect(pattern.test('<div className={cn("bg-brand", active && "text-brand")}>')).toBe(false)
  })
})

// 見出しの折り返しは、見出しごとのクラスではなく、globals.css の基本の指定で決める（付け忘れを防ぐ）
describe('全体の指定（globals.css）', () => {
  const css = fs.readFileSync(path.join(ROOT, 'src/app/globals.css'), 'utf8')

  it('見出し（h1〜h6）は、語の途中で切らない指定を持つ', () => {
    const rule = css.match(/h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6\s*\{([^}]*)\}/)
    expect(rule).not.toBeNull()
    const body = (rule as RegExpMatchArray)[1]
    expect(body).toMatch(/word-break:\s*keep-all/)
    expect(body).toMatch(/overflow-wrap:\s*anywhere/)
    expect(body).toMatch(/text-wrap:\s*balance/)
  })

  it('auto-phrase が使えるブラウザでは、文節の切れ目で切る', () => {
    expect(css).toMatch(/@supports\s*\(word-break:\s*auto-phrase\)\s*\{[^}]*h1,[^}]*word-break:\s*auto-phrase/)
  })
})
