import { z } from 'zod'

// Step 1: Basic Information
const basicInfoSchema = z.object({
  name: z.string()
    .min(1, 'お名前を入力してください')
    .min(2, 'お名前は2文字以上で入力してください')
    .max(50, 'お名前は50文字以内で入力してください'),
  company: z.string()
    .min(1, '会社名を入力してください')
    .max(100, '会社名は100文字以内で入力してください'),
  email: z.string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  phone: z.string()
    .min(1, '電話番号を入力してください')
    .regex(/^(0\d{1,4}-\d{1,4}-\d{4}|0\d{9,10}|\+81\d{1,4}-\d{1,4}-\d{4})$/,
      '有効な電話番号を入力してください（例: 03-1234-5678）'),
  department: z.string().optional(),
  position: z.string().optional()
})

// Step 2: Company Information
const companyInfoSchema = z.object({
  industry: z.enum([
    'food', 'cosmetics', 'medical', 'retail', 'electronics',
    'agriculture', 'chemical', 'automotive', 'other'
  ], {
    required_error: '業種を選択してください'
  }),
  employeeCount: z.enum([
    '1-10', '11-50', '51-100', '101-300', '301-500', '501-1000', '1000+'
  ], {
    required_error: '従業員数を選択してください'
  }),
  annualRevenue: z.enum([
    'under-100m', '100m-1b', '1b-10b', '10b-100b', 'over-100b'
  ], {
    required_error: '年商を選択してください'
  }),
  website: z.string().url('有効なURLを入力してください').optional().or(z.literal('')),
  location: z.string().optional()
})

// Step 3: Project Requirements
const projectRequirementsSchema = z.object({
  pouchTypes: z.array(z.string()).min(1, '少なくとも1つのパウチタイプを選択してください'),
  productType: z.enum([
    'food-solid', 'food-liquid', 'food-powder', 'cosmetics-cream',
    'cosmetics-liquid', 'medical-solid', 'medical-liquid', 'electronics',
    'chemical', 'agriculture', 'other'
  ], {
    required_error: '包装する製品を選択してください'
  }),
  monthlyQuantity: z.enum([
    'under-1000', '1000-5000', '5000-10000', '10000-50000', '50000-100000', '100000+'
  ], {
    required_error: '月産数量を選択してください'
  }),
  timeline: z.enum([
    'urgent-1month', 'normal-3months', 'planned-6months', 'researching'
  ], {
    required_error: '希望納期を選択してください'
  }),
  budget: z.enum([
    'under-500k', '500k-1m', '1m-5m', '5m-10m', '10m-50m', '50m+', 'consultation'
  ], {
    required_error: '予算規模を選択してください'
  })
})

// Step 4: Technical Requirements
const technicalRequirementsSchema = z.object({
  materials: z.array(z.string()).optional(),
  printing: z.object({
    type: z.enum(['none', 'simple', 'complex', 'full-color'], {
      required_error: '印刷要件を選択してください'
    }),
    colors: z.string().optional()
  }),
  features: z.array(z.string()).optional(),
  specialRequirements: z.string().optional()
})

// Step 5: Additional Information
const additionalInfoSchema = z.object({
  currentSupplier: z.string().optional(),
  challenges: z.string().optional(),
  decisionMaker: z.string().optional(),
  competitorAnalysis: z.string().optional(),
  message: z.string()
    .min(1, 'お問い合わせ内容を入力してください')
    .min(10, 'お問い合わせ内容は10文字以上で入力してください')
    .max(1000, 'お問い合わせ内容は1000文字以内で入力してください'),
  fileAttachment: z.string().optional()
})

// Final schema combining all steps
export const detailedInquirySchema = basicInfoSchema
  .and(companyInfoSchema)
  .and(projectRequirementsSchema)
  .and(technicalRequirementsSchema)
  .and(additionalInfoSchema)

export type DetailedInquiryFormData = z.infer<typeof detailedInquirySchema>
export type BasicInfoForm = z.infer<typeof basicInfoSchema>
export type CompanyInfoForm = z.infer<typeof companyInfoSchema>
export type ProjectRequirementsForm = z.infer<typeof projectRequirementsSchema>
export type TechnicalRequirementsForm = z.infer<typeof technicalRequirementsSchema>
export type AdditionalInfoForm = z.infer<typeof additionalInfoSchema>

// Form steps configuration
export const formSteps = [
  {
    id: 'basic',
    title: '基本情報',
    description: '担当者情報をご入力ください',
    schema: basicInfoSchema,
    fields: ['name', 'company', 'email', 'phone', 'department', 'position']
  },
  {
    id: 'company',
    title: '会社情報',
    description: '貴社の基本情報をご入力ください',
    schema: companyInfoSchema,
    fields: ['industry', 'employeeCount', 'annualRevenue', 'website', 'location']
  },
  {
    id: 'project',
    title: 'プロジェクト要件',
    description: '包装プロジェクトの要件を教えてください',
    schema: projectRequirementsSchema,
    fields: ['pouchTypes', 'productType', 'monthlyQuantity', 'timeline', 'budget']
  },
  {
    id: 'technical',
    title: '技術要件',
    description: '技術的な仕様や要件を選択してください',
    schema: technicalRequirementsSchema,
    fields: ['materials', 'printing', 'features', 'specialRequirements']
  },
  {
    id: 'additional',
    title: '追加情報',
    description: 'その他の詳細情報をお聞かせください',
    schema: additionalInfoSchema,
    fields: ['currentSupplier', 'challenges', 'decisionMaker', 'competitorAnalysis', 'message', 'fileAttachment']
  }
]

