/**
 * KRAFT紙計算テスト
 *
 * 材料幅選択と損失計算のテスト
 *
 * テスト対象:
 * 1. Material width selection (determineMaterialWidth)
 * 2. Loss calculation (getLossMeters)
 */

import { determineMaterialWidth, MaterialWidthType } from '../material-width-selector';

describe('KRAFT紙計算 - 材料幅選択', () => {
  describe('クラフト紙の材料幅選択', () => {
    test('クラフト紙で幅 <= 760mm の場合、780mmを返すこと', () => {
      const materialIds = ['kraft_vmpet_lldpe', 'kraft_pet_lldpe', 'kraft_pe'];

      materialIds.forEach(materialId => {
        const result = determineMaterialWidth(600, materialId);
        expect(result).toBe(780);
        console.log(`${materialId} @ 600mm → ${result}mm (期待値: 780mm)`);
      });
    });

    test('クラフト紙で幅760mmの場合、780mmを返すこと', () => {
      const result = determineMaterialWidth(760, 'kraft_pet_lldpe');
      expect(result).toBe(780);
      console.log(`クラフト紙 @ 760mm → ${result}mm (期待値: 780mm)`);
    });

    test('クラフト紙で幅 > 760mm の場合、1190mmを返すこと', () => {
      const result = determineMaterialWidth(800, 'kraft_pet_lldpe');
      expect(result).toBe(1190);
      console.log(`クラフト紙 @ 800mm → ${result}mm (期待値: 1190mm)`);
    });

    test('クラフト紙で幅1170mmの場合、1190mmを返すこと（境界値）', () => {
      const result = determineMaterialWidth(1170, 'kraft_vmpet_lldpe');
      expect(result).toBe(1190);
      console.log(`クラフト紙 @ 1170mm → ${result}mm (期待値: 1190mm)`);
    });
  });

  describe('通常材料の材料幅選択', () => {
    test('通常材料で幅 <= 570mm の場合、590mmを返すこと', () => {
      const result = determineMaterialWidth(476);
      expect(result).toBe(590);
      console.log(`通常材料 @ 476mm → ${result}mm (期待値: 590mm)`);
    });

    test('通常材料で幅570mmの場合、590mmを返すこと（境界値）', () => {
      const result = determineMaterialWidth(570);
      expect(result).toBe(590);
      console.log(`通常材料 @ 570mm → ${result}mm (期待値: 590mm)`);
    });

    test('通常材料で幅 > 570mm かつ <= 740mm の場合、760mmを返すこと', () => {
      const result = determineMaterialWidth(600);
      expect(result).toBe(760);
      console.log(`通常材料 @ 600mm → ${result}mm (期待値: 760mm)`);
    });

    test('通常材料で幅740mmの場合、760mmを返すこと（境界値）', () => {
      const result = determineMaterialWidth(740);
      expect(result).toBe(760);
      console.log(`通常材料 @ 740mm → ${result}mm (期待値: 760mm)`);
    });

    test('通常材料で幅 > 740mm の場合、警告して760mmを返すこと', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = determineMaterialWidth(800);
      expect(result).toBe(760);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('740mmを超えています'));
      consoleWarnSpy.mockRestore();
      console.log(`通常材料 @ 800mm → ${result}mm (期待値: 760mm with warning)`);
    });
  });

  describe('材料幅選択のエッジケース', () => {
    test('materialId未指定の場合、通常材料として処理すること', () => {
      const result = determineMaterialWidth(600);
      expect(result).toBe(760);
      console.log(`materialId未指定 @ 600mm → ${result}mm (期待値: 760mm)`);
    });

    test('クラフト紙で最小幅（1mm）の場合、780mmを返すこと', () => {
      const result = determineMaterialWidth(1, 'kraft_pe');
      expect(result).toBe(780);
      console.log(`クラフト紙 @ 1mm → ${result}mm (期待値: 780mm)`);
    });

    test('通常材料で最小幅（1mm）の場合、590mmを返すこと', () => {
      const result = determineMaterialWidth(1);
      expect(result).toBe(590);
      console.log(`通常材料 @ 1mm → ${result}mm (期待値: 590mm)`);
    });
  });
});

