import { z } from 'zod'

// Premium content download schema
export const premiumContentSchema = z.object({
  name: z.string()
    .min(1, 'お名前を入力してください')
    .min(2, 'お名前は2文字以上で入力してください')
    .max(50, 'お名前は50文字以内で入力してください'),
  company: z.string()
    .max(100, '会社名は100文字以内で入力してください')
    .optional(),
  email: z.string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  phone: z.string()
    .regex(/^(0\d{1,4}-\d{1,4}-\d{4}|0\d{9,10}|\+81\d{1,4}-\d{1,4}-\d{4})$/,
      '有効な電話番号を入力してください（例: 03-1234-5678）')
    .optional(),
  industry: z.enum([
    'food', 'cosmetics', 'medical', 'retail', 'electronics',
    'agriculture', 'chemical', 'automotive', 'other'
  ], {
    required_error: '業種を選択してください'
  }),
  role: z.enum([
    'president', 'manager', 'engineer', 'purchasing', 'marketing', 'other'
  ], {
    required_error: '役職を選択してください'
  }),
  contentId: z.string(),
  consent: z.boolean()
    .refine(val => val === true, '個人情報の取り扱いに同意が必要です'),
  newsletter: z.boolean().optional()
})

export type PremiumContentFormData = z.infer<typeof premiumContentSchema>

// Content types
export interface PremiumContent {
  id: string
  title: string
  description: string
  category: string
  fileSize: string
  pageCount: number
  format: string
  thumbnail: string
  featured: boolean
  tags: string[]
  leadScore: number // 1-10, for lead scoring
}

export const premiumContents: PremiumContent[] = [
  {
    id: 'japan-market-report-2024',
    title: '日本パウチ包装市場レポート 2024',
    description: '市場規模、成長率、主要トレンドを網羅した業界最新レポート。素材別、用途別の詳細分析付き。',
    category: '市場レポート',
    fileSize: '3.2MB',
    pageCount: 45,
    format: 'PDF',
    thumbnail: '/images/premium/market-report-thumb.jpg',
    featured: true,
    tags: ['市場分析', '業界トレンド', '統計データ'],
    leadScore: 9
  },
  {
    id: 'quote-calculator-template',
    title: 'パウチ導入ROI計算テンプレート',
    description: 'コスト削減効果を可視化するExcelテンプレート。自社での具体的な投資対効果計算に活用できます。',
    category: 'コスト計算',
    fileSize: '1.8MB',
    pageCount: 12,
    format: 'Excel',
    thumbnail: '/images/premium/roi-template-thumb.jpg',
    featured: true,
    tags: ['ROI', 'コスト削減', '導入効果'],
    leadScore: 8
  },
  {
    id: 'technical-spec-guide',
    title: 'パウチ技術仕様比較ガイド',
    description: '6種類のパウチタイプの技術仕様、適切用途、選定ポイントを詳細解説した技術資料。',
    category: '技術資料',
    fileSize: '4.1MB',
    pageCount: 38,
    format: 'PDF',
    thumbnail: '/images/premium/tech-guide-thumb.jpg',
    featured: true,
    tags: ['技術仕様', '製品比較', '選定ガイド'],
    leadScore: 7
  },
  {
    id: 'regulatory-compliance-checklist',
    title: '食品包装規制適合チェックリスト',
    description: '食品衛生法、PL法など関連法規の遵守要件を網羅したチェックリスト。',
    category: 'コンプライアンス',
    fileSize: '2.5MB',
    pageCount: 28,
    format: 'PDF',
    thumbnail: '/images/premium/compliance-thumb.jpg',
    featured: false,
    tags: ['法規制', '品質管理', '食品安全'],
    leadScore: 6
  },
  {
    id: 'sustainable-packaging-guide',
    title: 'サステナブル包装導入ガイド',
    description: '環境対応パウチの選定からサプライチェーン最適化までを解説したSDGs対応ガイド。',
    category: '環境対策',
    fileSize: '3.8MB',
    pageCount: 52,
    format: 'PDF',
    thumbnail: '/images/premium/sustainable-thumb.jpg',
    featured: true,
    tags: ['SDGs', '環境対応', 'サステナブル'],
    leadScore: 8
  }
]