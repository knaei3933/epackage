/**
 * BankInfoCard Component Tests
 *
 * Tests for bank account information display component
 */

import { render, screen, waitFor } from '@testing-library/react';
import { BankInfoCard } from '../BankInfoCard';

// Mock fetch
global.fetch = jest.fn();

describe('BankInfoCard', () => {
  const mockQuotationId = 'test-quotation-id';
  const mockBankInfo = {
    bankName: '三菱UFJ銀行',
    branchName: '東京支店',
    accountType: '普通',
    accountNumber: '1234567',
    accountHolder: 'イーパックラボ株式会社',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { container } = render(<BankInfoCard quotationId={mockQuotationId} />);

    // Check for loading card with pulse animation
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument(); // Loading animation
  });

  it('should display bank information after successful fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        invoice: {
          bankInfo: mockBankInfo,
        },
      }),
    });

    render(<BankInfoCard quotationId={mockQuotationId} />);

    await waitFor(() => {
      expect(screen.getByText('三菱UFJ銀行')).toBeInTheDocument();
      expect(screen.getByText('1234567')).toBeInTheDocument();
      expect(screen.getByText('イーパックラボ株式会社')).toBeInTheDocument();
    });
  });

  it('should not display card on error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });

    const { container } = render(<BankInfoCard quotationId={mockQuotationId} />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('should not display card when bank info is not available', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        invoice: {}, // No bankInfo
      }),
    });

    const { container } = render(<BankInfoCard quotationId={mockQuotationId} />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('should call the correct API endpoint', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        invoice: {
          bankInfo: mockBankInfo,
        },
      }),
    });

    render(<BankInfoCard quotationId={mockQuotationId} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/quotations/${mockQuotationId}/invoice`
      );
    });
  });

  it('should display all bank fields when available', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        invoice: {
          bankInfo: mockBankInfo,
        },
      }),
    });

    render(<BankInfoCard quotationId={mockQuotationId} />);

    await waitFor(() => {
      expect(screen.getByText('銀行名')).toBeInTheDocument();
      expect(screen.getByText('三菱UFJ銀行')).toBeInTheDocument();

      expect(screen.getByText('支店名')).toBeInTheDocument();
      expect(screen.getByText('東京支店')).toBeInTheDocument();

      expect(screen.getByText('口座種別')).toBeInTheDocument();
      expect(screen.getByText('普通')).toBeInTheDocument();

      expect(screen.getByText('口座番号')).toBeInTheDocument();
      expect(screen.getByText('1234567')).toBeInTheDocument();

      expect(screen.getByText('口座名義')).toBeInTheDocument();
      expect(screen.getByText('イーパックラボ株式会社')).toBeInTheDocument();
    });
  });
});
