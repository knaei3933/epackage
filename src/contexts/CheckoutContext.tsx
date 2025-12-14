'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import {
  CheckoutState,
  BillingAddress,
  ShippingAddress,
  PaymentMethod,
  OrderItem,
  OrderSummary
} from '@/types/checkout'
import { useCart } from './CartContext'

// Type definitions
type CheckoutAction =
  | { type: 'SET_BILLING_ADDRESS'; payload: BillingAddress }
  | { type: 'SET_SHIPPING_ADDRESS'; payload: ShippingAddress }
  | { type: 'SET_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'SET_ORDER_ITEMS'; payload: OrderItem[] }
  | { type: 'CALCULATE_SUMMARY'; payload: OrderSummary }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: Record<string, string[]> }
  | { type: 'CLEAR_ERRORS'; payload?: string }
  | { type: 'RESET_CHECKOUT' }
  | { type: 'LOAD_SAVED_STATE'; payload: Partial<CheckoutState> }

interface CheckoutContextType {
  state: CheckoutState
  errors: Record<string, string[]>
  setBillingAddress: (address: BillingAddress) => void
  setShippingAddress: (address: ShippingAddress) => void
  setPaymentMethod: (method: PaymentMethod) => void
  calculateSummary: () => void
  setCurrentStep: (step: number) => void
  setProcessing: (processing: boolean) => void
  setErrors: (errors: Record<string, string[]>) => void
  clearErrors: (field?: string) => void
  resetCheckout: () => void
  canProceedToNextStep: () => boolean
  validateCurrentStep: () => boolean
}

const initialState: CheckoutState = {
  currentStep: 0,
  billingAddress: null,
  shippingAddress: null,
  paymentMethod: null,
  orderItems: [],
  summary: null,
  isProcessing: false,
  errors: {}
}

// Checkout reducer
function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case 'SET_BILLING_ADDRESS':
      return {
        ...state,
        billingAddress: action.payload,
        errors: { ...state.errors, billingAddress: [] }
      }

    case 'SET_SHIPPING_ADDRESS':
      return {
        ...state,
        shippingAddress: action.payload,
        errors: { ...state.errors, shippingAddress: [] }
      }

    case 'SET_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethod: action.payload,
        errors: { ...state.errors, paymentMethod: [] }
      }

    case 'SET_ORDER_ITEMS':
      return {
        ...state,
        orderItems: action.payload
      }

    case 'CALCULATE_SUMMARY':
      return {
        ...state,
        summary: action.payload
      }

    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload
      }

    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload
      }

    case 'SET_ERRORS':
      return {
        ...state,
        errors: { ...state.errors, ...action.payload }
      }

    case 'CLEAR_ERRORS':
      if (action.payload) {
        const newErrors = { ...state.errors }
        delete newErrors[action.payload]
        return { ...state, errors: newErrors }
      }
      return { ...state, errors: {} }

    case 'RESET_CHECKOUT':
      return initialState

    case 'LOAD_SAVED_STATE':
      return {
        ...state,
        ...action.payload
      }

    default:
      return state
  }
}

// Create context
const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined)

