import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const push = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
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
    fireEvent.click(screen.getByRole('button', { name: '保存してサンプル依頼へ進む' }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/samples?from=profile');
    });
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
    expect(screen.getByDisplayValue('花子')).toBeDisabled();
  });

  it('keeps ordinary phone-only profile editing available outside completion mode', () => {
    render(<ProfileClient {...baseProps} />);

    expect(screen.queryByTestId('profile-completion-mode')).not.toBeInTheDocument();
    expect(screen.getByTestId('company-phone-input')).toBeEnabled();
    expect(screen.getByTestId('personal-phone-input')).toBeEnabled();
    expect(screen.getByTestId('fax-input')).toBeEnabled();
    expect(screen.getByRole('button', { name: '変更を保存' })).toBeEnabled();
  });
});
