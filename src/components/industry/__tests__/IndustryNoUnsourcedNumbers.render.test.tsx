import { render, fireEvent } from '@testing-library/react'

jest.mock('next/font/google', () => ({
  Shippori_Mincho_B1: () => ({ className: 'f1', variable: 'f1' }),
  Noto_Sans_JP: () => ({ className: 'f2', variable: 'f2' }),
}))

import { PharmaceuticalContent } from '../PharmaceuticalContent'
import { ElectronicsContent } from '../ElectronicsContent'
import { CosmeticsContent } from '../CosmeticsContent'
import { FoodManufacturingContent } from '../FoodManufacturingContent'
import { ROISection } from '../ROISection'
import { CaseStudiesSection } from '../CaseStudiesSection'
import { IndustrySolutionTemplate } from '../IndustrySolutionTemplate'

// 出典のない、業界独自の数字・評価（本文に出てはいけない）
const FORBIDDEN = [
  /4\.[89]\s*\/\s*5/, /\d+(\.\d+)?\s*[%％]/, /満足度/, /ROI/, /\d+\s*時間/, /\d+\s*社/, /\d+\+/, /\d+\s*倍/, /導入実績/,
]

const industries = ['food-manufacturing', 'cosmetics', 'pharmaceutical', 'electronics'] as const
const contents: Record<string, React.ComponentType> = {
  'food-manufacturing': FoodManufacturingContent,
  cosmetics: CosmeticsContent,
  pharmaceutical: PharmaceuticalContent,
  electronics: ElectronicsContent,
}

function expectClean(text: string) {
  FORBIDDEN.forEach((re) => expect(text).not.toMatch(re))
}

describe('業界ページ: 出典のない数字を出さない', () => {
  it.each(industries)('%s: 本体の部品が開けて、数字が出ない', (ind) => {
    const C = contents[ind]
    const { container } = render(<C />)
    expect(container.textContent!.length).toBeGreaterThan(200)
    expectClean(container.textContent || '')
  })

  it.each(industries)('%s: 事例・費用の区画にも数字が出ない', (ind) => {
    for (const el of [
      <ROISection industry={ind} />,
      <CaseStudiesSection industry={ind} />,
    ]) {
      const { container, unmount } = render(el)
      expect(container.textContent!.length).toBeGreaterThan(20)
      expectClean(container.textContent || '')
      unmount()
    }
  })

  it.each(industries)('%s: ページの枠（ヘッダー・横の欄）にも数字が出ない', (ind) => {
    const C = contents[ind]
    const { container } = render(
      <IndustrySolutionTemplate industry={ind} title="タイトル" subtitle="サブ" content={<C />} />
    )
    expectClean(container.textContent || '')
  })

  it.each(industries)('%s: 架空の「お客様の声」タブと推薦文が出ず、タブが切り替わる', (ind) => {
    const C = contents[ind]
    const { container, getByRole, queryByText } = render(
      <IndustrySolutionTemplate industry={ind} title="タイトル" subtitle="サブ" content={<C />} />
    )
    const text = container.textContent || ''
    expect(text).not.toContain('お客様の声')
    expect(text).not.toContain('山田')
    // 注: 「A食品」などの匿名事例は FoodManufacturingContent / CaseStudiesSection に残る（実在か未確認。別途確認）。
    for (const label of ['ソリューション', '技術仕様', '導入事例', '専門家へ相談']) {
      fireEvent.click(getByRole('button', { name: label }))
      expect(container.textContent!.length).toBeGreaterThan(100)
    }
    expect(queryByText('お客様の声')).toBeNull()
  })
})
