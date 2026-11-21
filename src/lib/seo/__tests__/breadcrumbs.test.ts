import { generateBreadcrumbs } from '../breadcrumbs'

describe('generateBreadcrumbs', () => {
  it.each([
    ['/csr', '環境・社会への取り組み'],
    ['/compare', '製品比較'],
    ['/cart', 'カート'],
    ['/legal', '特定商取引法に基づく表示'],
    ['/guide/size', 'サイズガイド'],
    ['/news', 'お知らせ'],
    ['/blog', 'ブログ'],
  ])('%s は日本語になる', (path, label) => {
    const items = generateBreadcrumbs(path)
    expect(items[items.length - 1].name).toBe(label)
  })
})
