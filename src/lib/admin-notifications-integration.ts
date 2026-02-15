/**
 * Admin Notifications Integration Guide
 *
 * This file provides examples of how to integrate admin notifications
 * into your business logic. Copy these patterns into your existing
 * API routes and business logic files.
 *
 * @module lib/admin-notifications-integration
 */

import {
  notifyNewOrder,
  notifyQuotationRequest,
  notifySampleRequest,
  notifyRegistrationRequest,
  notifyProductionComplete,
  notifyShipmentComplete,
  notifyContractSignature,
  notifySystemError,
} from './admin-notifications'

// ============================================================
// Example 1: Order Creation
// ============================================================

/**
 * Example: When a new order is created
 * Add this to your order creation API route
 */
export async function createOrderWithNotification(orderData: {
  id: string
  order_number: string
  customer_name: string
  total_amount: number
}) {
  try {
    // 1. Create the order (your existing logic)
    // const order = await createOrder(orderData)

    // 2. Send admin notification
    await notifyNewOrder(
      orderData.id,
      orderData.order_number,
      orderData.customer_name,
      orderData.total_amount
    )

    return { success: true, order: orderData }
  } catch (error) {
    console.error('[createOrderWithNotification] Error:', error)

    // Send system error notification
    await notifySystemError(
      'order_creation_failed',
      `Failed to create order for ${orderData.customer_name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { order_data: orderData }
    )

    throw error
  }
}

// ============================================================
// Example 2: Quotation Request
// ============================================================

/**
 * Example: When a quotation request is submitted
 * Add this to your quotation creation API route
 */
export async function createQuotationWithNotification(quotationData: {
  id: string
  quotation_number: string
  customer_name: string
}) {
  try {
    // 1. Create the quotation (your existing logic)
    // const quotation = await createQuotation(quotationData)

    // 2. Send admin notification
    await notifyQuotationRequest(
      quotationData.id,
      quotationData.quotation_number,
      quotationData.customer_name
    )

    return { success: true, quotation: quotationData }
  } catch (error) {
    console.error('[createQuotationWithNotification] Error:', error)

    await notifySystemError(
      'quotation_creation_failed',
      `Failed to create quotation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { quotation_data: quotationData }
    )

    throw error
  }
}

// ============================================================
// Example 3: Sample Request
// ============================================================

/**
 * Example: When a sample request is submitted
 * Add this to your sample request API route
 */
