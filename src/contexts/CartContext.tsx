'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import type { Cart, CartItem, QuoteRequest, QuoteResponse, CartContextType } from '@/types/cart'

// Cart state type
interface CartState {
  cart: Cart | null
  items: CartItem[]
  isLoading: boolean
  error: string | null
}

// Action types
type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_CART'; payload: Cart }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'UPDATE_SPECIFICATIONS'; payload: { itemId: string; specifications: CartItem['specifications']; unitPrice?: number; totalPrice?: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'UPDATE_TOTALS' }

// Initial state
const initialState: CartState = {
  cart: null,
  items: [],
  isLoading: false,
  error: null
}

// Cart reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }

    case 'LOAD_CART':
      return {
        ...state,
        cart: action.payload,
        items: action.payload.items,
        isLoading: false,
        error: null
      }

    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.productId === action.payload.productId
      )

      let newItems: CartItem[]
      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = [...state.items]
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + action.payload.quantity,
          totalPrice: newItems[existingItemIndex].totalPrice + action.payload.totalPrice
        }
      } else {
        // Add new item
        newItems = [...state.items, action.payload]
      }

      return {
        ...state,
        items: newItems,
        cart: state.cart ? { ...state.cart, items: newItems, updatedAt: new Date() } : null
      }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload)
      return {
        ...state,
        items: newItems,
        cart: state.cart ? { ...state.cart, items: newItems, updatedAt: new Date() } : null
      }
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.itemId
          ? { ...item, quantity: action.payload.quantity }
          : item
      )
      return {
        ...state,
        items: newItems,
        cart: state.cart ? { ...state.cart, items: newItems, updatedAt: new Date() } : null
      }
    }

    case 'UPDATE_SPECIFICATIONS': {
      const newItems = state.items.map(item =>
        item.id === action.payload.itemId
          ? {
              ...item,
              specifications: action.payload.specifications,
              ...(action.payload.unitPrice && { unitPrice: action.payload.unitPrice }),
              ...(action.payload.totalPrice && { totalPrice: action.payload.totalPrice })
            }
          : item
      )
      return {
        ...state,
        items: newItems,
        cart: state.cart ? { ...state.cart, items: newItems, updatedAt: new Date() } : null
      }
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        cart: state.cart ? { ...state.cart, items: [], updatedAt: new Date() } : null
      }

    case 'UPDATE_TOTALS': {
      if (!state.cart) return state

      const subtotal = state.items.reduce((sum, item) => sum + item.totalPrice, 0)
      const tax = Math.round(subtotal * 0.1) // 10% tax
      const shipping = state.items.length > 0 ? 1500 : 0 // Flat shipping rate
      const discount = 0 // No discount for now
      const total = subtotal + tax + shipping - discount

      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.items,
          subtotal,
          tax,
          shipping,
          discount,
          total,
          updatedAt: new Date()
        }
      }
    }

    default:
      return state
  }
}

// Context
const CartContext = createContext<CartContextType | null>(null)

