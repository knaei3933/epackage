import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { AdminInquiry } from '@/types/dashboard';
import { fetchAdminInquiries } from '@/lib/api/admin/inquiries';
import AdminInquiriesClient from '../AdminInquiriesClient';

jest.mock('@/lib/api/admin/inquiries', () => ({
  fetchAdminInquiries: jest.fn(),
}));

const fetchAdminInquiriesMock = jest.mocked(fetchAdminInquiries);

function createInquiry(
  overrides: Partial<AdminInquiry> & Pick<AdminInquiry, 'id' | 'type'>
): AdminInquiry {
  return {
    inquiryNumber: `INQ-${overrides.id.toUpperCase()}`,
    status: 'open',
    subject: 'Test inquiry',
    message: 'Test message',
    customerName: 'Yamada Taro',
    customerNameKana: null,
    companyName: null,
    email: null,
    phone: null,
    urgency: null,
    preferredContact: null,
    userId: null,
    orderId: null,
    orderNumber: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    respondedAt: null,
    ...overrides,
  };
}

describe('AdminInquiriesClient sample label column', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    global.fetch = jest.fn();
  });

  it('renders ラベル immediately after 受付番号 and removes the former late column', async () => {
    fetchAdminInquiriesMock.mockResolvedValue([
      createInquiry({
        id: 'normal-1',
        type: 'general',
      }),
    ]);

    render(<AdminInquiriesClient />);

    await screen.findByText('INQ-NORMAL-1');
    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent);
    expect(headers).toEqual([
      '受付番号',
      'ラベル',
      '顧客',
      '件名',
      '注文',
      '種別',
      'ステータス',
      '受付日',
      '詳細',
    ]);
    expect(headers.filter((header) => header === 'ラベル')).toHaveLength(1);
  });

  it('shows - for non-sample inquiries and 未連携 for samples without a label', async () => {
    fetchAdminInquiriesMock.mockResolvedValue([
      createInquiry({ id: 'normal-1', type: 'general' }),
      createInquiry({
        id: 'sample-1',
        type: 'sample',
        sampleLabel: null,
      }),
    ]);

    render(<AdminInquiriesClient />);

    const normalRow = await screen.findByRole('row', { name: /INQ-NORMAL-1/ });
    const normalCells = within(normalRow).getAllByRole('cell');
    expect(normalCells[1]).toHaveTextContent('-');
    expect(normalCells[2]).toHaveTextContent('Yamada Taro');

    const sampleRow = screen.getByRole('row', { name: /INQ-SAMPLE-1/ });
    const sampleCells = within(sampleRow).getAllByRole('cell');
    expect(sampleCells[1]).toHaveTextContent('未連携');
    expect(within(sampleRow).queryByRole('button', { name: '再印刷' })).not.toBeInTheDocument();
  });

  it('keeps the status badge and reprint control in the early label column', async () => {
    fetchAdminInquiriesMock.mockResolvedValue([
      createInquiry({
        id: 'sample-1',
        type: 'sample',
        sampleLabel: {
          id: 'sample-request-1',
          requestNumber: 'SR-1',
          printStatus: 'printed',
          destinationCount: 1,
          printSummary: '1 destination',
          destinations: [],
        },
      }),
    ]);

    render(<AdminInquiriesClient />);

    const row = await screen.findByRole('row', { name: /INQ-SAMPLE-1/ });
    const labelCell = within(row).getAllByRole('cell')[1];
    expect(labelCell).toHaveTextContent('印刷済');
    expect(
      within(labelCell!).getByRole('button', { name: '再印刷' })
    ).toHaveAccessibleDescription('宛先ラベルを再印字キューに追加します');
  });

  it('invokes the existing reprint handler and disables the control while reprinting', async () => {
    fetchAdminInquiriesMock.mockResolvedValue([
      createInquiry({
        id: 'sample-1',
        type: 'sample',
        sampleLabel: {
          id: 'sample-request-1',
          requestNumber: 'SR-1',
          printStatus: 'printed',
          destinationCount: 1,
          printSummary: '1 destination',
          destinations: [],
        },
      }),
    ]);

    let resolveReprint: (value: unknown) => void = () => {};
    global.fetch = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveReprint = resolve;
        })
    );

    render(<AdminInquiriesClient />);
    const reprintButton = await screen.findByRole('button', { name: '再印刷' });
    fireEvent.click(reprintButton);

    expect(global.fetch).toHaveBeenCalledWith('/api/admin/samples/sample-request-1/reprint', {
      method: 'POST',
    });
    expect(reprintButton).toBeDisabled();

    resolveReprint({
      ok: true,
      json: async () => ({ success: true, message: 'Reprint queued' }),
    });
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Reprint queued'));
    expect(fetchAdminInquiriesMock).toHaveBeenCalledTimes(2);
    expect(await screen.findByRole('button', { name: '再印刷' })).toBeEnabled();
  });
});
