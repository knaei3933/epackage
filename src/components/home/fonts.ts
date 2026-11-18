import { Shippori_Mincho_B1, Noto_Sans_JP } from 'next/font/google'

export const headingFont = Shippori_Mincho_B1({
  weight: '600',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
})

export const bodyFont = Noto_Sans_JP({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-home-body',
})

export const homeFontClass = `${headingFont.variable} ${bodyFont.variable}`
