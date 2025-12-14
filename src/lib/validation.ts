import { z } from 'zod';

export const simulationSchema = z.object({
  orderType: z.enum(['new', 'repeat'], {
    required_error: '주문 유형을 선택해주세요.',
  }),
  contentsType: z.enum(['solid', 'liquid', 'powder'], {
    required_error: '내용물 유형을 선택해주세요.',
  }),
  bagType: z.enum(['flat_3_side', 'stand_up', 'gusset'], {
    required_error: '백 유형을 선택해주세요.',
  }),
  width: z
    .number({
      required_error: '가로 크기를 입력해주세요.',
      invalid_type_error: '숫자로 입력해주세요.',
    })
    .min(50, '가로 크기는 최소 50mm 이상이어야 합니다.')
    .max(500, '가로 크기는 최대 500mm 이하여야 합니다.'),
  height: z
    .number({
      required_error: '세로 크기를 입력해주세요.',
      invalid_type_error: '숫자로 입력해주세요.',
    })
    .min(50, '세로 크기는 최소 50mm 이상이어야 합니다.')
    .max(1000, '세로 크기는 최대 1000mm 이하여야 합니다.'),
  materialGenre: z.string().min(1, '재료 장르를 선택해주세요.'),
  surfaceMaterial: z.string().min(1, '표면 재질을 선택해주세요.'),
  materialComposition: z.string().min(1, '재료 구성을 선택해주세요.'),
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
  const maxRatio = 5; // 가로:세로 최대 비율
  const minRatio = 0.2; // 가로:세로 최소 비율

  const ratio = width / height;

  if (ratio > maxRatio) {
    return {
      isValid: false,
      message: `가로:세로 비율은 ${maxRatio}:1을 초과할 수 없습니다.`,
    };
  }

  if (ratio < minRatio) {
    return {
      isValid: false,
      message: `가로:세로 비율은 ${minRatio}:1 미만일 수 없습니다.`,
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
        message: `${bagType}의 최대 가로 크기는 ${constraints.maxWidth}mm입니다.`,
      };
    }

    if (height > constraints.maxHeight) {
      return {
        isValid: false,
        message: `${bagType}의 최대 세로 크기는 ${constraints.maxHeight}mm입니다.`,
      };
    }
  }

  return { isValid: true, message: '' };
};

// Quantity pattern validation
export const validateQuantityPatterns = (patterns: number[]): { isValid: boolean; message: string } => {
  if (patterns.length === 0) {
    return { isValid: false, message: '최소 1개 이상의 수량을 입력해주세요.' };
  }

  if (patterns.length > 5) {
    return { isValid: false, message: '최대 5개까지 수량을 입력할 수 있습니다.' };
  }

  // Check for duplicates
  const uniquePatterns = new Set(patterns);
  if (uniquePatterns.size !== patterns.length) {
    return { isValid: false, message: '중복된 수량이 있습니다. 다른 수량을 입력해주세요.' };
  }

  // Check ascending order
  for (let i = 1; i < patterns.length; i++) {
    if (patterns[i] <= patterns[i - 1]) {
      return { isValid: false, message: '수량은 오름차순으로 정렬되어야 합니다.' };
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
        message: result.error.errors[0]?.message || '유효하지 않은 값입니다.',
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
    return { isValid: false, message: '유효성 검사 중 오류가 발생했습니다.' };
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