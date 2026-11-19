#!/usr/bin/env node
/* global process, require, __dirname */
/**
 * Epackage UI 基準 v1 の機械チェック（コマンド）。
 *
 *   node scripts/check-ui-standard.js <ファイル...>            # CORE の規則だけ
 *   node scripts/check-ui-standard.js --pages <ファイル...>    # CORE + PAGE の規則（変換した公開ページ用）
 *
 * 違反があれば、ファイル:行 と規則名を出して、終了コード 1 で終わる。
 * 規則は scripts/ui-standard-rules.js（jest の適合テストと同じもの）。
 */
const path = require('node:path')
const { CORE_RULES, PAGE_RULES, scanFile } = require('./ui-standard-rules.js')

const args = process.argv.slice(2)
const pages = args.includes('--pages')
const files = args.filter(a => !a.startsWith('--'))

if (files.length === 0) {
  console.error('使い方: node scripts/check-ui-standard.js [--pages] <ファイル...>')
  process.exit(2)
}

const rules = pages ? [...CORE_RULES, ...PAGE_RULES] : CORE_RULES
const root = path.join(__dirname, '..')
let total = 0
for (const f of files) {
  const abs = path.resolve(process.cwd(), f)
  for (const h of scanFile(abs, rules, path.relative(root, abs))) {
    total += 1
    console.log(`${h.file}:${h.line}  [${h.rule}]  ${h.text}`)
  }
}
console.log(total === 0 ? `OK: ${files.length} ファイル、違反なし（${pages ? 'CORE + PAGE' : 'CORE'}）` : `NG: ${total} 件の違反`)
process.exit(total === 0 ? 0 : 1)
