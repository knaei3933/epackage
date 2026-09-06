export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';

// Signup の日本語入力ルールと同じ形式制限を完了モードにも適用する。
const phonePattern = /^\d{2,4}-?\d{2,4}-?\d{3,4}$/;
const kanaPattern = /^[\u3040-\u309F\u30A0-\u30FF\u30FC\s]*$/;

const completionRequestSchema = z
  .object({
    userId: z.string().uuid().optional(),
    returnTo: z.string().optional(),
    kanji_last_name: z
      .string()
      .trim()
      .min(1, '姓を入力してください。')
      .max(50, '姓は50文字以内で入力してください。')
      .optional(),
    kanji_first_name: z
      .string()
      .trim()
      .min(1, '名を入力してください。')
      .max(50, '名は50文字以内で入力してください。')
      .optional(),
    kana_last_name: z
      .string()
      .trim()
      .min(1, '姓（カナ）を入力してください。')
      .regex(kanaPattern, 'ひらがなで入力してください。')
      .max(50, '姓は50文字以内で入力してください。')
      .optional(),
    kana_first_name: z
      .string()
      .trim()
      .min(1, '名（カナ）を入力してください。')
      .regex(kanaPattern, 'ひらがなで入力してください。')
      .max(50, '名は50文字以内で入力してください。')
      .optional(),
    corporate_phone: z
      .union([
        z.string().regex(phonePattern, '有効な電話番号の形式ではありません。'),
        z.literal(''),
      ])
      .optional(),
    personal_phone: z
      .union([
        z.string().regex(phonePattern, '有効な電話番号の形式ではありません。'),
        z.literal(''),
      ])
      .optional(),
    postal_code: z
      .string()
      .trim()
      .min(1, '郵便番号を入力してください。')
      .regex(/^\d{3}-?\d{4}$/, '有効な郵便番号を入力してください。（例：123-4567）')
      .optional(),
    prefecture: z
      .string()
      .trim()
      .min(1, '都道府県を選択してください。')
      .optional(),
    city: z
      .string()
      .trim()
      .min(1, '市区町村を入力してください。')
      .optional(),
    street: z
      .string()
      .trim()
      .min(1, '番地を入力してください。')
      .optional(),
  })
  .strict();

type CompletionRequest = z.infer<typeof completionRequestSchema>;
type ProfileRecord = Record<string, string | null | undefined>;

const requiredTextFields = [
  'kanji_last_name',
  'kanji_first_name',
  'kana_last_name',
  'kana_first_name',
  'postal_code',
  'prefecture',
  'city',
  'street',
] as const;

const isPresent = (value: string | null | undefined) => Boolean(value?.trim());

const isProfileComplete = (profile: ProfileRecord) =>
  requiredTextFields.every((field) => isPresent(profile[field])) &&
  (isPresent(profile.corporate_phone) || isPresent(profile.personal_phone));

const safeReturnPath = (value: string | undefined) => {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return '/samples';
  }
  return value;
};

const validationResponse = (error: z.ZodError) => {
  const details: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : '_form';
    (details[key] ??= []).push(issue.message);
  }

  return NextResponse.json(
    {
      success: false,
      error: '入力値が正しくありません。',
      error_code: 'VALIDATION_ERROR',
      details,
    },
    { status: 400 },
  );
};

