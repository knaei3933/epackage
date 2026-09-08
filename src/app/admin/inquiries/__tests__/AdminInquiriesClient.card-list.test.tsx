import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AdminInquiry } from '@/types/dashboard';
import { fetchAdminInquiries } from '@/lib/api/admin/inquiries';
import AdminInquiriesClient from '../AdminInquiriesClient';

jest.mock('@/lib/api/admin/inquiries', () => ({
  fetchAdminInquiries: jest.fn(),
}));

const fetchAdminInquiriesMock = jest.mocked(fetchAdminInquiries);

const defaultFetchArgs = {
  search: undefined,
  status: 'all',
  type: 'all',
  limit: 50,
};

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
    createdAt: new Date(2026, 0, 1, 9, 30).toISOString(),
    updatedAt: '2026-01-01T00:00:00.000Z',
    respondedAt: null,
    ...overrides,
  };
}

function createSampleLabel(id: string) {
  return {
    id,
    requestNumber: `SR-${id}`,
    printStatus: 'printed',
    destinationCount: 1,
    printSummary: '1 destination',
    destinations: [],
  };
}

function getDetailValue(card: HTMLElement, labelText: string) {
  const label = within(card).getByText(labelText, { selector: 'dt' });
  expect(label.nextElementSibling).not.toBeNull();
  return label.nextElementSibling as HTMLElement;
}

const getLabelValue = (card: HTMLElement) => getDetailValue(card, 'ラベル');

function getResultCount(count: string) {
  const paragraph = screen.getByText(/件のお問い合わせ/, { selector: 'p' });
  expect(paragraph).toHaveTextContent(count);
  return paragraph;
}

async function renderWithInquiries(inquiries: AdminInquiry[]) {
  fetchAdminInquiriesMock.mockResolvedValue(inquiries);
  render(<AdminInquiriesClient />);

  if (inquiries.length > 0) {
    await screen.findByRole('listitem', { name: inquiries[0].inquiryNumber });
  }

  return userEvent.setup();
}

