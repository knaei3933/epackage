import 'server-only';

/**
 * Tracked, server-side knowledge corpus for chat grounding.
 *
 * Product summaries follow the constants in `src/lib/product-data.ts`.
 * Submission guidance follows `src/components/quote/shared/DataTemplateGuide.tsx`.
 * Unconfirmed commercial or manufacturing conditions intentionally defer to
 * the quote/contact flow and staff confirmation.
 */

export const EXPECTED_KNOWLEDGE_IDS = [
  '01-flat-pouch',
  '02-stand-pouch',
  '03-gazette-pouch',
  '04-spout-pouch',
  '05-chojiu-bag',
  '06-roll-film',
  '07-die-cut-package',
  '08-white-plate',
  '09-product-selection-guide',
  '10-printing-guide',
  '11-user-flows',
  '12-pricing-tips',
] as const;

export type KnowledgeCorpusId = (typeof EXPECTED_KNOWLEDGE_IDS)[number];

export interface KnowledgeCorpusEntry {
  id: KnowledgeCorpusId;
  keywords: readonly string[];
  content: string;
}

export interface KnowledgeCorpusIntegrity {
  isValid: boolean;
  actualIds: readonly KnowledgeCorpusId[];
  expectedIds: readonly KnowledgeCorpusId[];
  missingIds: readonly KnowledgeCorpusId[];
  unexpectedIds: readonly string[];
  duplicateIds: readonly string[];
  emptyEntryIds: readonly string[];
  errors: readonly string[];
}

export const KNOWLEDGE_CORPUS: readonly KnowledgeCorpusEntry[] = [
  {
    id: '01-flat-pouch',
    keywords: ['平袋', '3面シール', 'シール袋'],
    content:
      '【平袋】三方シールの平袋は、シンプルでコストパフォーマンスに優れた定番パッケージです。小物や試供品、サンプル配布に適しています。対応サイズ・材質・オプションと最新の価格条件は仕様により変わるため、統合見積もりで条件を入力するか、担当者にご確認ください。',
  },
  {
    id: '02-stand-pouch',
    keywords: ['スタンドパウチ', 'スタンド', '自立袋'],
    content:
      '【スタンドパウチ】自立型で陳列性に優れ、チャック付きで再封可能なパウチです。食品・健康食品・化粧品など幅広い用途に対応します。仕様ごとの適合条件や価格は見積もりでの確認が必要です。詳細は担当者にご相談ください。',
  },
  {
    id: '03-gazette-pouch',
    keywords: ['ガゼット', '底マチ', 'マチ付き'],
    content:
      '【ガゼットパウチ】箱型形状で自立性が高く、内容物を保護しやすい立体パッケージです。マチによる容量設計が可能です。最適なマチ幅・材質・構造や価格は仕様により変わるため、統合見積もりと担当者確認をご利用ください。',
  },
  {
    id: '04-spout-pouch',
    keywords: ['スパウト', '注ぎ口', 'キャップ'],
    content:
      '【スパウトパウチ】液体食品・化粧品・健康食品に適したスパウト付きパウチです。軽量で持ち運びやすく、注ぎやすい形状が特徴です。内容物に合う材質・キャップ仕様は安全と品質に影響するため、見積もり条件と担当者確認が必要です。',
  },
  {
    id: '05-chojiu-bag',
    keywords: ['合掌袋', 'サイドシール', 'ピロー'],
    content:
      '【合掌袋】底部にマチ付きで自立する合掌袋（ピローパウチ）です。コーヒー豆や茶葉、スナック菓子の包装に適しています。サイズ・材質・保功能性の組み合わせは用途により異なるため、統合見積もりと担当者確認をお願いします。',
  },
  {
    id: '06-roll-film',
    keywords: ['ロールフィルム', '巻き取り', '自動包装'],
    content:
      '【ロールフィルム】自動包装機に対応し、大量生産でのコスト削減を目的としたロール状フィルムです。包装機との適合は機種・幅・厚み・シール条件に依存します。正確な可否と条件は見積もり入力後、担当者にご確認ください。',
  },
  {
    id: '07-die-cut-package',
    keywords: ['型抜き', '成型パウチ'],
    content:
      '【型抜きパッケージ】金型でフィルムを特殊な形状に加工するパッケージです。一般的な矩形と異なる独自形状で差別化を狙えます。形状・強度・製造性と金型条件は個別設計になるため、希望形状を統合見積もりまたはお問い合わせでご相談ください。',
  },
  {
    id: '08-white-plate',
    keywords: ['白版', 'ホイル'],
    content:
      '【白版】白版は色インキの下地に白インキを印刷する技術で、暗色や透明フィルム上の色再現を高め、にじみを抑える効果が期待できます。適した素材・印刷方式やコスト・納期への影響は条件により異なるため、見積もりと担当者確認が必要です。',
  },
  {
    id: '09-product-selection-guide',
    keywords: ['コスト', '安い', '価格', '選び方', 'おすすめ', 'どの製品', '比較'],
    content:
      '【製品選び】平袋はシンプルで低コスト、スタンドパウチは陳列性と再封可能性、ガゼットは容量と自立性、スパウトは液体対応、合掌袋は内容物に合わせた自立設計、ロールフィルムは自動包装向きです。最終選定は用途・内容物・数量・仕様により変わるため、統合見積もりと担当者へのご相談をご利用ください。',
  },
  {
    id: '10-printing-guide',
    keywords: [
      '塗り足し',
      'ドブ',
      'カラーモード',
      '色モード',
      'カラー',
      'CMYK',
      '特色',
      'アウトライン',
      'フォント',
      '解像度',
      'dpi',
      'レイヤー',
      '安全領域',
      '透明',
      'アルミ',
      '印刷',
      'データ作成',
      'デザイン',
    ],
    content:
      '【印刷データ】製品ごとのテンプレートには塗り足しと安全領域が含まれます。一般的な入稿案内では、カラーはCMYK、解像度は300DPI以上、テキストはアウトライン化、画像は埋め込みまたはリンク添付が求められます。特色グラビアや白版、透明・アルミ素材の可否は条件により異なるため、事前に見積もり・お問い合わせでご確認ください。',
  },
  {
    id: '11-user-flows',
    keywords: [
      '見積もり',
      '統合見積もり',
      '見積ツール',
      '詳細見積もり',
      '電話相談',
      '会員登録',
      'ログイン',
      'パスワード',
      'マイページ',
      '見積管理',
      'ダッシュボード',
      '注文管理',
      'サンプル',
      '契約',
      '請求書',
      '配送',
      '通知',
      'プロフィール',
      'アカウント',
      '承認',
      '登録',
    ],
    content:
      '【ご利用 flow】製品と仕様を選び、統合見積もりで価格を確認できます。会員登録・ログイン後はマイページから見積管理、注文状況、デザインファイル、通知、プロフィール、パスワードを確認・変更できます。サンプル依頼は製品詳細画面から受け付けます。口座・請求・配送などの確定条件は見積もり承認後に案内される情報と担当者確認をご利用ください。',
  },
  {
    id: '12-pricing-tips',
    keywords: [
      'お得',
      '割引',
      '安く',
      '経済的数量',
      '2列生産',
      'SKU',
      '複数',
      '最安値',
      'おトク',
    ],
    content:
      '【価格の考え方】価格は形状・材質・サイズ・数量・SKU構成・加工条件で変わります。見積もり結果では、条件により経済的な数量や並列生産の候補が表示される場合があります。適用可否と金額は固定の一般案内ではなく、最新の見積もり結果と担当者確認でお願いします。',
  },
] as const satisfies readonly KnowledgeCorpusEntry[];

