/**
 * ShareButtons Component
 * Social share buttons for blog posts
 */

'use client';

import { useState, useEffect } from 'react';
import { Share2, Link as LinkIcon, Check, Twitter, Facebook } from 'lucide-react';
import { pushToDataLayer } from '@/lib/analytics/dataLayer';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);

  // Check for native share on client side only to prevent hydration mismatch
  useEffect(() => {
    setHasNativeShare(typeof navigator !== 'undefined' && navigator.share !== undefined);
  }, []);

  // Get current URL if not provided
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  // Copy link to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      // 計測: リンクコピー（GA4 標準 share イベント）
      pushToDataLayer('share', { method: 'copy_link', content_type: 'article' });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Share on Twitter/X
  const shareOnTwitter = () => {
    // 計測: X（Twitter）シェア
    pushToDataLayer('share', { method: 'Twitter', content_type: 'article' });
    const text = `${description || ''}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  // Share on Facebook
  const shareOnFacebook = () => {
    // 計測: Facebook シェア
    pushToDataLayer('share', { method: 'Facebook', content_type: 'article' });
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
  };

  // Share on LinkedIn
  const shareOnLinkedIn = () => {
    // 計測: LinkedIn シェア
    pushToDataLayer('share', { method: 'LinkedIn', content_type: 'article' });
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
  };

  // Share on LINE（日本でシェア率が高い SNS）
  const shareOnLine = () => {
    // 計測: LINE シェア
    pushToDataLayer('share', { method: 'LINE', content_type: 'article' });
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;
    window.open(lineUrl, '_blank', 'width=550,height=520');
  };

  // Native share (mobile)
  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: shareUrl,
        });
        // 計測: ネイティブシェア（OS の共有シート経由）
        pushToDataLayer('share', { method: 'native', content_type: 'article' });
      } catch (err) {
        console.error('Share canceled:', err);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">シェア</h3>

      <div className="flex flex-wrap gap-3">
        {/* Native Share (mobile only) - rendered only on client after hydration */}
        {hasNativeShare && (
          <button
            onClick={nativeShare}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5" />
            <span>シェア</span>
          </button>
        )}

        {/* Twitter */}
        <button
          onClick={shareOnTwitter}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Share on X (Twitter)"
        >
          <Twitter className="w-5 h-5" />
          <span className="hidden sm:inline">Xでシェア</span>
        </button>

        {/* Facebook */}
        <button
          onClick={shareOnFacebook}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          aria-label="Share on Facebook"
        >
          <Facebook className="w-5 h-5" />
          <span className="hidden sm:inline">Facebook</span>
        </button>

        {/* LINE */}
        <button
          onClick={shareOnLine}
          className="flex items-center gap-2 px-4 py-2 bg-[#06C755] text-white rounded-lg hover:bg-[#05b04c] transition-colors"
          aria-label="LINEでシェア"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.252 1.058.58.12.301.079.773.038 1.078l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.965-4.617 8.999-7.693C23.002 14.271 24 12.434 24 10.314" />
          </svg>
          <span className="hidden sm:inline">LINE</span>
        </button>

        {/* LinkedIn */}
        <button
          onClick={shareOnLinkedIn}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
          aria-label="Share on LinkedIn"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          <span className="hidden sm:inline">LinkedIn</span>
        </button>

        {/* Copy Link */}
        <button
          onClick={copyToClipboard}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            copied
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-label="Copy link"
        >
          {copied ? (
            <Check className="w-5 h-5" />
          ) : (
            <LinkIcon className="w-5 h-5" />
          )}
          <span className="hidden sm:inline">
            {copied ? 'コピーしました!' : 'リンクをコピー'}
          </span>
        </button>
      </div>
    </div>
  );
}

// =====================================================
// Inline Share Buttons (horizontal layout)
// =====================================================

interface InlineShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

export function InlineShareButtons({ url, title, description }: InlineShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      // 計測: リンクコピー（インライン）
      pushToDataLayer('share', { method: 'copy_link', content_type: 'article' });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-500">シェア:</span>

      <div className="flex items-center gap-2">
        {/* Twitter */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => pushToDataLayer('share', { method: 'Twitter', content_type: 'article' })}
          className="p-2 text-gray-400 hover:text-black transition-colors"
          aria-label="Share on X (Twitter)"
        >
          <Twitter className="w-5 h-5" />
        </a>

        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => pushToDataLayer('share', { method: 'Facebook', content_type: 'article' })}
          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          aria-label="Share on Facebook"
        >
          <Facebook className="w-5 h-5" />
        </a>

        {/* LINE */}
        <a
          href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => pushToDataLayer('share', { method: 'LINE', content_type: 'article' })}
          className="p-2 text-gray-400 hover:text-[#06C755] transition-colors"
          aria-label="LINEでシェア"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.252 1.058.58.12.301.079.773.038 1.078l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.965-4.617 8.999-7.693C23.002 14.271 24 12.434 24 10.314" />
          </svg>
        </a>

        {/* Copy Link */}
        <button
          onClick={copyToClipboard}
          className={`p-2 transition-colors ${
            copied ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
          }`}
          aria-label="Copy link"
        >
          {copied ? (
            <Check className="w-5 h-5" />
          ) : (
            <LinkIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
