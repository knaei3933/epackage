import { describe, it, expect } from '@jest/globals';
import {
  computeSKUUploadStates,
  isAllSKUUploaded,
  getPendingSKUs,
  SKUUploadState,
  UploadedFile
} from './sku-upload-state';

describe('SKU Upload State Utilities', () => {
  describe('computeSKUUploadStates()', () => {
    it('should return empty array when given empty order items', () => {
      const orderItems = [];
      const uploadedFiles: UploadedFile[] = [];

      const result = computeSKUUploadStates(orderItems, uploadedFiles);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return isUploaded=true for single SKU with uploaded file', () => {
      const orderItems = [
        {
          id: 'order-1',
          product_name: 'Product A',
          quantity: 100
        }
      ];

      const uploadedFiles: UploadedFile[] = [
        {
          id: 'file-1',
          file_name: 'design-a.pdf',
          file_type: 'application/pdf',
          order_item_id: 'order-1',
          sku_name: 'Product A',
          uploaded_at: '2025-04-05T10:00:00Z'
        }
      ];

      const result = computeSKUUploadStates(orderItems, uploadedFiles);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        orderItemId: 'order-1',
        skuName: 'Product A',
        isUploaded: true,
        uploadedFileId: 'file-1',
        uploadedFileName: 'design-a.pdf',
        uploadedAt: '2025-04-05T10:00:00Z'
      });
    });

    it('should return isUploaded=false for single SKU without uploaded file', () => {
      const orderItems = [
        {
          id: 'order-1',
          product_name: 'Product A',
          quantity: 100
        }
      ];

      const uploadedFiles: UploadedFile[] = [];

      const result = computeSKUUploadStates(orderItems, uploadedFiles);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        orderItemId: 'order-1',
        skuName: 'Product A',
        isUploaded: false,
        uploadedFileId: undefined,
        uploadedFileName: undefined,
        uploadedAt: undefined
      });
    });

    it('should handle multiple SKUs with partial upload status', () => {
      const orderItems = [
        {
          id: 'order-1',
          product_name: 'Product A',
          quantity: 100
        },
        {
          id: 'order-2',
          product_name: 'Product B',
          quantity: 200
        },
        {
          id: 'order-3',
          product_name: 'Product C',
          quantity: 150
        }
      ];

      const uploadedFiles: UploadedFile[] = [
        {
          id: 'file-1',
          file_name: 'design-a.pdf',
          file_type: 'application/pdf',
          order_item_id: 'order-1',
          sku_name: 'Product A',
          uploaded_at: '2025-04-05T10:00:00Z'
        },
        {
          id: 'file-3',
          file_name: 'design-c.pdf',
          file_type: 'application/pdf',
          order_item_id: 'order-3',
          sku_name: 'Product C',
          uploaded_at: '2025-04-05T11:00:00Z'
        }
      ];

      const result = computeSKUUploadStates(orderItems, uploadedFiles);

      expect(result).toHaveLength(3);

      // First SKU uploaded
      expect(result[0]).toMatchObject({
        orderItemId: 'order-1',
        skuName: 'Product A',
        isUploaded: true,
        uploadedFileId: 'file-1'
      });

      // Second SKU not uploaded
      expect(result[1]).toMatchObject({
        orderItemId: 'order-2',
        skuName: 'Product B',
        isUploaded: false,
        uploadedFileId: undefined
      });

      // Third SKU uploaded
      expect(result[2]).toMatchObject({
        orderItemId: 'order-3',
        skuName: 'Product C',
        isUploaded: true,
        uploadedFileId: 'file-3'
      });
    });

    it('should handle order_item_id as null (not matching any SKU)', () => {
      const orderItems = [
        {
          id: 'order-1',
          product_name: 'Product A',
          quantity: 100
        },
        {
          id: 'order-2',
          product_name: 'Product B',
          quantity: 200
        }
      ];

      const uploadedFiles: UploadedFile[] = [
        {
          id: 'file-1',
          file_name: 'orphan-file.pdf',
          file_type: 'application/pdf',
          order_item_id: null,
          sku_name: null,
          uploaded_at: '2025-04-05T10:00:00Z'
        }
      ];

      const result = computeSKUUploadStates(orderItems, uploadedFiles);

      expect(result).toHaveLength(2);

      // Both SKUs should not be uploaded (null order_item_id doesn't match)
      expect(result[0]).toMatchObject({
        orderItemId: 'order-1',
        skuName: 'Product A',
        isUploaded: false
      });

      expect(result[1]).toMatchObject({
        orderItemId: 'order-2',
        skuName: 'Product B',
        isUploaded: false
      });
    });

    it('should handle all SKUs uploaded', () => {
      const orderItems = [
        {
          id: 'order-1',
          product_name: 'Product A',
          quantity: 100
        },
        {
          id: 'order-2',
          product_name: 'Product B',
          quantity: 200
        }
      ];

      const uploadedFiles: UploadedFile[] = [
        {
          id: 'file-1',
          file_name: 'design-a.pdf',
          file_type: 'application/pdf',
          order_item_id: 'order-1',
          sku_name: 'Product A',
          uploaded_at: '2025-04-05T10:00:00Z'
        },
        {
          id: 'file-2',
          file_name: 'design-b.pdf',
          file_type: 'application/pdf',
          order_item_id: 'order-2',
          sku_name: 'Product B',
          uploaded_at: '2025-04-05T11:00:00Z'
        }
      ];

      const result = computeSKUUploadStates(orderItems, uploadedFiles);

      expect(result).toHaveLength(2);
      expect(result.every(s => s.isUploaded)).toBe(true);
    });

    it('should handle missing optional fields in uploaded file', () => {
      const orderItems = [
        {
          id: 'order-1',
          product_name: 'Product A',
          quantity: 100
        }
      ];

      const uploadedFiles: UploadedFile[] = [
        {
          id: 'file-1',
          file_name: 'design-a.pdf',
          file_type: 'application/pdf',
          order_item_id: 'order-1',
          sku_name: null,
          uploaded_at: '2025-04-05T10:00:00Z'
        }
      ];

      const result = computeSKUUploadStates(orderItems, uploadedFiles);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        orderItemId: 'order-1',
        skuName: 'Product A',
        isUploaded: true,
        uploadedFileId: 'file-1',
        uploadedFileName: 'design-a.pdf',
        uploadedAt: '2025-04-05T10:00:00Z'
      });
    });

    it('should preserve order of order items in result', () => {
      const orderItems = [
        { id: 'order-3', product_name: 'Product C', quantity: 150 },
        { id: 'order-1', product_name: 'Product A', quantity: 100 },
        { id: 'order-2', product_name: 'Product B', quantity: 200 }
      ];

      const uploadedFiles: UploadedFile[] = [
        {
          id: 'file-1',
          file_name: 'design-a.pdf',
          file_type: 'application/pdf',
          order_item_id: 'order-1',
          sku_name: 'Product A',
          uploaded_at: '2025-04-05T10:00:00Z'
        }
      ];

      const result = computeSKUUploadStates(orderItems, uploadedFiles);

      expect(result).toHaveLength(3);
      expect(result[0].orderItemId).toBe('order-3');
      expect(result[1].orderItemId).toBe('order-1');
      expect(result[2].orderItemId).toBe('order-2');
    });
  });

  describe('isAllSKUUploaded()', () => {
    it('should return false for empty array (no SKUs to check)', () => {
      const states: SKUUploadState[] = [];

      const result = isAllSKUUploaded(states);

      expect(result).toBe(false);
    });

    it('should return true when all SKUs are uploaded', () => {
      const states: SKUUploadState[] = [
        {
          orderItemId: 'order-1',
          skuName: 'Product A',
          isUploaded: true,
          uploadedFileId: 'file-1'
        },
        {
          orderItemId: 'order-2',
          skuName: 'Product B',
          isUploaded: true,
          uploadedFileId: 'file-2'
        },
        {
          orderItemId: 'order-3',
          skuName: 'Product C',
          isUploaded: true,
          uploadedFileId: 'file-3'
        }
      ];

      const result = isAllSKUUploaded(states);

      expect(result).toBe(true);
    });

    it('should return false when at least one SKU is not uploaded', () => {
      const states: SKUUploadState[] = [
        {
          orderItemId: 'order-1',
          skuName: 'Product A',
          isUploaded: true,
          uploadedFileId: 'file-1'
        },
        {
          orderItemId: 'order-2',
          skuName: 'Product B',
          isUploaded: false
        },
        {
          orderItemId: 'order-3',
          skuName: 'Product C',
          isUploaded: true,
          uploadedFileId: 'file-3'
        }
      ];

      const result = isAllSKUUploaded(states);

      expect(result).toBe(false);
    });

    it('should return false when no SKUs are uploaded', () => {
      const states: SKUUploadState[] = [
        {
          orderItemId: 'order-1',
          skuName: 'Product A',
          isUploaded: false
        },
        {
          orderItemId: 'order-2',
          skuName: 'Product B',
          isUploaded: false
        }
      ];

      const result = isAllSKUUploaded(states);

      expect(result).toBe(false);
    });

    it('should return false for single unuploaded SKU', () => {
      const states: SKUUploadState[] = [
        {
          orderItemId: 'order-1',
          skuName: 'Product A',
          isUploaded: false
        }
      ];

      const result = isAllSKUUploaded(states);

      expect(result).toBe(false);
    });

    it('should return true for single uploaded SKU', () => {
      const states: SKUUploadState[] = [
        {
          orderItemId: 'order-1',
          skuName: 'Product A',
          isUploaded: true,
          uploadedFileId: 'file-1'
        }
      ];

      const result = isAllSKUUploaded(states);

      expect(result).toBe(true);
    });
  });

  describe('getPendingSKUs()', () => {
    it('should return empty array for empty input', () => {
      const states: SKUUploadState[] = [];

      const result = getPendingSKUs(states);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return empty array when all SKUs are uploaded', () => {
      const states: SKUUploadState[] = [
        {
          orderItemId: 'order-1',
          skuName: 'Product A',
          isUploaded: true,
          uploadedFileId: 'file-1'
        },
        {
          orderItemId: 'order-2',
          skuName: 'Product B',
          isUploaded: true,
          uploadedFileId: 'file-2'
        }
      ];

      const result = getPendingSKUs(states);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return only unuploaded SKUs when partially uploaded', () => {
      const states: SKUUploadState[] = [
        {
          orderItemId: 'order-1',
          skuName: 'Product A',
          isUploaded: true,
          uploadedFileId: 'file-1'
        },
        {
          orderItemId: 'order-2',
          skuName: 'Product B',
          isUploaded: false
        },
        {
          orderItemId: 'order-3',
          skuName: 'Product C',
          isUploaded: false
        },
        {
          orderItemId: 'order-4',
          skuName: 'Product D',
          isUploaded: true,
          uploadedFileId: 'file-4'
        }
      ];

      const result = getPendingSKUs(states);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        orderItemId: 'order-2',
        skuName: 'Product B',
        isUploaded: false
      });
      expect(result[1]).toMatchObject({
        orderItemId: 'order-3',
        skuName: 'Product C',
        isUploaded: false
      });
    });

    it('should return all SKUs when none are uploaded', () => {
      const states: SKUUploadState[] = [
        {
          orderItemId: 'order-1',
          skuName: 'Product A',
          isUploaded: false
        },
        {
          orderItemId: 'order-2',
          skuName: 'Product B',
          isUploaded: false
        },
        {
          orderItemId: 'order-3',
          skuName: 'Product C',
          isUploaded: false
        }
      ];

      const result = getPendingSKUs(states);

      expect(result).toHaveLength(3);
      expect(result.every(s => !s.isUploaded)).toBe(true);
    });

    it('should return single pending SKU', () => {
      const states: SKUUploadState[] = [
        {
          orderItemId: 'order-1',
          skuName: 'Product A',
          isUploaded: true,
          uploadedFileId: 'file-1'
        },
        {
          orderItemId: 'order-2',
          skuName: 'Product B',
          isUploaded: false
        }
      ];

      const result = getPendingSKUs(states);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        orderItemId: 'order-2',
        skuName: 'Product B',
        isUploaded: false
      });
    });

    it('should preserve original SKU properties in pending list', () => {
      const states: SKUUploadState[] = [
        {
          orderItemId: 'order-1',
          skuName: 'Product A',
          isUploaded: false,
          uploadedFileId: undefined,
          uploadedFileName: undefined,
          uploadedAt: undefined
        }
      ];

      const result = getPendingSKUs(states);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(states[0]);
    });
  });

  describe('integration tests', () => {
    it('should handle complete workflow: compute -> check all uploaded -> get pending', () => {
      const orderItems = [
        { id: 'order-1', product_name: 'Product A', quantity: 100 },
        { id: 'order-2', product_name: 'Product B', quantity: 200 },
        { id: 'order-3', product_name: 'Product C', quantity: 150 }
      ];

      const uploadedFiles: UploadedFile[] = [
        {
          id: 'file-1',
          file_name: 'design-a.pdf',
          file_type: 'application/pdf',
          order_item_id: 'order-1',
          sku_name: 'Product A',
          uploaded_at: '2025-04-05T10:00:00Z'
        }
      ];

      const states = computeSKUUploadStates(orderItems, uploadedFiles);

      // Check overall status
      expect(isAllSKUUploaded(states)).toBe(false);

      // Get pending SKUs
      const pending = getPendingSKUs(states);
      expect(pending).toHaveLength(2);
      expect(pending.map(s => s.orderItemId)).toEqual(['order-2', 'order-3']);
    });

    it('should handle complete workflow when all uploaded', () => {
      const orderItems = [
        { id: 'order-1', product_name: 'Product A', quantity: 100 },
        { id: 'order-2', product_name: 'Product B', quantity: 200 }
      ];

      const uploadedFiles: UploadedFile[] = [
        {
          id: 'file-1',
          file_name: 'design-a.pdf',
          file_type: 'application/pdf',
          order_item_id: 'order-1',
          sku_name: 'Product A',
          uploaded_at: '2025-04-05T10:00:00Z'
        },
        {
          id: 'file-2',
          file_name: 'design-b.pdf',
          file_type: 'application/pdf',
          order_item_id: 'order-2',
          sku_name: 'Product B',
          uploaded_at: '2025-04-05T11:00:00Z'
        }
      ];

      const states = computeSKUUploadStates(orderItems, uploadedFiles);

      expect(isAllSKUUploaded(states)).toBe(true);
      expect(getPendingSKUs(states)).toHaveLength(0);
    });

    it('should handle complete workflow with no uploads', () => {
      const orderItems = [
        { id: 'order-1', product_name: 'Product A', quantity: 100 },
        { id: 'order-2', product_name: 'Product B', quantity: 200 }
      ];

      const uploadedFiles: UploadedFile[] = [];

      const states = computeSKUUploadStates(orderItems, uploadedFiles);

      expect(isAllSKUUploaded(states)).toBe(false);
      expect(getPendingSKUs(states)).toHaveLength(2);
      expect(getPendingSKUs(states).map(s => s.orderItemId)).toEqual(['order-1', 'order-2']);
    });

    it('should handle complete workflow with null order_item_id files', () => {
      const orderItems = [
        { id: 'order-1', product_name: 'Product A', quantity: 100 }
      ];

      const uploadedFiles: UploadedFile[] = [
        {
          id: 'file-orphan',
          file_name: 'orphan.pdf',
          file_type: 'application/pdf',
          order_item_id: null,
          sku_name: null,
          uploaded_at: '2025-04-05T10:00:00Z'
        }
      ];

      const states = computeSKUUploadStates(orderItems, uploadedFiles);

      expect(isAllSKUUploaded(states)).toBe(false);
      expect(getPendingSKUs(states)).toHaveLength(1);
      expect(getPendingSKUs(states)[0].orderItemId).toBe('order-1');
    });
  });
});
