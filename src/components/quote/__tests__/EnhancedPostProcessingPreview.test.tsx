import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { EnhancedPostProcessingPreview } from '../EnhancedPostProcessingPreview'
import { BeforeAfterPreview } from '../BeforeAfterPreview'
import { ProcessingPreviewTrigger } from '../ProcessingPreviewTrigger'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock the components to isolate testing
jest.mock('../BeforeAfterPreview', () => ({
  BeforeAfterPreview: ({ onClose }: any) => (
    <div data-testid="before-after-preview">
      <button onClick={onClose}>Close Preview</button>
    </div>
  )
}))

jest.mock('../ProcessingPreviewTrigger', () => ({
  ProcessingPreviewTrigger: ({ option, isSelected, onToggle, onPreview }: any) => (
    <div data-testid="processing-trigger" data-option-id={option.id} data-selected={isSelected}>
      <span>{option.nameJa || option.name}</span>
      <button onClick={() => onToggle?.(option.id)}>Toggle</button>
      <button onClick={() => onPreview?.(option)}>Preview</button>
    </div>
  )
}))

describe('EnhancedPostProcessingPreview', () => {
  const defaultProps = {
    selectedProductType: 'stand_up',
    selectedOptions: [],
    onOptionsChange: jest.fn(),
    onPriceUpdate: jest.fn(),
    language: 'ja' as const,
    variant: 'full' as const,
    showAdvancedFilters: true,
    enableBatchSelection: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders without crashing', () => {
    render(<EnhancedPostProcessingPreview {...defaultProps} />)

    expect(screen.getByText('後加工オプション')).toBeInTheDocument()
    expect(screen.getByText('製品仕様をカスタマイズ')).toBeInTheDocument()
  })

  test('displays processing options', async () => {
    render(<EnhancedPostProcessingPreview {...defaultProps} />)

    await waitFor(() => {
      const triggers = screen.getAllByTestId('processing-trigger')
      expect(triggers.length).toBeGreaterThan(0)
    })
  })

  test('filters options by product compatibility', async () => {
    render(<EnhancedPostProcessingPreview {...defaultProps} />)

    await waitFor(() => {
      // Should show options compatible with 'stand_up' product type
      const triggers = screen.getAllByTestId('processing-trigger')
      expect(triggers.length).toBeGreaterThan(0)
    })
  })

  test('handles option selection', async () => {
    render(<EnhancedPostProcessingPreview {...defaultProps} />)

    await waitFor(() => {
      const triggers = screen.getAllByTestId('processing-trigger')
      expect(triggers.length).toBeGreaterThan(0)
    })

    const firstTrigger = screen.getAllByTestId('processing-trigger')[0]
    const toggleButton = firstTrigger.querySelector('button')

    if (toggleButton) {
      fireEvent.click(toggleButton)

      expect(defaultProps.onOptionsChange).toHaveBeenCalledTimes(1)
    }
  })

  test('updates price when options change', async () => {
    render(<EnhancedPostProcessingPreview {...defaultProps} />)

    // Simulate selecting a processing option
    const mockSelectedOptions = ['zipper-yes']

    // Re-render with selected options
    render(
      <EnhancedPostProcessingPreview
        {...defaultProps}
        selectedOptions={mockSelectedOptions}
      />
    )

    // Should call onPriceUpdate with the calculated multiplier
    await waitFor(() => {
      expect(defaultProps.onPriceUpdate).toHaveBeenCalledWith(1.15)
    })
  })

  test('shows advanced filters', () => {
    render(<EnhancedPostProcessingPreview {...defaultProps} />)

    expect(screen.getByText('すべてのカテゴリ')).toBeInTheDocument()
    expect(screen.getByText('人気順')).toBeInTheDocument()
  })

  test('filters by category', async () => {
    render(<EnhancedPostProcessingPreview {...defaultProps} />)

    const categorySelect = screen.getByDisplayValue('すべてのカテゴリ')
    fireEvent.change(categorySelect, { target: { value: 'opening-sealing' } })

    await waitFor(() => {
      const triggers = screen.getAllByTestId('processing-trigger')
      // Should show filtered options for 'closure' category
      expect(triggers.length).toBeGreaterThan(0)
    })
  })

  test('searches options', async () => {
    render(<EnhancedPostProcessingPreview {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText('オプションを検索...')
    fireEvent.change(searchInput, { target: { value: 'ジッパー' } })

    await waitFor(() => {
      const triggers = screen.getAllByTestId('processing-trigger')
      expect(triggers.length).toBeGreaterThan(0)
    })
  })

  test('sorts options by price', async () => {
    render(<EnhancedPostProcessingPreview {...defaultProps} />)

    const sortSelect = screen.getByDisplayValue('人気順')
    fireEvent.change(sortSelect, { target: { value: 'price' } })

    await waitFor(() => {
      const triggers = screen.getAllByTestId('processing-trigger')
      expect(triggers.length).toBeGreaterThan(0)
    })
  })

  test('displays selected options summary', () => {
    render(
      <EnhancedPostProcessingPreview
        {...defaultProps}
        selectedOptions={['zipper-yes', 'glossy']}
      />
    )

    expect(screen.getByText('選択されたオプション')).toBeInTheDocument()
    expect(screen.getByText(/価格乗数: x/)).toBeInTheDocument()
  })

  test('clears all selections', () => {
    const mockOnOptionsChange = jest.fn()
    render(
      <EnhancedPostProcessingPreview
        {...defaultProps}
        selectedOptions={['zipper-yes']}
        onOptionsChange={mockOnOptionsChange}
      />
    )

    const clearButton = screen.getByText('すべてクリア')
    fireEvent.click(clearButton)

    expect(mockOnOptionsChange).toHaveBeenCalledWith([])
  })

  test('toggles view mode between grid and list', () => {
    render(<EnhancedPostProcessingPreview {...defaultProps} />)

    // Should default to grid view
    const gridButton = screen.getByRole('button', { name: /grid/i })
    expect(gridButton).toBeInTheDocument()

    // Switch to list view
    const listButton = screen.getByRole('button', { name: /list/i })
    fireEvent.click(listButton)

    // Grid button should still exist
    expect(gridButton).toBeInTheDocument()
  })

  test('opens preview modal', async () => {
    render(<EnhancedPostProcessingPreview {...defaultProps} />)

    await waitFor(() => {
      const triggers = screen.getAllByTestId('processing-trigger')
      expect(triggers.length).toBeGreaterThan(0)
    })

    const firstTrigger = screen.getAllByTestId('processing-trigger')[0]
    const previewButtons = firstTrigger.querySelectorAll('button')
    const previewButton = previewButtons[1] // Second button should be Preview

    if (previewButton) {
      fireEvent.click(previewButton)

      await waitFor(() => {
        expect(screen.getByTestId('before-after-preview')).toBeInTheDocument()
      })
    }
  })

  test('handles compatibility filter toggle', () => {
    render(<EnhancedPostProcessingPreview {...defaultProps} />)

    const compatibilityCheckbox = screen.getByLabelText('互換性のみ')
    expect(compatibilityCheckbox).toBeChecked()

    fireEvent.click(compatibilityCheckbox)
    expect(compatibilityCheckbox).not.toBeChecked()
  })

  test('shows no options message when no compatible options', () => {
    render(
      <EnhancedPostProcessingPreview
        {...defaultProps}
        selectedProductType='nonexistent_product'
      />
    )

    expect(screen.getByText('オプションが見つかりません')).toBeInTheDocument()
  })

  test('handles search input changes', () => {
    render(<EnhancedPostProcessingPreview {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText('オプションを検索...')
    fireEvent.change(searchInput, { target: { value: 'test search' } })

    expect(searchInput).toHaveValue('test search')
  })
})

describe('ProcessingPreviewTrigger', () => {
  const mockOption = {
    id: 'zipper-yes',
    name: 'Resealable Zipper',
    nameJa: '再利用可能なジッパー',
    description: 'High-quality zipper closure',
    descriptionJa: '高品質ジッパー閉鎖',
    image: '/test-image.png',
    beforeImage: '/test-before.png',
    afterImage: '/test-after.png',
    priceMultiplier: 1.15,
    features: ['Resealable', 'Freshness preservation'],
    featuresJa: ['再封可能', '鮮度保持'],
    compatibleWith: ['stand_up', 'flat_3_side'],
    category: 'opening-sealing' as const,
    processingTime: '+2-3 business days',
    processingTimeJa: '+2-3営業日',
    minimumQuantity: 1000,
    technicalNotes: 'Test technical notes',
    technicalNotesJa: 'テスト技術メモ',
    benefits: ['Extended shelf life'],
    benefitsJa: ['賞味期限延長'],
    applications: ['Coffee beans'],
    applicationsJa: ['コーヒー豆']
  }

  test('renders option details correctly', () => {
    render(
      <ProcessingPreviewTrigger
        option={mockOption}
        language="ja"
      />
    )

    expect(screen.getByText('再利用可能なジッパー')).toBeInTheDocument()
    expect(screen.getByText('高品質ジッパー閉鎖')).toBeInTheDocument()
  })

  test('shows selected state when isSelected is true', () => {
    render(
      <ProcessingPreviewTrigger
        option={mockOption}
        isSelected={true}
        language="ja"
      />
    )

    const trigger = screen.getByTestId('processing-trigger')
    expect(trigger).toHaveAttribute('data-selected', 'true')
  })

  test('calls onToggle when toggle button is clicked', () => {
    const mockOnToggle = jest.fn()
    render(
      <ProcessingPreviewTrigger
        option={mockOption}
        onToggle={mockOnToggle}
        language="ja"
      />
    )

    const toggleButton = screen.getByRole('button', { name: /Toggle/i })
    fireEvent.click(toggleButton)

    expect(mockOnToggle).toHaveBeenCalledWith('zipper-yes')
  })

  test('calls onPreview when preview is triggered', () => {
    const mockOnPreview = jest.fn()
    render(
      <ProcessingPreviewTrigger
        option={mockOption}
        onPreview={mockOnPreview}
        language="ja"
      />
    )

    const previewButton = screen.getByRole('button', { name: /Preview/i })
    fireEvent.click(previewButton)

    expect(mockOnPreview).toHaveBeenCalledWith(mockOption)
  })
})