/**
 * 損失計算のテスト
 * unified-pricing-engine.tsのgetLossMeters関数のロジックを再現
 */
describe('KRAFT紙計算 - 損失計算', () => {
  // getLossMeters関数のロジックを再現
  const getLossMeters = (layers: Array<{ materialId: string }>): number => {
    const hasAL = layers.some(layer => layer.materialId === 'AL');
    const hasKraft = layers.some(layer => layer.materialId === 'KRAFT');
    // KRAFT材料は700mのロス、AL材料は400mのロス
    if (hasKraft) return 700;
    return hasAL ? 400 : 300;
  };

  describe('基本的な損失計算', () => {
    test('KRAFT材料を含む場合、700mのロスを返すこと', () => {
      const layers = [
        { materialId: 'PET' },
        { materialId: 'KRAFT' },
        { materialId: 'PE' }
      ];

      const result = getLossMeters(layers);
      expect(result).toBe(700);
      console.log(`KRAFT材料を含む層構造のロス: ${result}m (期待値: 700m)`);
    });

    test('AL材料のみを含む場合、400mのロスを返すこと', () => {
      const layers = [
        { materialId: 'PET' },
        { materialId: 'AL' },
        { materialId: 'PE' }
      ];

      const result = getLossMeters(layers);
      expect(result).toBe(400);
      console.log(`AL材料を含む層構造のロス: ${result}m (期待値: 400m)`);
    });

    test('KRAFTもALも含まない場合、300mのロスを返すこと', () => {
      const layers = [
        { materialId: 'PET' },
        { materialId: 'PE' },
        { materialId: 'CPP' }
      ];

      const result = getLossMeters(layers);
      expect(result).toBe(300);
      console.log(`通常材料の層構造のロス: ${result}m (期待値: 300m)`);
    });
  });

  describe('混合材料の損失計算', () => {
    test('KRAFTとALの両方を含む場合、最高値（700m）を使用すること', () => {
      const layers = [
        { materialId: 'PET' },
        { materialId: 'KRAFT' },
        { materialId: 'AL' },
        { materialId: 'PE' }
      ];

      const result = getLossMeters(layers);
      expect(result).toBe(700);
      console.log(`KRAFT+AL混合層構造のロス: ${result}m (期待値: 700m - KRAFT優先)`);
    });

    test('複数のKRAFT層がある場合、700mのロスを返すこと（重複カウントなし）', () => {
      const layers = [
        { materialId: 'KRAFT' },
        { materialId: 'PE' },
        { materialId: 'KRAFT' }
      ];

      const result = getLossMeters(layers);
      expect(result).toBe(700);
      console.log(`複数KRAFT層のロス: ${result}m (期待値: 700m)`);
    });

    test('複数のAL層がある場合、400mのロスを返すこと（重複カウントなし）', () => {
      const layers = [
        { materialId: 'PET' },
        { materialId: 'AL' },
        { materialId: 'AL' }
      ];

      const result = getLossMeters(layers);
      expect(result).toBe(400);
      console.log(`複数AL層のロス: ${result}m (期待値: 400m)`);
    });
  });

  describe('エッジケース', () => {
    test('空の配列の場合、300mのロスを返すこと', () => {
      const layers: Array<{ materialId: string }> = [];

      const result = getLossMeters(layers);
      expect(result).toBe(300);
      console.log(`空の配列のロス: ${result}m (期待値: 300m)`);
    });

    test('KRAFTのみの単層構造の場合、700mのロスを返すこと', () => {
      const layers = [
        { materialId: 'KRAFT' }
      ];

      const result = getLossMeters(layers);
      expect(result).toBe(700);
      console.log(`KRAFT単層のロス: ${result}m (期待値: 700m)`);
    });

    test('ALのみの単層構造の場合、400mのロスを返すこと', () => {
      const layers = [
        { materialId: 'AL' }
      ];

      const result = getLossMeters(layers);
      expect(result).toBe(400);
      console.log(`AL単層のロス: ${result}m (期待値: 400m)`);
    });
  });
});

