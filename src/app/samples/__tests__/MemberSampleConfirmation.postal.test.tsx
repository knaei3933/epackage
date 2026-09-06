import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const router = {
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => router,
}));

import MemberSampleConfirmation from '../MemberSampleConfirmation';

const baseConfirmation = {
  contactPerson: '山田 太郎',
  phone: '03-1234-5678',
  postalCode: '',
  prefecture: '',
  city: '',
  street: '',
  companyName: '株式会社サンプル',
  building: '',
};

const profileKana = {
  lastName: 'ヤマダ',
  firstName: 'タロウ',
  name: 'ヤマダ タロウ',
};

describe('MemberSampleConfirmation postal lookup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes 6730846 and fills the same city structure as signup', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        prefecture: '兵庫県',
        city: '明石市',
        street: '上ノ丸',
      }),
    });

    render(<MemberSampleConfirmation confirmation={baseConfirmation} profileKana={profileKana} />);
    fireEvent.change(screen.getByTestId('member-sample-postalCode'), {
      target: { value: '6730846' },
    });

    await waitFor(() => expect(screen.getByTestId('member-sample-postalCode')).toHaveValue('673-0846'));
    expect(global.fetch).toHaveBeenCalledWith('/api/registry/postal-code?postalCode=673-0846');
    await waitFor(() => expect(screen.getByTestId('member-sample-city')).toHaveValue('明石市上ノ丸'));
    expect(screen.getByTestId('member-sample-prefecture')).toHaveValue('兵庫県');
    expect(screen.getByTestId('member-sample-street')).toHaveValue('');

    fireEvent.change(screen.getByTestId('member-sample-street'), {
      target: { value: '2-11-21' },
    });
    expect(screen.getByTestId('member-sample-street')).toHaveValue('2-11-21');
  });

  it('shows loading while the shared lookup is in flight', async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    global.fetch = jest.fn().mockImplementation(
      () => new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    render(<MemberSampleConfirmation confirmation={baseConfirmation} profileKana={profileKana} />);
    fireEvent.change(screen.getByTestId('member-sample-postalCode'), {
      target: { value: '1000001' },
    });

    expect(screen.getByTestId('member-sample-postal-loading')).toHaveTextContent(
      '住所を検索しています...',
    );

    resolveFetch({
      ok: true,
      status: 200,
      json: async () => ({ prefecture: '東京都', city: '千代田区', street: '' }),
    });
    await waitFor(() => expect(screen.queryByTestId('member-sample-postal-loading')).not.toBeInTheDocument());
    expect(screen.getByTestId('member-sample-city')).toHaveValue('千代田区');
  });

  it('shows a lookup error and keeps all address values editable', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });

    render(<MemberSampleConfirmation confirmation={baseConfirmation} profileKana={profileKana} />);
    fireEvent.change(screen.getByTestId('member-sample-postalCode'), {
      target: { value: '9999999' },
    });

    await waitFor(() => expect(screen.getByTestId('member-sample-postal-error')).toHaveTextContent(
      '住所検索に失敗しました。',
    ));
    expect(screen.getByTestId('member-sample-prefecture')).toBeEnabled();
    fireEvent.change(screen.getByTestId('member-sample-prefecture'), {
      target: { value: '東京都' },
    });
    expect(screen.getByTestId('member-sample-prefecture')).toHaveValue('東京都');
  });
});
