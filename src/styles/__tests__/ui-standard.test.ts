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
  'src/components/home/AnnouncementBanner.tsx',
  'src/components/home/BeforeAfterSection.tsx',
  'src/components/home/CTASection.tsx',
  'src/components/home/HeroSection.tsx',
  'src/components/home/HomePageProductCard.tsx',
  'src/components/home/IndustryShowcase.tsx',
  'src/components/home/ManufacturingProcessShowcase.tsx',
  'src/components/home/ProductShowcaseSection.tsx',
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
