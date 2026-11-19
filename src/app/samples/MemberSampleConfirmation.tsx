'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Loader2,
  MapPin,
  ShieldCheck,
  Truck,
  User,
} from 'lucide-react';
import {
  JAPANESE_PREFECTURES,
  isCompletePostalCode,
  normalizePostalCodeInput,
} from '@/lib/address/postal-code';
import { buttonVariants } from '@/components/ui/Button';
import { usePostalCodeLookup } from '@/hooks/usePostalCodeLookup';

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
}

type ConfirmationField = keyof MemberSampleConfirmationValue;

const inputClassName =
  'h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11';

const labelClassName = 'mb-2 block text-sm font-medium text-text-primary';

function FieldLabel({
  htmlFor,
  children,
  optional = false,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className={labelClassName}>
      {children}
      {!optional && <span className="ml-1 text-error">*</span>}
    </label>
  );
}

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-muted text-brand">
        {icon}
      </span>
      <div>
        <h3 className="text-base font-bold text-text-primary">{title}</h3>
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      </div>
    </div>
  );
}

export default function MemberSampleConfirmation({
  confirmation: initialConfirmation,
}: MemberSampleConfirmationProps) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState(() => ({
    ...initialConfirmation,
    postalCode: normalizePostalCodeInput(initialConfirmation.postalCode ?? ''),
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePostalAddressFound = ({
    postalCode,
    prefecture,
    city,
    street,
  }: {
    postalCode: string;
    prefecture: string;
    city: string;
    street: string;
  }) => {
    // Match signup: registry district data is kept in city and street is left
    // editable for the customer's lot/building number.
    setConfirmation((current) => ({
      ...current,
      postalCode,
      prefecture,
      city: street ? `${city}${street}` : city,
      street: '',
    }));
  };

  const {
    lookupPostalCode,
    isSearchingPostal,
    postalSearchError,
    clearPostalSearchError,
  } = usePostalCodeLookup({ onAddressFound: handlePostalAddressFound });

  const update = (field: ConfirmationField) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const value =
      field === 'postalCode'
        ? normalizePostalCodeInput(event.target.value)
        : event.target.value;

    setConfirmation((current) => ({ ...current, [field]: value }));

    if (field === 'postalCode') {
      clearPostalSearchError();
      if (isCompletePostalCode(value)) {
        void lookupPostalCode(value);
      }
    }
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

  return (
    <form onSubmit={submit} className="space-y-8" data-testid="member-sample-confirmation">
      {/* Contact and company */}
      <section aria-labelledby="member-sample-contact-heading">
        <SectionTitle
          icon={<User className="size-5" />}
          title="会社・担当者情報"
          description="ラベルに印字される内容を確認してください。"
        />

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="member-sample-companyName" optional>
              会社名
            </FieldLabel>
            <input
              id="member-sample-companyName"
              data-testid="member-sample-companyName"
              name="companyName"
              value={confirmation.companyName ?? ''}
              onChange={update('companyName')}
              placeholder="株式会社サンプル"
              autoComplete="organization"
              className={inputClassName}
            />
          </div>

          <div>
            <FieldLabel htmlFor="member-sample-contactPerson">担当者名</FieldLabel>
            <input
              id="member-sample-contactPerson"
              data-testid="member-sample-contactPerson"
              name="contactPerson"
              value={confirmation.contactPerson ?? ''}
              onChange={update('contactPerson')}
              placeholder="山田 太郎"
              required
              autoComplete="name"
              className={inputClassName}
            />
          </div>

          <div className="md:col-span-2">
            <FieldLabel htmlFor="member-sample-phone">電話番号</FieldLabel>
            <input
              id="member-sample-phone"
              data-testid="member-sample-phone"
              name="phone"
              value={confirmation.phone ?? ''}
              onChange={update('phone')}
              placeholder="03-1234-5678"
              required
              inputMode="tel"
              autoComplete="tel"
              className={inputClassName}
            />
          </div>
        </div>
      </section>

      <div className="border-t border-border-medium" />

      {/* Shipping address */}
      <section aria-labelledby="member-sample-address-heading">
        <SectionTitle
          icon={<MapPin className="size-5" />}
          title="お届け先住所"
          description="郵便番号を入力すると住所を自動入力します。"
        />

        <div className="space-y-5">
          <div className="max-w-md">
            <FieldLabel htmlFor="member-sample-postalCode">郵便番号</FieldLabel>
            <input
              id="member-sample-postalCode"
              data-testid="member-sample-postalCode"
              name="postalCode"
              value={confirmation.postalCode ?? ''}
              onChange={update('postalCode')}
              placeholder="100-0001"
              required
              inputMode="numeric"
              autoComplete="postal-code"
              className={inputClassName}
            />

            {isSearchingPostal ? (
              <p
                role="status"
                data-testid="member-sample-postal-loading"
                className="mt-2 flex items-center gap-2 text-sm text-text-secondary"
              >
                <Loader2 className="size-4 animate-spin" />
                住所を検索しています...
              </p>
            ) : null}
            {postalSearchError ? (
              <p
                role="alert"
                data-testid="member-sample-postal-error"
                className="mt-2 rounded-md bg-warning-muted px-3 py-2 text-sm text-on-warning-muted"
              >
                {postalSearchError}
              </p>
            ) : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="member-sample-prefecture">都道府県</FieldLabel>
              <select
                id="member-sample-prefecture"
                data-testid="member-sample-prefecture"
                name="prefecture"
                value={confirmation.prefecture ?? ''}
                onChange={update('prefecture')}
                required
                className={inputClassName}
              >
                <option value="">選択</option>
                {JAPANESE_PREFECTURES.map((prefecture) => (
                  <option key={prefecture} value={prefecture}>
                    {prefecture}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel htmlFor="member-sample-city">市区町村</FieldLabel>
              <input
                id="member-sample-city"
                data-testid="member-sample-city"
                name="city"
                value={confirmation.city ?? ''}
                onChange={update('city')}
                placeholder="明石市"
                required
                className={inputClassName}
              />
            </div>

            <div>
              <FieldLabel htmlFor="member-sample-street">番地</FieldLabel>
              <input
                id="member-sample-street"
                data-testid="member-sample-street"
                name="street"
                value={confirmation.street ?? ''}
                onChange={update('street')}
                placeholder="2-11-21"
                required
                className={inputClassName}
              />
            </div>

            <div>
              <FieldLabel htmlFor="member-sample-building" optional>
                建物名
              </FieldLabel>
              <input
                id="member-sample-building"
                data-testid="member-sample-building"
                name="building"
                value={confirmation.building ?? ''}
                onChange={update('building')}
                placeholder="サンプルビル101"
                autoComplete="address-line2"
                className={inputClassName}
              />
            </div>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <p
          role="alert"
          data-testid="member-sample-error"
          className="rounded-container border border-error bg-error-muted px-4 py-3 text-sm font-medium text-on-error-muted"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="rounded-container border border-border-medium bg-bg-secondary p-5">
        <button
          type="submit"
          disabled={isSubmitting}
          data-testid="member-sample-submit"
          className={`${buttonVariants({ variant: 'primary', size: 'lg' })} w-full`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              送信中...
            </>
          ) : (
            <>
              <CheckCircle2 className="size-5" />
              確認して依頼する
            </>
          )}
        </button>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-brand" />
            送料無料安心配送
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Truck className="size-4 text-brand" />
            2-3営業日で発送準備
          </span>
        </div>
        <p className="mt-3 text-center text-[13px] text-text-muted">
          ※ 2営業日以内にご連絡いたします
        </p>
      </div>
    </form>
  );
}