describe('AdminInquiriesClient card list', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    global.fetch = jest.fn();
  });

  it('renders a semantic, overflow-safe card list instead of a table', async () => {
    fetchAdminInquiriesMock.mockResolvedValue([
      createInquiry({ id: 'normal-1', type: 'general' }),
    ]);
    const { container } = render(<AdminInquiriesClient />);

    const cardList = await screen.findByRole('list', { name: 'お問い合わせ管理' });
    const card = screen.getByRole('listitem', { name: 'INQ-NORMAL-1' });

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(container.querySelector('.overflow-x-auto')).not.toBeInTheDocument();
    expect(cardList.tagName).toBe('UL');
    expect(getDetailValue(card, '注文')).toHaveTextContent('-');
    expect(card.tagName).toBe('LI');
    expect(cardList).toHaveClass('min-w-0', 'max-w-full');

    const forbiddenCardData = Array.from(cardList.querySelectorAll('*')).find((element) =>
      element.classList.contains('whitespace-nowrap')
    );
    expect(forbiddenCardData).toBeUndefined();
    expect(
      Array.from(cardList.querySelectorAll('dd')).every((element) =>
        !element.classList.contains('whitespace-nowrap')
      )
    ).toBe(true);
    expect(fetchAdminInquiriesMock).toHaveBeenCalledWith(defaultFetchArgs);
  });

  it('renders every inquiry field, the count, accessible card name, and detail link', async () => {
    await renderWithInquiries([
      createInquiry({
        id: 'full-1',
        type: 'order',
        status: 'in_progress',
        subject: '注文に関する件名',
        message: '注文に関する本文です。',
        customerName: '鈴木 一郎',
        companyName: '株式会社EPACK',
        email: 'suzuki@example.com',
        orderId: 'order-1',
        orderNumber: 'ORD-2026-001',
      }),
    ]);

    const card = await screen.findByRole('listitem', { name: 'INQ-FULL-1' });
    expect(card).toHaveAccessibleName('INQ-FULL-1');
    expect(within(card).getByText('INQ-FULL-1')).toBeInTheDocument();
    expect(within(card).getByText('鈴木 一郎')).toBeInTheDocument();
    expect(within(card).getByText('株式会社EPACK')).toBeInTheDocument();
    expect(within(card).getByText('suzuki@example.com')).toBeInTheDocument();
    expect(within(card).getByText('注文に関する件名')).toBeInTheDocument();
    expect(within(card).getByText('注文に関する本文です。')).toBeInTheDocument();
    expect(within(card).getByText('ORD-2026-001')).toHaveAttribute(
      'href',
      '/admin/orders/order-1'
    );
    expect(getDetailValue(card, '注文')).toHaveTextContent('ORD-2026-001');
    expect(within(card).getByText('対応中')).toBeInTheDocument();
    expect(within(card).getByText('2026/01/01 09:30')).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: '詳細' })).toHaveAttribute(
      'href',
      '/admin/inquiries/full-1'
    );
    expect(getResultCount('1 件')).toHaveTextContent('1 件のお問い合わせ');
  });

  it('shows label state and reprint availability for samples and non-samples', async () => {
    await renderWithInquiries([
      createInquiry({
        id: 'normal-1',
        type: 'general',
        sampleLabel: null,
      }),
      createInquiry({
        id: 'sample-unlinked',
        type: 'sample',
        sampleLabel: null,
      }),
      createInquiry({
        id: 'sample-linked',
        type: 'sample',
        sampleLabel: createSampleLabel('sample-request-1'),
      }),
    ]);

    const normalCard = await screen.findByRole('listitem', { name: 'INQ-NORMAL-1' });
    expect(getLabelValue(normalCard)).toHaveTextContent('-');
    expect(
      within(normalCard).queryByTestId('admin-inquiry-reprint-normal-1')
    ).not.toBeInTheDocument();

    const unlinkedCard = screen.getByRole('listitem', { name: 'INQ-SAMPLE-UNLINKED' });
    expect(getLabelValue(unlinkedCard)).toHaveTextContent('未連携');
    expect(
      within(unlinkedCard).queryByTestId('admin-inquiry-reprint-sample-unlinked')
    ).not.toBeInTheDocument();

    const linkedCard = screen.getByRole('listitem', { name: 'INQ-SAMPLE-LINKED' });
    expect(getLabelValue(linkedCard)).toHaveTextContent('印刷済');
    const reprintButton = within(linkedCard).getByTestId(
      'admin-inquiry-reprint-sample-linked'
    );
    expect(reprintButton).toHaveTextContent('再印刷');
    expect(reprintButton).toBeEnabled();
    expect(reprintButton).toHaveAccessibleDescription(
      '宛先ラベルを再印字キューに追加します'
    );
  });

  it('calls the reprint API, reloads, shows feedback, and disables the button during the request', async () => {
    await renderWithInquiries([
      createInquiry({
        id: 'sample-1',
        type: 'sample',
        sampleLabel: createSampleLabel('sample-request-1'),
      }),
    ]);

    let resolveReprint!: (value: {
      ok: boolean;
      json: () => Promise<{ success: boolean; message: string }>;
    }) => void;
    global.fetch = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveReprint = resolve;
        })
    );

    const reprintButton = screen.getByTestId('admin-inquiry-reprint-sample-1');
    await userEvent.click(reprintButton);

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/admin/samples/sample-request-1/reprint',
      { method: 'POST' }
    );
    expect(reprintButton).toBeDisabled();

    resolveReprint({
      ok: true,
      json: async () => ({ success: true, message: 'Reprint queued' }),
    });

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Reprint queued'));
    expect(fetchAdminInquiriesMock).toHaveBeenCalledTimes(2);
    expect(
      await screen.findByTestId('admin-inquiry-reprint-sample-1')
    ).toBeEnabled();
  });

  it('keeps the list, shows reprint failure feedback, and re-enables the button', async () => {
    await renderWithInquiries([
      createInquiry({
        id: 'sample-1',
        type: 'sample',
        sampleLabel: createSampleLabel('sample-request-1'),
      }),
    ]);
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ success: false, message: 'Reprint failed' }),
    });

    const card = screen.getByRole('listitem', { name: 'INQ-SAMPLE-1' });
    const reprintButton = within(card).getByTestId('admin-inquiry-reprint-sample-1');
    fireEvent.click(reprintButton);

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Reprint failed'));
    expect(card).toBeInTheDocument();
    expect(fetchAdminInquiriesMock).toHaveBeenCalledTimes(1);
    expect(reprintButton).toBeEnabled();
  });

  it('commits a trimmed search when Enter is pressed', async () => {
    await renderWithInquiries([
      createInquiry({ id: 'normal-1', type: 'general' }),
    ]);
    fetchAdminInquiriesMock.mockClear();

    fireEvent.change(screen.getByLabelText('キーワード検索'), {
      target: { value: '  invoice subject  ' },
    });
    fireEvent.keyDown(screen.getByLabelText('キーワード検索'), { key: 'Enter' });

    await waitFor(() =>
      expect(fetchAdminInquiriesMock).toHaveBeenCalledWith({
        ...defaultFetchArgs,
        search: 'invoice subject',
      })
    );
    expect(screen.getByLabelText('キーワード検索')).toHaveValue('  invoice subject  ');
  });

  it('commits search with the 検索 button', async () => {
    await renderWithInquiries([
      createInquiry({ id: 'normal-1', type: 'general' }),
    ]);
    fetchAdminInquiriesMock.mockClear();

    fireEvent.change(screen.getByLabelText('キーワード検索'), {
      target: { value: ' keyword ' },
    });
    fireEvent.click(screen.getByRole('button', { name: '検索' }));

    await waitFor(() =>
      expect(fetchAdminInquiriesMock).toHaveBeenCalledWith({
        ...defaultFetchArgs,
        search: 'keyword',
      })
    );
  });

  it('refetches when status, type, and limit change and preserves the refresh indicator', async () => {
    await renderWithInquiries([
      createInquiry({ id: 'normal-1', type: 'general' }),
    ]);

    fetchAdminInquiriesMock.mockResolvedValueOnce(new Promise(() => {}));
    fireEvent.change(screen.getByLabelText('ステータスで絞り込み'), {
      target: { value: 'pending' },
    });
    await waitFor(() => expect(screen.getByText('（更新中...）')).toBeInTheDocument());
    expect(screen.getByRole('listitem', { name: 'INQ-NORMAL-1' })).toBeInTheDocument();

    fetchAdminInquiriesMock.mockResolvedValue([
      createInquiry({ id: 'normal-1', type: 'general' }),
    ]);
    fireEvent.change(screen.getByLabelText('種別で絞り込み'), {
      target: { value: 'sample' },
    });
    await waitFor(() =>
      expect(fetchAdminInquiriesMock).toHaveBeenNthCalledWith(3, {
        ...defaultFetchArgs,
        status: 'pending',
        type: 'sample',
      })
    );

    fireEvent.change(screen.getByLabelText('表示件数'), {
      target: { value: '20' },
    });
    await waitFor(() =>
      expect(fetchAdminInquiriesMock).toHaveBeenNthCalledWith(4, {
        ...defaultFetchArgs,
        status: 'pending',
        type: 'sample',
        limit: 20,
      })
    );
  });

  it('clears all filters to their defaults and refetches', async () => {
    await renderWithInquiries([
      createInquiry({ id: 'normal-1', type: 'general' }),
    ]);

    fireEvent.change(screen.getByLabelText('キーワード検索'), {
      target: { value: 'active search' },
    });
    fireEvent.click(screen.getByRole('button', { name: '検索' }));
    fireEvent.change(screen.getByLabelText('ステータスで絞り込み'), {
      target: { value: 'pending' },
    });
    fireEvent.change(screen.getByLabelText('種別で絞り込み'), {
      target: { value: 'sample' },
    });
    fireEvent.change(screen.getByLabelText('表示件数'), {
      target: { value: '20' },
    });
    await waitFor(() => expect(fetchAdminInquiriesMock).toHaveBeenCalledTimes(5));

    fireEvent.click(screen.getByRole('button', { name: 'クリア' }));

    await waitFor(() => expect(fetchAdminInquiriesMock).toHaveBeenCalledTimes(6));
    expect(fetchAdminInquiriesMock).toHaveBeenLastCalledWith(defaultFetchArgs);
    expect(screen.getByLabelText('キーワード検索')).toHaveValue('');
    expect(screen.getByLabelText('ステータスで絞り込み')).toHaveValue('all');
    expect(screen.getByLabelText('種別で絞り込み')).toHaveValue('all');
    expect(screen.getByLabelText('表示件数')).toHaveValue('50');
    expect(screen.queryByRole('button', { name: 'クリア' })).not.toBeInTheDocument();
  });

  it('shows fetch errors and uses 再読み込み to refresh the list', async () => {
    fetchAdminInquiriesMock.mockRejectedValueOnce(new Error('API unavailable'));
    render(<AdminInquiriesClient />);

    expect(await screen.findByText('API unavailable')).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();

    fetchAdminInquiriesMock.mockResolvedValueOnce([
      createInquiry({ id: 'normal-1', type: 'general' }),
    ]);
    fireEvent.click(screen.getByRole('button', { name: '再読み込み' }));

    expect(await screen.findByRole('listitem', { name: 'INQ-NORMAL-1' })).toBeInTheDocument();
    expect(fetchAdminInquiriesMock).toHaveBeenCalledTimes(2);
  });

  it('distinguishes initial loading, unfiltered empty, and filtered empty states', async () => {
    fetchAdminInquiriesMock.mockResolvedValueOnce(new Promise(() => {}));
    render(<AdminInquiriesClient />);
    expect(await screen.findByText('読み込み中...')).toBeInTheDocument();
    expect(screen.queryByText(/件のお問い合わせ/)).not.toBeInTheDocument();

    fetchAdminInquiriesMock.mockResolvedValueOnce([]);
    const { unmount } = render(<AdminInquiriesClient />);
    expect(await screen.findByText('お問い合わせがありません')).toBeInTheDocument();

    unmount();
    fetchAdminInquiriesMock.mockResolvedValueOnce([
      createInquiry({ id: 'normal-1', type: 'general' }),
    ]);
    render(<AdminInquiriesClient />);
    await screen.findByRole('listitem', { name: 'INQ-NORMAL-1' });

    fetchAdminInquiriesMock.mockResolvedValueOnce([]);
    fireEvent.change(screen.getByLabelText('キーワード検索'), {
      target: { value: 'missing search' },
    });
    fireEvent.click(screen.getByRole('button', { name: '検索' }));

    expect(
      await screen.findByText('検索条件に一致するお問い合わせがありません')
    ).toBeInTheDocument();
  });

  it('updates the result count after a new response loads', async () => {
    await renderWithInquiries([
      createInquiry({ id: 'normal-1', type: 'general' }),
      createInquiry({ id: 'normal-2', type: 'sample' }),
    ]);
    expect(getResultCount('2 件')).toHaveTextContent('2 件のお問い合わせ');

    fetchAdminInquiriesMock.mockResolvedValueOnce([]);
    fireEvent.change(screen.getByLabelText('ステータスで絞り込み'), {
      target: { value: 'pending' },
    });

    await waitFor(() =>
      expect(getResultCount('0 件')).toHaveTextContent('0 件のお問い合わせ')
    );
  });

  it('exposes bound visible accessible names for search, filters, and limit', async () => {
    await renderWithInquiries([
      createInquiry({ id: 'normal-1', type: 'general' }),
    ]);

    for (const [labelText, controlId] of [
      ['キーワード検索', 'admin-inquiry-search'],
      ['ステータスで絞り込み', 'admin-inquiry-status'],
      ['種別で絞り込み', 'admin-inquiry-type'],
      ['表示件数', 'admin-inquiry-limit'],
    ] as const) {
      const control = screen.getByLabelText(labelText);
      const label = screen.getByText(labelText);
      expect(control).toHaveAttribute('id', controlId);
      expect(label).toHaveAttribute('for', controlId);
    }
  });

  it('uses wrapping classes for long message and contact/company values', async () => {
    const longToken = 'A'.repeat(180);
    const longEmail = `${'b'.repeat(100)}@example.com`;
    await renderWithInquiries([
      createInquiry({
        id: 'long-1',
        type: 'general',
        customerName: longToken,
        companyName: `company-${longToken}`,
        email: longEmail,
        message: `multiline\n${longToken}`,
      }),
    ]);

    const card = await screen.findByRole('listitem', { name: 'INQ-LONG-1' });
    expect(getDetailValue(card, '顧客名')).toHaveTextContent(longToken);
    expect(getDetailValue(card, '顧客名')).toHaveClass('break-words');
    expect(getDetailValue(card, '会社名')).toHaveTextContent(`company-${longToken}`);
    expect(getDetailValue(card, '会社名')).toHaveClass('break-words');
    expect(getDetailValue(card, 'メールアドレス')).toHaveTextContent(longEmail);
    expect(getDetailValue(card, 'メールアドレス')).toHaveClass('break-all');
    const message = getDetailValue(card, '本文');
    expect(message.textContent).toContain('multiline');
    expect(message.textContent).toContain(longToken);
    expect(getDetailValue(card, '本文')).toHaveClass('whitespace-pre-wrap', 'break-words');
  });
});
