/**
 * Pricing Engine Tests
 * 統一価格計算エンジンのテスト
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import { pricingEngine, PricingEngine } from '../core/engine'
import { PouchStrategy } from '../strategies/pouch-strategy'
import { RollFilmStrategy } from '../strategies/roll-film-strategy'
import type { CalculationParams } from '../core/types'

describe('PricingEngine', () => {
  let engine: PricingEngine

  beforeEach(() => {
    engine = new PricingEngine()
  })

  describe('戦略登録と取得', () => {
    it('PouchStrategyが登録される', () => {
      expect(() => engine.registerStrategy(new PouchStrategy())).not.toThrow()
    })

    it('RollFilmStrategyが登録される', () => {
      expect(() => engine.registerStrategy(new RollFilmStrategy())).not.toThrow()
    })
  })

  describe('パウチ製品価格計算', () => {
    const pouchParams: CalculationParams = {
      bagTypeId: 'flat_3_side',
      materialId: 'pet_al',
      width: 200,
      height: 300,
      depth: 0,
      quantity: 1000,
      thicknessSelection: 'medium',
      isUVPrinting: false,
      postProcessingOptions: [],
      printingType: 'digital',
      printingColors: 1,
      doubleSided: false,
      deliveryLocation: 'domestic',
      urgency: 'standard',
    }

    it('三辺シールパウチの価格計算が成功する', async () => {
      const result = await engine.calculatePrice(pouchParams)

      expect(result).toBeDefined()
      expect(result.unitPrice).toBeGreaterThan(0)
      expect(result.totalPrice).toBeGreaterThan(0)
      expect(result.currency).toBe('JPY')
      expect(result.leadTimeDays).toBeGreaterThan(0)
      expect(result.quantity).toBe(1000)
    })

    it('スタンドアップパウチの価格計算が成功する', async () => {
      const standUpParams = { ...pouchParams, bagTypeId: 'stand_up' as const }
      const result = await engine.calculatePrice(standUpParams)

      expect(result).toBeDefined()
      expect(result.unitPrice).toBeGreaterThan(0)
    })

    it('後加工オプションが価格に反映される', async () => {
      const withZipperParams = {
        ...pouchParams,
        postProcessingOptions: ['zipper-yes']
      }
      const withoutZipperParams = { ...pouchParams }

      const [withZipper, withoutZipper] = await Promise.all([
        engine.calculatePrice(withZipperParams),
        engine.calculatePrice(withoutZipperParams)
      ])

      expect(withZipper.totalPrice).toBeGreaterThan(withoutZipper.totalPrice)
    })

    it('マット仕上げが追加価格に反映される', async () => {
      const matteParams = {
        ...pouchParams,
        postProcessingOptions: ['matte']
      }

      const result = await engine.calculatePrice(matteParams)
      expect(result).toBeDefined()
      expect(result.totalPrice).toBeGreaterThan(0)
    })
  })

  describe('ロールフィルム価格計算', () => {
    const rollFilmParams: CalculationParams = {
      bagTypeId: 'roll_film',
      materialId: 'pet_al',
      width: 590,
      height: 0,
      depth: 0,
      quantity: 1000, // メートル数として解釈
      thicknessSelection: 'medium',
      isUVPrinting: false,
      postProcessingOptions: [],
      printingType: 'digital',
      printingColors: 1,
      doubleSided: false,
      deliveryLocation: 'domestic',
      urgency: 'standard',
    }

    it('ロールフィルムの価格計算が成功する', async () => {
      const result = await engine.calculatePrice(rollFilmParams)

      expect(result).toBeDefined()
      expect(result.unitPrice).toBeGreaterThan(0)
      expect(result.totalPrice).toBeGreaterThan(0)
      expect(result.currency).toBe('JPY')
    })

    it('最小注文数量（500m）未満でエラーになる', async () => {
      const invalidParams = { ...rollFilmParams, quantity: 400 }

      await expect(engine.calculatePrice(invalidParams)).rejects.toThrow()
    })
  })

  describe('パラメータ検証', () => {
    const validParams: CalculationParams = {
      bagTypeId: 'flat_3_side',
      materialId: 'pet_al',
      width: 200,
      height: 300,
      quantity: 1000,
    }

    it('最小注文数量未満でエラー', async () => {
      const invalidParams = { ...validParams, quantity: 50 }

      await expect(engine.calculatePrice(invalidParams)).rejects.toThrow()
    })

    it('幅が範囲外でエラー', async () => {
      const invalidParams = { ...validParams, width: 5 }

      await expect(engine.calculatePrice(invalidParams)).rejects.toThrow()
    })

    it('高さが範囲外でエラー', async () => {
      const invalidParams = { ...validParams, height: 1500 }

      await expect(engine.calculatePrice(invalidParams)).rejects.toThrow()
    })
  })

  describe('キャッシュ機能', () => {
    it('同じパラメータでキャッシュが使用される', async () => {
      const params: CalculationParams = {
        bagTypeId: 'flat_3_side',
        materialId: 'pet_al',
        width: 200,
        height: 300,
        quantity: 1000,
      }

      const result1 = await engine.calculatePrice(params)
      const result2 = await engine.calculatePrice(params)

      expect(result1).toEqual(result2)
      expect(engine.getCacheSize()).toBeGreaterThan(0)
    })

    it('キャッシュクリアでサイズが0になる', () => {
      engine.clearCache()
      expect(engine.getCacheSize()).toBe(0)
    })
  })

  describe('厚さ選択による価格変動', () => {
    const baseParams: CalculationParams = {
      bagTypeId: 'flat_3_side',
      materialId: 'pet_al',
      width: 200,
      height: 300,
      quantity: 1000,
    }

    it('heavyタイプはmediumより高価', async () => {
      const [heavy, medium] = await Promise.all([
        engine.calculatePrice({ ...baseParams, thicknessSelection: 'heavy' }),
        engine.calculatePrice({ ...baseParams, thicknessSelection: 'medium' })
      ])

      expect(heavy.totalPrice).toBeGreaterThan(medium.totalPrice)
    })

    it('lightタイプはmediumより安価', async () => {
      const [light, medium] = await Promise.all([
        engine.calculatePrice({ ...baseParams, thicknessSelection: 'light' }),
        engine.calculatePrice({ ...baseParams, thicknessSelection: 'medium' })
      ])

      expect(light.totalPrice).toBeLessThan(medium.totalPrice)
    })
  })

  describe('緊急度によるリードタイム変動', () => {
    const baseParams: CalculationParams = {
      bagTypeId: 'flat_3_side',
      materialId: 'pet_al',
      width: 200,
      height: 300,
      quantity: 1000,
    }

    it('expressはstandardよりリードタイムが短い', async () => {
      const [express, standard] = await Promise.all([
        engine.calculatePrice({ ...baseParams, urgency: 'express' }),
        engine.calculatePrice({ ...baseParams, urgency: 'standard' })
      ])

      expect(express.leadTimeDays).toBeLessThan(standard.leadTimeDays)
    })
  })
})

describe('PricingEngine Integration', () => {
  it('シングルトンインスタンスが使用可能', async () => {
    const params: CalculationParams = {
      bagTypeId: 'flat_3_side',
      materialId: 'pet_al',
      width: 200,
      height: 300,
      quantity: 1000,
    }

    const result = await pricingEngine.calculatePrice(params)
    expect(result).toBeDefined()
    expect(result.totalPrice).toBeGreaterThan(0)
  })
})
