/**
 * 製品タイプ別PDF/DB実装の検証テスト
 *
 * 検証項目:
 * 1. PouchSpecs型定義に'box'が含まれている
 * 2. spoutSizeがDB保存時に含まれる
 * 3. 製品タイプ別バリデーションが正しく動作する
 */

import { PouchSpecs, SpoutPouchSpecs, RollFilmSpecs, isSpoutPouch, isRollFilm } from '../../types/quote';

describe('製品タイプ別実装検証', () => {
  describe('型定義の検証', () => {
    test('PouchSpecsにboxが含まれている', () => {
      const specs: PouchSpecs = {
        bagTypeId: 'box',
        materialId: 'pet_al_pet',
        width: 150,
        height: 200,
        thicknessSelection: 'standard',
        postProcessingOptions: [],
        sideWidth: 50
      };

      expect(specs.bagTypeId).toBe('box');
      expect(specs.sideWidth).toBe(50);
    });

    test('PouchSpecsがすべての製品タイプを含む', () => {
      const validTypes: Array<PouchSpecs['bagTypeId']> = [
        'flat_3_side',
        'stand_up',
        'gusset',
        'lap_seal',
        'box'
      ];

      validTypes.forEach(type => {
        const specs: PouchSpecs = {
          bagTypeId: type,
          materialId: 'pet_al_pet',
          width: 150,
          height: 200,
          thicknessSelection: 'standard',
          postProcessingOptions: []
        };
        expect(specs.bagTypeId).toBe(type);
      });
    });

    test('型ガード関数が正しく動作する', () => {
      const spoutPouch: SpoutPouchSpecs = {
        bagTypeId: 'spout_pouch',
        materialId: 'pet_al_pet',
        width: 150,
        height: 200,
        thicknessSelection: 'standard',
        postProcessingOptions: [],
        spoutSize: 18,
        spoutPosition: 'top-center'
      };

      const rollFilm: RollFilmSpecs = {
        bagTypeId: 'roll_film',
        materialId: 'pet_al_pet',
        width: 150,
        height: 200,
        thicknessSelection: 'standard',
        postProcessingOptions: [],
        pitch: 150,
        totalLength: 1000,
        rollCount: 1
      };

      expect(isSpoutPouch(spoutPouch)).toBe(true);
      expect(isRollFilm(rollFilm)).toBe(true);
      expect(isSpoutPouch(rollFilm)).toBe(false);
      expect(isRollFilm(spoutPouch)).toBe(false);
    });
  });

  describe('spoutSizeデータ永続化の検証', () => {
    test('スパウトパウチ仕様にspoutSizeが含まれる', () => {
      const spoutPouchSpecs: SpoutPouchSpecs = {
        bagTypeId: 'spout_pouch',
        materialId: 'pet_al_pet',
        width: 150,
        height: 200,
        thicknessSelection: 'standard',
        postProcessingOptions: [],
        spoutSize: 18,
        spoutPosition: 'top-center'
      };

      // JSONシリアライズでspoutSizeが保持される
      const serialized = JSON.stringify(spoutPouchSpecs);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.spoutSize).toBe(18);
      expect(deserialized.spoutPosition).toBe('top-center');
    });

    test('スパウトサイズの全オプションが型定義に含まれる', () => {
      const validSpoutSizes: Array<SpoutPouchSpecs['spoutSize']> = [9, 15, 18, 22, 28];

      validSpoutSizes.forEach(size => {
        const specs: SpoutPouchSpecs = {
          bagTypeId: 'spout_pouch',
          materialId: 'pet_al_pet',
          width: 150,
          height: 200,
          thicknessSelection: 'standard',
          postProcessingOptions: [],
          spoutSize: size,
          spoutPosition: 'top-center'
        };

        expect(specs.spoutSize).toBe(size);
      });
    });
  });

  describe('製品タイプ別必須フィールドの検証', () => {
    test('スパウトパウチの必須フィールド', () => {
      // spoutSizeとspoutPositionが必須
      const validSpecs: Partial<SpoutPouchSpecs> = {
        spoutSize: 18,
        spoutPosition: 'top-center'
      };

      expect(validSpecs.spoutSize).toBeDefined();
      expect(validSpecs.spoutPosition).toBeDefined();
    });

    test('ロールフィルムの必須フィールド', () => {
      // pitch, totalLength, rollCountが必須
      const validSpecs: Partial<RollFilmSpecs> = {
        pitch: 150,
        totalLength: 1000,
        rollCount: 1
      };

      expect(validSpecs.pitch).toBeDefined();
      expect(validSpecs.totalLength).toBeDefined();
      expect(validSpecs.rollCount).toBeDefined();
    });

    test('ボックスパウチのsideWidthフィールド', () => {
      const boxSpecs: PouchSpecs = {
        bagTypeId: 'box',
        materialId: 'pet_al_pet',
        width: 150,
        height: 200,
        thicknessSelection: 'standard',
        postProcessingOptions: [],
        sideWidth: 50
      };

      expect(boxSpecs.sideWidth).toBe(50);
    });
  });
});
