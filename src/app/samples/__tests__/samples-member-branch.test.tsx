import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';

const push = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  redirect: (path: string) => {
    throw new Error(`REDIRECT:${path}`);
  },
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/member/sample-prefill', () => ({
  loadSamplePrefill: jest.fn(),
}));

const updateProfile = jest.fn();

jest.mock('@/components/ui/Toast', () => ({
  useToastContext: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
  }),
}));

import { ProfileClient } from '@/app/member/profile/ProfileClient';
import SamplesPage from '../page';
import MemberSampleConfirmation from '../MemberSampleConfirmation';
import { createClient } from '@/lib/supabase/server';
import { loadSamplePrefill } from '@/lib/member/sample-prefill';

const mockedCreateClient = jest.mocked(createClient);
const mockedLoadSamplePrefill = jest.mocked(loadSamplePrefill);

const confirmation = {
  contactPerson: '山田 太郎',
  phone: '03-1234-5678',
  postalCode: '100-0001',
  prefecture: '東京都',
  city: '千代田区',
  street: '千代田1-1',
  companyName: '株式会社サンプル',
  building: 'サンプルビル',
};

const loadedPrefill = {
  status: 'loaded',
  complete: true,
  missingFields: [],
  validationErrors: [],
  data: {
    confirmation,
    profileKana: { lastName: 'ヤマダ', firstName: 'タロウ', name: 'ヤマダ タロウ' },
  },
};

async function renderPage() {
  let ui: React.ReactElement | null = null;
  await act(async () => {
    ui = (await SamplesPage()) as React.ReactElement;
  });
  render(ui!);
}

function mockAuthentication(
  user: Record<string, unknown> | null,
  error: Record<string, unknown> | null = null,
) {
  const getUser = jest.fn().mockResolvedValue({ data: { user }, error });
  mockedCreateClient.mockResolvedValue({
    auth: { getUser },
    from: jest.fn(),
  } as never);
  return getUser;
}

describe('/samples server auth branch (G006)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('J01/K01: renders the guest flow only for definitive no-session and no authenticated profile PII', async () => {
    mockAuthentication(null);
    await renderPage();

    expect(screen.getByRole('button', { name: 'サンプルを依頼する' })).toBeInTheDocument();
    expect(screen.queryByTestId('member-sample-confirmation')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('山田 太郎')).not.toBeInTheDocument();
    expect(mockedLoadSamplePrefill).not.toHaveBeenCalled();
  });

  it('K02: renders a complete ACTIVE member confirmation from server prefill', async () => {
    mockAuthentication({ id: 'member-1', email: 'm@example.com' });
    mockedLoadSamplePrefill.mockResolvedValueOnce(loadedPrefill as never);
    await renderPage();

    expect(mockedLoadSamplePrefill).toHaveBeenCalledWith(expect.anything(), 'member-1');
    expect(screen.getByTestId('member-sample-confirmation')).toBeInTheDocument();
    expect(screen.getByTestId('member-sample-contactPerson')).toHaveValue('山田 太郎');
    expect(screen.getByTestId('member-sample-phone')).toHaveValue('03-1234-5678');
  });

  it('K03: redirects an incomplete ACTIVE member to profile completion with return path', async () => {
    mockAuthentication({ id: 'member-1', email: 'm@example.com' });
    mockedLoadSamplePrefill.mockResolvedValueOnce({
      ...loadedPrefill,
      complete: false,
      missingFields: ['phone'],
    });

    await expect(SamplesPage()).rejects.toThrow(
      'REDIRECT:/member/profile?complete=1&returnTo=%2Fsamples',
    );
  });

  it.each(['PENDING', 'SUSPENDED', 'DELETED'])(
    'K09: routes a %s member to the existing status page instead of completion',
    async (status) => {
      mockAuthentication({
        id: `member-${status}`,
        email: 'm@example.com',
      });
      mockedLoadSamplePrefill.mockResolvedValueOnce({
        status: 'profile_not_active',
        profileStatus: status,
        data: null,
        complete: false,
        missingFields: [],
        validationErrors: [],
      } as never);

      const expectedPath =
        status === 'PENDING'
          ? '/auth/pending'
          : status === 'SUSPENDED'
            ? '/auth/suspended'
            : '/auth/signin?redirect=%2Fsamples';

      await expect(SamplesPage()).rejects.toThrow(`REDIRECT:${expectedPath}`);
      expect(mockedCreateClient).toHaveBeenCalledTimes(2);
      expect(mockedLoadSamplePrefill).toHaveBeenCalledWith(
        expect.anything(),
        `member-${status}`,
      );
    },
  );

  it.each(['profile_query_failed', 'delivery_query_failed'])(
    'K10: keeps %s fail-closed on the auth error page',
    async (status) => {
      mockAuthentication({
        id: 'member-query-failed',
        email: 'm@example.com',
      });
      mockedLoadSamplePrefill.mockResolvedValueOnce({
        status,
        data: null,
        complete: false,
        missingFields: [],
        validationErrors: [],
      } as never);

      await expect(SamplesPage()).rejects.toThrow(
        'REDIRECT:/auth/error?error=sample_prefill_unavailable',
      );
    },
  );

  it('K11: keeps profile_not_found off the completion path', async () => {
    mockAuthentication({
      id: 'member-missing',
      email: 'm@example.com',
    });
    mockedLoadSamplePrefill.mockResolvedValueOnce({
      status: 'profile_not_found',
      data: null,
      complete: false,
      missingFields: [],
      validationErrors: [],
    } as never);

    await expect(SamplesPage()).rejects.toThrow(
      'REDIRECT:/auth/signin?redirect=%2Fsamples',
    );
  });

  it('fails closed on authenticated-user lookup failure without rendering the guest form', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockAuthentication(
      { id: 'member-1', email: 'm@example.com' },
      { message: 'auth service unavailable' },
    );

    try {
      await expect(SamplesPage()).rejects.toThrow(
        'REDIRECT:/auth/error?error=authentication_unavailable',
      );
      expect(mockedLoadSamplePrefill).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[SAMPLES] authentication lookup unavailable',
        { pathname: '/samples' },
      );
    } finally {
      consoleWarnSpy.mockRestore();
    }
  });

  it('fails closed when authentication client creation throws', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockedCreateClient.mockRejectedValueOnce(new Error('cookie store unavailable'));

    try {
      await expect(SamplesPage()).rejects.toThrow(
        'REDIRECT:/auth/error?error=authentication_unavailable',
      );
      expect(mockedLoadSamplePrefill).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[SAMPLES] authentication lookup unavailable',
        { pathname: '/samples' },
      );
    } finally {
      consoleWarnSpy.mockRestore();
    }
  });
});