// Provider component
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Initialize cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('epackage-cart')
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart)
        const cart: Cart = {
          ...cartData,
          createdAt: new Date(cartData.createdAt),
          updatedAt: new Date(cartData.updatedAt),
          items: cartData.items.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt)
          }))
        }
        dispatch({ type: 'LOAD_CART', payload: cart })
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error)
        // Create new cart
        createNewCart()
      }
    } else {
      createNewCart()
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (state.cart) {
      localStorage.setItem('epackage-cart', JSON.stringify(state.cart))
    }
  }, [state.cart])

  // Create new cart
  const createNewCart = useCallback(() => {
    const newCart: Cart = {
      id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      currency: 'JPY',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft'
    }
    dispatch({ type: 'LOAD_CART', payload: newCart })
  }, [])

  // Calculate totals
  const calculateTotals = useCallback(() => {
    dispatch({ type: 'UPDATE_TOTALS' })
  }, [])

  // Add item to cart
  const addItem = useCallback((
    product: CartItem['product'],
    quantity: number,
    specifications?: CartItem['specifications']
  ) => {
    if (!state.cart) return

    const { unitPrice, totalPrice } = calculateItemPrice(product, quantity, specifications)

    const newItem: CartItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      product,
      quantity,
      specifications: specifications || {},
      unitPrice,
      totalPrice,
      addedAt: new Date()
    }

    dispatch({ type: 'ADD_ITEM', payload: newItem })
    calculateTotals()
  }, [state.cart, calculateTotals])

  // Remove item from cart
  const removeItem = useCallback((itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId })
    calculateTotals()
  }, [calculateTotals])

  // Update item quantity
  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }

    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } })

    // Recalculate item price
    if (state.cart) {
      const item = state.items.find(i => i.id === itemId)
      if (item) {
        const { unitPrice, totalPrice } = calculateItemPrice(
          item.product,
          quantity,
          item.specifications
        )

        dispatch({
          type: 'UPDATE_SPECIFICATIONS',
          payload: {
            itemId,
            specifications: item.specifications,
            unitPrice,
            totalPrice
          }
        })
      }
    }

    calculateTotals()
  }, [state.items, state.cart, removeItem, calculateTotals])

  // Update item specifications
  const updateSpecifications = useCallback((
    itemId: string,
    specifications: CartItem['specifications']
  ) => {
    dispatch({ type: 'UPDATE_SPECIFICATIONS', payload: { itemId, specifications } })

    // Recalculate item price
    if (state.cart) {
      const item = state.items.find(i => i.id === itemId)
      if (item) {
        const { unitPrice, totalPrice } = calculateItemPrice(
          item.product,
          item.quantity,
          specifications
        )

        dispatch({
          type: 'UPDATE_SPECIFICATIONS',
          payload: {
            itemId,
            specifications,
            unitPrice,
            totalPrice
          }
        })
      }
    }

    calculateTotals()
  }, [state.items, state.cart, calculateTotals])

  // Clear cart
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
    calculateTotals()
  }, [calculateTotals])

  // Request quote
  const requestQuote = useCallback(async (
    quoteRequest: Omit<QuoteRequest, 'id' | 'cartId' | 'requestedAt' | 'status'>
  ): Promise<QuoteResponse> => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      const response = await fetch('/api/quotes/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...quoteRequest,
          cartId: state.cart?.id,
          items: state.items
        })
      })

      if (!response.ok) {
        throw new Error('Failed to request quote')
      }

      const quoteResponse: QuoteResponse = await response.json()

      // Update cart status
      if (state.cart) {
        dispatch({
          type: 'LOAD_CART',
          payload: { ...state.cart, status: 'quote_requested' }
        })
      }

      return quoteResponse
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request quote'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.cart, state.items])

  // Convert quote to order
  const convertToOrder = useCallback(async (quoteId: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteId,
          cartId: state.cart?.id,
          items: state.items
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      // Clear cart after successful order
      clearCart()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.cart, state.items, clearCart])

  // Calculate item price utility
  const calculateItemPrice = (
    product: CartItem['product'],
    quantity: number,
    specifications?: CartItem['specifications']
  ) => {
    const baseCost = product.pricing_formula.base_cost || 0
    const perUnitCost = product.pricing_formula.per_unit_cost || 0
    const setupFee = product.pricing_formula.setup_fee || 0

    // Base calculation
    let unitPrice = perUnitCost
    let totalPrice = baseCost + (unitPrice * quantity)

    // Add setup fee distributed across units
    if (setupFee && quantity > 0) {
      unitPrice += setupFee / quantity
      totalPrice += setupFee
    }

    // Adjust for material specifications
    if (specifications?.material) {
      const materialMultiplier = getMaterialMultiplier(specifications.material)
      unitPrice *= materialMultiplier
      totalPrice = unitPrice * quantity + baseCost
    }

    return { unitPrice, totalPrice }
  }

  // Material multiplier utility
  const getMaterialMultiplier = (material: string): number => {
    const multipliers: { [key: string]: number } = {
      'PE': 1.0,
      'PP': 1.1,
      'PET': 1.2,
      'ALUMINUM': 1.5,
      'PAPER_LAMINATE': 1.3,
      '特殊素材': 2.0
    }
    return multipliers[material] || 1.0
  }

  const value: CartContextType = {
    cart: state.cart,
    items: state.items,
    addItem,
    removeItem,
    updateQuantity,
    updateSpecifications,
    clearCart,
    calculateTotals,
    requestQuote,
    convertToOrder,
    isLoading: state.isLoading,
    error: state.error
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Export types for external use
export type { CartContextType, CartState, CartAction }