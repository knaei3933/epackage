import React from 'react'
import { render } from '@testing-library/react'
import { Layout } from '../Layout'

jest.mock('next/font/google', () => ({
  Shippori_Mincho_B1: () => ({ className: 'mock-serif', variable: '--font-serif' }),
  Noto_Sans_JP: () => ({ className: 'mock-sans', variable: '--font-sans' }),
}))

describe('Layout', () => {
  it('<main> を出さない（ルート layout の main と入れ子にしない）', () => {
    const { container } = render(<Layout showHeader={false} showFooter={false}><p>中身</p></Layout>)
    expect(container.querySelector('main')).toBeNull()
    expect(container.querySelector('#main-content')).toBeNull()
    expect(container.textContent).toContain('中身')
  })
})
