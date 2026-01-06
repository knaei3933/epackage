'use client';

/**
 * 전자서명 컴포넌트 (Electronic Signature Component)
 * 일본 전자서명법 준수의 전자서명 UI
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
        message: '서명과 이용약관 동의가 모두 필요합니다.'
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
      const response = await fetch('/api/b2b/contracts/sign', {
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
          message: '전자서명이 완료되었습니다.'
        });

        if (onSignComplete) {
          onSignComplete(result.data);
        }
      } else {
        setStatus({
          type: 'error',
          message: result.error || '서명 처리 중 오류가 발생했습니다.'
        });
      }
    } catch (error) {
      console.error('Signature submission error:', error);
      setStatus({
        type: 'error',
        message: '서명 처리 중 오류가 발생했습니다.'
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
          전자서명 (電子署名)
        </h1>
        <p className="text-gray-600">
          계약서 번호: {contractNumber}
        </p>
      </Card>

      {/* Contract Preview */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          계약서 내용 확인
        </h2>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <iframe
            src={contractUrl}
            className="w-full h-96 border-0"
            title="Contract Preview"
          />
        </div>
        <p className="text-sm text-gray-600">
          위 계약서 내용을 확인하신 후, 서명란에 서명해 주십시오.
        </p>
      </Card>

      {/* Signature Canvas */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Fingerprint className="w-5 h-5" />
          서명란 (署名欄)
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
            위 영역에 마우스 또는 손가락으로 서명해 주십시오.
          </div>
          <Button
            variant="outline"
            onClick={clearSignature}
            disabled={!hasSignature}
          >
            <Eraser className="w-4 h-4 mr-2" />
            지우기
          </Button>
        </div>

        {/* Legal Agreement */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold mb-2">전자서명 동의 (電子署名同意)</h3>
          <p className="text-sm text-gray-700 mb-4">
            본인은 위 계약서 내용을 충분히 이해하였으며, 전자서명법에 의거하여
            전자서명을 동의합니다. 서명 시점의 IP 주소, 타임스탬프 등의 정보가
            기록됩니다.
          </p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">
              계약 내용을 확인하였으며 전자서명에 동의합니다 (同意する)
            </span>
          </label>
        </div>

        {/* Signature Info */}
        {hasSignature && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>서명 일시: {new Date().toLocaleString('ja-JP')}</span>
            </div>
            <p className="text-xs text-gray-500">
              * 서명 완료 후 타임스탬프와 IP 주소가 자동으로 기록됩니다.
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
              취소
            </Button>
          )}
          <Button
            onClick={submitSignature}
            disabled={!hasSignature || !agreedToTerms || isSigning}
            size="lg"
          >
            <Check className="w-4 h-4 mr-2" />
            서명 완료
          </Button>
        </div>
      </Card>

      {/* Legal Notice */}
      <Card className="p-6 bg-gray-50">
        <h3 className="font-semibold mb-2">전자서명법에 관한 안내</h3>
        <p className="text-sm text-gray-600">
          본 전자서명은 일본 전자서명법(電子署名法)에 준거하여 작성됩니다.
          서명 시 기록되는 타임스탬프, IP 주소, 단말정보 등은 법적 효력을 갖는
          증거로 보존됩니다. 서명 후에는 계약 내용의 변경이 불가능합니다.
        </p>
      </Card>
    </div>
  );
}
