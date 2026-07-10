/**
 * UltraQA Adversarial Test: Verify refactored components render without crashing
 * and maintain the same prop interfaces as before refactoring.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Test that extracted parts can be imported and render
import { StatsCards } from '@/app/admin/customers/management/parts/StatsCards';
import { SearchAndFilters } from '@/app/admin/customers/management/parts/SearchAndFilters';
import { BulkActionsBar } from '@/app/admin/customers/management/parts/BulkActionsBar';
import { DesktopPagination, MobilePagination } from '@/app/admin/customers/management/parts/Pagination';
import { PersistenceStatusBanner } from '@/components/quote/sections/parts/PersistenceStatusBanner';
import { ActionButtons } from '@/components/quote/sections/parts/ActionButtons';
import { PrintingRecommendation } from '@/components/quote/sections/parts/PrintingRecommendation';

describe('UltraQA: Refactored component rendering', () => {
  test('StatsCards renders with correct values', () => {
    render(<StatsCards totalItems={100} active={80} pending={15} newThisMonth={5} />);
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('PersistenceStatusBanner shows success message', () => {
    const { container } = render(
      <PersistenceStatusBanner
        persistenceStatus={{ status: 'success', message: '保存しました', quotationNumber: 'Q-123' }}
        userId="user-1"
        setPersistenceStatus={() => {}}
      />
    );
    expect(container.textContent).toContain('保存しました');
    expect(container.textContent).toContain('Q-123');
  });

  test('PersistenceStatusBanner shows error message', () => {
    const { container } = render(
      <PersistenceStatusBanner
        persistenceStatus={{ status: 'error', message: 'エラーが発生しました' }}
        userId={null}
        setPersistenceStatus={() => {}}
      />
    );
    expect(container.textContent).toContain('エラーが発生しました');
  });

  test('PersistenceStatusBanner renders nothing for idle', () => {
    const { container } = render(
      <PersistenceStatusBanner
        persistenceStatus={{ status: 'idle', message: '' }}
        userId={null}
        setPersistenceStatus={() => {}}
      />
    );
    expect(container.innerHTML.trim()).toBe('');
  });

  test('PrintingRecommendation shows correct method', () => {
    const { container } = render(
      <PrintingRecommendation
        recommendation={{
          method: 'gravure',
          reason: 'グラビアがおすすめです',
          breakevenQuantity: 5000,
          digitalTotalPrice: 500000,
          gravureTotalPrice: 400000,
        }}
        showPatternComparison={false}
      />
    );
    expect(container.textContent).toContain('グラビア印刷');
    expect(container.textContent).toContain('グラビアがおすすめです');
    expect(container.textContent).toContain('500,000');
    expect(container.textContent).toContain('400,000');
  });

  test('PrintingRecommendation returns null when showPatternComparison', () => {
    const { container } = render(
      <PrintingRecommendation
        recommendation={{
          method: 'digital',
          reason: 'test',
          breakevenQuantity: 100,
          digitalTotalPrice: 1000,
          gravureTotalPrice: 2000,
        }}
        showPatternComparison={true}
      />
    );
    expect(container.innerHTML.trim()).toBe('');
  });

  test('BulkActionsBar renders when showBulkActions is true', () => {
    const { container } = render(
      <BulkActionsBar
        showBulkActions={true}
        selectedCustomers={new Set(['1', '2'])}
        customersLength={10}
        toggleAllSelection={() => {}}
        handleSendEmail={() => {}}
        setShowExportModal={() => {}}
        clearSelection={() => {}}
      />
    );
    expect(container.textContent).toContain('2件選択中');
  });

  test('BulkActionsBar renders nothing when showBulkActions is false', () => {
    const { container } = render(
      <BulkActionsBar
        showBulkActions={false}
        selectedCustomers={new Set()}
        customersLength={10}
        toggleAllSelection={() => {}}
        handleSendEmail={() => {}}
        setShowExportModal={() => {}}
        clearSelection={() => {}}
      />
    );
    expect(container.innerHTML.trim()).toBe('');
  });

  test('ActionButtons renders download button', () => {
    const { container } = render(
      <ActionButtons
        userId="user-1"
        quotationId="quote-1"
        onReset={() => {}}
        handleDownloadPdf={() => {}}
        isGeneratingPdf={false}
        pdfStatus="idle"
        showPatternComparison={false}
        multiQuantityQuotesLength={0}
      />
    );
    expect(container.textContent).toContain('PDFダウンロード');
  });

  test('ActionButtons shows generating state', () => {
    const { container } = render(
      <ActionButtons
        userId="user-1"
        quotationId="quote-1"
        onReset={() => {}}
        handleDownloadPdf={() => {}}
        isGeneratingPdf={true}
        pdfStatus="idle"
        showPatternComparison={false}
        multiQuantityQuotesLength={0}
      />
    );
    expect(container.textContent).toContain('PDF生成中');
  });

  test('ActionButtons shows guest registration prompt for unauthenticated users', () => {
    const { container } = render(
      <ActionButtons
        userId={null}
        quotationId={null}
        onReset={() => {}}
        handleDownloadPdf={() => {}}
        isGeneratingPdf={false}
        pdfStatus="idle"
        showPatternComparison={false}
        multiQuantityQuotesLength={0}
      />
    );
    expect(container.textContent).toContain('会員登録');
  });
});
