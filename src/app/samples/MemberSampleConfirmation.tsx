'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface MemberSampleConfirmationValue {
  contactPerson?: string;
  phone?: string;
  postalCode?: string;
  prefecture?: string;
  city?: string;
  street?: string;
  companyName?: string;
  building?: string;
}

export interface MemberSampleConfirmationProps {
  confirmation: MemberSampleConfirmationValue;
  profileKana: {
    lastName: string;
    firstName: string;
    name: string;
  };
}

type ConfirmationField = keyof MemberSampleConfirmationValue;

const OPTIONAL_FIELDS: ConfirmationField[] = ['companyName', 'building'];

const inputClassName =
  'w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-brixa-500 focus:outline-none';

export default function MemberSampleConfirmation({
  confirmation: initialConfirmation,
  profileKana,
}: MemberSampleConfirmationProps) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState(initialConfirmation);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const update = (field: ConfirmationField) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setConfirmation((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/member/samples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(confirmation),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        setErrorMessage(result.error || 'サンプル依頼の送信に失敗しました。');
        return;
      }

      router.push('/member/samples');
    } catch {
      setErrorMessage('サンプル依頼の送信に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const rows: Array<{ field: ConfirmationField; label: string; placeholder?: string }> = [
    { field: 'companyName', label: '会社名' },
    { field: 'contactPerson', label: '担当者名' },
    { field: 'phone', label: '電話番号', placeholder: '03-1234-5678' },
    { field: 'postalCode', label: '郵便番号', placeholder: '100-0001' },
    { field: 'prefecture', label: '都道府県' },
    { field: 'city', label: '市区町村' },
    { field: 'street', label: '番地' },
    { field: 'building', label: '建物名' },
  ];

  return (
    <form onSubmit={submit} className="space-y-5" data-testid="member-sample-confirmation">
      <div className="rounded-lg border border-brixa-200 bg-brixa-50 p-4 text-sm text-gray-700">
        <p className="font-semibold text-gray-900">パウチサンプルセット（1点）</p>
        <p>内容は固定です。お届け先をご確認・編集してください。</p>
        {profileKana.name ? (
          <p className="mt-2 text-xs text-gray-500">
            フリガナ: {profileKana.name}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map(({ field, label, placeholder }) => {
          const optional = OPTIONAL_FIELDS.includes(field);
          return (
            <div key={field} className={field === 'companyName' ? 'md:col-span-2' : ''}>
              <label
                htmlFor={`member-sample-${field}`}
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                {label}
                {!optional && <span className="text-red-600"> *</span>}
              </label>
              <input
                id={`member-sample-${field}`}
                data-testid={`member-sample-${field}`}
                name={field}
                value={confirmation[field] ?? ''}
                onChange={update(field)}
                placeholder={placeholder}
                required={!optional}
                className={inputClassName}
              />
            </div>
          );
        })}
      </div>

      {errorMessage ? (
        <p role="alert" data-testid="member-sample-error" className="text-sm text-red-600">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        data-testid="member-sample-submit"
        className="w-full rounded-lg bg-brixa-600 px-4 py-4 font-semibold text-white transition-colors hover:bg-brixa-700 focus:ring-4 focus:ring-brixa-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? '送信中...' : '確認して依頼する'}
      </button>
      <p className="text-center text-xs text-gray-500">
        ※ 2営業日以内にご連絡いたします
      </p>
    </form>
  );
}
