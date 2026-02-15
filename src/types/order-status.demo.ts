/**
 * Order Status Type System - Usage Examples
 *
 * This file demonstrates how to use the unified order status type system.
 * Feel free to delete this file after reviewing the examples.
 */

import type {
  OrderStatus,
  OrderStatusLegacy,
  ProductionSubStatus,
} from '@/types/order-status';
import {
  getStatusLabel,
  getStatusProgress,
  isValidStatusTransition,
  isTerminalStatus,
  isProductionStatus,
  OrderStatusMapping,
} from '@/types/order-status';

// =====================================================
// Example 1: Type-safe status handling
// =====================================================

function updateOrderStatus(currentStatus: OrderStatus, newStatus: OrderStatus): void {
  // Check if transition is valid
  if (isValidStatusTransition(currentStatus, newStatus)) {
    console.log(`Status change: ${currentStatus} -> ${newStatus}`);
  } else {
    console.error(`Invalid transition: ${currentStatus} -> ${newStatus}`);
  }
}

// Valid transition
updateOrderStatus('PENDING', 'QUOTATION'); // ✓

// Invalid transition
updateOrderStatus('DELIVERED', 'PRODUCTION'); // ✗ Error: Invalid

// =====================================================
// Example 2: Multilingual UI labels
// =====================================================

function displayOrderStatus(status: OrderStatus, locale: 'ja' | 'ko' | 'en' = 'ja'): string {
  return getStatusLabel(status, locale);
}

console.log(displayOrderStatus('PRODUCTION', 'ja')); // "製造中"
console.log(displayOrderStatus('PRODUCTION', 'ko')); // "생산 중"
console.log(displayOrderStatus('PRODUCTION', 'en')); // "Production"

// =====================================================
// Example 3: Progress calculation
// =====================================================

function getOrderProgressPercentage(status: OrderStatus): number {
  return getStatusProgress(status);
}

console.log(getOrderProgressPercentage('PENDING')); // 0
console.log(getOrderProgressPercentage('PRODUCTION')); // 70
console.log(getOrderProgressPercentage('DELIVERED')); // 100

// =====================================================
// Example 4: Legacy compatibility
// =====================================================

function convertLegacyStatus(legacy: OrderStatusLegacy): OrderStatus {
  return OrderStatusMapping.toUppercase(legacy);
}

const legacyStatus: OrderStatusLegacy = 'pending';
const newStatus = convertLegacyStatus(legacyStatus);
console.log(newStatus); // "PENDING"

// =====================================================
// Example 5: Type guards
// =====================================================

function handleOrder(status: OrderStatus): void {
  if (isProductionStatus(status)) {
    console.log('Order is in production phase');
    // Handle production-specific logic
  }

  if (isTerminalStatus(status)) {
    console.log('Order is in terminal state');
    // Handle finalization
  }
}

handleOrder('PRODUCTION'); // Order is in production phase
handleOrder('DELIVERED'); // Order is in terminal state

// =====================================================
// Example 6: Production sub-status
// =====================================================

type ProductionOrder = {
  status: 'PRODUCTION';
  subStatus?: ProductionSubStatus;
};

function displayProductionProgress(order: ProductionOrder): string {
  if (order.subStatus) {
    return `Production: ${order.subStatus}`;
  }
  return 'Production in progress';
}

const prodOrder: ProductionOrder = {
  status: 'PRODUCTION',
  subStatus: 'printing',
};

console.log(displayProductionProgress(prodOrder)); // "Production: printing"
