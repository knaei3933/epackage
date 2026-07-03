/**
 * Unit tests for order state machine mapping and transitions
 *
 * G001: State machine unification & status mapping audit
 * Verifies that every OrderStatus maps to a valid OrderState and that
 * transitions work for the full lifecycle including new states.
 */

import {
  mapOrderStatusToState,
  mapStateToOrderStatus,
  canTransition,
  getNextStates,
  isTerminalState,
} from '@/lib/state-machine/order-machine';
import type { OrderStatus } from '@/types/order-status';
import { getAllStatuses } from '@/types/order-status';

describe('G001: Order State Machine Mapping', () => {
  describe('mapOrderStatusToState — total coverage', () => {
    it('should map every OrderStatus to a defined OrderState', () => {
      const allStatuses = getAllStatuses();
      expect(allStatuses.length).toBeGreaterThan(0);

      for (const status of allStatuses) {
        const state = mapOrderStatusToState(status);
        expect(state).toBeDefined();
        expect(typeof state).toBe('string');
        expect(state.length).toBeGreaterThan(0);
      }
    });

    it('should map DB-present statuses correctly', () => {
      // These are the actual status values found in the production DB (66 orders)
      const dbStatuses: OrderStatus[] = [
        'DATA_UPLOAD_PENDING',
        'CORRECTION_IN_PROGRESS',
        'CUSTOMER_APPROVAL_PENDING',
        'SHIPPED',
        'QUOTATION_APPROVED',
        'QUOTATION_PENDING',
        'PRODUCTION',
        'READY_TO_SHIP',
        'DATA_UPLOADED',
      ];

      for (const status of dbStatuses) {
        const state = mapOrderStatusToState(status);
        expect(state).toBeDefined();
      }
    });

    it('should map QUOTATION_PENDING and QUOTATION_APPROVED to quotation state', () => {
      expect(mapOrderStatusToState('QUOTATION_PENDING')).toBe('quotation');
      expect(mapOrderStatusToState('QUOTATION_APPROVED')).toBe('quotation');
    });

    it('should map data upload statuses to data_received state', () => {
      expect(mapOrderStatusToState('DATA_UPLOAD_PENDING')).toBe('data_received');
      expect(mapOrderStatusToState('DATA_UPLOADED')).toBe('data_received');
    });

    it('should map correction statuses to work_order state', () => {
      expect(mapOrderStatusToState('CORRECTION_IN_PROGRESS')).toBe('work_order');
      expect(mapOrderStatusToState('CORRECTION_COMPLETED')).toBe('work_order');
      expect(mapOrderStatusToState('CUSTOMER_APPROVAL_PENDING')).toBe('work_order');
    });

    it('should map production and later statuses correctly', () => {
      expect(mapOrderStatusToState('PRODUCTION')).toBe('production');
      expect(mapOrderStatusToState('READY_TO_SHIP')).toBe('stock_in');
      expect(mapOrderStatusToState('SHIPPED')).toBe('shipped');
      expect(mapOrderStatusToState('CANCELLED')).toBe('cancelled');
    });
  });

  describe('mapStateToOrderStatus — reversibility', () => {
    it('should map every OrderState to a valid OrderStatus', () => {
      const states: Array<ReturnType<typeof mapOrderStatusToState>> = [
        'pending', 'quotation', 'data_received', 'work_order',
        'contract_sent', 'contract_signed', 'production',
        'stock_in', 'shipped', 'delivered', 'cancelled',
      ];

      for (const state of states) {
        const status = mapStateToOrderStatus(state);
        expect(status).toBeDefined();
        expect(typeof status).toBe('string');
      }
    });
  });

  describe('canTransition — guard behavior', () => {
    it('should allow same-state transitions for non-terminal states', () => {
      // QUOTATION_PENDING → QUOTATION_APPROVED both map to 'quotation'
      const from = mapOrderStatusToState('QUOTATION_PENDING');
      const to = mapOrderStatusToState('QUOTATION_APPROVED');
      expect(canTransition(from, to)).toBe(true);
    });

    it('should allow quotation → data_received transition', () => {
      expect(canTransition('quotation', 'data_received')).toBe(true);
    });

    it('should allow data_received → work_order transition', () => {
      expect(canTransition('data_received', 'work_order')).toBe(true);
    });

    it('should allow full lifecycle progression', () => {
      expect(canTransition('work_order', 'contract_sent')).toBe(true);
      expect(canTransition('contract_sent', 'contract_signed')).toBe(true);
      expect(canTransition('contract_signed', 'production')).toBe(true);
      expect(canTransition('production', 'stock_in')).toBe(true);
      expect(canTransition('stock_in', 'shipped')).toBe(true);
      expect(canTransition('shipped', 'delivered')).toBe(true);
    });

    it('should not allow terminal state transitions', () => {
      expect(canTransition('delivered', 'pending')).toBe(false);
      expect(canTransition('cancelled', 'pending')).toBe(false);
    });

    it('should allow cancellation from active states', () => {
      expect(canTransition('quotation', 'cancelled')).toBe(true);
      expect(canTransition('data_received', 'cancelled')).toBe(true);
      expect(canTransition('production', 'cancelled')).toBe(true);
    });
  });

  describe('getNextStates', () => {
    it('should return valid next states for active states', () => {
      const next = getNextStates('quotation');
      expect(next).toContain('data_received');
      expect(next).toContain('cancelled');
    });
  });

  describe('isTerminalState', () => {
    it('should identify delivered and cancelled as terminal', () => {
      expect(isTerminalState('delivered')).toBe(true);
      expect(isTerminalState('cancelled')).toBe(true);
      expect(isTerminalState('quotation')).toBe(false);
    });
  });
});
