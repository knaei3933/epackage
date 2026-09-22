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

const inputClassName = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa focus:border-transparent disabled:bg-gray-100';

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
  const [channel, setChannel] = useState<'email' | 'phone'>('email');
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
    if (channel === 'email' && !email.trim()) {
      setError('メールアドレスを入力してください。');
      return;
    }
    if (channel === 'phone' && !phone.trim()) {
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
        channel,
        email: channel === 'email' ? email.trim() : undefined,
        phone: channel === 'phone' ? phone.trim() : undefined,
        companyName: companyName.trim() || undefined,
        contactName: contactName.trim() || undefined,
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
      className="mx-4 mb-3 p-3 bg-white border border-gray-200 rounded-lg space-y-3"
    >
      <p className="text-sm font-medium text-gray-900">
        続けてご相談いただく場合
      </p>
      {consentVersion !== null && privacyPolicyVersion !== null && (
        <p className="text-xs text-gray-500">
          同意バージョン {consentVersion} / ポリシー {privacyPolicyVersion}
        </p>
      )}

      <div>
        <label className="block text-xs text-gray-600 mb-1" htmlFor="lead-contents">
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
          <label className="block text-xs text-gray-600 mb-1" htmlFor="lead-quantity">
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
          <label className="block text-xs text-gray-600 mb-1" htmlFor="lead-deadline">
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
        <label className="block text-xs text-gray-600 mb-1" htmlFor="lead-size">
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
        <label className="block text-xs text-gray-600 mb-1" htmlFor="lead-material">
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
          <label className="block text-xs text-gray-600 mb-1" htmlFor="lead-company">
            会社名（任意）
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
          <label className="block text-xs text-gray-600 mb-1" htmlFor="lead-contact-name">
            お名前（任意）
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

      <fieldset className="space-y-2">
        <legend className="text-xs text-gray-600">連絡方法</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="lead-contact-channel"
            checked={channel === 'email'}
            onChange={() => setChannel('email')}
            disabled={disabled}
          />
          メール
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="lead-contact-channel"
            checked={channel === 'phone'}
            onChange={() => setChannel('phone')}
            disabled={disabled}
          />
          電話
        </label>
        {channel === 'email' && (
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={disabled}
            maxLength={254}
            placeholder="example@example.com"
            className={inputClassName}
          />
        )}
        {channel === 'phone' && (
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            disabled={disabled}
            maxLength={32}
            placeholder="050-1793-6500"
            className={inputClassName}
          />
        )}
      </fieldset>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-600 mb-1" htmlFor="lead-preferred-channel">
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
          <label className="block text-xs text-gray-600 mb-1" htmlFor="lead-contact-window">
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

      <label className="flex items-start gap-2 text-xs text-gray-700">
        <input
          type="checkbox"
          checked={contactConsent}
          onChange={(event) => setContactConsent(event.target.checked)}
          disabled={disabled}
          className="mt-0.5"
        />
        入力内容を担当者確認のために保存することに同意します。
      </label>
      <label className="flex items-start gap-2 text-xs text-gray-700">
        <input
          type="checkbox"
          checked={privacyConsent}
          onChange={(event) => setPrivacyConsent(event.target.checked)}
          disabled={disabled}
          className="mt-0.5"
        />
        <span>
          <a href="/privacy" className="text-brixa hover:underline" target="_blank" rel="noreferrer">
            プライバシーポリシー
          </a>
          に同意します。
        </span>
      </label>
      <label className="flex items-start gap-2 text-xs text-gray-700">
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
        <label className="flex items-start gap-2 text-xs text-gray-700">
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
        <p className="text-xs text-red-600">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={disabled}
          className="flex-1 px-3 py-2 text-sm bg-brixa text-white rounded-lg hover:bg-brixa-600 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
        >
          {disabled && <Loader2 className="w-4 h-4 animate-spin" />}
          内容を保存する
        </button>
        <button
          type="button"
          onClick={onSkip}
          disabled={disabled}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:bg-gray-100"
        >
          スキップ
        </button>
      </div>
    </form>
  );
}