const corpusById = new Map<string, KnowledgeCorpusEntry>(
  KNOWLEDGE_CORPUS.map((entry) => [entry.id, entry]),
);

export function getKnowledgeEntry(id: string): KnowledgeCorpusEntry | undefined {
  return corpusById.get(id);
}

export function getKnowledgeCorpusIntegrity(
  corpus: readonly KnowledgeCorpusEntry[] = KNOWLEDGE_CORPUS,
): KnowledgeCorpusIntegrity {
  const expectedIds = [...EXPECTED_KNOWLEDGE_IDS];
  const actualIds = corpus.map((entry) => entry.id);
  const actualIdSet = new Set<string>(actualIds);

  const missingIds = expectedIds.filter((id) => !actualIdSet.has(id));
  const unexpectedIds = actualIds.filter((id) => !expectedIds.includes(id as KnowledgeCorpusId));

  const seenIds = new Set<string>();
  const duplicateIds = new Set<string>();
  const emptyEntryIds = new Set<string>();
  const errors: string[] = [];

  corpus.forEach((entry) => {
    if (seenIds.has(entry.id)) {
      duplicateIds.add(entry.id);
      return;
    }
    seenIds.add(entry.id);

    if (entry.keywords.length === 0 || entry.keywords.some((keyword) => keyword.trim() === '')) {
      emptyEntryIds.add(entry.id);
    }
    if (entry.content.trim() === '') {
      emptyEntryIds.add(entry.id);
    }
  });

  if (missingIds.length > 0) {
    errors.push(`Missing knowledge IDs: ${missingIds.join(', ')}`);
  }
  if (unexpectedIds.length > 0) {
    errors.push(`Unexpected knowledge IDs: ${unexpectedIds.join(', ')}`);
  }
  if (duplicateIds.size > 0) {
    errors.push(`Duplicate knowledge IDs: ${[...duplicateIds].join(', ')}`);
  }
  if (emptyEntryIds.size > 0) {
    errors.push(`Entries with empty keywords/content: ${[...emptyEntryIds].join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    actualIds,
    expectedIds,
    missingIds,
    unexpectedIds,
    duplicateIds: [...duplicateIds],
    emptyEntryIds: [...emptyEntryIds],
    errors,
  };
}
