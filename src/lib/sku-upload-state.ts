/**
 * SKU Upload State Utilities
 *
 * SKUのアップロード状態を管理するユーティリティ関数
 */

export interface SKUUploadState {
  orderItemId: string;
  skuName: string;
  isUploaded: boolean;
  uploadedFileId?: string;
  uploadedFileName?: string;
  uploadedAt?: string;
}

export interface UploadedFile {
  id: string;
  file_name: string;
  file_type: string;
  order_item_id?: string | null;
  sku_name?: string | null;
  uploaded_at: string;
}

/**
 * SKUのアップロード状態を計算するヘルパー関数
 *
 * @param orderItems - 注文アイテム配列
 * @param uploadedFiles - アップロード済みファイル配列
 * @returns SKUUploadState配列
 */
export function computeSKUUploadStates(
  orderItems: Array<{ id: string; product_name: string; quantity: number }>,
  uploadedFiles: UploadedFile[]
): SKUUploadState[] {
  return orderItems.map((item) => {
    // order_item_idでマッチング
    const matchingFile = uploadedFiles.find(
      (file) => file.order_item_id === item.id
    );

    return {
      orderItemId: item.id,
      skuName: item.product_name,
      isUploaded: !!matchingFile,
      uploadedFileId: matchingFile?.id,
      uploadedFileName: matchingFile?.file_name,
      uploadedAt: matchingFile?.uploaded_at,
    };
  });
}

/**
 * すべてのSKUがアップロード完了かどうかを判定
 */
export function isAllSKUUploaded(states: SKUUploadState[]): boolean {
  return states.length > 0 && states.every((s) => s.isUploaded);
}

/**
 * アップロード待ちのSKU数を取得
 */
export function getPendingSKUs(states: SKUUploadState[]): SKUUploadState[] {
  return states.filter((s) => !s.isUploaded);
}
