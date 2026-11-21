import { render, screen } from '@testing-library/react'
import { PharmaceuticalContent } from '../PharmaceuticalContent'
import { ElectronicsContent } from '../ElectronicsContent'
import { CosmeticsContent } from '../CosmeticsContent'
import { FoodManufacturingContent } from '../FoodManufacturingContent'
import { ROISection } from '../ROISection'
import { ContactExpertSection } from '../ContactExpertSection'

const hrefs = () => screen.getAllByRole('link').map((a) => a.getAttribute('href'))

describe('業界ページの CTA ボタン（押せる）', () => {
  it.each([
    ['薬品', PharmaceuticalContent, '/contact'],
    ['電子', ElectronicsContent, '/contact'],
    ['化粧品', CosmeticsContent, '/contact'],
    ['食品', FoodManufacturingContent, '/quote-simulator'],
  ])('%s: 開けて、末尾のボタンがリンクになっている', (_n, Comp: any, expected: string) => {
    render(<Comp />)
    expect(hrefs()).toContain(expected)
    // 動かない <button> の CTA が残っていない
    expect(screen.queryByRole('button', { name: /ダウンロード|専門家相談を予約|ROI分析レポート/ })).toBeNull()
  })

  it('薬品: 規格の資料は /guide、専門家相談は /contact', () => {
    render(<PharmaceuticalContent />)
    expect(screen.getByRole('link', { name: /規格・仕様ガイド/ }).getAttribute('href')).toBe('/guide')
    expect(screen.getByRole('link', { name: /専門家へ相談/ }).getAttribute('href')).toBe('/contact')
  })

  it('ROISection: 2つのボタンがリンク', () => {
    render(<ROISection industry="cosmetics" />)
    expect(screen.getByRole('link', { name: /専門家へ相談/ }).getAttribute('href')).toBe('/contact')
    expect(screen.getByRole('link', { name: /見積もり/ }).getAttribute('href')).toBe('/quote-simulator')
  })

  it('ContactExpertSection: 送信フォームを置かず、/contact へ案内する', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {})
    render(<ContactExpertSection industry="pharmaceutical" />)
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(screen.getByRole('link', { name: /お問い合わせページへ/ }).getAttribute('href')).toBe('/contact')
    expect(log).not.toHaveBeenCalled()
  })
})
