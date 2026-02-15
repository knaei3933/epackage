/**
 * Signature Canvas Component
 *
 * HTML5 Canvas-based signature pad with touch/mobile support
 * Supports both handwritten signatures and hanko (Japanese seal) placement
 */

'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface SignatureCanvasProps {
  width?: number;
  height?: number;
  className?: string;
  onSignatureChange?: (signatureData: string, isEmpty: boolean) => void;
  signatureType?: 'handwritten' | 'hanko';
  hankoImage?: string; // Base64 encoded hanko image for stamping
  disabled?: boolean;
  penColor?: string;
  penWidth?: number;
  backgroundColor?: string;
}

interface Point {
  x: number;
  y: number;
}

interface StrokeData {
  points: Point[];
  timestamp: number;
}

export function SignatureCanvas({
  width = 500,
  height = 200,
  className,
  onSignatureChange,
  signatureType = 'handwritten',
  hankoImage,
  disabled = false,
  penColor = '#000000',
  penWidth = 2,
  backgroundColor = '#ffffff',
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [strokeCount, setStrokeCount] = useState(0);
  const [signingDuration, setSigningDuration] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [strokes, setStrokes] = useState<StrokeData[]>([]);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Set drawing style
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw hanko image if provided (for stamping mode)
    if (signatureType === 'hanko' && hankoImage) {
      const img = new Image();
      img.onload = () => {
        // Center the hanko image
        const x = (width - img.width) / 2;
        const y = (height - img.height) / 2;
        ctx.drawImage(img, x, y);
        setIsEmpty(false);
        notifyChange(false);
      };
      img.src = hankoImage;
    }
  }, [width, height, backgroundColor, penColor, penWidth, signatureType, hankoImage]);

  // Get coordinates from event
  const getCoordinates = useCallback((event: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  // Start drawing
  const startDrawing = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    event.preventDefault();

    setIsDrawing(true);
    if (!startTime) setStartTime(Date.now());

    const point = getCoordinates(event);
    const newStroke: StrokeData = {
      points: [point],
      timestamp: Date.now(),
    };
    setStrokes((prev) => [...prev, newStroke]);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }, [disabled, getCoordinates, startTime]);

  // Draw
  const draw = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    event.preventDefault();

    const point = getCoordinates(event);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    // Update current stroke
    setStrokes((prev) => {
      const updated = [...prev];
      const lastStroke = updated[updated.length - 1];
      if (lastStroke) {
        lastStroke.points.push(point);
      }
      return updated;
    });
  }, [isDrawing, disabled, getCoordinates]);

  // Stop drawing
  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;

    setIsDrawing(false);
    setStrokeCount((prev) => prev + 1);
    setIsEmpty(false);

    const duration = startTime ? Date.now() - startTime : 0;
    setSigningDuration(duration);

    notifyChange(false);
  }, [isDrawing, startTime]);

  // Notify parent component of signature change
  const notifyChange = useCallback((empty: boolean) => {
    if (!onSignatureChange) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL('image/png');
    onSignatureChange(signatureData, empty);
  }, [onSignatureChange]);

  // Clear canvas
  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    setIsEmpty(true);
    setStrokeCount(0);
    setSigningDuration(0);
    setStartTime(null);
    setStrokes([]);
    notifyChange(true);
  }, [backgroundColor, width, notifyChange]);

  // Undo last stroke
  const undo = useCallback(() => {
    if (strokes.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Redraw all strokes except the last one
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const newStrokes = strokes.slice(0, -1);
    setStrokes(newStrokes);

    // Redraw remaining strokes
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    newStrokes.forEach((stroke) => {
      if (stroke.points.length === 0) return;

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }

      ctx.stroke();
    });

    const hasSignature = newStrokes.length > 0;
    setIsEmpty(!hasSignature);
    setStrokeCount(newStrokes.length);
    notifyChange(!hasSignature);
  }, [strokes, backgroundColor, width, penColor, penWidth, notifyChange]);

  // Export signature data
  const getSignatureData = useCallback((): {
    signatureData: string;
    isEmpty: boolean;
    strokeCount: number;
    signingDuration: number;
    canvasWidth: number;
    canvasHeight: number;
  } => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return {
        signatureData: '',
        isEmpty: true,
        strokeCount: 0,
        signingDuration: 0,
        canvasWidth: width,
        canvasHeight: height,
      };
    }

    return {
      signatureData: canvas.toDataURL('image/png'),
      isEmpty,
      strokeCount,
      signingDuration,
      canvasWidth: width,
      canvasHeight: height,
    };
  }, [isEmpty, strokeCount, signingDuration, width, height]);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Canvas */}
      <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="block touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ cursor: disabled ? 'not-allowed' : 'crosshair' }}
        />

        {/* Placeholder text when empty */}
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-sm">
              {signatureType === 'hanko' ? 'はんこを置いてください (Place your hanko)' : 'ここに署名してください (Sign here)'}
            </p>
          </div>
        )}

        {/* Disabled overlay */}
        {disabled && (
          <div className="absolute inset-0 bg-white/10 pointer-events-none" />
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={isEmpty || disabled}
            className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            元に戻す (Undo)
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={isEmpty || disabled}
            className="px-4 py-2 text-sm font-medium rounded-md border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            クリア (Clear)
          </button>
        </div>

        {/* Stats */}
        <div className="text-xs text-gray-500">
          {strokeCount > 0 && (
            <span>ストローク: {strokeCount} | 所要時間: {Math.round(signingDuration / 1000)}秒</span>
          )}
        </div>
      </div>

      {/* Export button (hidden, but accessible via ref if needed) */}
      <button
        type="button"
        onClick={() => {
          const data = getSignatureData();
          console.log('Signature data:', data);
        }}
        className="hidden"
        aria-hidden="true"
      >
        Export
      </button>
    </div>
  );
}

/**
 * Hook to access signature canvas methods programmatically
 */
export function useSignatureCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Trigger clear by dispatching custom event
    canvas.dispatchEvent(new CustomEvent('clear-signature'));
  }, []);

  const getSignatureData = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    return canvas.toDataURL('image/png');
  }, []);

  return {
    canvasRef,
    clear,
    getSignatureData,
  };
}
