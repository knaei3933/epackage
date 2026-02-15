'use client';

/**
 * 電子署名コンポーネント (Electronic Signature Component)
 * 日本電子署名法準拠の電子署名UI
 * Japan e-Signature Law Compliant Electronic Signature
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Pen,
  Eraser,
  Check,
  AlertCircle,
  FileText,
  Calendar,
  Fingerprint
} from 'lucide-react';

interface SignatureData {
  signature_image: string; // base64 encoded
  signed_at: string;
  ip_address: string;
  user_agent: string;
  location?: {
    country?: string;
    city?: string;
  };
}

interface ElectronicSignatureProps {
  contractId: string;
  contractNumber: string;
  contractUrl: string;
  onSignComplete?: (signatureData: SignatureData) => void;
  onCancel?: () => void;
}

export default function ElectronicSignature({
  contractId,
  contractNumber,
  contractUrl,
  onSignComplete,
  onCancel
}: ElectronicSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [signaturePosition, setSignaturePosition] = useState({ x: 0, y: 0 });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Set default styles
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw guide line
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.1, canvas.height * 0.7);
    ctx.lineTo(canvas.width * 0.9, canvas.height * 0.7);
    ctx.stroke();
    ctx.setLineDash([]);

    // Reset to signature styles
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
  }, []);

  // Get coordinates from event
  const getCoordinates = useCallback((event: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ('touches' in event) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top
      };
    }

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }, []);

  // Start drawing
  const startDrawing = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    setIsDrawing(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(event as any);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  }, [getCoordinates]);

  // Draw
  const draw = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();

    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(event as any);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    setHasSignature(true);
    setSignaturePosition(coords);
  }, [isDrawing, getCoordinates]);

  // Stop drawing
  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  // Clear signature
  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw guide line
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.1, canvas.height * 0.7);
    ctx.lineTo(canvas.width * 0.9, canvas.height * 0.7);
    ctx.stroke();
    ctx.setLineDash([]);

    // Reset to signature styles
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;

    setHasSignature(false);
    setSignaturePosition({ x: 0, y: 0 });
  }, []);

  // Submit signature
  const submitSignature = useCallback(async () => {
    if (!hasSignature || !agreedToTerms) {
      setStatus({
        type: 'error',
        message: '署名と利用規約の同意が両方必要です。'
      });
      return;
    }

    setIsSigning(true);
    setStatus({ type: null, message: '' });

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Get signature image as base64
      const signatureImage = canvas.toDataURL('image/png');

      // Get client info for compliance
      const response = await fetch('/api/member/contracts/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_id: contractId,
          signature_image: signatureImage
        })
      });

      const result = await response.json();

      if (result.success) {
        setStatus({
          type: 'success',
          message: '電子署名が完了しました。'
        });

        if (onSignComplete) {
          onSignComplete(result.data);
        }
      } else {
        setStatus({
          type: 'error',
          message: result.error || '署名処理中にエラーが発生しました。'
        });
      }
    } catch (error) {
      console.error('Signature submission error:', error);
      setStatus({
        type: 'error',
        message: '署名処理中にエラーが発生しました。'
      });
    } finally {
      setIsSigning(false);
    }
  }, [hasSignature, agreedToTerms, contractId, onSignComplete]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Pen className="w-6 h-6" />
          電子署名 (電子署名)
        </h1>
        <p className="text-gray-600">
          契約番号: {contractNumber}
        </p>
      </Card>

      {/* Contract Preview */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          契約内容確認
        </h2>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <iframe
            src={contractUrl}
            className="w-full h-96 border-0"
            title="Contract Preview"
          />
        </div>
        <p className="text-sm text-gray-600">
          上記契約内容をご確認の上、署名欄に署名してください。
        </p>
      </Card>

      {/* Signature Canvas */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Fingerprint className="w-5 h-5" />
          署名欄 (署名欄)
        </h2>

        {/* Canvas */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-48 cursor-crosshair bg-white touch-none"
          />
        </div>

        {/* Canvas Controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            上記エリアにマウスまたは指で署名してください。
          </div>
          <Button
            variant="outline"
            onClick={clearSignature}
            disabled={!hasSignature}
          >
            <Eraser className="w-4 h-4 mr-2" />
            消去
          </Button>
        </div>

        {/* Legal Agreement */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold mb-2">電子署名同意 (電子署名同意)</h3>
          <p className="text-sm text-gray-700 mb-4">
            本人は上記契約内容を十分に理解し、電子署名法に基づき
            電子署名に同意します。署名時のIPアドレス、タイムスタンプ等の情報が
            記録されます。
          </p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">
              契約内容を確認し電子署名に同意します (同意する)
            </span>
          </label>
        </div>

        {/* Signature Info */}
        {hasSignature && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>署名日時: {new Date().toLocaleString('ja-JP')}</span>
            </div>
            <p className="text-xs text-gray-500">
              * 署名完了後、タイムスタンプとIPアドレスが自動的に記録されます。
            </p>
          </div>
        )}

        {/* Status Message */}
        {status.type && (
          <div className={`p-4 rounded-lg mb-4 ${
            status.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {status.type === 'success' ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={status.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {status.message}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSigning}
            >
              キャンセル
            </Button>
          )}
          <Button
            onClick={submitSignature}
            disabled={!hasSignature || !agreedToTerms || isSigning}
            size="lg"
          >
            <Check className="w-4 h-4 mr-2" />
            署名完了
          </Button>
        </div>
      </Card>

      {/* Legal Notice */}
      <Card className="p-6 bg-gray-50">
        <h3 className="font-semibold mb-2">電子署名法に関する案内</h3>
        <p className="text-sm text-gray-600">
          本電子署名は日本電子署名法(電子署名法)に準拠して作成されます。
          署名時に記録されるタイムスタンプ、IPアドレス、端末情報等は法的効力を有する
          証拠として保存されます。署名後は契約内容の変更が不可能です。
        </p>
      </Card>
    </div>
  );
}
