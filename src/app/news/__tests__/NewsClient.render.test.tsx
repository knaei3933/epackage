import { render, screen } from '@testing-library/react'
import { NewsClient } from '../NewsClient'

jest.mock('next/font/google', () => ({
  Shippori_Mincho_B1: () => ({ variable: 'font-heading-var', className: '', style: {} }),
  Noto_Sans_JP: () => ({ variable: 'font-body-var', className: '', style: {} }),
}))

describe('NewsClient', () => {
  it('開ける。記事ページが無いので、動かない「続きを読む」ボタンを出さない', () => {
    ;(global as any).fetch = jest.fn()
    render(<NewsClient />)
    expect(screen.queryAllByRole('button', { name: /続きを読む/ })).toHaveLength(0)
    expect(screen.queryByText('続きを読む')).toBeNull()
  })
})
