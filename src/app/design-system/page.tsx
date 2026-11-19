'use client';

import React, { useState } from 'react';
import { Check, X, Download, Search, Trash2, ArrowRight } from 'lucide-react';
import { Button, Input, Select, Textarea, Card, Badge, Alert } from '@/components/ui';
import { ThemeToggle } from '@/components/theme/ThemeProvider';
import { homeFontClass } from '@/components/home/fonts';
import { ColorSwatches } from './ColorSwatches';

// Epackage UI 基準 v1 の見本。正本は src/styles/DESIGN_STANDARD.md。
// このページ自身も基準に従う（グラデーション・ぼかし・大きな影・拡大・ピル型を使わない）。

const HEADING_WRAP = '[word-break:keep-all] [overflow-wrap:anywhere]';

const SECTIONS = [
  { id: 'color', label: '色' },
  { id: 'type', label: '文字' },
  { id: 'button', label: 'ボタン' },
  { id: 'input', label: '入力' },
  { id: 'card', label: 'カード・バッジ・アラート' },
  { id: 'shape', label: '形' },
  { id: 'elevation', label: '高さ（影）と動き' },
  { id: 'avoid', label: '使わないもの' },
  { id: 'cheatsheet', label: 'クラスの早見表' },
] as const;

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-inner bg-bg-muted px-1 py-0.5 font-mono text-[13px] text-text-primary [overflow-wrap:anywhere]">
      {children}
    </code>
  );
}

function Section({
  id,
  tone,
  title,
  lead,
  children,
}: {
  id: string;
  tone: 'primary' | 'secondary';
  title: string;
  lead?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`scroll-mt-16 py-16 md:py-24 ${tone === 'primary' ? 'bg-bg-primary' : 'bg-bg-secondary'}`}>
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
        <h2
          className={`font-heading text-[24px] font-medium leading-[1.4] text-text-primary md:text-[32px] ${HEADING_WRAP}`}
        >
          {title}
        </h2>
        {lead && <p className="mt-4 max-w-[40em] text-[15px] leading-[1.8] text-text-secondary md:text-base">{lead}</p>}
        <div className="mt-8 md:mt-12">{children}</div>
      </div>
    </section>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className={`text-[18px] font-bold leading-[1.5] text-text-primary md:text-[20px] ${HEADING_WRAP}`}>{children}</h3>
  );
}

function Scroll({ label, children }: { label: string; children: React.ReactNode }) {
  // 表が幅より広いときだけ、この枠の中で横に動く（ページ全体は動かさない）
  return (
    <div
      className="overflow-x-auto rounded-container border border-border-medium bg-bg-primary"
      tabIndex={0}
      role="region"
      aria-label={label}
    >
      {children}
    </div>
  );
}

const TH = 'bg-bg-secondary px-4 py-3 text-left text-sm font-medium text-text-primary';
const TD = 'border-t border-border-medium px-4 py-3 align-top text-sm leading-[1.6] text-text-secondary';

const VARIANTS = ['primary', 'secondary', 'outline', 'ghost', 'link', 'destructive', 'success', 'warning', 'info'] as const;
const SIZES = ['xs', 'sm', 'md', 'lg'] as const;

const TYPE_ROLES = [
  { role: 'display', use: 'トップのヒーローの h1', size: '28 → 40 → 48px', weight: '400〜600', lh: '1.35', font: 'font-heading（明朝）' },
  { role: 'title', use: '公開ページの h1', size: '28 → 36px', weight: '500', lh: '1.4', font: 'font-heading（明朝）' },
  { role: 'section', use: 'h2', size: '24 → 32px', weight: '500', lh: '1.4', font: '公開ページは font-heading。画面の部品は sans の 700' },
  { role: 'subsection', use: 'h3', size: '18 → 20px', weight: '700', lh: '1.5', font: 'sans（ゴシック）' },
  { role: 'body', use: '本文', size: '15 → 16px', weight: '400', lh: '1.8', font: 'sans（ゴシック）' },
  { role: 'label', use: '項目名、ボタン', size: '14px', weight: '500', lh: '1.6', font: 'sans（ゴシック）' },
  { role: 'caption', use: '注記', size: '13px', weight: '400', lh: '1.6', font: 'sans（text-muted）' },
] as const;