export async function POST(request: NextRequest) {
  try {
    const { client: supabase } = await createSupabaseSSRClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: '認証されていません。',
          error_code: 'UNAUTHORIZED',
        },
        { status: 401 },
      );
    }

    const body = (await request.json().catch((): null => null)) as
      | (CompletionRequest & Record<string, unknown>)
      | null;

    if (!body) {
      return NextResponse.json(
        {
          success: false,
          error: 'リクエストの形式が正しくありません。',
          error_code: 'INVALID_REQUEST',
        },
        { status: 400 },
      );
    }

    // body に所有者 ID を付ける場合も、セッションユーザーと一致することを必須にする。
    if (body.userId && body.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: '自分のプロフィールのみ完了できます。',
          error_code: 'PROFILE_OWNER_MISMATCH',
        },
        { status: 403 },
      );
    }

    const parsed = completionRequestSchema.safeParse(body);
    if (!parsed.success) {
      return validationResponse(parsed.error);
    }

    const returnTo = safeReturnPath(parsed.data.returnTo);
    const profileResult = await supabase
      .from('profiles')
      .select(
        [
          'id',
          'kanji_last_name',
          'kanji_first_name',
          'kana_last_name',
          'kana_first_name',
          'corporate_phone',
          'personal_phone',
          'postal_code',
          'prefecture',
          'city',
          'street',
          'status',
          'updated_at',
        ].join(','),
      )
      .eq('id', user.id)
      .maybeSingle();

    const profile = profileResult.data as unknown as ProfileRecord | null;
    if (profileResult.error || !profile) {
      return NextResponse.json(
        {
          success: false,
          error: 'プロフィールが見つかりませんでした。',
          error_code: 'PROFILE_NOT_FOUND',
        },
        { status: 404 },
      );
    }

    if (profile.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          error: 'プロフィールを完了できるのは有効な会員のみです。',
          error_code: 'PROFILE_NOT_ACTIVE',
        },
        { status: 403 },
      );
    }

    const submittedData = parsed.data;
    const updateData: Record<string, string> = {};
    const completableFields = [
      ...requiredTextFields,
      'corporate_phone',
      'personal_phone',
    ] as const;

    for (const field of completableFields) {
      const submittedValue = submittedData[field];
      if (submittedValue === undefined) continue;

      const currentValue = profile[field]?.trim() ?? '';
      // 完了モードは空欄補完専用。承認済みの非空値は同一値であっても上書き対象にしない。
      if (currentValue) {
        return NextResponse.json(
          {
            success: false,
            error: '承認済みの項目は変更できません。',
            error_code: 'APPROVED_FIELD_CONFLICT',
            details: { [field]: ['承認済みの項目は変更できません。'] },
          },
          { status: 409 },
        );
      }

      if (submittedValue.trim()) {
        updateData[field] = submittedValue.trim();
      }
    }

    const mergedProfile = { ...profile, ...updateData };
    if (!isProfileComplete(mergedProfile)) {
      return NextResponse.json(
        {
          success: false,
          error: '必須項目をすべて入力してください。',
          error_code: 'PROFILE_INCOMPLETE',
          details: {
            _form: ['氏名、電話番号、住所の必須項目をすべて入力してください。'],
          },
        },
        { status: 400 },
      );
    }

    // 電話が片方登録済みで新規入力がない場合は、idempotent success として返す。
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: true,
        message: 'プロフィールは既に完了しています。',
        returnTo,
      });
    }

    const { data: updatedProfiles, error: updateError } = await supabase
      .from('profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .eq('updated_at', profile.updated_at as string)
      .select('id');

    if (updateError) {
      console.error('[PROFILE-COMPLETE] update failed');
      return NextResponse.json(
        {
          success: false,
          error: 'プロフィールの保存に失敗しました。',
          error_code: 'UPDATE_ERROR',
        },
        { status: 500 },
      );
    }

    if (!updatedProfiles || updatedProfiles.length === 0) {
      console.warn('[PROFILE-COMPLETE] concurrent profile update detected');
      return NextResponse.json(
        {
          success: false,
          error:
            'プロフィール情報が更新されました。画面を再読み込みして、最新の状態で再度お試しください。',
          error_code: 'PROFILE_CONCURRENCY_CONFLICT',
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'プロフィールを保存しました。',
      returnTo,
    });
  } catch {
    console.error('[PROFILE-COMPLETE] unexpected error');
    return NextResponse.json(
      {
        success: false,
        error: 'プロフィール保存中にエラーが発生しました。',
        error_code: 'SERVER_ERROR',
      },
      { status: 500 },
    );
  }
}
