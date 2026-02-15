/**
 * CSV Bulk Import Component
 *
 * CSV一括インポートコンポーネント
 * - CSVファイルアップロード
 * - データ検証とプレビュー
 * - 見積もり項目に一括追加
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, X, AlertCircle, CheckCircle, Download } from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface CSVRow {
  productName: string;
  productCode?: string;
  category?: string;
  quantity: number;
  unitPrice?: number;
  specifications?: Record<string, any>;
  notes?: string;
}

interface QuotationItem {
  id: string;
  product_name: string;
  product_code: string | null;
  category: string | null;
  quantity: number;
  unit_price: number | null;
  specifications: Record<string, any>;
  notes: string | null;
}

interface CSVBulkImportProps {
  onImport: (items: Omit<QuotationItem, 'id'>[]) => void;
  onCancel: () => void;
  className?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

// ============================================================
// CSV Parser
// ============================================================

function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let currentLine: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++;
        } else {
          // End of quoted field
          insideQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ',') {
        currentLine.push(currentField);
        currentField = '';
      } else if (char === '\n') {
        currentLine.push(currentField);
        lines.push(currentLine);
        currentLine = [];
        currentField = '';
      } else if (char === '\r' && nextChar === '\n') {
        // Windows line ending
        currentLine.push(currentField);
        lines.push(currentLine);
        currentLine = [];
        currentField = '';
        i++;
      } else {
        currentField += char;
      }
    }
  }

  // Add last field and line
  currentLine.push(currentField);
  if (currentLine.length > 0 && (currentLine.length > 1 || currentLine[0] !== '')) {
    lines.push(currentLine);
  }

  return lines;
}

// ============================================================
// Component
// ============================================================

export function CSVBulkImport({ onImport, onCancel, className = '' }: CSVBulkImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CSVRow[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'error'>('upload');

  // Handle file selection
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file type
    if (!selectedFile.name.endsWith('.csv')) {
      setErrors([{ row: 0, field: 'file', message: 'CSVファイルのみアップロード可能です' }]);
      setStep('error');
      return;
    }

    setFile(selectedFile);
    processCSV(selectedFile);
  }, []);

  // Process CSV file
  const processCSV = useCallback(async (csvFile: File) => {
    const text = await csvFile.text();
    const lines = parseCSV(text);

    if (lines.length < 2) {
      setErrors([{ row: 0, field: 'file', message: 'CSVファイルにデータが含まれていません' }]);
      setStep('error');
      return;
    }

    // Parse header (first line)
    const headers = lines[0].map(h => h.trim().toLowerCase());
    const headerMap: Record<string, number> = {};
    headers.forEach((h, i) => {
      headerMap[h] = i;
    });

    // Required columns
    const requiredColumns = ['productname', 'quantity'];
    const missingColumns = requiredColumns.filter(col => !Object.keys(headerMap).includes(col));

    if (missingColumns.length > 0) {
      setErrors([{
        row: 1,
        field: 'header',
        message: `必須カラムが不足しています: ${missingColumns.join(', ')}`
      }]);
      setStep('error');
      return;
    }

    // Parse data rows
    const newErrors: ValidationError[] = [];
    const newRows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.length === 0 || line.every(cell => cell.trim() === '')) continue; // Skip empty lines

      const row: CSVRow = {
        productName: line[headerMap['productname']]?.trim() || '',
        productCode: line[headerMap['productcode']]?.trim() || '',
        category: line[headerMap['category']]?.trim() || '',
        quantity: parseInt(line[headerMap['quantity']]?.trim() || '0'),
        unitPrice: parseFloat(line[headerMap['unitprice']]?.trim() || '0'),
        specifications: {},
        notes: line[headerMap['notes']]?.trim() || '',
      };

      // Validate row
      if (!row.productName) {
        newErrors.push({ row: i + 1, field: 'productName', message: '製品名は必須です' });
      }
      if (isNaN(row.quantity) || row.quantity <= 0) {
        newErrors.push({ row: i + 1, field: 'quantity', message: '数量は正の整数である必要があります' });
      }
      if (row.unitPrice !== undefined && !isNaN(row.unitPrice) && row.unitPrice < 0) {
        newErrors.push({ row: i + 1, field: 'unitPrice', message: '単価は正の数である必要があります' });
      }

      newRows.push(row);
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setStep('error');
    } else {
      setParsedData(newRows);
      setStep('preview');
    }
  }, []);

  // Handle import confirmation
  const handleImport = useCallback(() => {
    const items: Omit<QuotationItem, 'id'>[] = parsedData.map(row => ({
      product_name: row.productName,
      product_code: row.productCode || null,
      category: row.category || null,
      quantity: row.quantity,
      unit_price: (row.unitPrice !== undefined && !isNaN(row.unitPrice) && row.unitPrice > 0) ? row.unitPrice : null,
      specifications: row.specifications || {},
      notes: row.notes || null,
    }));

    onImport(items);
  }, [parsedData, onImport]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setFile(null);
    setParsedData([]);
    setErrors([]);
    setStep('upload');
    onCancel();
  }, [onCancel]);

  // Download CSV template
  const handleDownloadTemplate = useCallback(() => {
    const template = `productName,productCode,category,quantity,unitPrice,notes,specifications
スタンドアップパウチ,PRD-001,stand_up,1000,150,サンプル商品,"{""size"":""W150×H200""}"
三方シール袋,PRD-002,flat_3_side,500,100,,"{""size"":""W100×H150""}"`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'quotation_items_template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }, []);

  return (
    <div className={`bg-white border border-gray-300 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          CSV一括インポート
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          CSVファイルから見積もり項目を一括インポートできます。
        </p>
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="space-y-4">
          {/* Download Template */}
          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">CSVテンプレート</p>
                <p className="text-sm text-blue-700">フォーマットを確認するにはテンプレートをダウンロードしてください</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              テンプレートダウンロード
            </button>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-700 font-medium">CSVファイルをドラッグ＆ドロップ</p>
              <p className="text-gray-500 text-sm mt-1">またはクリックして選択</p>
              <p className="text-gray-400 text-xs mt-3">最大ファイルサイズ: 5MB</p>
            </label>
          </div>

          {/* Format Requirements */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">必須カラム</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li><code className="px-1 py-0.5 bg-gray-200 rounded">productName</code> - 製品名</li>
              <li><code className="px-1 py-0.5 bg-gray-200 rounded">quantity</code> - 数量</li>
            </ul>

            <h4 className="font-medium text-gray-900 mt-4 mb-2">オプションカラム</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li><code className="px-1 py-0.5 bg-gray-200 rounded">productCode</code> - 製品コード/SKU</li>
              <li><code className="px-1 py-0.5 bg-gray-200 rounded">category</code> - カテゴリ</li>
              <li><code className="px-1 py-0.5 bg-gray-200 rounded">unitPrice</code> - 単価</li>
              <li><code className="px-1 py-0.5 bg-gray-200 rounded">notes</code> - 備考</li>
              <li><code className="px-1 py-0.5 bg-gray-200 rounded">specifications</code> - 仕様 (JSON形式)</li>
            </ul>
          </div>

          {/* Cancel Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{parsedData.length}件のデータを確認</span>
            </div>
            <button
              type="button"
              onClick={() => setStep('upload')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              別のファイルを選択
            </button>
          </div>

          {/* Data Table */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-900">行番号</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-900">製品名</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-900">製品コード</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-900">カテゴリ</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-900">数量</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-900">単価</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-900">備考</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {parsedData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-600">{index + 1}</td>
                      <td className="px-4 py-2 font-medium text-gray-900">{row.productName}</td>
                      <td className="px-4 py-2 text-gray-600">{row.productCode || '-'}</td>
                      <td className="px-4 py-2 text-gray-600">{row.category || '-'}</td>
                      <td className="px-4 py-2 text-right text-gray-900">{row.quantity.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right text-gray-900">
                        {row.unitPrice ? `¥${row.unitPrice.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-2 text-gray-600 truncate max-w-xs">{row.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleImport}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              インポート実行
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Error */}
      {step === 'error' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">エラーが発生しました</span>
          </div>

          {/* Error List */}
          <div className="border border-red-300 bg-red-50 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2">検証エラー</h4>
            <ul className="space-y-2">
              {errors.map((error, index) => (
                <li key={index} className="text-sm text-red-800">
                  <span className="font-medium">行 {error.row}:</span> {error.field} - {error.message}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setStep('upload')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              別のファイルを選択
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
