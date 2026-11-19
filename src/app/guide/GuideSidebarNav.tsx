'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Palette, Ruler, Image, FileText, Leaf } from 'lucide-react'

const guideSections = [
  {
    title: 'カラー',
    description: 'パッケージ印刷の色指定とカラーマッチング',
    href: '/guide/color',
    icon: Palette,
  },
  {
    title: 'サイズ',
    description: 'パッケージサイズと寸法の仕様',
    href: '/guide/size',
    icon: Ruler,
  },
  {
    title: '画像',
    description: '画像データの仕様と解像度',
    href: '/guide/image',
    icon: Image,
  },
  {
    title: '白版',
    description: '白版（しろはん）の作成と用途',
    href: '/guide/shirohan',
    icon: FileText,
  },
  {
    title: '環境表示',
    description: '環境ラベルとサステナビリティ表示',
    href: '/guide/environmentaldisplay',
    icon: Leaf,
  },
]

/** ガイドの左サイドバー。いま開いているページだけ淡いブランド色にする。 */
export function GuideSidebarNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="デザインガイド" className="space-y-2">
      {guideSections.map((section) => {
        const IconComponent = section.icon
        const isActive = pathname === section.href
        return (
          <Link
            key={section.href}
            href={section.href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-start gap-3 rounded-md p-3 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              isActive
                ? 'bg-brand-muted text-on-brand-muted'
                : 'text-text-primary hover:bg-bg-secondary'
            }`}
          >
            <IconComponent
              className={`mt-0.5 h-5 w-5 flex-shrink-0 ${isActive ? 'text-on-brand-muted' : 'text-brand'}`}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium">{section.title}</h3>
              <p className={`mt-1 text-xs ${isActive ? 'text-on-brand-muted' : 'text-text-secondary'}`}>
                {section.description}
              </p>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
