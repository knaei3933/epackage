# Epackage UI 基準 v1

最終更新: 2026-11-19
正本: このファイル。色の値の実体は `src/app/globals.css`、クラス名は `tailwind.config.ts`。
旧 `COLOR_SYSTEM.md` と食い違うときは、このファイルを優先する。

## 1. なぜ作ったか

画面ごとに「ブランドの緑」が違っていた。

| 場所 | 実際の色 |
|---|---|
| ヘッダーの「会員登録」「今すぐ相談」 | `#47A39A` から `#2D6C65` へのグラデーション（見た目の中間は `#3A827B`） |
| トップのヒーローのボタン | 単色の `#2D6C65`（ヘッダーより暗い） |
| 右下のチャット部品 | `#5EB6AC`（明るいミント） |
| 業界ページ | まったく別の鮮やかな緑 |

旧 `COLOR_SYSTEM.md` は「`#5EB6AC` がメインのブランド色」と書いていたが、`#5EB6AC` は白文字で 2.40:1 しかなく、ボタンには使えない。実際に使われていた色が正しかった。

**ブランドの基準色は、ヘッダーの「会員登録」「今すぐ相談」ボタンの色 `#3A827B` とする。**
根拠は 3 つ。(1) ボタンの見た目の中間色がこの値。(2) ヘッダーの「ログイン」の文字色もこの値。(3) 元の `.btn-primary`（`globals.css`）も、この値の単色だった。白い文字で 4.51:1 あり、基準の 4.5:1 を満たす。

