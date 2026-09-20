import {
  BAG_TYPE_OPTIONS,
  CONTENTS_TYPE_LABELS,
  MATERIAL_CATEGORIES,
  PRODUCT_SIZE_LIMITS,
} from '@/types/quote-wizard';

type ProductId = keyof typeof PRODUCT_SIZE_LIMITS;

export interface NumericBound {
  min: number | null;
  max: number | null;
}

export type QuoteFieldBounds =
  | { kind: 'options'; values: readonly string[] }
  | { kind: 'numeric'; unit: 'mm'; products: Record<ProductId, NumericBound> }
  | { kind: 'numeric'; unit: 'mm'; min: number; max: number | null }
  | { kind: 'numeric'; unit: '枚' | '個'; min: number; max: number | null }
  | {
      kind: 'conditional';
      rules: readonly {
        conditionJa: string;
        unit: 'mm' | 'm' | '枚';
        min: number | null;
        max: number | null;
        ruleJa: string;
      }[];
    }
  | { kind: 'derived' };

export interface QuoteFieldHelpItem {
  id: string;
  step: 'specs' | 'post-processing' | 'sku-quantity' | 'result';
  fieldId: string;
  labelJa: string;
  purposeJa: string;
  bounds: QuoteFieldBounds;
  exampleJa: string;
  escalationJa: string;
}

const PRODUCT_IDS = Object.keys(PRODUCT_SIZE_LIMITS) as ProductId[];

const getProductBound = (
  productId: ProductId,
  key: 'minWidth' | 'maxWidth' | 'minHeight' | 'maxHeight',
): number | null => PRODUCT_SIZE_LIMITS[productId][key];

const productWidthBounds = Object.fromEntries(
  PRODUCT_IDS.map((productId) => [
    productId,
    {
      min: getProductBound(productId, 'minWidth'),
      max: getProductBound(productId, 'maxWidth'),
    },
  ]),
) as Record<ProductId, NumericBound>;

const productHeightBounds = Object.fromEntries(
  PRODUCT_IDS.map((productId) => [
    productId,
    {
      min: getProductBound(productId, 'minHeight'),
      max: getProductBound(productId, 'maxHeight'),
    },
  ]),
) as Record<ProductId, NumericBound>;

