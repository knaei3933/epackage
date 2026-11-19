/* global describe, it, expect */
/**
 * Epackage UI 基準 v1（src/styles/DESIGN_STANDARD.md）の適合テスト。
 *
 * 基準を適用ずみの範囲だけを見る。公開ページなど、適用を広げたら GOVERNED_* に足す。
 * 目的: 「効かない書き方」と「禁止の飾り」を、レビューの目ではなく機械で止める。
 */
import * as fs from 'node:fs'
import * as path from 'node:path'

const ROOT = process.cwd()

/** 丸ごと見るフォルダ（__tests__ は除く） */
const GOVERNED_DIRS = ['src/components/ui', 'src/components/chat']

/** 個別に見るファイル */
const GOVERNED_FILES = [
  'src/components/layout/Header.tsx',
  'src/components/layout/HeaderWrapper.tsx',
  'src/components/layout/Footer.tsx',
  'src/components/layout/PageHeader.tsx',
  'src/components/auth/UserMenu.tsx',
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

const FILES = [...GOVERNED_DIRS.flatMap(walk), ...GOVERNED_FILES].sort()

/** コメントの中身を空白にする（行番号は保つ）。コメントアウトされた古い書き方は判定しない。 */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .replace(/^(\s*)\/\/.*$/gm, '$1')
}

function findViolations(pattern: RegExp): string[] {
  const hits: string[] = []
  for (const file of FILES) {
    const lines = stripComments(fs.readFileSync(path.join(ROOT, file), 'utf8')).split('\n')
    lines.forEach((line, i) => {
      for (const m of line.matchAll(new RegExp(pattern.source, 'g'))) {
        hits.push(`${file}:${i + 1}  ${m[0]}`)
      }
    })
  }
  return hits
}

describe('Epackage UI 基準 v1 の適合（適用ずみの範囲）', () => {
  it('見る範囲が空になっていない', () => {
    expect(FILES.length).toBeGreaterThan(30)
  })

  it('値が CSS 変数のトークン色に、透明度（/10 など）を付けていない。付けても CSS が作られず、効果が黙って消える', () => {
    const alphaOnToken =
      /\b(?:bg|text|border|ring|from|to|via|divide|outline|decoration|fill|stroke)-(?:bg|text|border|brand|on-brand|on-success|on-warning|on-error|on-info|success|warning|error|info|brixa|navy)[a-z0-9-]*\/\d{1,3}\b/
    expect(findViolations(alphaOnToken)).toEqual([])
  })

  it('グラデーション・ぼかし・大きな影・拡大の動きを使っていない', () => {
    const banned = /bg-gradient-|backdrop-blur|\bshadow-(?:xl|2xl)\b|\b(?:hover|active|group-hover):scale-/
    expect(findViolations(banned)).toEqual([])
  })

  it('色の 16 進数をクラスに直接書いていない（トークンのクラスを使う）', () => {
    const hexInClass = /\b(?:text|bg|border|ring|from|to|via|fill|stroke)-\[#[0-9a-fA-F]{3,8}\]/
    expect(findViolations(hexInClass)).toEqual([])
  })

  it('廃止の variant（metallic / brixa-gradient）を、定義の外で使っていない', () => {
    const deprecated = /variant=["'](?:metallic|brixa-gradient)["']/
    expect(findViolations(deprecated)).toEqual([])
  })
})