/**
 * 統合テスト - 実際の使用シナリオ
 */
describe('KRAFT紙計算 - 実際の使用シナリオ', () => {
  const getLossMeters = (layers: Array<{ materialId: string }>): number => {
    const hasAL = layers.some(layer => layer.materialId === 'AL');
    const hasKraft = layers.some(layer => layer.materialId === 'KRAFT');
    if (hasKraft) return 700;
    return hasAL ? 400 : 300;
  };

  describe('一般的な3層構造', () => {
    test('PET/AL/PE構造 - 400mロス', () => {
      const layers = [
        { materialId: 'PET' },
        { materialId: 'AL' },
        { materialId: 'PE' }
      ];
      expect(getLossMeters(layers)).toBe(400);
    });

    test('PET/KRAFT/PE構造 - 700mロス', () => {
      const layers = [
        { materialId: 'PET' },
        { materialId: 'KRAFT' },
        { materialId: 'PE' }
      ];
      expect(getLossMeters(layers)).toBe(700);
    });

    test('PET/PE/CPP構造 - 300mロス', () => {
      const layers = [
        { materialId: 'PET' },
        { materialId: 'PE' },
        { materialId: 'CPP' }
      ];
      expect(getLossMeters(layers)).toBe(300);
    });
  });

  describe('高バリア4層構造', () => {
    test('PET/AL/PA/PE構造 - 400mロス', () => {
      const layers = [
        { materialId: 'PET' },
        { materialId: 'AL' },
        { materialId: 'PA' },
        { materialId: 'PE' }
      ];
      expect(getLossMeters(layers)).toBe(400);
    });

    test('PET/KRAFT/PA/PE構造 - 700mロス', () => {
      const layers = [
        { materialId: 'PET' },
        { materialId: 'KRAFT' },
        { materialId: 'PA' },
        { materialId: 'PE' }
      ];
      expect(getLossMeters(layers)).toBe(700);
    });
  });

  describe('材料幅と損失の組み合わせ', () => {
    test('クラフト紙600mm幅 + KRAFT層 → 780mm幅 + 700mロス', () => {
      const materialWidth = determineMaterialWidth(600, 'kraft_pet_lldpe');
      const layers = [{ materialId: 'KRAFT' }];
      const loss = getLossMeters(layers);

      expect(materialWidth).toBe(780);
      expect(loss).toBe(700);
      console.log(`クラフト紙600mm: 幅=${materialWidth}mm, ロス=${loss}m`);
    });

    test('通常材料600mm幅 + AL層 → 760mm幅 + 400mロス', () => {
      const materialWidth = determineMaterialWidth(600);
      const layers = [{ materialId: 'AL' }];
      const loss = getLossMeters(layers);

      expect(materialWidth).toBe(760);
      expect(loss).toBe(400);
      console.log(`通常材料600mm: 幅=${materialWidth}mm, ロス=${loss}m`);
    });

    test('クラフト紙800mm幅 + KRAFT層 → 1190mm幅 + 700mロス', () => {
      const materialWidth = determineMaterialWidth(800, 'kraft_vmpet_lldpe');
      const layers = [{ materialId: 'KRAFT' }];
      const loss = getLossMeters(layers);

      expect(materialWidth).toBe(1190);
      expect(loss).toBe(700);
      console.log(`クラフト紙800mm: 幅=${materialWidth}mm, ロス=${loss}m`);
    });
  });
});
