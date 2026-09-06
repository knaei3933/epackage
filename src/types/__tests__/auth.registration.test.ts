import { registrationSchema } from '../auth';

type RegistrationInput = Parameters<typeof registrationSchema.parse>[0];

const validRegistration: RegistrationInput = {
  email: 'member@example.com',
  password: 'Password123',
  passwordConfirm: 'Password123',
  kanjiLastName: '山田',
  kanjiFirstName: '太郎',
  kanaLastName: 'ヤマダ',
  kanaFirstName: 'タロウ',
  corporatePhone: '03-1234-5678',
  personalPhone: '090-1234-5678',
  companyName: '',
  postalCode: '123-4567',
  prefecture: '東京都',
  city: '千代田区',
  street: '丸の内1-1-1',
  privacyConsent: true,
};

function issuePaths(value: RegistrationInput) {
  const result = registrationSchema.safeParse(value);

  if (result.success) {
    throw new Error('Expected validation to fail');
  }

  return new Set(result.error.issues.map((issue) => issue.path.join('.')));
}

describe('registrationSchema required Japanese signup fields', () => {
  it.each(['kanjiLastName', 'kanjiFirstName'] as const)(
    'A01: requires non-empty %s',
    (field) => {
      const paths = issuePaths({ ...validRegistration, [field]: '' });

      expect(paths).toContain(field);
    },
  );

  it('A02: requires Japanese kana and preserves kana-only validation', () => {
    const emptyPaths = issuePaths({
      ...validRegistration,
      kanaLastName: '',
      kanaFirstName: '',
    });

    expect(emptyPaths).toContain('kanaLastName');
    expect(emptyPaths).toContain('kanaFirstName');

    const latinPaths = issuePaths({
      ...validRegistration,
      kanaLastName: 'Yamada',
      kanaFirstName: 'Taro',
    });

    expect(latinPaths).toContain('kanaLastName');
    expect(latinPaths).toContain('kanaFirstName');
  });

  it('A03 and F02: accepts corporate phone alone', () => {
    const result = registrationSchema.safeParse({
      ...validRegistration,
      corporatePhone: '03-1234-5678',
      personalPhone: '',
    });

    expect(result.success).toBe(true);
  });

  it('A04 and F03: accepts personal phone alone', () => {
    const result = registrationSchema.safeParse({
      ...validRegistration,
      corporatePhone: '',
      personalPhone: '090-1234-5678',
    });

    expect(result.success).toBe(true);
  });

  it('A05: rejects when neither phone is present', () => {
    const paths = issuePaths({
      ...validRegistration,
      corporatePhone: '',
      personalPhone: '',
    });

    expect(paths).toContain('corporatePhone');
  });

  it('A06: accepts both phones in valid formats', () => {
    const result = registrationSchema.safeParse(validRegistration);

    expect(result.success).toBe(true);
  });

  it.each(['postalCode', 'prefecture', 'city', 'street'] as const)(
    'A07: requires non-empty %s',
    (field) => {
      const paths = issuePaths({ ...validRegistration, [field]: '' });

      expect(paths).toContain(field);
    },
  );

  it('A08: preserves invalid phone and postal format failures', () => {
    const paths = issuePaths({
      ...validRegistration,
      corporatePhone: '',
      personalPhone: '1234',
      postalCode: '123-456',
    });

    expect(paths).toContain('personalPhone');
    expect(paths).toContain('postalCode');
  });

  it('A09: accepts an empty optional company name', () => {
    const result = registrationSchema.safeParse({
      ...validRegistration,
      companyName: '',
    });

    expect(result.success).toBe(true);
  });

  it('A10: attaches Japanese required messages to field paths', () => {
    const result = registrationSchema.safeParse({
      ...validRegistration,
      kanjiLastName: '',
      kanjiFirstName: '',
      kanaLastName: '',
      kanaFirstName: '',
      corporatePhone: '',
      personalPhone: '',
      postalCode: '',
      prefecture: '',
      city: '',
      street: '',
    });

    if (result.success) {
      throw new Error('Expected validation to fail');
    }

    const messages = result.error.issues.reduce<Record<string, string[]>>(
      (acc, issue) => {
        const path = issue.path.join('.');
        acc[path] = [...(acc[path] ?? []), issue.message];
        return acc;
      },
      {},
    );

    expect(messages.kanjiLastName).toContain('姓を入力してください。');
    expect(messages.kanjiFirstName).toContain('名を入力してください。');
    expect(messages.kanaLastName).toContain('姓（カナ）を入力してください。');
    expect(messages.kanaFirstName).toContain('名（カナ）を入力してください。');
    expect(messages.corporatePhone).toContain(
      '法人電話番号または携帯電話のいずれかを入力してください。',
    );
    expect(messages.postalCode).toContain('郵便番号を入力してください。');
    expect(messages.prefecture).toContain('都道府県を選択してください。');
    expect(messages.city).toContain('市区町村を入力してください。');
    expect(messages.street).toContain('番地を入力してください。');
  });

  it.each([
    'kanjiLastName',
    'kanjiFirstName',
    'kanaLastName',
    'kanaFirstName',
    'postalCode',
    'prefecture',
    'city',
    'street',
  ] as const)('B05: rejects whitespace-only %s before submission', (field) => {
    const result = registrationSchema.safeParse({
      ...validRegistration,
      [field]: '   ',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join('.'))).toContain(field);
    }
  });

  it('B06: treats whitespace-only phones as invalid rather than an omitted value', () => {
    const oneWhitespace = registrationSchema.safeParse({
      ...validRegistration,
      corporatePhone: '   ',
      personalPhone: '',
    });
    expect(oneWhitespace.success).toBe(false);

    const bothWhitespace = registrationSchema.safeParse({
      ...validRegistration,
      corporatePhone: '   ',
      personalPhone: '   ',
    });
    expect(bothWhitespace.success).toBe(false);
  });
});
