import {
  PRODUCT_SIZE_LIMITS,
} from '@/types/quote-wizard';
import { QUOTE_FIELD_HELP } from '@/lib/chat/quote-field-help';

describe('QUOTE_FIELD_HELP', () => {
  it('has stable unique IDs and field identifiers within each step', () => {
    const ids = QUOTE_FIELD_HELP.map((item) => item.id);
    const stepFields = QUOTE_FIELD_HELP.map((item) => `${item.step}:${item.fieldId}`);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(stepFields).size).toBe(stepFields.length);
  });

  it('covers all wizard steps and representative critical fields', () => {
    const steps = new Set(QUOTE_FIELD_HELP.map((item) => item.step));
    expect([...steps]).toEqual([
      'specs',
      'post-processing',
      'sku-quantity',
      'result',
    ]);

    const fieldIds = new Set(QUOTE_FIELD_HELP.map((item) => item.fieldId));
    expect([...fieldIds]).toEqual(expect.arrayContaining([
      'product-type',
      'contents',
      'width',
      'height',
      'depth-gusset',
      'side',
      'pitch',
      'material',
      'thickness',
      'printing',
      'post-processing',
      'sku-count',
      'quantity',
      'result',
    ]));
  });

  it('distinguishes material-derived thickness from printing colors', () => {
    const thickness = QUOTE_FIELD_HELP.find((item) => item.fieldId === 'thickness');
    const printing = QUOTE_FIELD_HELP.find((item) => item.fieldId === 'printing');

    expect(thickness).toMatchObject({
      id: 'quote.specs.thickness',
      step: 'specs',
      labelJa: '厚さのタイプ',
      bounds: { kind: 'derived' },
    });
    expect(thickness?.purposeJa).not.toContain('印刷');

    expect(printing).toMatchObject({
      id: 'quote.specs.printing',
      step: 'specs',
      labelJa: '印刷色数',
      bounds: {
        kind: 'options',
        values: ['1', '2', '3', '4', '5', '6', '7', '8'],
      },
    });
  });

  it('derives width and height ranges from the authoritative product limits', () => {
    const width = QUOTE_FIELD_HELP.find((item) => item.fieldId === 'width');
    const height = QUOTE_FIELD_HELP.find((item) => item.fieldId === 'height');

    expect(width?.bounds).toEqual({
      kind: 'numeric',
      unit: 'mm',
      products: Object.fromEntries(Object.entries(PRODUCT_SIZE_LIMITS).map(
        ([product, limits]) => [product, {
          min: limits.minWidth,
          max: limits.maxWidth,
        }],
      )),
    });
    expect(height?.bounds).toEqual({
      kind: 'numeric',
      unit: 'mm',
      products: Object.fromEntries(Object.entries(PRODUCT_SIZE_LIMITS).map(
        ([product, limits]) => [product, {
          min: limits.minHeight,
          max: limits.maxHeight,
        }],
      )),
    });
    expect(width?.bounds).not.toEqual(height?.bounds);
  });

  it('describes side as numeric side width with the box combined-width limit', () => {
    const side = QUOTE_FIELD_HELP.find((item) => item.fieldId === 'side');

    expect(side?.labelJa).toBe('側面幅');
    expect(side?.purposeJa).not.toContain('印刷面');
    expect(side?.bounds).toEqual({
      kind: 'conditional',
      rules: [{
        conditionJa: 'ボックス型パウチ',
        unit: 'mm',
        min: 0,
        max: null,
        ruleJa: '幅＋側面は335mm以下にします。',
      }],
    });
  });

  it('uses the roll-film design repeat bounds for pitch', () => {
    const pitch = QUOTE_FIELD_HELP.find((item) => item.fieldId === 'pitch');

    expect(pitch?.purposeJa).toContain('ロールフィルム');
    expect(pitch?.purposeJa).toContain('デザイン周期');
    expect(pitch?.bounds).toEqual({ kind: 'numeric', unit: 'mm', min: 50, max: 1000 });
  });

  it('uses SKU-count and product-type conditional quantity bounds', () => {
    const quantity = QUOTE_FIELD_HELP.find((item) => item.fieldId === 'quantity');

    expect(quantity?.bounds).toEqual({
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
    });
  });
});