export async function createSampleRequestWithNotification(sampleData: {
  id: string
  customer_name: string
  items: Array<{ product_name: string }>
}) {
  try {
    // 1. Create the sample request (your existing logic)
    // const sample = await createSampleRequest(sampleData)

    // 2. Send admin notification
    await notifySampleRequest(
      sampleData.id,
      sampleData.customer_name,
      sampleData.items.length
    )

    return { success: true, sample: sampleData }
  } catch (error) {
    console.error('[createSampleRequestWithNotification] Error:', error)

    await notifySystemError(
      'sample_request_failed',
      `Failed to create sample request: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { sample_data: sampleData }
    )

    throw error
  }
}

// ============================================================
// Example 4: User Registration (B2B)
// ============================================================

/**
 * Example: When a new B2B user registers
 * Add this to your registration API route
 */
export async function handleUserRegistrationWithNotification(userData: {
  id: string
  name: string
  email: string
}) {
  try {
    // 1. Create the user (your existing logic)
    // const user = await createUser(userData)

    // 2. Send admin notification for approval
    await notifyRegistrationRequest(
      userData.id,
      userData.name,
      userData.email
    )

    return { success: true, user: userData }
  } catch (error) {
    console.error('[handleUserRegistrationWithNotification] Error:', error)

    await notifySystemError(
      'user_registration_failed',
      `Failed to register user ${userData.email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { user_email: userData.email }
    )

    throw error
  }
}

// ============================================================
// Example 5: Production Complete
// ============================================================

/**
 * Example: When production is completed
 * Add this to your production completion API route
 */
export async function markProductionCompleteWithNotification(orderData: {
  id: string
  order_number: string
}) {
  try {
    // 1. Update production status (your existing logic)
    // await updateProductionStatus(orderData.id, 'COMPLETED')

    // 2. Send admin notification
    await notifyProductionComplete(
      orderData.id,
      orderData.order_number
    )

    return { success: true }
  } catch (error) {
    console.error('[markProductionCompleteWithNotification] Error:', error)

    await notifySystemError(
      'production_update_failed',
      `Failed to mark production as complete: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { order_id: orderData.id }
    )

    throw error
  }
}

// ============================================================
// Example 6: Shipment Complete
// ============================================================

/**
 * Example: When a shipment is completed
 * Add this to your shipment API route
 */
export async function createShipmentWithNotification(shipmentData: {
  id: string
  order_number: string
}) {
  try {
    // 1. Create the shipment (your existing logic)
    // const shipment = await createShipment(shipmentData)

    // 2. Send admin notification
    await notifyShipmentComplete(
      shipmentData.id,
      shipmentData.order_number
    )

    return { success: true, shipment: shipmentData }
  } catch (error) {
    console.error('[createShipmentWithNotification] Error:', error)

    await notifySystemError(
      'shipment_creation_failed',
      `Failed to create shipment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { shipment_data: shipmentData }
    )

    throw error
  }
}

// ============================================================
// Example 7: Contract Signature
// ============================================================

/**
 * Example: When a contract is signed
 * Add this to your contract signature webhook/API route
 */
export async function handleContractSignatureWithNotification(contractData: {
  id: string
  order_number: string
}) {
  try {
    // 1. Update contract status (your existing logic)
    // await updateContractStatus(contractData.id, 'SIGNED')

    // 2. Send admin notification
    await notifyContractSignature(
      contractData.id,
      contractData.order_number
    )

    return { success: true }
  } catch (error) {
    console.error('[handleContractSignatureWithNotification] Error:', error)

    await notifySystemError(
      'contract_signature_failed',
      `Failed to handle contract signature: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { contract_id: contractData.id }
    )

    throw error
  }
}

// ============================================================
// Integration Checklist
// ============================================================

/**
 * INTEGRATION CHECKLIST:
 *
 * Copy the notification calls into your existing API routes:
 *
 * ✅ Orders API (e.g., src/app/api/orders/route.ts)
 *    - Call notifyNewOrder() after successful order creation
 *
 * ✅ Quotations API (e.g., src/app/api/quotations/route.ts)
 *    - Call notifyQuotationRequest() after successful quotation creation
 *
 * ✅ Sample Requests API (e.g., src/app/api/samples/route.ts)
 *    - Call notifySampleRequest() after successful sample request creation
 *
 * ✅ User Registration API (e.g., src/app/api/auth/register/route.ts)
 *    - Call notifyRegistrationRequest() after B2B user registration
 *
 * ✅ Production API (e.g., src/app/api/production/[id]/complete/route.ts)
 *    - Call notifyProductionComplete() when production is completed
 *
 * ✅ Shipments API (e.g., src/app/api/shipments/route.ts)
 *    - Call notifyShipmentComplete() after shipment creation
 *
 * ✅ Contracts API (e.g., src/app/api/contracts/[id]/signature/route.ts)
 *    - Call notifyContractSignature() when contract is signed
 *
 * ✅ Error Handling
 *    - Call notifySystemError() for critical system errors
 *
 * Example pattern:
 * ```typescript
 * // In your existing API route
 * try {
 *   const result = await yourExistingFunction(data)
 *
 *   // Add notification
 *   await notifyNewOrder(result.id, result.orderNumber, result.customerName, result.totalAmount)
 *
 *   return NextResponse.json({ success: true, data: result })
 * } catch (error) {
 *   // Add error notification
 *   await notifySystemError('order_failed', error.message, { data })
 *   throw error
 * }
 * ```
 */
