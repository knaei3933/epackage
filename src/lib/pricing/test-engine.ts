import { PriceCalculationEngine } from './PriceCalculationEngine'
import { QuotePatternSpecification } from './types'

async function testPricing() {
    const engine = new PriceCalculationEngine()

    const pattern: QuotePatternSpecification = {
        skuCount: 1,
        quantity: 3000,
        bag: {
            bagTypeId: 'flat_3_side',
            materialCompositionId: 'opp_alu',
            width: 100,
            height: 150,
            capacity: 0
        },
        printing: {
            printColors: { front: 0, back: 0 },
            printCoverage: 'partial',
            printPosition: 'center',
            printQuality: 'standard'
        },
        features: {}
    }

    try {
        const result = await engine.calculatePrice({
            pattern,
            userTier: 'basic',
            isRepeatOrder: false
        })

        console.log('--- Pricing Test Result ---')
        console.log(`Pattern: 100x150 Flat Bag, Qty 3000`)
        console.log(`Total Price: ${result.priceBreakdown.totalPrice.toLocaleString()} JPY`)
        console.log(`Unit Price: ${result.priceBreakdown.unitPrice.toFixed(2)} JPY`)
        console.log('Breakdown:', JSON.stringify(result.priceBreakdown, null, 2))

        // Expected: ~202,800 JPY
        const expected = 202800
        const diff = result.priceBreakdown.totalPrice - expected
        console.log(`Difference from Brixa: ${diff} JPY (${(diff / expected * 100).toFixed(2)}%)`)

        // Test 2: Zipper Bag
        const zipperPattern = { ...pattern, features: { resealability: { type: 'zipper', position: 'top' } } } as QuotePatternSpecification
        const zipperResult = await engine.calculatePrice({
            pattern: zipperPattern,
            userTier: 'basic',
            isRepeatOrder: false
        })
        console.log('\n--- Zipper Test Result ---')
        console.log(`Total Price: ${zipperResult.priceBreakdown.totalPrice.toLocaleString()} JPY`)
        console.log(`Zipper Delta: ${(zipperResult.priceBreakdown.totalPrice - result.priceBreakdown.totalPrice).toLocaleString()} JPY`)

    } catch (error) {
        console.error('Test failed:', error)
    }
}

testPricing()