// Provider component
export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(checkoutReducer, initialState)
  const { items } = useCart()

  // Load saved checkout state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('epackage-checkout')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        dispatch({ type: 'LOAD_SAVED_STATE', payload: parsed })
      } catch (error) {
        console.error('Failed to load checkout state:', error)
      }
    }
  }, [])

  // Save checkout state to localStorage
  useEffect(() => {
    const stateToSave = {
      billingAddress: state.billingAddress,
      shippingAddress: state.shippingAddress,
      paymentMethod: state.paymentMethod,
      currentStep: state.currentStep
    }
    localStorage.setItem('epackage-checkout', JSON.stringify(stateToSave))
  }, [state.billingAddress, state.shippingAddress, state.paymentMethod, state.currentStep])

  // Update order items when cart changes
  useEffect(() => {
    const orderItems: OrderItem[] = items.map(item => ({
      id: item.id,
      productId: item.product.id,
      name: item.product.name_en,
      nameJa: item.product.name_ja,
      description: item.product.description_ja,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      specifications: {
        material: item.specifications.material || '標準',
        thickness: item.specifications.thickness || 100,
        printing: item.specifications.printing || {
          colors: 1,
          sides: 'front',
          method: 'offset'
        },
        size: (item.specifications.width && item.specifications.height) ? {
          width: item.specifications.width,
          height: item.specifications.height
        } : undefined
      },
      leadTime: item.product.lead_time_days,
      minOrderQuantity: item.product.min_order_quantity
    }))

    dispatch({ type: 'SET_ORDER_ITEMS', payload: orderItems })
  }, [items])

  // Auto-calculate summary when items or addresses change
  useEffect(() => {
    if (state.orderItems.length > 0) {
      calculateSummary()
    }
  }, [state.orderItems, state.shippingAddress])

  const calculateSummary = () => {
    const subtotal = state.orderItems.reduce((sum, item) => sum + item.totalPrice, 0)

    // Japanese consumption tax (10%)
    const tax = Math.round(subtotal * 0.1)

    // Shipping fee calculation (simplified for B2B)
    let shippingFee = 0
    if (state.shippingAddress && state.orderItems.length > 0) {
      // Base shipping fee based on order value
      if (subtotal < 10000) shippingFee = 800
      else if (subtotal < 50000) shippingFee = 1200
      else if (subtotal < 100000) shippingFee = 1800
      else shippingFee = 0 // Free shipping for large orders
    }

    // Installation fee for large orders
    let installationFee = 0
    if (subtotal > 200000) {
      installationFee = Math.round(subtotal * 0.05) // 5% installation fee
    }

    // Calculate estimated delivery
    const maxLeadTime = Math.max(...state.orderItems.map(item => item.leadTime))
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + maxLeadTime + 7) // +7 days buffer

    const summary: OrderSummary = {
      subtotal,
      tax,
      shippingFee,
      installationFee,
      total: subtotal + tax + shippingFee + (installationFee || 0),
      estimatedDelivery: deliveryDate.toLocaleDateString('ja-JP'),
      paymentTerms: state.paymentMethod?.type === 'invoice' ? '請求書払い（30日）' : '即時払い'
    }

    dispatch({ type: 'CALCULATE_SUMMARY', payload: summary })
  }

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string[]> = {}

    switch (state.currentStep) {
      case 0: // Billing Address
        if (!state.billingAddress) {
          errors.billingAddress = ['請求先住所を入力してください']
        } else {
          const billingErrors: string[] = []
          if (!state.billingAddress.company) billingErrors.push('会社名を入力してください')
          if (!state.billingAddress.name) billingErrors.push('担当者名を入力してください')
          if (!state.billingAddress.email) billingErrors.push('メールアドレスを入力してください')
          if (!state.billingAddress.phone) billingErrors.push('電話番号を入力してください')
          if (!state.billingAddress.zipCode) billingErrors.push('郵便番号を入力してください')
          if (!state.billingAddress.prefecture) billingErrors.push('都道府県を選択してください')
          if (!state.billingAddress.address) billingErrors.push('住所を入力してください')

          if (billingErrors.length > 0) {
            errors.billingAddress = billingErrors
          }
        }
        break

      case 1: // Shipping Address
        if (!state.shippingAddress) {
          errors.shippingAddress = ['配送先住所を入力してください']
        } else {
          const shippingErrors: string[] = []
          if (!state.shippingAddress.company) shippingErrors.push('会社名を入力してください')
          if (!state.shippingAddress.contactName) shippingErrors.push('担当者名を入力してください')
          if (!state.shippingAddress.phone) shippingErrors.push('電話番号を入力してください')
          if (!state.shippingAddress.zipCode) shippingErrors.push('郵便番号を入力してください')
          if (!state.shippingAddress.prefecture) shippingErrors.push('都道府県を選択してください')
          if (!state.shippingAddress.address) shippingErrors.push('住所を入力してください')

          if (shippingErrors.length > 0) {
            errors.shippingAddress = shippingErrors
          }
        }
        break

      case 2: // Payment Method
        if (!state.paymentMethod) {
          errors.paymentMethod = ['支払方法を選択してください']
        } else {
          const paymentErrors: string[] = []
          if (state.paymentMethod.type === 'credit_card') {
            if (!state.paymentMethod.details?.cardNumber) {
              paymentErrors.push('カード番号を入力してください')
            }
            if (!state.paymentMethod.details?.expiryDate) {
              paymentErrors.push('有効期限を入力してください')
            }
            if (!state.paymentMethod.details?.cvv) {
              paymentErrors.push('CVVを入力してください')
            }
            if (!state.paymentMethod.details?.cardholderName) {
              paymentErrors.push('カード名義人を入力してください')
            }
          }

          if (state.paymentMethod.type === 'invoice' && !state.paymentMethod.purchaseOrder) {
            paymentErrors.push('購入発注番号を入力してください')
          }

          if (paymentErrors.length > 0) {
            errors.paymentMethod = paymentErrors
          }
        }
        break

      case 3: // Review
        if (!state.summary) {
          errors.summary = ['注文内容を確認してください']
        }
        break
    }

    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_ERRORS', payload: errors })
      return false
    }

    dispatch({ type: 'CLEAR_ERRORS' })
    return true
  }

  const canProceedToNextStep = (): boolean => {
    switch (state.currentStep) {
      case 0:
        return !!state.billingAddress
      case 1:
        return !!state.shippingAddress
      case 2:
        return !!state.paymentMethod
      case 3:
        return !!state.summary && state.orderItems.length > 0
      default:
        return false
    }
  }

  const setBillingAddress = (address: BillingAddress) => {
    dispatch({ type: 'SET_BILLING_ADDRESS', payload: address })
  }

  const setShippingAddress = (address: ShippingAddress) => {
    dispatch({ type: 'SET_SHIPPING_ADDRESS', payload: address })
  }

  const setPaymentMethod = (method: PaymentMethod) => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: method })
  }

  const setCurrentStep = (step: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step })
  }

  const setProcessing = (processing: boolean) => {
    dispatch({ type: 'SET_PROCESSING', payload: processing })
  }

  const setErrors = (errors: Record<string, string[]>) => {
    dispatch({ type: 'SET_ERRORS', payload: errors })
  }

  const clearErrors = (field?: string) => {
    dispatch({ type: 'CLEAR_ERRORS', payload: field })
  }

  const resetCheckout = () => {
    dispatch({ type: 'RESET_CHECKOUT' })
    localStorage.removeItem('epackage-checkout')
  }

  const value: CheckoutContextType = {
    state,
    errors: state.errors,
    setBillingAddress,
    setShippingAddress,
    setPaymentMethod,
    calculateSummary,
    setCurrentStep,
    setProcessing,
    setErrors,
    clearErrors,
    resetCheckout,
    canProceedToNextStep,
    validateCurrentStep
  }

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  )
}

// Hook to use checkout context
export function useCheckout() {
  const context = useContext(CheckoutContext)
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider')
  }
  return context
}