const AVOID: ReadonlyArray<readonly [string, string]> = [
  ['bg-gradient-* / from-* / to-*（背景・ボタン・見出し）', '単色（bg-brand、bg-bg-secondary）'],
  ['text-transparent bg-clip-text（グラデーション文字）', 'text-text-primary か text-brand'],
  ['backdrop-blur、半透明の面（ガラス風）、GlassCard', 'Card（不透明 + 細い枠）'],
  ['shadow-xl / 2xl、色つきの影', '影なし、または shadow-low / med / high'],
  ['hover:scale-* / active:scale-* / 光が走る動き', '色の変化だけ'],
  ['rounded-xl / 2xl / 3xl', 'rounded-container（8px）か rounded-element（6px）'],
  ['rounded-full のラベル（ピル）', 'Badge（四角）'],
  ['text-[#xxxxxx] / bg-[#xxxxxx]', 'トークンのクラス'],
  ['blue-* / green-* / gray-* などの標準色を部品の色に使う', 'トークン（text-text-*、bg-bg-*、bg-info など）'],
  ['絵文字をアイコン代わりに使う', 'lucide-react のアイコン'],
  ['variant="metallic" / "brixa-gradient"', 'variant="primary"'],
  ['text-primary / bg-primary（旧 primary-*、値は #5EB6AC）', 'text-brand / bg-brand'],
];

const CHEATS: ReadonlyArray<readonly [string, string]> = [
  ['主ボタンの塗り', 'bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-pressed'],
  ['ブランド色の文字・リンク', 'text-brand hover:text-brand-pressed'],
  ['淡いブランドの面', 'bg-brand-muted text-on-brand-muted'],
  ['交互の帯', 'bg-bg-secondary'],
  ['本文 / 補助 / 注記', 'text-text-primary / text-text-secondary / text-text-muted'],
  ['カードの枠 / 入力欄の枠', 'border-border-medium / border-border-strong'],
  ['装飾の細線', 'border-brand-soft'],
  ['フォーカス', 'focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'],
  ['形', 'rounded-element / rounded-container / rounded-inner'],
  ['影', 'shadow-low / shadow-med / shadow-high'],
  ['見出しの明朝', 'font-heading'],
  ['状態色', 'bg-success text-on-success / bg-success-muted text-on-success-muted（warning・error・info も同じ）'],
];