export const QUOTE_FIELD_HELP: readonly QuoteFieldHelpItem[] = [
  {
    id: 'quote.specs.product-type',
    step: 'specs',
    fieldId: 'product-type',
    labelJa: '製品タイプ',
    purposeJa: '袋形状を選び、以降のサイズ条件と加工可否を確定します。',
    bounds: { kind: 'options', values: BAG_TYPE_OPTIONS.map((option) => option.id) },
    exampleJa: 'スタンドパウチを選択してください。',
    escalationJa: 'wantと見た目条件が競合する場合は代替袋形状を提案します。',
  },
  {
    id: 'quote.specs.contents',
    step: 'specs',
    fieldId: 'contents',
    labelJa: '内容物',
    purposeJa: '内容物の性質から必要なバリア性を判断します。',
    bounds: { kind: 'options', values: Object.keys(CONTENTS_TYPE_LABELS) },
    exampleJa: '粉体の健康食品です。',
    escalationJa: '成分や保管条件が不明な場合は安全側の仕様を確定しません。',
  },
  {
    id: 'quote.specs.width',
    step: 'specs',
    fieldId: 'width',
    labelJa: '幅',
    purposeJa: '袋の横幅を確定します。条件は製品タイプごとに異なります。',
    bounds: { kind: 'numeric', unit: 'mm', products: productWidthBounds },
    exampleJa: '幅120mmで検討してください。',
    escalationJa: 'ガゼットパウチは幅＋側面335mm以下の合算制限も確認します。',
  },
  {
    id: 'quote.specs.height',
    step: 'specs',
    fieldId: 'height',
    labelJa: '高さ（縦）',
    purposeJa: '袋の縦方向サイズを確定します。',
    bounds: { kind: 'numeric', unit: 'mm', products: productHeightBounds },
    exampleJa: '高さ200mmで検討してください。',
    escalationJa: 'スタンドパウチは高さ×2＋底が690mm以下か確認します。',
  },
  {
    id: 'quote.specs.depth-gusset',
    step: 'specs',
    fieldId: 'depth-gusset',
    labelJa: 'マチ／側面',
    purposeJa: '底マチまたは側面の厚みを確定し、自立性と容積を調整します。',
    bounds: { kind: 'derived' },
    exampleJa: 'マチ60mmで検討してください。',
    escalationJa: '製品タイプ別の合算上限は幅や高さと組み合わせて再計算します。',
  },
  {
    id: 'quote.specs.side',
    step: 'specs',
    fieldId: 'side',
    labelJa: '側面幅',
    purposeJa: 'ボックス型パウチの側面（よこめん）幅をmmで確定します。',
    bounds: {
      kind: 'conditional',
      rules: [{
        conditionJa: 'ボックス型パウチ',
        unit: 'mm',
        min: 0,
        max: null,
        ruleJa: '幅＋側面は335mm以下にします。',
      }],
    },
    exampleJa: '側面幅は50mmです。',
    escalationJa: '幅との合算が335mm以下か最終確認が必要です。',
  },
  {
    id: 'quote.specs.pitch',
    step: 'specs',
    fieldId: 'pitch',
    labelJa: 'ピッチ',
    purposeJa: 'ロールフィルムのデザイン周期（ピッチ）をmmで確定します。',
    bounds: { kind: 'numeric', unit: 'mm', min: 50, max: 1000 },
    exampleJa: '1袋あたり250mmピッチで検討します。',
    escalationJa: 'ロールフィルム以外ではピッチは入力しません。',
  },
  {
    id: 'quote.specs.material',
    step: 'specs',
    fieldId: 'material',
    labelJa: '素材',
    purposeJa: '透明性・バリア性・環境対応の方向性を選びます。',
    bounds: { kind: 'options', values: MATERIAL_CATEGORIES.map((category) => category.id) },
    exampleJa: '高バリアタイプを希望します。',
    escalationJa: '層構成と厚さは内容物条件が確定してから提案します。',
  },
  {
    id: 'quote.specs.thickness',
    step: 'specs',
    fieldId: 'thickness',
    labelJa: '厚さのタイプ',
    purposeJa: '選択した素材に対応する厚さタイプを選び、強度とコストのバランスを確定します。',
    bounds: { kind: 'derived' },
    exampleJa: '標準タイプの厚さを希望します。',
    escalationJa: '選択可能な厚さは素材ごとに変わるため、組合せを確認します。',
  },
  {
    id: 'quote.specs.printing',
    step: 'specs',
    fieldId: 'printing',
    labelJa: '印刷色数',
    purposeJa: '印刷する色数を1〜8色で確定します。色数は銅版費用に影響します。',
    bounds: { kind: 'options', values: ['1', '2', '3', '4', '5', '6', '7', '8'] },
    exampleJa: '4色印刷で検討してください。',
    escalationJa: '特色やグラデーションの要否を確認してから色数を確定します。',
  },
  {
    id: 'quote.post-processing.post-processing',
    step: 'post-processing',
    fieldId: 'post-processing',
    labelJa: '後加工',
    purposeJa: '開封補助や意匠加工など、印刷後の処理を選びます。',
    bounds: { kind: 'derived' },
    exampleJa: 'エンボス加工とノッチを検討します。',
    escalationJa: '袋タイプによって組合せ可否が変わるため実現性を確認します。',
  },
  {
    id: 'quote.sku-quantity.sku-count',
    step: 'sku-quantity',
    fieldId: 'sku-count',
    labelJa: 'SKU数',
    purposeJa: 'デザイン・サイズ違いの管理単位数を確定します。',
    bounds: { kind: 'numeric', unit: '個', min: 1, max: null },
    exampleJa: '3SKUで検討します。',
    escalationJa: '版共有や割引条件は内訳確認後に評価します。',
  },
  {
    id: 'quote.sku-quantity.quantity',
    step: 'sku-quantity',
    fieldId: 'quantity',
    labelJa: '数量',
    purposeJa: '各SKUの発注数量を確定し、単価と納期へ反映します。',
    bounds: {
      kind: 'conditional',
      rules: [
        {
          conditionJa: 'ロールフィルム・SKU数1',
          unit: 'm',
          min: 500,
          max: 1000000,
          ruleJa: '1SKUの長さは500m以上です。',
        },
        {
          conditionJa: 'ロールフィルム・SKU数2以上',
          unit: 'm',
          min: 300,
          max: 1000000,
          ruleJa: '各SKUの長さは300m以上です。',
        },
        {
          conditionJa: 'ロールフィルム以外・SKU数1',
          unit: '枚',
          min: 500,
          max: 1000000,
          ruleJa: '1SKUの数量は500枚以上です。',
        },
        {
          conditionJa: 'ロールフィルム以外・SKU数2以上',
          unit: '枚',
          min: 300,
          max: 1000000,
          ruleJa: '各SKUの数量は300枚以上です。',
        },
      ],
    },
    exampleJa: '各SKU10,000枚です。',
    escalationJa: '数量内訳が曖昧な場合は合計だけでは確定しません。',
  },
  {
    id: 'quote.result.result',
    step: 'result',
    fieldId: 'result',
    labelJa: '見積結果',
    purposeJa: '価格・数量・納期条件を読み取り、次の意思決定を支援します。',
    bounds: { kind: 'derived' },
    exampleJa: '3SKU合計の概算を確認します。',
    escalationJa: '正式見積り・納期確定は営業確認事項として扱います。',
  },
] as const;

export const getQuoteFieldHelp = (
  step: QuoteFieldHelpItem['step'],
  fieldId: string,
): QuoteFieldHelpItem | undefined =>
  QUOTE_FIELD_HELP.find((item) => item.step === step && item.fieldId === fieldId);
