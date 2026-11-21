import { CLIENT_COUNT_LABEL, LEAD_TIME_LABEL, LEAD_TIME_MIN_DAYS, REPLY_TIME_LABEL, BUSINESS_HOURS_LABEL } from '../site-facts'

describe('site-facts', () => {
  it('決まった数字を持つ', () => {
    expect(CLIENT_COUNT_LABEL).toBe('100社以上')
    expect(LEAD_TIME_LABEL).toBe('最短30日')
    expect(LEAD_TIME_MIN_DAYS).toBe(30)
    expect(REPLY_TIME_LABEL).toBe('2営業日以内')
    expect(BUSINESS_HOURS_LABEL).toBe('平日 9:00-18:00')
  })
})

import { readFileSync } from 'fs'
import { join } from 'path'
import { MIN_ORDER_BAG, MIN_ORDER_BAG_LABEL, MIN_ORDER_ROLL, MIN_ORDER_ROLL_LABEL, minOrderLabel } from '../site-facts'
import { getAllProducts } from '../product-data'
import { catalogProducts } from '../../data/catalogData'

describe('最小注文数量（見積もり画面と同じ数字）', () => {
  it('定数は 袋500個・ロール500m', () => {
    expect(MIN_ORDER_BAG).toBe(500)
    expect(MIN_ORDER_BAG_LABEL).toBe('500個')
    expect(MIN_ORDER_ROLL).toBe(500)
    expect(MIN_ORDER_ROLL_LABEL).toBe('500m')
    expect(minOrderLabel(false)).toBe('500個')
    expect(minOrderLabel(true)).toBe('500m')
  })

  it('見積もり画面の入力欄の下限と同じ値', () => {
    const step = readFileSync(join(__dirname, '../../components/quote/steps/UnifiedSKUQuantityStep.tsx'), 'utf-8')
    expect(step).toMatch(new RegExp(`minQtyPerCell = ${MIN_ORDER_BAG}\\b`))
    expect(step).toContain(`"${MIN_ORDER_BAG}"`)
    expect(step).toContain(`'${MIN_ORDER_ROLL}'`)
  })

  it('商品データ（product-data）は全製品が対応表の値', () => {
    const products = getAllProducts(null, 'ja') as any[]
    expect(products.length).toBeGreaterThan(0)
    for (const p of products) {
      const isRoll = p.category === 'roll_film'
      expect(p.min_order_quantity).toBe(isRoll ? MIN_ORDER_ROLL : MIN_ORDER_BAG)
      expect(p.pricing_formula.min_quantity).toBe(p.min_order_quantity)
    }
  })

  it('カタログ用データ（catalogData）も同じ値で、袋は pieces・ロールは meters', () => {
    for (const p of catalogProducts as any[]) {
      const isRoll = p.id.startsWith('roll-film')
      expect(p.minOrder.quantity).toBe(isRoll ? MIN_ORDER_ROLL : MIN_ORDER_BAG)
      expect(p.minOrder.unit).toBe(isRoll ? 'meters' : 'pieces')
    }
  })
})
