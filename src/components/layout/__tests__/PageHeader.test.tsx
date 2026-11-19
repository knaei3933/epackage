/* global describe, it, expect, jest */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { PageHeader, FactList } from '../PageHeader'

// next/font/google はビルド時に Next の SWC が処理する。jest では関数として存在しないため、代わりのものを渡す。
jest.mock('next/font/google', () => ({
  Shippori_Mincho_B1: () => ({ variable: 'font-heading-var', className: '', style: {} }),
  Noto_Sans_JP: () => ({ variable: 'font-body-var', className: '', style: {} }),
}))

const FORBIDDEN = ['bg-gradient', 'backdrop-blur', 'shadow-xl', 'shadow-2xl', 'scale-', 'rounded-full']

describe('PageHeader (Epackage UI 基準 v1)', () => {
  it('h1 を 1 つだけ出し、タイトルは font-heading（明朝）にする', () => {
    render(<PageHeader title="会社概要" lead="導入文です。" />)
    const h1 = screen.getAllByRole('heading', { level: 1 })
    expect(h1).toHaveLength(1)
    expect(h1[0]).toHaveTextContent('会社概要')
    expect(h1[0].className).toContain('font-heading')
    expect(h1[0].className).toContain('[word-break:keep-all]')
  })

  it('既定は Mist の単色の面。tone="plain" で白になる', () => {
    const { container, rerender } = render(<PageHeader title="a" />)
    expect((container.firstChild as HTMLElement).className).toContain('bg-bg-secondary')
    rerender(<PageHeader title="a" tone="plain" />)
    expect((container.firstChild as HTMLElement).className).toContain('bg-bg-primary')
  })

  it('グラデーション・ぼかし・大きな影・拡大・丸いラベルのクラスを持たない', () => {
    const { container } = render(
      <PageHeader title="a" lead="b" actions={<a href="/x">c</a>}>
        <FactList items={[{ value: '28日', label: '平均納期' }]} />
      </PageHeader>
    )
    const all = Array.from(container.querySelectorAll('*')).map(e => e.className).join(' ')
    for (const f of FORBIDDEN) expect(all).not.toContain(f)
  })

  it('導入文と操作は、渡したときだけ出る', () => {
    const { container, rerender } = render(<PageHeader title="a" />)
    expect(container.querySelector('p')).toBeNull()
    rerender(<PageHeader title="a" lead="導入" actions={<a href="/x">続ける</a>} />)
    expect(screen.getByText('導入')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '続ける' })).toBeInTheDocument()
  })
})

describe('FactList', () => {
  it('dt（項目名）→ dd（値）の順で出す（読み上げの順序）', () => {
    const { container } = render(<FactList items={[{ value: '100社以上', label: '実績' }]} />)
    const dt = container.querySelector('dt') as HTMLElement
    const dd = container.querySelector('dd') as HTMLElement
    expect(dt).toHaveTextContent('実績')
    expect(dd).toHaveTextContent('100社以上')
    expect(dt.compareDocumentPosition(dd) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
