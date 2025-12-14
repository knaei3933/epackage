import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase'
import { PricingEngine, QuoteCalculationParamsSchema } from '@/lib/pricing-engine'

// Validation schema
const QuoteRequestSchema = z.object({
  customerInfo: z.object({
    companyName: z.string().min(1, 'Company name is required'),
    contactPerson: z.string().min(1, 'Contact person is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional(),
    address: z.object({
      postalCode: z.string().optional(),
      prefecture: z.string().optional(),
      city: z.string().optional(),
      address1: z.string().optional(),
      address2: z.string().optional()
    }).optional()
  }),
  products: z.array(QuoteCalculationParamsSchema).min(1, 'At least one product is required'),
  deliveryLocation: z.string().optional(),
  urgency: z.enum(['standard', 'express']).optional(),
  notes: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = QuoteRequestSchema.parse(body)

    const supabase = createServiceClient()

    // Calculate prices for all products
    const calculatedQuotes = []
    let totalPrice = 0
    let maxLeadTime = 0

    for (const productParams of validatedData.products) {
      try {
        PricingEngine.validateQuoteParams(productParams)
        const quoteResult = await PricingEngine.calculateQuote(productParams)

        calculatedQuotes.push({
          product: {
            id: productParams.product.id,
            category: productParams.product.category,
            name_ja: productParams.product.name_ja,
            name_en: productParams.product.name_en
          },
          specifications: productParams.specifications,
          quantity: productParams.quantity,
          customOptions: productParams.customOptions,
          result: quoteResult
        })

        totalPrice += quoteResult.totalPrice
        maxLeadTime = Math.max(maxLeadTime, quoteResult.leadTimeDays)
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: `Calculation error for product ${productParams.product.name_ja}: ${error instanceof Error ? error.message : String(error)}`
          },
          { status: 400 }
        )
      }
    }

    // Create quote record in database
    const quoteData = {
      customer_info: validatedData.customerInfo,
      product_configurations: calculatedQuotes,
      calculated_prices: {
        items: calculatedQuotes.map(q => ({
          product: q.product,
          quantity: q.quantity,
          unitPrice: q.result.unitPrice,
          totalPrice: q.result.totalPrice
        })),
        subtotal: totalPrice,
        total: totalPrice
      },
      total_price: totalPrice,
      currency: 'JPY',
      status: 'draft' as const,
      delivery_location: validatedData.deliveryLocation,
      urgency: validatedData.urgency || 'standard',
      lead_time_days: maxLeadTime,
      notes: validatedData.notes
    }

    const { data: quote, error } = await supabase
      .from('quotes')
      .insert(quoteData as any)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to save quote')
    }

    // Send notification email (in a real implementation)
    await sendQuoteNotification(quote, validatedData.customerInfo)

    return NextResponse.json({
      success: true,
      quote: {
        id: (quote as any)?.id,
        customerInfo: validatedData.customerInfo,
        items: calculatedQuotes,
        summary: {
          subtotal: totalPrice,
          total: totalPrice,
          currency: 'JPY',
          leadTimeDays: maxLeadTime,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    })

  } catch (error) {
    console.error('Quote calculation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const quoteId = searchParams.get('id')

    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const { data: quote, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single()

    if (error || !quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      quote
    })

  } catch (error) {
    console.error('Get quote error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// Helper function to send notification (placeholder)
async function sendQuoteNotification(quote: any, customerInfo: any) {
  // In a real implementation, this would use SendGrid or another email service
  console.log('Quote notification sent:', {
    quoteId: quote.id,
    customerEmail: customerInfo.email,
    total: quote.total_price
  })
}