import React from 'react'
import { render, screen } from '@testing-library/react'
import { HeroSection } from '../HeroSection'
import { TrustSignalsSection } from '../TrustSignalsSection'
import { BeforeAfterSection } from '../BeforeAfterSection'
import { ContactTrustCards as ContactTrust } from '@/components/contact/ContactTrust'

jest.mock('next/font/google', () => ({
  Shippori_Mincho_B1: () => ({ className: 'mock-serif', variable: '--font-serif' }),
  Noto_Sans_JP: () => ({ className: 'mock-sans', variable: '--font-sans' }),
}))
jest.mock('next/image', () => ({ __esModule: true, default: (p: any) => <img alt={p.alt} src={typeof p.src === 'string' ? p.src : ''} /> }))

jest.mock('framer-motion', () => {
  const R = require('react')
  const motion = new Proxy({}, { get: (_t, tag: string) => ({ children, ...rest }: any) => {
    const clean: any = {}
    for (const k of Object.keys(rest)) if (/^(className|id|role|href|style)$|^aria-|^data-/.test(k)) clean[k] = rest[k]
    return R.createElement(tag, clean, children)
  } })
  return { motion, AnimatePresence: ({ children }: any) => children, useInView: () => true, useReducedMotion: () => true }
})

describe('数字の定数が画面に出る', () => {
  it('HeroSection', () => {
    const { container } = render(<HeroSection />)
    expect(container.textContent).toContain('最短30日')
    expect(container.textContent).toContain('100社以上')
    expect(container.textContent).not.toContain('28日')
  })
  it('TrustSignalsSection', () => {
    const { container } = render(<TrustSignalsSection />)
    expect(container.textContent).toContain('最短30日')
    expect(container.textContent).toContain('100社以上')
  })
  it('BeforeAfterSection', () => {
    const { container } = render(<BeforeAfterSection />)
    expect(container.textContent).toContain('最短30日')
    expect(container.textContent).not.toContain('28日')
  })
  it('ContactTrust', () => {
    const { container } = render(<ContactTrust />)
    expect(container.textContent).toContain('100社以上')
    expect(container.textContent).toContain('2営業日以内')
    expect(container.textContent).not.toContain('24時間')
  })
})