export default function DesignSystemPage() {
  const [selectValue, setSelectValue] = useState('');
  const [selectError, setSelectError] = useState('');

  const options = [
    { value: 'stand', label: 'スタンドパウチ' },
    { value: 'flat', label: '三方シール袋' },
    { value: 'gusset', label: 'ガゼット袋' },
    { value: 'old', label: '取り扱い終了の形', disabled: true },
  ];

  return (
    <div className={`${homeFontClass} bg-bg-primary font-sans text-text-primary`}>
      {/* 冒頭 */}
      <header className="bg-bg-primary py-16 md:py-24">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-medium text-text-brand">Epackage Lab デザイン基準</p>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span>表示の切り替え（ライト／ダーク）</span>
              <ThemeToggle />
            </div>
          </div>
          <h1
            className={`mt-6 font-heading text-[28px] font-medium leading-[1.4] text-text-primary md:text-[36px] ${HEADING_WRAP}`}
          >
            Epackage UI 基準 v1
          </h1>
          <p className="mt-4 max-w-[40em] text-[15px] leading-[1.8] text-text-secondary md:text-base">
            コンセプトは「明るく、静かで、信頼できる」。平らな面と、細い枠線と、ブランドの 1 色で作ります。
            段のちがいは、余白と文字の大きさで見せます。
          </p>

          <div className="mt-8 flex max-w-[40em] items-start gap-4 rounded-container border border-border-medium bg-bg-secondary p-4">
            <div className="h-12 w-12 flex-shrink-0 rounded-element bg-brand" aria-hidden="true" />
            <p className="text-[15px] leading-[1.8] text-text-primary">
              ブランドの基準色は、ヘッダーの「会員登録」「今すぐ相談」ボタンの色 <Code>#3A827B</Code>
              です。白い文字を乗せて 4.51:1 あります。
            </p>
          </div>

          <p className="mt-6 max-w-[40em] text-sm leading-[1.8] text-text-muted">
            正本は <Code>src/styles/DESIGN_STANDARD.md</Code>。色の名前と考え方は{' '}
            <a
              href="https://github.com/meta/astryx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline underline-offset-4 hover:text-brand-pressed"
            >
              Astryx（github.com/meta/astryx）
            </a>
            を参考にしました。
          </p>

          <nav aria-label="このページの目次" className="mt-10">
            <p className="text-sm font-medium text-text-primary">もくじ</p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="inline-block rounded-inner py-1 text-[15px] text-brand underline-offset-4 hover:text-brand-pressed hover:underline"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* 1. 色 */}
      <Section
        id="color"
        tone="secondary"
        title="色"
        lead="見本の色は、すべてトークンのクラスで塗っています。ダークに切り替えると、見本の色・値・比も変わります。"
      >
        <ColorSwatches />
      </Section>

      {/* 2. 文字 */}
      <Section
        id="type"
        tone="primary"
        title="文字"
        lead="大きさは、その場で決めません。7 つの役割から選びます。見出しは明朝、それ以外はゴシックです。"
      >
        <div className="space-y-6">
          <div className="space-y-6 rounded-container border border-border-medium bg-bg-primary p-6">
            <div>
              <p className="text-[13px] text-text-muted">display</p>
              <p className={`font-heading text-[28px] font-medium leading-[1.35] md:text-[40px] lg:text-[48px] ${HEADING_WRAP}`}>
                明るく、静かで、信頼できる
              </p>
            </div>
            <div>
              <p className="text-[13px] text-text-muted">title</p>
              <p className={`font-heading text-[28px] font-medium leading-[1.4] md:text-[36px] ${HEADING_WRAP}`}>
                小ロットから、はじめての パウチづくり
              </p>
            </div>
            <div>
              <p className="text-[13px] text-text-muted">section</p>
              <p className={`font-heading text-[24px] font-medium leading-[1.4] md:text-[32px] ${HEADING_WRAP}`}>
                ご注文までの流れ
              </p>
            </div>
            <div>
              <p className="text-[13px] text-text-muted">subsection</p>
              <p className={`text-[18px] font-bold leading-[1.5] md:text-[20px] ${HEADING_WRAP}`}>デザインデータの入稿方法</p>
            </div>
            <div>
              <p className="text-[13px] text-text-muted">body</p>
              <p className="max-w-[40em] text-[15px] leading-[1.8] md:text-base">
                本文は 1 行を全角 40 字までにします。行の高さを 1.8 にして、長い文章でも目が迷わないようにします。
              </p>
            </div>
            <div>
              <p className="text-[13px] text-text-muted">label</p>
              <p className="text-sm font-medium leading-[1.6]">お名前（必須）</p>
            </div>
            <div>
              <p className="text-[13px] text-text-muted">caption</p>
              <p className="text-[13px] leading-[1.6] text-text-muted">納期は、データの確認後にお知らせします。</p>
            </div>
          </div>

          <Scroll label="文字の 7 つの役割の表">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr>
                  <th className={TH}>役割</th>
                  <th className={TH}>使う場所</th>
                  <th className={TH}>大きさ（スマホ → PC）</th>
                  <th className={TH}>太さ</th>
                  <th className={TH}>行の高さ</th>
                  <th className={TH}>書体</th>
                </tr>
              </thead>
              <tbody>
                {TYPE_ROLES.map((r) => (
                  <tr key={r.role}>
                    <td className={`${TD} font-medium text-text-primary`}>{r.role}</td>
                    <td className={TD}>{r.use}</td>
                    <td className={TD}>{r.size}</td>
                    <td className={TD}>{r.weight}</td>
                    <td className={TD}>{r.lh}</td>
                    <td className={TD}>{r.font}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Scroll>

          <div>
            <H3>日本語の見出しの折り返し</H3>
            <p className="mt-2 max-w-[40em] text-[15px] leading-[1.8] text-text-secondary">
              見出しには <Code>[word-break:keep-all] [overflow-wrap:anywhere]</Code>{' '}
              を付けます。ことばのまとまりを守って、次の行へ送ります。
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-container border border-border-medium bg-bg-primary p-4">
                <Badge variant="success">
                  <Check className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                  良い例：keep-all あり
                </Badge>
                <p
                  className={`mt-3 max-w-[11em] font-heading text-[20px] font-medium leading-[1.5] ${HEADING_WRAP}`}
                >
                  スタンドパウチを 小ロットから 最短 2 週間で お届けします
                </p>
              </div>
              <div className="rounded-container border border-border-medium bg-bg-primary p-4">
                <Badge variant="error">
                  <X className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                  悪い例：なにも付けない
                </Badge>
                <p className="mt-3 max-w-[11em] font-heading text-[20px] font-medium leading-[1.5]">
                  スタンドパウチを 小ロットから 最短 2 週間で お届けします
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-[40em] text-sm leading-[1.8] text-text-muted">
              使わないもの：グラデーション文字、英字の全大文字の小ラベル、<Code>tracking-widest</Code>、0.02em を超える字間。
              太字は、見出しとラベルだけに使います。
            </p>
          </div>
        </div>
      </Section>

      {/* 3. ボタン */}
      <Section
        id="button"
        tone="secondary"
        title="ボタン"
        lead="9 つの variant と 4 つの size。1 つのまとまりに、主ボタン（primary）は 1 つだけです。"
      >
        <div className="space-y-10">
          <div>
            <H3>variant × size</H3>
            <div className="mt-4">
              <Scroll label="ボタンの variant と size の一覧">
                <table className="w-full min-w-[640px] border-collapse">
                  <thead>
                    <tr>
                      <th className={TH}>variant</th>
                      {SIZES.map((s) => (
                        <th key={s} className={TH}>
                          {s}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {VARIANTS.map((v) => (
                      <tr key={v}>
                        <td className={`${TD} font-medium text-text-primary`}>{v}</td>
                        {SIZES.map((s) => (
                          <td key={s} className={`${TD} align-middle`}>
                            <Button variant={v} size={s}>
                              ボタン
                            </Button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Scroll>
            </div>
            <p className="mt-3 max-w-[40em] text-sm leading-[1.8] text-text-muted">
              高さは xs 32px（管理画面の密な表だけ）/ sm 36px / md 40px（スマホは 44px）/ lg 48px。
              destructive・success・warning・info は、削除や確認など、状態を伝える操作だけに使います。
            </p>
          </div>

          <div>
            <H3>状態</H3>
            <div className="mt-4 flex flex-wrap items-center gap-4 rounded-container border border-border-medium bg-bg-primary p-6">
              <div className="flex flex-col items-start gap-2">
                <Button variant="secondary">通常</Button>
                <span className="text-[13px] text-text-muted">通常</span>
              </div>
              <div className="flex flex-col items-start gap-2">
                <Button variant="secondary" disabled>
                  無効
                </Button>
                <span className="text-[13px] text-text-muted">無効（不透明度 50%）</span>
              </div>
              <div className="flex flex-col items-start gap-2">
                <Button variant="secondary" loading loadingText="送信中">
                  送信
                </Button>
                <span className="text-[13px] text-text-muted">読み込み中（大きさは変わらない）</span>
              </div>
            </div>
            <p className="mt-3 max-w-[40em] text-sm leading-[1.8] text-text-muted">
              ホバーと押した状態は、色だけが変わります（brand → brand-hover → brand-pressed）。
              フォーカスは、2px のリングです。Tab キーで確かめられます。
            </p>
          </div>

          <div>
            <H3>アイコンつき</H3>
            <div className="mt-4 flex flex-wrap items-center gap-4 rounded-container border border-border-medium bg-bg-primary p-6">
              <Button variant="secondary" icon={<Download className="h-4 w-4" aria-hidden="true" />}>
                資料をダウンロード
              </Button>
              <Button variant="outline" icon={<Search className="h-4 w-4" aria-hidden="true" />}>
                商品を探す
              </Button>
              <Button variant="ghost" icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />} iconPosition="right">
                くわしく見る
              </Button>
              <Button variant="destructive" icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}>
                削除する
              </Button>
            </div>
          </div>

          <div>
            <H3>主ボタンは 1 つのまとまりに 1 つ</H3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-container border border-border-medium bg-bg-primary p-6">
                <Badge variant="success">
                  <Check className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                  良い例
                </Badge>
                <p className="mt-3 text-base font-bold text-text-primary">お見積りの確認</p>
                <p className="mt-1 text-sm leading-[1.6] text-text-secondary">いちばん大事な操作だけを、主ボタンにします。</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button variant="primary">見積りを依頼する</Button>
                  <Button variant="secondary">戻る</Button>
                </div>
              </div>
              <div className="rounded-container border border-border-medium bg-bg-primary p-6">
                <Badge variant="error">
                  <X className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                  悪い例（図で説明）
                </Badge>
                <p className="mt-3 text-sm leading-[1.8] text-text-secondary">
                  ひとつのまとまりに、主ボタンが 3 つ並ぶと、どれを押すのかわかりません。
                  下の図の「主」は、主ボタンのことです。
                </p>
                <div className="mt-4 flex flex-wrap gap-3" aria-hidden="true">
                  {['主', '主', '主'].map((t, i) => (
                    <div
                      key={i}
                      className="flex h-10 w-20 items-center justify-center rounded-element border border-dashed border-border-strong text-sm text-text-secondary"
                    >
                      {t}
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[13px] leading-[1.6] text-text-muted">
                  例外：ヘッダーの「会員登録」と「今すぐ相談」は、基準色の出どころなので、2 つとも主ボタンです。
                </p>
              </div>
            </div>
          </div>

          <div>
            <H3>廃止した variant</H3>
            <p className="mt-2 max-w-[40em] text-[15px] leading-[1.8] text-text-secondary">
              <Code>metallic</Code> と <Code>brixa-gradient</Code> は廃止です。見本は出しません。かわりに{' '}
              <Code>primary</Code> を使います。
            </p>
          </div>
        </div>
      </Section>

      {/* 4. 入力 */}
      <Section
        id="input"
        tone="primary"
        title="入力"
        lead="ラベルは、かならず上に置きます。枠は 3:1 の濃さ。エラーは、アイコンとメッセージで伝えます。"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Card variant="default" size="md">
            <H3>通常</H3>
            <div className="mt-4 space-y-4">
              <Input label="お名前" placeholder="例：山田 太郎" />
              <Select
                label="袋の種類"
                options={options}
                value={selectValue}
                onChange={setSelectValue}
                placeholder="選んでください"
              />
              <Textarea label="ご相談の内容" placeholder="サイズ、数量、ご希望の納期など" />
            </div>
            <p className="mt-4 text-[13px] leading-[1.6] text-text-muted">
              フォーカスしたときは、2px のブランド色のリングが出ます（枠の色もブランド色に変わります）。
              Tab キーで、いずれかの欄に移って確かめてください。
            </p>
          </Card>

          <Card variant="default" size="md">
            <H3>エラー</H3>
            <div className="mt-4 space-y-4">
              <Input label="メールアドレス" defaultValue="taro@example" error="メールアドレスの形式で入力してください" />
              <Select
                label="袋の種類"
                options={options}
                value={selectError}
                onChange={setSelectError}
                placeholder="選んでください"
                error="袋の種類を選んでください"
              />
              <Textarea label="ご相談の内容" variant="error" error="ご相談の内容を入力してください" />
            </div>
          </Card>

          <Card variant="default" size="md" className="md:col-span-2">
            <H3>無効</H3>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Input label="お名前" defaultValue="山田 太郎" disabled />
              <Select label="袋の種類" options={options} value="stand" disabled />
              <Textarea label="ご相談の内容" defaultValue="入力できません" disabled />
            </div>
          </Card>
        </div>
      </Section>

      {/* 5. カード・バッジ・アラート */}
      <Section
        id="card"
        tone="secondary"
        title="カード・バッジ・アラート"
        lead="カードは、操作やデータを持つときだけ使います。余白と揃えで区切れるところに、枠を足しません。"
      >
        <div className="space-y-10">
          <div>
            <H3>Card</H3>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Card variant="default" size="md">
                <p className="text-base font-bold text-text-primary">置いてあるカード</p>
                <p className="mt-2 text-sm leading-[1.6] text-text-secondary">不透明 + 細い枠線。影はありません。（default）</p>
              </Card>
              <Card variant="interactive" size="md" tabIndex={0}>
                <p className="text-base font-bold text-text-primary">操作できるカード</p>
                <p className="mt-2 text-sm leading-[1.6] text-text-secondary">
                  ホバーで、枠が濃くなり、影が low になります。（interactive）
                </p>
              </Card>
              <Card variant="brixa" size="md">
                <p className="flex items-center gap-2 text-base font-bold text-text-primary">
                  <Check className="h-5 w-5 text-brand" aria-hidden="true" />
                  選ばれた状態
                </p>
                <p className="mt-2 text-sm leading-[1.6] text-text-secondary">
                  ブランド色の枠と、淡い面。チェックと言葉でも伝えます。（brixa）
                </p>
              </Card>
            </div>
            <p className="mt-3 max-w-[40em] text-sm leading-[1.8] text-text-muted">
              余白は 24px（密なときは 16px）。角は rounded-container（8px）です。
            </p>
          </div>

          <div>
            <H3>Badge</H3>
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-container border border-border-medium bg-bg-primary p-6">
              <Badge variant="secondary">下書き</Badge>
              <Badge variant="default">おすすめ</Badge>
              <Badge variant="success">完了</Badge>
              <Badge variant="warning">確認待ち</Badge>
              <Badge variant="error">エラー</Badge>
              <Badge variant="info">新規</Badge>
              <Badge variant="outline">タグ</Badge>
            </div>
            <p className="mt-3 max-w-[40em] text-sm leading-[1.8] text-text-muted">
              四角（rounded-inner）、13px、font-medium。状態は、かならず言葉を添えます。丸い「ピル」型は使いません。
            </p>
          </div>

          <div>
            <H3>Alert</H3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Alert variant="success" title="保存しました">
                変更内容は、すぐに反映されます。
              </Alert>
              <Alert variant="warning" title="確認してください">
                入力したサイズが、標準の範囲をこえています。
              </Alert>
              <Alert variant="destructive" title="送信できませんでした">
                通信を確かめて、もう一度お試しください。
              </Alert>
              <Alert variant="info" title="お知らせ">
                年末年始は、出荷をお休みします。
              </Alert>
            </div>
            <p className="mt-3 max-w-[40em] text-sm leading-[1.8] text-text-muted">
              淡い塗り + 全周の細い枠（状態色）+ 先頭にアイコン + 見出し + 本文。左だけの太い線は使いません。
            </p>
          </div>
        </div>
      </Section>

      {/* 6. 形 */}
      <Section
        id="shape"
        tone="primary"
        title="形"
        lead="角の丸さは、役割で決めます。全体で 1 つの性格にそろえて、状態によって形を変えません。"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: 'inner', cls: 'rounded-inner', px: '4px', use: 'チップ、サムネイル、コード' },
            { name: 'element', cls: 'rounded-element', px: '6px', use: 'ボタン、入力欄、バッジ、タブ' },
            { name: 'container', cls: 'rounded-container', px: '8px', use: 'カード、パネル、ダイアログ、ポップオーバー、アラート' },
            { name: 'full', cls: 'rounded-full', px: '完全な丸', use: 'アバター、状態の点、アイコンだけのボタン' },
          ].map((s) => (
            <div key={s.name} className="min-w-0 rounded-container border border-border-medium bg-bg-primary p-4">
              <div
                className={`flex h-20 items-center justify-center border border-border-strong bg-bg-muted text-sm text-text-primary ${s.cls}`}
                aria-hidden="true"
              >
                {s.px}
              </div>
              <p className="mt-3 text-sm font-medium text-text-primary">{s.name}</p>
              <p className="mt-0.5 text-[13px] text-text-muted">
                <Code>{s.cls}</Code>
              </p>
              <p className="mt-2 text-sm leading-[1.6] text-text-secondary">{s.use}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-[40em] text-sm leading-[1.8] text-text-muted">
          <Code>rounded-xl</Code> / <Code>2xl</Code> / <Code>3xl</Code> は旧名です。新しい作業では使いません（値は 8px にそろえてあります）。
        </p>
      </Section>

      {/* 7. 高さと動き */}
      <Section
        id="elevation"
        tone="secondary"
        title="高さ（影）と動き"
        lead="影は、浮いているものだけ。置いてあるカードは、細い枠線で区切ります。枠と影を、同じ強さで重ねません。"
      >
        <div className="space-y-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'なし', cls: '', use: '置いてあるカード、ボタン、ヘッダー（細い枠線で区切る）' },
              { name: 'low', cls: 'shadow-low', use: '少し持ち上げたいとき（操作できるカードのホバーなど）' },
              { name: 'med', cls: 'shadow-med', use: 'メニュー、ポップオーバー' },
              { name: 'high', cls: 'shadow-high', use: 'ダイアログ、ドロワー、トースト' },
            ].map((s) => (
              <div key={s.name} className="min-w-0">
                <div
                  className={`flex h-24 items-center justify-center rounded-container border border-border-medium bg-bg-primary text-sm text-text-primary ${s.cls}`}
                  aria-hidden="true"
                >
                  {s.name}
                </div>
                <p className="mt-3 text-sm font-medium text-text-primary">
                  {s.name}
                  {s.cls && (
                    <>
                      {' '}
                      <Code>{s.cls}</Code>
                    </>
                  )}
                </p>
                <p className="mt-1 text-sm leading-[1.6] text-text-secondary">{s.use}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-container border border-border-medium bg-bg-primary p-6">
              <H3>使ってよい動き</H3>
              <ul className="mt-3 space-y-2 text-[15px] leading-[1.8] text-text-secondary">
                {[
                  '色・背景色・枠線の色・透明度の変化（150〜300ms）',
                  '開く・閉じるの動き',
                  'トップのスライド演出（導入ずみ）',
                  '読み込み中の表示（回るスピナーなど）',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Check className="mt-1.5 h-4 w-4 flex-shrink-0 text-success" aria-hidden="true" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-container border border-border-medium bg-bg-primary p-6">
              <H3>使わない動き</H3>
              <ul className="mt-3 space-y-2 text-[15px] leading-[1.8] text-text-secondary">
                {[
                  'ホバーでの拡大',
                  '押したときの縮み',
                  '光が走る動き',
                  '操作と関係のない、跳ねる・脈打つ動き',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <X className="mt-1.5 h-4 w-4 flex-shrink-0 text-error" aria-hidden="true" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="max-w-[40em] text-sm leading-[1.8] text-text-muted">
            <Code>prefers-reduced-motion</Code> を守ります。フォーカスは、全体の設定で 2px のリングです。
          </p>
        </div>
      </Section>

      {/* 8. 使わないもの */}
      <Section
        id="avoid"
        tone="primary"
        title="使わないもの"
        lead="左は、もう使いません。右を使ってください。実物は描きません。"
      >
        <Scroll label="使わないものと、かわりに使うものの表">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th className={TH}>使わない</th>
                <th className={TH}>かわりに</th>
              </tr>
            </thead>
            <tbody>
              {AVOID.map(([bad, good]) => (
                <tr key={bad}>
                  <td className={TD}>
                    <span className="inline-flex items-start gap-2">
                      <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-error" aria-hidden="true" />
                      <code className="font-mono text-[13px] text-text-primary [overflow-wrap:anywhere]">{bad}</code>
                    </span>
                  </td>
                  <td className={TD}>
                    <span className="inline-flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" aria-hidden="true" />
                      <span className="text-text-primary [overflow-wrap:anywhere]">{good}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Scroll>
      </Section>

      {/* 9. 早見表 */}
      <Section id="cheatsheet" tone="secondary" title="クラスの早見表" lead="やりたいことから、クラスを引けます。">
        <Scroll label="クラスの早見表">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th className={TH}>やりたいこと</th>
                <th className={TH}>クラス</th>
              </tr>
            </thead>
            <tbody>
              {CHEATS.map(([what, cls]) => (
                <tr key={what}>
                  <td className={`${TD} text-text-primary`}>{what}</td>
                  <td className={TD}>
                    <code className="font-mono text-[13px] text-text-primary [overflow-wrap:anywhere]">{cls}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Scroll>
        <p className="mt-6 max-w-[40em] text-sm leading-[1.8] text-text-muted">
          <Code>bg-brand/10</Code> のような透明度の指定はできません（値が CSS 変数のため）。淡い色は <Code>-muted</Code> /{' '}
          <Code>-subtle</Code> を使います。
        </p>
      </Section>
    </div>
  );
}