describe('member sample confirmation UI (G006)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('K04: keeps confirmation edits local before submit', async () => {
    render(<MemberSampleConfirmation confirmation={confirmation} profileKana={loadedPrefill.data.profileKana} />);

    fireEvent.change(screen.getByTestId('member-sample-phone'), {
      target: { value: '090-1234-5678' },
    });

    expect(screen.getByTestId('member-sample-phone')).toHaveValue('090-1234-5678');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('K05: submits once and redirects to member sample history on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ success: true, data: { sampleRequestId: 'request-1' } }),
    });
    render(<MemberSampleConfirmation confirmation={confirmation} profileKana={loadedPrefill.data.profileKana} />);

    fireEvent.click(screen.getByTestId('member-sample-submit'));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/member/samples'));
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/member/samples',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(JSON.parse(jest.mocked(global.fetch).mock.calls[0]![1]!.body as string)).toEqual(confirmation);
  });

  it('K06: preserves edits and shows a Japanese error on API failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ success: false, error: '入力内容をご確認ください。' }),
    });
    render(<MemberSampleConfirmation confirmation={confirmation} profileKana={loadedPrefill.data.profileKana} />);

    fireEvent.change(screen.getByTestId('member-sample-street'), {
      target: { value: '編集済み番地' },
    });
    fireEvent.click(screen.getByTestId('member-sample-submit'));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('入力内容をご確認ください。'));
    expect(screen.getByTestId('member-sample-street')).toHaveValue('編集済み番地');
    expect(push).not.toHaveBeenCalled();
  });

  it('K07: does not show a fixed sample selection UI', () => {
    render(<MemberSampleConfirmation confirmation={confirmation} profileKana={loadedPrefill.data.profileKana} />);

    expect(screen.queryByLabelText('サンプルを選択')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByText('パウチサンプルセット（1点）')).toBeInTheDocument();
  });

  it('K08: profile completion shows the required-field notice and return path', () => {
    render(
      <ProfileClient
        userId="member-1"
        userEmail="member@example.com"
        userLastName=""
        userFirstName="太郎"
        userKanaLastName="ヤマダ"
        userKanaFirstName="タロウ"
        userCorporatePhone="03-1234-5678"
        userPostalCode="100-0001"
        userPrefecture="東京都"
        userCity="千代田区"
        userStreet="千代田1-1"
        userRole="MEMBER"
        userStatus="ACTIVE"
        userCreatedAt="2026-01-01T00:00:00.000Z"
        completionMode
        returnTo="/samples"
        updateProfile={updateProfile}
      />,
    );

    expect(screen.getByTestId('profile-completion-mode')).toBeInTheDocument();
    expect(screen.getByTestId('profile-completion-notice')).toHaveTextContent(
      'サンプル依頼には氏名・電話番号・住所が必要です',
    );
    expect(screen.getByTestId('profile-completion-notice')).toHaveTextContent(
      '保存後は「/samples」へ戻ります。',
    );
  });
});