考え方と色の名前の文法は、[Astryx](https://github.com/meta/astryx)（Meta 製・MIT・Beta）に合わせた。パッケージは入れていない。理由は 8 章。

## 2. コンセプト

**「明るく、静かで、信頼できる」**

平らな面、細い枠線、ブランドの 1 色。階層は、余白と文字の大きさでつくる。グラデーション、ガラス風、影、光る動きでは作らない。

| # | 原則 | Astryx の対応 |
|---|---|---|
| 1 | ブランド色は 1 色で、意味も 1 つ（「ここを押す」「ここが選ばれている」）。1 つのまとまりに主ボタンは 1 つ | color-emphasis DR3 |
| 2 | 箱より先に余白。まとまりは、余白と揃えでつくる。カードは、操作やデータを持つときだけ | spatial-hierarchy DR3 |
| 3 | 影は「浮いているもの」だけ。置いてあるカードは細い枠線だけ。枠と影を同じ強さで重ねない | elevation-hierarchy DR2, DR3 |
| 4 | 形は役割で決める（6 章）。全体で 1 つの性格にそろえる | shape-relationships DR1, DR3 |
| 5 | 文字は役割で決める（4 章）。その場で大きさを決めない | typography-hierarchy DR1 |
| 6 | 同じ行の部品は同じ高さ。見た目が小さくても、スマホで押せる範囲は 44px 以上 | control-rhythm DR1, DR4 |
| 7 | 動きには意味を。色と透明度の変化だけ。拡大、光の走り、跳ねる動きは使わない | motion |
| 8 | 読めて、押せること。文字 4.5:1、部品の枠 3:1、フォーカスは常に見える。状態を色だけで伝えない | color-emphasis DR4, DR7 |

## 3. 色

### 3.1 ブランド

| トークン | 値 | 使う場所 | 確認した比 |
|---|---|---|---|
| `--color-brand` | `#3A827B` | 主ボタン、選ばれた状態の塗り | 白文字 4.51:1 |
| `--color-brand-hover` | `#2D6C65` | ホバーの塗り | 白文字 6.10:1 |
| `--color-brand-pressed` | `#235954` | 押した状態の塗り | 白文字 7.99:1 |
| `--color-brand-muted` | `#E1F6F4` | 淡い塗り（選択した行、お知らせの帯）。文字は `on-brand-muted` | 9.50:1 |
| `--color-brand-subtle` | `#F0FBFA` | ghost・outline のホバー背景 | - |
| `--color-brand-soft` | `#5EB6AC` | **装飾の細線と大きな淡い面だけ**。文字・ボタンには使わない | 白の上で 2.40:1 |
| `--color-on-brand` | `#FFFFFF` | ブランドの塗りの上の文字 | - |
| `--color-text-brand` | `#2D6C65` | ブランド色の文字・リンク | 白 6.10 / Mist 5.70 / 淡い塗り 5.43 |
| `--color-ring` | `#3A827B` | フォーカスリング | 白 4.51（必要 3.0） |

> 塗りの `brand`（4.51:1）は、淡い面の上の文字としては足りない（Mist の上で 4.21:1）。だから文字には、別の `text-brand`（`#2D6C65`）を使う。Astryx が `--color-accent` と `--color-text-accent` を分けているのと同じ考え方。

### 3.2 文字・面・線

| トークン | 値 | 使う場所 | 比（白の上） |
|---|---|---|---|
| `--color-text-primary` | `#2F333D` | 本文、見出し | 12.64 |
| `--color-text-secondary` | `#545D66` | 補助の説明 | 6.70 |
| `--color-text-muted` | `#636D77` | 注記、日付、プレースホルダー | 5.27（Mist 4.92） |
| `--color-text-disabled` | `#9CA3AF` | **無効状態の文字だけ** | 2.54（対象外） |
| `--color-background-body` / `-surface` | `#FFFFFF` | ページ、カード | - |
| `--color-background-muted` | `#F4F8F7` | 交互の帯、表の見出し、フッター（「Mist」） | - |
| `--color-background-subtle` | `#EEF3F2` | ホバーの行、チップ | - |
| `--color-background-inverted`（`bg-bg-inverted`） | `#2F333D` | 紺の帯。**ページ末尾の CTA の帯だけ**。文字は `text-text-inverse`（白、12.64:1）、主ボタンは基準色の `bg-brand`（白文字 4.51:1）。ほかの場所では使わない | 白文字 12.64 |
| `--color-border` | `#E2E8E6` | 区切り線、カードの枠（装飾） | 1.24 |
| `--color-border-emphasized` | `#C9D3D0` | 強めの区切り | 1.53 |
| `--color-border-control` | `#7A858F` | **入力欄などの枠**。唯一の境界の手がかりなので 3:1 が必要 | 3.76 |

### 3.3 状態色

塗りは白文字で 4.5:1 以上。文字として使うときも `DEFAULT` を使う。状態は、色だけで伝えない（アイコンか言葉を必ず添える）。

| 状態 | 塗り・文字 | 淡い塗り | 淡い塗りの上の文字 | 白文字の比 |
|---|---|---|---|---|
| success | `#047857` | `#ECFDF5` | `#065F46` | 5.48 |
| warning | `#B45309` | `#FFFBEB` | `#92400E` | 5.02 |
| error | `#B91C1C` | `#FEF2F2` | `#991B1B` | 6.47 |
| info | `#1D4ED8` | `#EFF6FF` | `#1E40AF` | 6.70 |

### 3.4 ルール

- ブランド以外の「緑・青緑」を新しく作らない。業界・商品ごとの色分けもしない（アイコンと写真で分ける）。
- 1 つのまとまり（ヒーロー、フォーム、カードの行）に、主ボタン（`primary`）は 1 つだけ。
  **例外**: ヘッダーの「会員登録」と「今すぐ相談」。基準色の出どころなので、2 つとも主ボタンにする。
- 文字色: 本文 `text-text-primary`、補助 `text-text-secondary`、注記 `text-text-muted`、ブランド文字・リンク `text-brand`。
- 薄い灰色（`#9CA3AF` など）の文字は、無効状態だけ。
- 色の値を `className` に直接書かない（`text-[#2D6C65]` は不可）。トークンのクラスを使う。
- 暗い写真の上に文字を置くときだけ、単色の暗い幕（`bg-black/50` など）を敷いてよい。

## 4. 文字

| 役割 | 使う場所 | 大きさ（スマホ → PC） | 太さ | 行の高さ | 書体 |
|---|---|---|---|---|---|
| display | トップのヒーローの h1 | 28 → 40 → 48px | 400〜600 | 1.35 | `font-heading` |
| title | 公開ページの h1 | 22〜28 → 36px（スマホは画面幅の 6.4%。375px で 24px、437px 以上で 28px） | 500 | 1.4 | `font-heading` |
| section | h2 | 24 → 32px | 500 | 1.4 | 公開ページは `font-heading`、画面の部品は sans の 700 |
| subsection | h3 | 18 → 20px | 700 | 1.5 | sans |
| body | 本文 | 15 → 16px | 400 | 1.8 | sans |
| label | 項目名、ボタン | 14px | 500 | 1.6 | sans |
| caption | 注記 | 13px | 400 | 1.6 | sans（`text-text-muted`） |

- 書体: `font-sans`（Noto Sans JP → Hiragino Sans → Yu Gothic）、`font-heading`（Shippori Mincho B1 → Hiragino Mincho ProN → Yu Mincho → serif）。
  明朝は `src/components/home/fonts.ts` が読み込む（変数 `--font-heading`）。読み込んだ範囲の外では、明朝系のシステム書体になる。
- h1 は 1 ページに 1 つ。見出しは `[word-break:keep-all] [overflow-wrap:anywhere]` で、語の途中で切らない。
  日本語は語の切れ目が空白で示されないので、`keep-all` だけでは行末で機械的に切れる（「パッケージ／ング」）。
  文節の切れ目で改行するため、`supports-[word-break:auto-phrase]:[word-break:auto-phrase]` と `text-balance` を足す（Chrome 系。使えないブラウザでは `keep-all` のまま）。`PageHeader` と `AuthShell` の h1 は、これを含んでいる。
  スマホの文字は `text-[length:clamp(1.375rem,6.4vw,1.75rem)]`。14 字の長いカタカナ語（パッケージングソリューション）が、343px の幅に 1 行で入るようにしてある。
  それでも、カタカナの複合語の中は、ブラウザが見分けられない。長い複合語の前には、改行してよい位置 `<wbr />` を置く（例: `industry/HeaderSection.tsx` の `breakBeforeLongWords`）。表示される文字は変わらない。
- 本文の 1 行は、全角で 40 字（`max-w-[40em]`）まで。
- 使わない: グラデーション文字、英字の全大文字の小ラベル、`tracking-widest`、0.02em を超える字間。
- 太字は、見出しとラベルだけ。

## 5. 間隔とレイアウト

- 基本の単位は 4px（Tailwind の標準どおり）。
- 近いものは近く、別のものは遠く。**部品の中 8px → まとまりの間 16〜24px → セクションの間 64〜96px**。
- 本文の幅: `max-w-[1120px] px-4 sm:px-6`。
- セクションの上下: `py-16 md:py-24`。交互の帯は `bg-bg-primary` と `bg-bg-secondary`（Mist）。
- セクションの見出し: h2 + 必要なら導入文（`max-w-[40em]`）。内容との間は 32〜48px。
- 余白と揃えで区切れるところに、カードの枠を足さない。

## 6. 形

| 役割 | クラス | 値 | 使う場所 |
|---|---|---|---|
| inner | `rounded-inner`（= `rounded`） | 4px | チップ、サムネイル、コード |
| element | `rounded-element`（= `rounded-md`） | 6px | ボタン、入力欄、バッジ、タブ |
| container | `rounded-container`（= `rounded-lg`） | 8px | カード、パネル、ダイアログ、ポップオーバー、アラート |
| full | `rounded-full` | - | アバター、状態の点、アイコンだけのボタン |

- `rounded-xl` / `2xl` / `3xl` は旧名。新しい作業では使わない（値は 8px に揃えてある）。
- 状態（ホバー、フォーカス、選択）で、角の形を変えない。

## 7. 高さ（影）・動き

### 影

| 段階 | クラス | 値 | 使う場所 |
|---|---|---|---|
| なし | - | - | **置いてあるカード、ボタン、ヘッダー**（細い枠線で区切る） |
| low | `shadow-low`（= `shadow-sm`） | `0 1px 2px` 6% | 少し持ち上げたいとき（操作できるカードのホバーなど） |
| med | `shadow-med`（= `shadow-md`） | `0 2px 8px` 8% | メニュー、ポップオーバー |
| high | `shadow-high`（= `shadow-lg`） | `0 6px 20px` 10% | ダイアログ、ドロワー、トースト |

`shadow-xl` / `2xl` は旧名。色つきの影（`shadow-brixa-500/30` など）は使わない。

### 動き

- 使ってよい: `color` / `background-color` / `border-color` / `opacity` の変化（150〜300ms）。開閉の動き。トップのスライド演出（導入ずみ）。
- 使わない: ホバーで拡大（`hover:scale-*`）、押したときの縮み（`active:scale-*`）、光が走る動き、操作と関係のない跳ねる・脈打つ動き（読み込み中の表示は可）。
- `prefers-reduced-motion` を守る。

### フォーカス

`:focus-visible` は、全体の設定で 2px のリング（`--color-ring`）。部品では `focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2`。

## 8. 部品の決まり

### Button（`src/components/ui/Button.tsx`）

| variant | 見た目 | 使う場面 |
|---|---|---|
| `primary` | 塗り `bg-brand` + 白文字。ホバー `brand-hover`、押下 `brand-pressed` | そのまとまりのいちばん大事な操作（1 つだけ） |
| `secondary` | 白地 + 1px `border-border-strong` + 文字 `text-text-primary`。ホバーで Mist | 中立の操作（キャンセル、戻る、絞り込み） |
| `outline` | 透明 + 1px `border-brand` + 文字 `text-brand`。ホバーで `brand-subtle` | ブランド色の副次操作 |
| `ghost` | 枠なし + 文字 `text-brand`。ホバーで `brand-subtle` | 目立たせない操作 |
| `link` | 文字 `text-brand` + 下線（ホバー） | 文中のリンク風の操作 |
| `destructive` / `success` / `warning` / `info` | 状態色の塗り + 白文字 | 削除・確認など、状態を伝える操作だけ |

- 影、グラデーション、光る動き、拡大は付けない。
- 高さ: `sm` 36px / `md` 40px（スマホは 44px）/ `lg` 48px。`xs` は管理画面の密な表だけ（32px）。文字は 14px（`lg` は 16px）。
- 角: `rounded-element`。
- `metallic` と `brixa-gradient` は廃止。型には残してあり、`primary` と同じ見た目で表示される。`Badge` / `Card` / `Input` の `metallic` も同じ扱い（`Badge` の呼び出しは `default` に置き換えずみ）。
- 無効は不透明度 50%。読み込み中は、大きさを変えずにスピナーを出す。
- アイコンは `icon` プロップに渡す（右側は `iconPosition="right"`）。子に直接置いた svg も、文字と同じ行に出る（余白は `mr-2` / `ml-2`）。
- リンクをボタンの見た目にするときは、`<Link className={buttonVariants({ variant, size })}>` にする。`<Link><Button>…</Button></Link>` の入れ子にしない（押せる範囲が `a` と `button` に分かれ、スマホの 44px も測れなくなる）。

### 入力欄（Input / Select / Textarea）

高さ 40px（スマホ 44px）、`rounded-element`、枠は `border-border-strong`（3:1）。フォーカスは `ring-2 ring-brand`。エラーは `border-error` とメッセージ（アイコン付き）。ラベルは必ず上に置く。プレースホルダーは `text-text-muted`。

### Card

`bg-bg-primary` + `border border-border-medium` + `rounded-container`。影なし。余白は 24px（密なときは 16px）。操作できるカードは、ホバーで `border-border-dark` + `shadow-low`。選ばれた状態は `border-brand` + `bg-brand-subtle`。

### Badge

四角（`rounded-inner`）、13px、`font-medium`。中立 `bg-bg-muted text-text-secondary`、ブランド `bg-brand-muted text-on-brand-muted`、状態 `bg-<状態>-muted text-on-<状態>-muted`（言葉を必ず添える）。丸い「ピル」型は使わない。

### Alert

淡い塗り + 全周の細い枠（状態色）+ 先頭にアイコン + 見出し + 本文。左だけの太い線は使わない。

### ヘッダー・フッター・チャット

- ヘッダー: 高さ 64px、白の単色、下に細い枠線。影とぼかし（`backdrop-blur`）は使わない。「ログイン」は `ghost`、「会員登録」「今すぐ相談」は `primary`（`sm`）。
- フッター: Mist の面 + 上に `brand-soft` の細線。リンクは `text-brand`。
- チャット部品: `bg-brand` + 白いアイコン。

### ページの型（公開ページ）

- **ページの頭 = `PageHeader`**（`import { PageHeader, FactList } from '@/components/layout'`）。
  - 中身は、タイトル（h1。`font-heading`）、導入文（`max-w-[40em]`）、操作（2 つまで。主ボタンは 1 つ）、必要なら `FactList`（数字や事実の行）。
  - 面は Mist の単色（既定）か、白（`tone="plain"`）。左そろえ。
  - パンくずは、全ページ共通の `BreadcrumbNav` が出す。ページの頭の中に重ねて作らない。
  - 使わない: グラデーション、写真や色の重ね、ガラス風、丸いラベル（ピル）、中央そろえの大きなタイトル、絵文字、ページごとの別の色。
- **セクション**: 5 章のとおり（`py-16 md:py-24`、`bg-bg-primary` と `bg-bg-secondary` を交互に）。
- **カード**: `Card`（細い枠 + `rounded-container`、影なし）。操作できるカードだけ、ホバーで `shadow-low`。画像は `rounded-inner`。
- **分類のラベル**: `Badge`（四角）。丸いピルは使わない。
- **アイコン**: `lucide-react`。絵文字は使わない。色は `text-brand` か文字色。業界・商品ごとに色を変えない（区別は、アイコンの形と写真で行う）。
- **ボタン**: 主 = `Button variant="primary"`。副 = `variant="outline"`（または下線つきのテキストリンク）。半透明の白、すりガラス、白抜きのボタンは使わない。
- **紺の帯**: ページ末尾の CTA だけ（3.2 章）。
- **ヒーロー（トップだけ）**: display の h1 + 写真 + 主ボタン 1 つ。

## 9. 使わないもの（置き換え表）

| 使わない | 代わりに |
|---|---|
| `bg-gradient-*` / `from-*` / `to-*`（背景・ボタン・見出し） | 単色（`bg-brand`、`bg-bg-secondary`） |
| `text-transparent bg-clip-text`（グラデーション文字） | `text-text-primary` か `text-brand` |
| `backdrop-blur`、半透明の面（ガラス風）、`GlassCard` | `Card`（不透明 + 細い枠） |
| `shadow-xl` / `2xl`、色つきの影 | 影なし、または `shadow-low/med/high` |
| `hover:scale-*` / `active:scale-*` / 光が走る動き | 色の変化だけ |
| `rounded-xl` / `2xl` / `3xl` | `rounded-container`（8px）か `rounded-element`（6px） |
| `rounded-full` のラベル（ピル） | `Badge`（四角） |
| `text-[#xxxxxx]` / `bg-[#xxxxxx]` | トークンのクラス |
| `blue-*` `green-*` `gray-*` などの標準色を部品の色に使う | トークン（`text-text-*`、`bg-bg-*`、`bg-info` など） |
| 絵文字をアイコン代わりに使う | `lucide-react` のアイコン |
| `variant="metallic"` / `"brixa-gradient"` | `variant="primary"` |
| `text-primary` / `bg-primary`（旧 `primary-*`、値は `#5EB6AC`） | `text-brand` / `bg-brand` |

## 10. クラスの早見表

| やりたいこと | クラス |
|---|---|
| 主ボタンの塗り | `bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-pressed` |
| ブランド色の文字・リンク | `text-brand hover:text-brand-pressed` |
| 淡いブランドの面 | `bg-brand-muted text-on-brand-muted` |
| 交互の帯 | `bg-bg-secondary` |
| 本文 / 補助 / 注記 | `text-text-primary` / `text-text-secondary` / `text-text-muted` |
| カードの枠 / 入力欄の枠 | `border-border-medium` / `border-border-strong` |
| 装飾の細線 | `border-brand-soft` |
| フォーカス | `focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2` |
| 形 | `rounded-element` / `rounded-container` / `rounded-inner` |
| 影 | `shadow-low` / `shadow-med` / `shadow-high` |
| 見出しの明朝 | `font-heading` |
| 紺の帯（ページ末尾の CTA だけ） | `bg-bg-inverted text-text-inverse` |
| 無効状態の文字 | `text-text-disabled` |
| 状態色 | `bg-success text-on-success` / `bg-success-muted text-on-success-muted`（warning・error・info も同じ） |

`bg-brand/10` のような透明度の指定はできない（値が CSS 変数のため）。**書いても CSS が作られず、効果が黙って消える**（実際に、チャットのホバーが消えた）。淡い色は `-muted` / `-subtle` を使う。適合テストが検出する。

## 11. Astryx との対応と、パッケージを入れていない理由

| Astryx | このプロジェクト |
|---|---|
| `--color-accent` / `--color-on-accent` | `--color-brand` / `--color-on-brand` |
| `--color-text-accent` | `--color-text-brand` |
| `--color-text-primary` / `secondary` / `disabled` | 同名 |
| `--color-background-body` / `surface` / `muted` | 同名 |
| `--color-border` / `-emphasized` / `-control` | 同名 |
| `--color-success` `warning` `error` `info`（`-muted`、`--color-on-*`） | 同名 |
| `--radius-inner` / `element` / `container` | 同名 |
| `--shadow-low` / `med` / `high` | Tailwind は `shadow-low` / `med` / `high`（CSS は `--shadow-sm` / `md` / `lg`） |
| テーマ = CSS 変数の上書き | `globals.css` の `:root` と `.dark` の値を差し替える |

入れていない理由:

1. このプロジェクトは **Tailwind 3.4**。Astryx の公式の Tailwind 連携（`@theme reference inline`）は **Tailwind 4** の書き方。
2. Astryx はまだ Beta。StyleX、独自の reset、Theme プロバイダーが増える。
3. 既存の 31 部品（Button、Input など）と API が違う。860 か所以上の呼び出しを書き換える必要がある。

将来 Tailwind 4 に上げるときは、上の対応表で移行できる。

## 12. ブランド色を変えるとき

1. `globals.css` の `--color-brand` を決める。白文字で **4.5:1 以上** あること（計算して確かめる）。
2. `-hover`（もっと濃く）、`-pressed`、`-muted`、`-subtle`、`--color-text-brand`（淡い面の上でも 4.5:1）、`--color-ring`（3:1）を合わせる。
3. `.dark` の値と、`--brixa-primary-*` の土台も合わせる。
4. このファイルの 3.1 の表を更新する。

## 13. 適用の状況

| 範囲 | 状態 |
|---|---|
| トークン、Tailwind のクラス、この基準書 | 完了 |
| 共通部品（Button、Badge、Card、Input、Select、Textarea、Alert ほか `ui/`） | 完了 |
| ヘッダー、フッター、チャット部品、お知らせの帯 | 完了（`Layout.tsx` `Navigation.tsx` `LoadingSkeleton.tsx` の古い指定は次の段階） |
| トップページ（トークンへの置き換え、ボタンの色） | 完了 |
| `/design-system` ページ（この基準の見本） | 完了 |
| 適合テスト（`jest src/styles`。適用ずみの範囲に、透明度つきのトークン色・グラデーション・ぼかし・大きな影・色の 16 進数が入ると落ちる） | 完了。公開ページに適用を広げるたび、テストの対象（`ui-standard.test.ts` の `GOVERNED_*`）に足す |
| 公開ページ（第 2 段階の主要 26 本: `/about` `/contact`（+ thank-you）`/catalog`（+ 詳細）`/flow` `/quote-simulator`（上部）`/guide`（+ 5 つ）`/industry` 4 本 `/auth` 9 本。ページの頭は `PageHeader`） | 完了。変換した 86 ファイル（トップの 8 を含む）は、`GOVERNED_PAGE_FILES` で機械的に守る |
| 公開ページ（残り約 30 本: `/pricing` `/service` `/samples` `/blog` `/news` `/legal` `/privacy` `/terms` `/csr` `/archives` `/cart` `/compare` `/designer*` `/inquiry/detailed` ほか）と `src/components/lp/**` | 未着手 |
| 見積りシミュレーターの内部（`SpecsStep` の本体、`previews/**`、`MaterialSelection`、`PriceBreakdown`） | 未着手（色の見本として意味のある色を含むため、個別に判断する） |
| 会員・管理画面 | 共通部品と値の更新で自動的にそろう。個別の整理は未着手 |

## 14. PR のチェックリスト

- [ ] 新しい色の値を、`className` に直接書いていない（トークンを使った）
- [ ] 主ボタンは、1 つのまとまりに 1 つだけ
- [ ] グラデーション、ガラス風、`shadow-xl`、拡大、光る動きがない
- [ ] 角は `rounded-element` / `container` / `inner` のどれか
- [ ] 文字は 4.5:1、部品の枠は 3:1 以上（薄い灰色を文字に使っていない）
- [ ] 状態は、色だけで伝えていない（アイコンか言葉がある）
- [ ] フォーカスが見える。スマホで押せる範囲が 44px 以上
- [ ] ボタンの中のアイコンは `icon` プロップ。リンクをボタンの見た目にするときは `buttonVariants`（`<Link><Button>` の入れ子にしない）
- [ ] 375px 幅で横にはみ出さない。見出しが語の途中で切れない
- [ ] `/design-system` に載せる必要がある変更なら、見本も更新した
- [ ] `./node_modules/.bin/jest src/styles` が通る（基準を適用ずみの範囲を機械で守る）
- [ ] 変換した公開ページを `node scripts/check-ui-standard.js --pages <ファイル...>` にかけて、違反 0（規則は `scripts/ui-standard-rules.js`。通ったファイルは `ui-standard.test.ts` の `GOVERNED_PAGE_FILES` に足す）
