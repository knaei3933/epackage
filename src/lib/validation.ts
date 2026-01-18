import { z } from 'zod';

export const simulationSchema = z.object({
  orderType: z.enum(['new', 'repeat'], {
    required_error: '注文タイプを選択してください。',
  }),
  contentsType: z.enum(['solid', 'liquid', 'powder'], {
    required_error: '内容物タイプを選択してください。',
  }),
  bagType: z.enum(['flat_3_side', 'stand_up', 'gusset'], {
    required_error: 'バッグタイプを選択してください。',
  }),
  width: z
    .number({
      required_error: '横サイズを入力してください。',
      invalid_type_error: '数値で入力してください。',
    })
    .min(50, '横サイズは最小50mm以上である必要があります。')
    .max(500, '横サイズは最大500mm以下である必要があります。'),
  height: z
    .number({
      required_error: '縦サイズを入力してください。',
      invalid_type_error: '数値で入力してください。',
    })
    .min(50, '縦サイズは最小50mm以上である必要があります。')
    .max(1000, '縦サイズは最大1000mm以下である必要があります。'),
  materialGenre: z.string().min(1, '材料ジャンルを選択してください。'),
  surfaceMaterial: z.string().min(1, '表面材質を選択してください。'),
  materialComposition: z.string().min(1, '材料構成を選択してください。'),
  quantities: z
    .array(
      z
        .number({
          required_error: '数量を入力してください。',
          invalid_type_error: '数値で入力してください。',
        })
        .min(100, '数量は100個以上で入力してください。')
        .max(50000, '数量は50,000個以下で入力してください。')
    )
    .min(1, '少なくとも1つの数量パターンを設定してください。')
    .max(5, '数量パターンは最大5つまで設定できます。'),
  deliveryDate: z
    .date({
      required_error: '納期を選択してください。',
    })
    .refine(
      (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const minDate = new Date(today);
        minDate.setDate(today.getDate() + 7); // 最短7日後
        return date >= minDate;
      },
      {
        message: '納期は今日から7日以降の日付を選択してください',
      }
    )
    .optional(),
});

export type SimulationFormData = z.infer<typeof simulationSchema>;

// Step-specific validation schemas
export const stepOneSchema = simulationSchema.pick({
  orderType: true,
  contentsType: true,
  bagType: true,
  width: true,
  height: true,
  materialGenre: true,
  surfaceMaterial: true,
  materialComposition: true,
});

export const stepTwoSchema = simulationSchema.pick({
  quantities: true,
  deliveryDate: true,
});

export const stepThreeSchema = simulationSchema.pick({
  deliveryDate: true,
});

// Validation functions
export const validateStep = (step: number, data: Partial<SimulationFormData>) => {
  switch (step) {
    case 1:
      return stepOneSchema.safeParse(data);
    case 2:
      return stepTwoSchema.safeParse(data);
    case 3:
      return stepThreeSchema.safeParse(data);
    default:
      return simulationSchema.safeParse(data);
  }
};

export const getFieldError = (field: string, error: z.ZodError | null): string => {
  if (!error) return '';

  const fieldError = error.errors.find((err) => err.path.includes(field));
  return fieldError?.message || '';
};

// Size validation helpers
export const validateSizeConstraints = (
  width: number,
  height: number,
  bagType: string
): { isValid: boolean; message: string } => {
  const maxRatio = 5; // 横:縦 最大比率
  const minRatio = 0.2; // 横:縦 最小比率

  const ratio = width / height;

  if (ratio > maxRatio) {
    return {
      isValid: false,
      message: `横:縦 比率は${maxRatio}:1を超えることはできません。`,
    };
  }

  if (ratio < minRatio) {
    return {
      isValid: false,
      message: `横:縦 比率は${minRatio}:1未満であることはできません。`,
    };
  }

  // Bag type specific constraints
  const bagTypeConstraints: Record<string, { maxWidth: number; maxHeight: number }> = {
    flat_3_side: { maxWidth: 400, maxHeight: 600 },
    stand_up: { maxWidth: 300, maxHeight: 500 },
    gusset: { maxWidth: 500, maxHeight: 800 },
  };

  const constraints = bagTypeConstraints[bagType];
  if (constraints) {
    if (width > constraints.maxWidth) {
      return {
        isValid: false,
        message: `${bagType}の最大横サイズは${constraints.maxWidth}mmです。`,
      };
    }

    if (height > constraints.maxHeight) {
      return {
        isValid: false,
        message: `${bagType}の最大縦サイズは${constraints.maxHeight}mmです。`,
      };
    }
  }

  return { isValid: true, message: '' };
};

// Quantity pattern validation
export const validateQuantityPatterns = (patterns: number[]): { isValid: boolean; message: string } => {
  if (patterns.length === 0) {
    return { isValid: false, message: '最小1つ以上の数量を入力してください。' };
  }

  if (patterns.length > 5) {
    return { isValid: false, message: '最大5つまで数量を入力できます。' };
  }

  // Check for duplicates
  const uniquePatterns = new Set(patterns);
  if (uniquePatterns.size !== patterns.length) {
    return { isValid: false, message: '重複した数量があります。異なる数量を入力してください。' };
  }

  // Check ascending order
  for (let i = 1; i < patterns.length; i++) {
    if (patterns[i] <= patterns[i - 1]) {
      return { isValid: false, message: '数量は昇順にソートする必要があります。' };
    }
  }

  return { isValid: true, message: '' };
};

// Real-time validation helpers
export const validateField = (
  field: keyof SimulationFormData,
  value: unknown,
  bagType?: string
): { isValid: boolean; message: string } => {
  try {
    const fieldSchema = simulationSchema.shape[field];
    const result = fieldSchema.safeParse(value);

    if (!result.success) {
      return {
        isValid: false,
        message: result.error.errors[0]?.message || '無効な値です。',
      };
    }

    // Additional size constraint validation
    if ((field === 'width' || field === 'height') && bagType) {
      const width = field === 'width' ? (value as number) : undefined;
      const height = field === 'height' ? (value as number) : undefined;

      if (width && height) {
        return validateSizeConstraints(width, height, bagType);
      }
    }

    return { isValid: true, message: '' };
  } catch {
    return { isValid: false, message: '妥当性検証中にエラーが発生しました。' };
  }
};

// Form completion validation
export const isFormComplete = (data: Partial<SimulationFormData>): boolean => {
  const requiredFields = [
    'orderType',
    'contentsType',
    'bagType',
    'width',
    'height',
    'materialGenre',
    'surfaceMaterial',
    'materialComposition',
    'quantities',
  ];

  return requiredFields.every((field) => {
    const value = data[field as keyof SimulationFormData];
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== undefined && value !== null && value !== '';
  });
};