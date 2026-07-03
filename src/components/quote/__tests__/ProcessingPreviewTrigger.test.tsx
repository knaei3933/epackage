import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ProcessingPreviewTrigger } from '../previews/ProcessingPreviewTrigger'

// framer-motion を mock（アニメーション副作用を回避）
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// BeforeAfterPreview を mock（showFullPreview 時のモーダル表示を軽量化）
jest.mock('../previews/BeforeAfterPreview', () => ({
  BeforeAfterPreview: ({ onClose }: any) => (
    <div data-testid="before-after-preview">
      <button onClick={onClose}>Close Preview</button>
    </div>
  )
}))

describe('ProcessingPreviewTrigger', () => {
  const mockOption = {
    id: 'zipper-yes',
    name: 'Resealable Zipper',
    nameJa: '再利用可能なジッパー',
    description: 'High-quality zipper closure',
    descriptionJa: '高品質ジッパー閉鎖',
    afterImage: '/test-image.png',
    beforeImage: '/test-before.png',
    priceMultiplier: 1.15,
    features: ['Resealable', 'Freshness preservation'],
    featuresJa: ['再封可能', '鮮度保持'],
    compatibleWith: ['stand_up', 'flat_3_side'],
  }

  test('renders option details correctly', () => {
    render(<ProcessingPreviewTrigger option={mockOption} language="ja" />)
    // 実装 detailed variant: nameJa / descriptionJa を表示
    // 参考: ProcessingPreviewTrigger.tsx (nameJa, descriptionJa)
    expect(screen.getByText('再利用可能なジッパー')).toBeInTheDocument()
    expect(screen.getByText('高品質ジッパー閉鎖')).toBeInTheDocument()
  })

  test('shows selected state when isSelected is true', () => {
    render(
      <ProcessingPreviewTrigger option={mockOption} isSelected={true} language="ja" />
    )
    // 実装: isSelected 時に Image Section に「選択済み」Badge を表示
    // onToggle を渡さないため、ボタン内の「選択済み」は表示されず Badge のみ
    expect(screen.getByText('選択済み')).toBeInTheDocument()
  })

  test('calls onToggle when toggle button is clicked', () => {
    const mockOnToggle = jest.fn()
    render(
      <ProcessingPreviewTrigger option={mockOption} onToggle={mockOnToggle} language="ja" />
    )
    // 実装: onToggle ボタンは「選択」(ja) / "Select" (en)
    const toggleButton = screen.getByRole('button', { name: /選択/ })
    fireEvent.click(toggleButton)
    // handleToggle: onToggle(option.id)
    expect(mockOnToggle).toHaveBeenCalledWith('zipper-yes')
  })

  test('calls onPreview when preview is triggered', () => {
    const mockOnPreview = jest.fn()
    render(
      <ProcessingPreviewTrigger option={mockOption} onPreview={mockOnPreview} language="ja" />
    )
    // 実装: handlePreview はカード全体（triggerRef div）の onClick
    // 画像（alt=nameJa）をクリックして親 div の onClick を発火
    const image = screen.getByAltText('再利用可能なジッパー')
    fireEvent.click(image)
    // handlePreview: onPreview(option.id)
    expect(mockOnPreview).toHaveBeenCalledWith('zipper-yes')
  })
})