// Lead scoring calculation
export function calculateLeadScore(formData: Partial<DetailedInquiryFormData>): number {
  let score = 0

  // Company size scoring
  if (formData.employeeCount) {
    const sizeScores: Record<string, number> = {
      '1-10': 1,
      '11-50': 2,
      '51-100': 4,
      '101-300': 6,
      '301-500': 8,
      '501-1000': 10,
      '1000+': 12
    }
    score += sizeScores[formData.employeeCount] || 0
  }

  // Revenue scoring
  if (formData.annualRevenue) {
    const revenueScores: Record<string, number> = {
      'under-100m': 1,
      '100m-1b': 3,
      '1b-10b': 6,
      '10b-100b': 10,
      'over-100b': 15
    }
    score += revenueScores[formData.annualRevenue] || 0
  }

  // Budget scoring
  if (formData.budget) {
    const budgetScores: Record<string, number> = {
      'under-500k': 2,
      '500k-1m': 4,
      '1m-5m': 8,
      '5m-10m': 12,
      '10m-50m': 16,
      '50m+': 20,
      'consultation': 6
    }
    score += budgetScores[formData.budget] || 0
  }

  // Quantity scoring
  if (formData.monthlyQuantity) {
    const quantityScores: Record<string, number> = {
      'under-1000': 2,
      '1000-5000': 5,
      '5000-10000': 8,
      '10000-50000': 12,
      '50000-100000': 16,
      '100000+': 20
    }
    score += quantityScores[formData.monthlyQuantity] || 0
  }

  // Timeline scoring
  if (formData.timeline) {
    const timelineScores: Record<string, number> = {
      'urgent-1month': 10,
      'normal-3months': 6,
      'planned-6months': 3,
      'researching': 1
    }
    score += timelineScores[formData.timeline] || 0
  }

  // Multiple pouch types bonus
  if (formData.pouchTypes && formData.pouchTypes.length > 1) {
    score += formData.pouchTypes.length * 2
  }

  // Detailed requirements bonus
  if (formData.materials && formData.materials.length > 0) score += 5
  if (formData.features && formData.features.length > 0) score += 5
  if (formData.message && formData.message.length > 200) score += 8
  if (formData.currentSupplier) score += 3
  if (formData.challenges) score += 5

  return Math.min(score, 100) // Cap at 100
}

// Export types for options
export interface FormOption {
  value: string
  label: string
  description?: string
  score?: number
}

export const pouchTypeOptions: FormOption[] = [
  { value: 'soft', label: 'ソフトパウチ', description: '3シール・4シール', score: 1 },
  { value: 'standing', label: 'スタンドパウチ', description: '角底・チャック付き', score: 2 },
  { value: 'gusset', label: 'ガゼットパウチ', description: 'マチ付き', score: 2 },
  { value: 'pillow', label: 'ピローパウチ', description: '最も一般的', score: 1 },
  { value: 'triangle', label: '三角パウチ', description: '液体・粉末用', score: 2 },
  { value: 'special', label: '特殊形状パウチ', description: 'カスタム対応', score: 3 }
]

export const industryOptions: FormOption[] = [
  { value: 'food', label: '食品', score: 3 },
  { value: 'cosmetics', label: '化粧品', score: 4 },
  { value: 'medical', label: '医療・医薬品', score: 5 },
  { value: 'retail', label: '小売・流通', score: 3 },
  { value: 'electronics', label: '電子機器', score: 4 },
  { value: 'agriculture', label: '農業', score: 2 },
  { value: 'chemical', label: '化学工業', score: 3 },
  { value: 'automotive', label: '自動車', score: 5 },
  { value: 'other', label: 'その他', score: 1 }
]

export const materialOptions: FormOption[] = [
  { value: 'pet', label: 'PET（透明性・バリア性）', score: 2 },
  { value: 'cpp', label: 'CPP（ヒートシール性）', score: 1 },
  { value: 'pe', label: 'PE（柔軟性・防湿性）', score: 1 },
  { value: 'aluminum', label: 'アルミ（完全遮光・高バリア）', score: 3 },
  { value: 'paper', label: '紙（環境対応・高級感）', score: 2 },
  { value: 'biodegradable', label: '生分解性フィルム', score: 4 },
  { value: 'eco-friendly', label: '環境対応フィルム', score: 3 }
]

export const featureOptions: FormOption[] = [
  { value: 'zipper', label: 'チャック（ジッパー）', score: 2 },
  { value: 'spout', label: '注出口（スパウト）', score: 3 },
  { value: 'tear-notch', label: 'イージーオープン（裂け目）', score: 1 },
  { value: 'hanging-hole', label: '吊り穴', score: 1 },
  { value: 'transparent-window', label: '透明窓', score: 2 },
  { value: 'tamper-evident', label: '改ざん防止シール', score: 2 },
  { value: 'valve', label: 'ガス抜きバルブ', score: 3 },
  { value: 'microwaveable', label: '電子レンジ対応', score: 2 }
]