'use client';

import { useEffect, useState } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

export function CustomCursor() {
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [followerPosition, setFollowerPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // クライアントサイドでのみマウント
  useEffect(() => {
    setIsMounted(true);
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    // タッチデバイスの場合はカスタムカーソルを無効化
    if (isTouchDevice) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.classList.contains('cursor-pointer')
      ) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.classList.contains('cursor-pointer')
      ) {
        setIsHovering(false);
      }
    };

    // マウスがウィンドウから離れた時にカーソルを非表示
    const handleMouseLeaveWindow = () => setIsVisible(false);
    const handleMouseEnterWindow = () => setIsVisible(true);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    document.addEventListener('mouseenter', handleMouseEnterWindow);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      document.removeEventListener('mouseenter', handleMouseEnterWindow);
    };
  }, [isTouchDevice]);

  // フォロワー円のアニメーション（少し遅れて追従）
  useEffect(() => {
    if (!isMounted || isTouchDevice) return;

    const animationFrame = requestAnimationFrame(() => {
      setFollowerPosition((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.15,
        y: prev.y + (position.y - prev.y) * 0.15,
      }));
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [position, isMounted, isTouchDevice]);

  // SSR中またはタッチデバイスでは何も表示しない
  if (!isMounted || isTouchDevice) {
    return null;
  }

  return (
    <>
      {/* メインカーソル（光る中心点） */}
      <div
        className={`custom-cursor-dot ${isClicking ? 'clicking' : ''}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          opacity: isVisible ? 1 : 0,
        }}
      />

      {/* フォロワー円（グロー効果） */}
      <div
        className={`custom-cursor-follower ${isHovering ? 'hovering' : ''} ${isClicking ? 'clicking' : ''}`}
        style={{
          transform: `translate(${followerPosition.x}px, ${followerPosition.y}px)`,
          opacity: isVisible ? 1 : 0,
        }}
      />

      <style jsx>{`
        .custom-cursor-dot {
          position: fixed;
          top: 0;
          left: 0;
          width: 14px;
          height: 14px;
          background: linear-gradient(135deg, #5EB6AC, #3A827B);
          border-radius: 50%;
          pointer-events: none;
          z-index: 10001;
          box-shadow: 0 0 25px rgba(94, 182, 172, 0.9),
                      0 0 50px rgba(94, 182, 172, 0.7),
                      0 0 75px rgba(94, 182, 172, 0.5);
          transition: transform 0.05s ease-out;
        }

        .custom-cursor-dot.clicking {
          width: 10px;
          height: 10px;
          box-shadow: 0 0 35px rgba(94, 182, 172, 1),
                      0 0 60px rgba(94, 182, 172, 0.8);
        }

        .custom-cursor-follower {
          position: fixed;
          top: 0;
          left: 0;
          width: 60px;
          height: 60px;
          border: 3px solid rgba(94, 182, 172, 0.5);
          border-radius: 50%;
          pointer-events: none;
          z-index: 10000;
          box-shadow: 0 0 30px rgba(94, 182, 172, 0.4),
                      0 0 60px rgba(94, 182, 172, 0.3),
                      inset 0 0 20px rgba(94, 182, 172, 0.1);
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                      height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                      border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .custom-cursor-follower.hovering {
          width: 90px;
          height: 90px;
          border-color: rgba(94, 182, 172, 0.9);
          box-shadow: 0 0 50px rgba(94, 182, 172, 0.7),
                      0 0 80px rgba(94, 182, 172, 0.5),
                      inset 0 0 30px rgba(94, 182, 172, 0.2);
        }

        .custom-cursor-follower.clicking {
          width: 50px;
          height: 50px;
        }

        /* ダークモード対応 */
        @media (prefers-color-scheme: dark) {
          .custom-cursor-dot {
            background: linear-gradient(135deg, #4DD0C9, #2FA39C);
            box-shadow: 0 0 30px rgba(77, 208, 201, 1),
                        0 0 60px rgba(77, 208, 201, 0.8),
                        0 0 90px rgba(77, 208, 201, 0.6);
          }

          .custom-cursor-follower.hovering {
            border-color: rgba(77, 208, 201, 1);
            box-shadow: 0 0 60px rgba(77, 208, 201, 0.8),
                        0 0 100px rgba(77, 208, 201, 0.6),
                        inset 0 0 40px rgba(77, 208, 201, 0.3);
          }
        }

        /* モーション削減対応 */
        @media (prefers-reduced-motion: reduce) {
          .custom-cursor-dot,
          .custom-cursor-follower {
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}
