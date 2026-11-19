/* global module, require */
/**
 * Epackage UI 基準 v1（src/styles/DESIGN_STANDARD.md）の機械チェックの規則。
 * jest の適合テスト（src/styles/__tests__/ui-standard.test.ts）と、
 * コマンド（scripts/check-ui-standard.js）の両方が、この 1 か所の規則を使う。
 *
 * - CORE_RULES: 基準を適用ずみのすべてのファイル
 * - PAGE_RULES: 公開ページ（ページの頭・カード・ラベル・アイコンまで揃えたファイル）。CORE に上乗せする
 */
const fs = require('node:fs')

const TOKEN_GROUPS = 'bg|text|border|ring|from|to|via|divide|outline|decoration|fill|stroke'

const CORE_RULES = [
  {
    id: 'alpha-on-token',
    message: '値が CSS 変数のトークン色には、透明度（/10 など）を付けられない。CSS が作られず、効果が黙って消える。-muted / -subtle のトークンを使う',
    pattern: new RegExp(
      `\\b(?:${TOKEN_GROUPS})-(?:bg|text|border|brand|on-brand|on-success|on-warning|on-error|on-info|success|warning|error|info|brixa|navy)[a-z0-9-]*\\/\\d{1,3}\\b`
    ),
  },
  {
    id: 'banned-decoration',
    message: 'グラデーション・ぼかし・大きな影・拡大の動きは使わない（基準書 9 章）',
    pattern: /bg-gradient-|backdrop-blur|\bshadow-(?:xl|2xl)\b|\b(?:hover|active|group-hover):scale-/,
  },
  {
    id: 'hex-in-class',
    message: '色の 16 進数をクラスに直接書かない。トークンのクラスを使う',
    pattern: /\b(?:text|bg|border|ring|from|to|via|fill|stroke)-\[#[0-9a-fA-F]{3,8}\]/,
  },
  {
    id: 'deprecated-variant',
    message: '廃止の variant（metallic / brixa-gradient）は使わない',
    pattern: /variant=["'](?:metallic|brixa-gradient)["']/,
  },
]

const HUES = 'blue|indigo|purple|violet|pink|rose|fuchsia|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|red'

const PAGE_RULES = [
  {
    id: 'big-radius',
    message: 'rounded-xl / 2xl / 3xl は使わない。rounded-container（8px）か rounded-md（6px）',
    pattern: /\brounded-(?:xl|2xl|3xl)\b/,
  },
  {
    id: 'gradient-text',
    message: 'グラデーション文字（bg-clip-text / text-transparent）は使わない',
    pattern: /\bbg-clip-text\b|\btext-transparent\b/,
  },
  {
    id: 'glass-panel',
    message: '半透明の白い面（ガラス風）は使わない。不透明な Card にする',
    pattern: /\bbg-white\/(?:\d{1,3}|\[[^\]]+\])/,
  },
  {
    id: 'emoji-icon',
    message: '絵文字をアイコン代わりに使わない。lucide-react のアイコンにする',
    pattern: /[\u{1F300}-\u{1FAFF}]/u,
  },
  {
    id: 'decorative-hue',
    message: 'ブランド以外の色（blue / green / red など）を部品の色に使わない。トークン（text-brand、bg-info-muted、text-error など）にする',
    pattern: new RegExp(`\\b(?:${TOKEN_GROUPS})-(?:${HUES})-\\d{2,3}\\b`),
  },
  {
    id: 'low-contrast-gray-text',
    message: '薄い灰色（gray-100〜400）の文字は 4.5:1 に届かない。text-text-secondary / text-text-muted にする',
    pattern: /\btext-(?:gray|slate|zinc|neutral|stone)-(?:100|200|300|400)\b/,
  },
  {
    id: 'brixa-navy-direct',
    message: 'brixa-* / navy-* を直接使わない。brand 系・text-text-* のトークンにする',
    pattern: new RegExp(`\\b(?:${TOKEN_GROUPS})-(?:brixa|navy)-\\d{2,3}\\b`),
  },
  {
    id: 'legacy-primary-token',
    message: 'primary-*（値は #5EB6AC。primary-dark などは定義もない）は使わない。brand 系のトークンにする',
    // text-text-primary のような別のトークンに誤って一致しないよう、前が「英数字と - 以外」のときだけ見る
    pattern: new RegExp(`(?<![\\w-])(?:${TOKEN_GROUPS})-primary(?:-\\d{2,3}|-dark|-light)?(?![\\w-])`),
  },
  {
    id: 'inline-gradient',
    message: 'インラインのグラデーション（linear-gradient(...) など）は使わない',
    pattern: /(?:linear|radial|conic)-gradient\(/,
  },
  {
    id: 'legacy-decorative-class',
    message: '旧い飾りのクラス（gradient-hero / card-glass / hover-glow など）は使わない。globals.css の飾りは廃止の対象',
    pattern: /\b(?:gradient-hero|gradient-cta|card-glass|card-premium|btn-premium|section-premium|metallic-accent|hover-lift|hover-glow|bg-grid-pattern|bg-dots-pattern|text-shadow-premium|text-shadow-strong|quick-actions-card)\b/,
  },
]

/** コメントの中身を空白にする（行番号は保つ）。コメントアウトされた古い書き方は判定しない。 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .replace(/^(\s*)\/\/.*$/gm, '$1')
}

/** ファイル 1 つを調べ、違反の一覧（{ file, line, rule, text }）を返す。 */
function scanFile(filePath, rules, displayName) {
  const lines = stripComments(fs.readFileSync(filePath, 'utf8')).split('\n')
  const hits = []
  lines.forEach((line, i) => {
    for (const rule of rules) {
      const re = new RegExp(rule.pattern.source, rule.pattern.flags.includes('g') ? rule.pattern.flags : rule.pattern.flags + 'g')
      for (const m of line.matchAll(re)) {
        hits.push({ file: displayName || filePath, line: i + 1, rule: rule.id, text: m[0] })
      }
    }
  })
  return hits
}

module.exports = { CORE_RULES, PAGE_RULES, stripComments, scanFile }
