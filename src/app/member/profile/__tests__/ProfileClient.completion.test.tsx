import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const router = {
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => router,
}));

jest.mock('@/components/ui/Toast', () => ({
  useToastContext: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
  }),
}));

import { ProfileClient } from '../ProfileClient';

const baseProps = {
  userId: 'member-1',
  userEmail: 'member@example.com',
  userName: '山田 花子',
  userLastName: '山田',
  userFirstName: '花子',
  userKanaLastName: 'ヤマダ',
  userKanaFirstName: 'ハナコ',
  userCorporatePhone: '03-1234-5678',
  userPostalCode: '123-4567',
  userPrefecture: '東京都',
  userCity: '千代田区',
  userStreet: '丸の内1-1-1',
  userRole: 'MEMBER',
  userStatus: 'ACTIVE',
  userCreatedAt: '2026-01-01T00:00:00.000Z',
  updateProfile: jest.fn().mockResolvedValue(undefined),
};

describe('ProfileClient completion mode (G003)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, returnTo: '/samples' }),
    });
  });

  it('K08/H06: shows the completion notice and returns to /samples after saving', async () => {
    render(
      <ProfileClient
        {...baseProps}
        userLastName=""
        completionMode
        returnTo="/samples?from=profile"
      />,
    );

    expect(screen.getByTestId('profile-completion-notice')).toHaveTextContent(
      'サンプル依頼には氏名・電話番号・住所が必要です',
    );

    fireEvent.change(screen.getByTestId('completion-kanji-last-name'), {
      target: { value: '山田' },
    });
    fireEvent.click(screen.getByTestId('profile-completion-submit'));

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/samples?from=profile');
    });
    expect(router.refresh).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/member/profile/complete',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(JSON.parse(jest.mocked(global.fetch).mock.calls[0]![1]!.body as string)).toEqual({
      kanji_last_name: '山田',
      returnTo: '/samples?from=profile',
    });
  });

  it('renders inputs only for blank required fields and preserves approved fields read-only', () => {
    render(
      <ProfileClient
        {...baseProps}
        userLastName=""
        completionMode
        returnTo="/samples"
      />,
    );

    expect(screen.queryByTestId('completion-kanji-first-name')).not.toBeInTheDocument();
    expect(screen.queryByTestId('completion-corporate-phone')).not.toBeInTheDocument();
    expect(screen.getByTestId('completion-kanji-last-name')).toBeEnabled();
    expect(screen.queryByTestId('completion-kanji-first-name')).not.toBeInTheDocument();
  });

  it('keeps ordinary phone-only profile editing available outside completion mode', () => {
    render(<ProfileClient {...baseProps} />);

    expect(screen.queryByTestId('profile-completion-mode')).not.toBeInTheDocument();
    expect(screen.getByTestId('company-phone-input')).toBeEnabled();
    expect(screen.getByTestId('personal-phone-input')).toBeEnabled();
    expect(screen.getByTestId('fax-input')).toBeEnabled();
    expect(screen.getByRole('button', { name: '変更を保存' })).toBeEnabled();
  });

  it('shows only the focused completion flow in completion mode', () => {
    render(<ProfileClient {...baseProps} completionMode />);

    expect(screen.getByTestId('profile-completion-title')).toHaveTextContent(
      'サンプル依頼に必要な情報',
    );
    expect(screen.getByTestId('profile-completion-submit')).toHaveTextContent(
      '確認画面へ進む',
    );
    expect(screen.queryByText('マイページ')).not.toBeInTheDocument();
    expect(screen.queryByText('その他')).not.toBeInTheDocument();
    expect(screen.queryByTestId('company-phone-input')).not.toBeInTheDocument();
  });

  it('uses the shared signup lookup and keeps registry street editable', async () => {
    global.fetch = jest.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === '/api/registry/postal-code?postalCode=673-0846') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            prefecture: '兵庫県',
            city: '明石市',
            street: '上ノ丸',
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ success: true, returnTo: '/samples' }),
      });
    });

    render(
      <ProfileClient
        {...baseProps}
        userPostalCode=""
        userPrefecture=""
        userCity=""
        userStreet=""
        completionMode
      />,
    );

    fireEvent.change(screen.getByTestId('completion-postal-code'), {
      target: { value: '6730846' },
    });
    await waitFor(() => expect(screen.getByTestId('completion-postal-code')).toHaveValue('673-0846'));
    await waitFor(() => expect(screen.getByTestId('completion-city')).toHaveValue('明石市上ノ丸'));
    expect(screen.getByTestId('completion-prefecture')).toHaveValue('兵庫県');
    expect(screen.getByTestId('completion-street')).toHaveValue('');

    fireEvent.change(screen.getByTestId('completion-street'), {
      target: { value: '2-11-21' },
    });
    fireEvent.click(screen.getByTestId('profile-completion-submit'));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/samples'));
    const payload = JSON.parse(jest.mocked(global.fetch).mock.calls.at(-1)![1]!.body as string);
    expect(payload).toMatchObject({
      postal_code: '673-0846',
      prefecture: '兵庫県',
      city: '明石市上ノ丸',
      street: '2-11-21',
    });
  });
});
