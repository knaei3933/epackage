'use client';

import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import type {
  ChatLeadIntent,
  ChatLeadSubmission,
} from '@/lib/chat/lead-schema';

interface ChatLeadFormProps {
  intent: ChatLeadIntent;
  disabled: boolean;
  consentVersion: number | null;
  privacyPolicyVersion: number | null;
  memberLinkageAvailable: boolean;
  onSubmit: (lead: Omit<ChatLeadSubmission, 'sessionId'>) => Promise<boolean>;
  onSkip: () => void;
}

const inputClassName = 'w-full px-3 py-2.5 text-base border border-border-strong rounded-md focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50';

export function ChatLeadForm({
  intent,
  disabled,
  consentVersion,
  privacyPolicyVersion,
  memberLinkageAvailable,
  onSubmit,
  onSkip,
}: ChatLeadFormProps) {
  const [contentsDescription, setContentsDescription] = useState('');
  const [quantityDescription, setQuantityDescription] = useState('');
  const [sizeSpecState, setSizeSpecState] = useState('');
  const [materialPrintingNeeds, setMaterialPrintingNeeds] = useState('');
  const [deadlineText, setDeadlineText] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [preferredChannel, setPreferredChannel] = useState<'email' | 'phone' | 'any'>('any');
  const [contactWindow, setContactWindow] = useState<'unspecified' | 'weekday_daytime' | 'weekday_evening' | 'weekend'>('unspecified');
  const [contactConsent, setContactConsent] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [memberLinkage, setMemberLinkage] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled) return;

    const requirements = [
      contentsDescription,
      quantityDescription,
      sizeSpecState,
      materialPrintingNeeds,
      deadlineText,
    ];
    if (requirements.every((value) => value.trim().length === 0)) {
      setError('相談内容を1つ以上入力してください。');
      return;
    }
    if (!companyName.trim()) {
      setError('会社名を入力してください。');
      return;
    }
    if (!contactName.trim()) {
      setError('お名前を入力してください。');
      return;
    }
    if (!email.trim()) {
      setError('メールアドレスを入力してください。');
      return;
    }
    if (!phone.trim()) {
      setError('電話番号を入力してください。');
      return;
    }
    if (!contactConsent || !privacyConsent) {
      setError('同意にチェックを入れてください。');
      return;
    }
    if (requirements.some((value) => value.includes('@') || /\d{9,}/.test(value))) {
      setError('連絡先情報は専用の連絡方法に入力してください。');
      return;
    }

    const accepted = await onSubmit({
      intent,
      requirements: {
        contentsDescription: contentsDescription.trim() || undefined,
        quantityDescription: quantityDescription.trim() || undefined,
        sizeSpecState: sizeSpecState.trim() || undefined,
        materialPrintingNeeds: materialPrintingNeeds.trim() || undefined,
        deadlineText: deadlineText.trim() || undefined,
      },
      contact: {
        channel: preferredChannel === 'phone' ? 'phone' : 'email',
        email: email.trim(),
        phone: phone.trim(),
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        preferredChannel,
        contactWindow,
      },
      consent: {
        contact: contactConsent,
        privacy: privacyConsent,
        marketing: marketingConsent,
        memberLinkage: memberLinkageAvailable && memberLinkage,
      },
      memberLinkage: memberLinkageAvailable && memberLinkage,
      pageContext: {},
    });

    if (!accepted) setError('ただいま保存できませんでした。');
  };

  return (
    <form
      data-testid="chat-lead-form"
      onSubmit={handleSubmit}
      className="mx-4 mb-3 p-3 bg-bg-primary border border-border-medium rounded-container space-y-3"
    >
      <p className="text-base font-medium text-text-primary">
        続けてご相談いただく場合
      </p>
      {consentVersion !== null && privacyPolicyVersion !== null && (
        <p className="text-sm text-text-muted">
          同意バージョン {consentVersion} / ポリシー {privacyPolicyVersion}
        </p>
      )}

      <div>
        <label className="block text-sm text-text-secondary mb-1" htmlFor="lead-contents">
          内容・用途
        </label>
        <textarea
          id="lead-contents"
          value={contentsDescription}
          onChange={(event) => setContentsDescription(event.target.value)}
          disabled={disabled}
          maxLength={400}
          rows={2}
          className={inputClassName}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm text-text-secondary mb-1" htmlFor="lead-quantity">
            数量
          </label>
          <input
            id="lead-quantity"
            value={quantityDescription}
            onChange={(event) => setQuantityDescription(event.target.value)}
            disabled={disabled}
            maxLength={200}
            className={inputClassName}
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1" htmlFor="lead-deadline">
            希望時期
          </label>
          <input
            id="lead-deadline"
            value={deadlineText}
            onChange={(event) => setDeadlineText(event.target.value)}
            disabled={disabled}
            maxLength={100}
            className={inputClassName}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1" htmlFor="lead-size">
          サイズ・仕様の状況
        </label>
        <input
          id="lead-size"
          value={sizeSpecState}
          onChange={(event) => setSizeSpecState(event.target.value)}
          disabled={disabled}
          maxLength={300}
          className={inputClassName}
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1" htmlFor="lead-material">
          素材・印刷の希望
        </label>
        <input
          id="lead-material"
          value={materialPrintingNeeds}
          onChange={(event) => setMaterialPrintingNeeds(event.target.value)}
          disabled={disabled}
          maxLength={300}
          className={inputClassName}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm text-text-secondary mb-1" htmlFor="lead-company">
            会社名
          </label>
          <input
            id="lead-company"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            disabled={disabled}
            maxLength={200}
            className={inputClassName}
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1" htmlFor="lead-contact-name">
            ご担当者名
          </label>
          <input
            id="lead-contact-name"
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
            disabled={disabled}
            maxLength={100}
            className={inputClassName}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1" htmlFor="lead-email">
          メールアドレス
        </label>
        <input
          id="lead-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={disabled}
          maxLength={254}
          placeholder="example@example.com"
          className={inputClassName}
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1" htmlFor="lead-phone">
          電話番号
        </label>
        <input
          id="lead-phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          disabled={disabled}
          maxLength={32}
          placeholder="050-3613-9673"
          className={inputClassName}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm text-text-secondary mb-1" htmlFor="lead-preferred-channel">
            希望連絡方法
          </label>
          <select
            id="lead-preferred-channel"
            value={preferredChannel}
            onChange={(event) => setPreferredChannel(event.target.value as typeof preferredChannel)}
            disabled={disabled}
            className={inputClassName}
          >
            <option value="any">指定しない</option>
            <option value="email">メール</option>
            <option value="phone">電話</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1" htmlFor="lead-contact-window">
            連絡可能時間
          </label>
          <select
            id="lead-contact-window"
            value={contactWindow}
            onChange={(event) => setContactWindow(event.target.value as typeof contactWindow)}
            disabled={disabled}
            className={inputClassName}
          >
            <option value="unspecified">指定しない</option>
            <option value="weekday_daytime">平日日中</option>
            <option value="weekday_evening">平日夕方</option>
            <option value="weekend">週末</option>
          </select>
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm text-text-secondary">
        <input
          type="checkbox"
          checked={contactConsent}
          onChange={(event) => setContactConsent(event.target.checked)}
          disabled={disabled}
          className="mt-0.5"
        />
        入力内容を担当者確認のために保存することに同意します。
      </label>
      <label className="flex items-start gap-2 text-sm text-text-secondary">
        <input
          type="checkbox"
          checked={privacyConsent}
          onChange={(event) => setPrivacyConsent(event.target.checked)}
          disabled={disabled}
          className="mt-0.5"
        />
        <span>
          <a href="/privacy" className="text-brand hover:underline" target="_blank" rel="noreferrer">
            プライバシーポリシー
          </a>
          に同意します。
        </span>
      </label>
      <label className="flex items-start gap-2 text-sm text-text-secondary">
        <input
          type="checkbox"
          checked={marketingConsent}
          onChange={(event) => setMarketingConsent(event.target.checked)}
          disabled={disabled}
          className="mt-0.5"
        />
        お知らせを受け取る場合はチェックしてください（任意）。
      </label>

      {memberLinkageAvailable && (
        <label className="flex items-start gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={memberLinkage}
            onChange={(event) => setMemberLinkage(event.target.checked)}
            disabled={disabled}
            className="mt-0.5"
          />
          この相談内容を会員アカウントと関連付けることに同意します。
        </label>
      )}

      {error && (
        <p className="text-sm text-error">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={disabled}
          className="flex-1 px-3 py-2 text-sm bg-brand text-on-brand rounded-md hover:bg-brand-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {disabled && <Loader2 className="w-4 h-4 animate-spin" />}
          内容を保存する
        </button>
        <button
          type="button"
          onClick={onSkip}
          disabled={disabled}
          className="px-3 py-2 text-sm border border-border-strong rounded-md hover:bg-bg-secondary disabled:opacity-50"
        >
          スキップ
        </button>
      </div>
    </form>
  );
}
