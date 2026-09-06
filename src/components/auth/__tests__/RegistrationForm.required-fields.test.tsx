import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
  }),
}));

import RegistrationForm from '../RegistrationForm';

describe('RegistrationForm required Japanese fields', () => {
  it('F04: shows schema errors and required markers for every new required field', async () => {
    const { container } = render(<RegistrationForm />);

    fireEvent.change(screen.getByPlaceholderText('example@company.com'), {
      target: { value: 'member@example.com' },
    });
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0]!, {
      target: { value: 'Password123' },
    });
    fireEvent.change(passwordInputs[1]!, {
      target: { value: 'Password123' },
    });
    fireEvent.blur(screen.getByPlaceholderText('example@company.com'));
    fireEvent.click(screen.getByRole('checkbox'));
    // Simulate a touched-but-empty submission for each newly required field.
    // The split name control validates all four paths whenever one visible
    // field changes; standard controls use their native blur handlers.
    const namePlaceholders = ['山田', '太郎', 'ヤマダ', 'タロウ'] as const;
    for (const placeholder of namePlaceholders) {
      const input = screen.getAllByPlaceholderText(placeholder)[0]!;
      fireEvent.change(input, { target: { value: 'x' } });
      fireEvent.change(input, { target: { value: '' } });
    }

    const corporatePhone = container.querySelector('[name="corporatePhone"]')!;
    fireEvent.change(corporatePhone, { target: { value: 'x' } });
    fireEvent.change(corporatePhone, { target: { value: '' } });
    fireEvent.blur(corporatePhone);

    const standardFields = [
      container.querySelector('[name="postalCode"]')!,
      container.querySelector('[name="city"]')!,
      container.querySelector('[name="street"]')!,
    ];
    for (const field of standardFields) {
      fireEvent.change(field, { target: { value: 'x' } });
      fireEvent.change(field, { target: { value: '' } });
      fireEvent.blur(field);
    }

    const prefecture = container.querySelector('[name="prefecture"]')!;
    fireEvent.change(prefecture, { target: { value: '東京都' } });
    fireEvent.change(prefecture, { target: { value: '' } });
    fireEvent.blur(prefecture);

    await waitFor(() => {
      expect(screen.getByText('姓を入力してください。')).toBeInTheDocument();
    });
    expect(screen.getByText('名を入力してください。')).toBeInTheDocument();
    expect(screen.getByText('姓（カナ）を入力してください。')).toBeInTheDocument();
    expect(screen.getByText('名（カナ）を入力してください。')).toBeInTheDocument();
    expect(
      screen.getByText('法人電話番号または携帯電話のいずれかを入力してください。'),
    ).toBeInTheDocument();
    expect(screen.getByText('郵便番号を入力してください。')).toBeInTheDocument();
    expect(screen.getByText('都道府県を選択してください。')).toBeInTheDocument();
    expect(screen.getByText('市区町村を入力してください。')).toBeInTheDocument();
    expect(screen.getByText('番地を入力してください。')).toBeInTheDocument();

    expect(screen.getByText('郵便番号 *')).toBeInTheDocument();
    expect(screen.getByText('都道府県 *')).toBeInTheDocument();
    expect(screen.getByText('市区町村 *')).toBeInTheDocument();
    expect(screen.getByText('番地 *')).toBeInTheDocument();
  });
});
