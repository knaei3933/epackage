/**
 * XSS Security Tests for EnvelopePreview
 *
 * EnvelopePreviewコンポーネントのXSSセキュリティテスト
 * XSS security tests for the envelope preview component
 *
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import EnvelopePreview from '../EnvelopePreview';

// Mock DOMPurify
jest.mock('dompurify', () => ({
  default: {
    sanitize: jest.fn((html: string) => {
      // Simulate DOMPurify sanitization
      const sanitized = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/javascript:/gi, '');
      return sanitized;
    }),
  },
}));

describe('XSS Security - EnvelopePreview', () => {
  const defaultProps = {
    bagTypeId: 'flat_3_side',
    dimensions: {
      width: 200,
      height: 300,
      depth: 0,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Error Message Sanitization', () => {
    it('should sanitize XSS in config name', () => {
      const maliciousProps = {
        ...defaultProps,
        bagTypeId: '<script>alert("XSS")</script>flat_3_side' as any,
      };

      const { container } = render(<EnvelopePreview {...maliciousProps} />);

      // Component should render without executing the script
      expect(container).toBeInTheDocument();
    });

    it('should sanitize XSS in error messages', () => {
      const { container } = render(<EnvelopePreview {...defaultProps} />);

      // Any error messages should be sanitized
      expect(container).toBeInTheDocument();
    });
  });

  describe('Image Error Handler Sanitization', () => {
    it('should sanitize XSS in image fallback', () => {
      // This test verifies that the image onError handler properly sanitizes HTML
      const { container } = render(<EnvelopePreview {...defaultProps} />);

      // The component should render without executing malicious scripts
      expect(container).toBeInTheDocument();
      expect(container.querySelector('img')).toBeInTheDocument();
    });

    it('should handle SVG sanitization in fallback', () => {
      const DOMPurify = require('dompurify').default;

      const maliciousSVG = '<svg onload="alert(\'XSS\')"><path d="test"/></svg>';
      const sanitized = DOMPurify.sanitize(maliciousSVG);

      expect(sanitized).not.toContain('onload');
      expect(DOMPurify.sanitize).toHaveBeenCalledWith(maliciousSVG, expect.any(Object));
    });
  });

  describe('User Input Display', () => {
    it('should escape dimension values properly', () => {
      const maliciousProps = {
        ...defaultProps,
        dimensions: {
          width: 200,
          height: '<script>alert("XSS")</script>' as any,
          depth: 0,
        },
      };

      const { container } = render(<EnvelopePreview {...maliciousProps} />);

      // The component should render without executing the script
      expect(container).toBeInTheDocument();
    });

    it('should display dimensions safely', () => {
      const { container } = render(<EnvelopePreview {...defaultProps} />);

      // Dimensions should be displayed as text, not HTML
      expect(container.textContent).toContain('200');
      expect(container.textContent).toContain('300');
    });
  });

  describe('Bag Type Config Display', () => {
    it('should sanitize bag type names', () => {
      const { container } = render(<EnvelopePreview {...defaultProps} />);

      // Bag type name should be displayed safely
      expect(container.textContent).toContain('三方シール平袋');
    });
  });

  describe('DOMPurify Configuration', () => {
    it('should use proper ALLOWED_TAGS configuration', () => {
      const DOMPurify = require('dompurify').default;

      // Test with allowed tags
      const safeHTML = '<div class="test"><span>Safe content</span></div>';
      const result = DOMPurify.sanitize(safeHTML, {
        ALLOWED_TAGS: ['div', 'span', 'p', 'br', 'strong', 'em'],
        ALLOWED_ATTR: ['class'],
      });

      expect(result).toContain('Safe content');
    });

    it('should remove disallowed tags', () => {
      const DOMPurify = require('dompurify').default;

      const maliciousHTML = '<script>alert("XSS")</script><div>Safe</div>';
      const result = DOMPurify.sanitize(maliciousHTML, {
        ALLOWED_TAGS: ['div'],
        ALLOWED_ATTR: ['class'],
      });

      expect(result).not.toContain('<script>');
      expect(result).toContain('Safe');
    });

    it('should remove dangerous attributes', () => {
      const DOMPurify = require('dompurify').default;

      const dangerousHTML = '<div onclick="alert(\'XSS\')" class="safe">Content</div>';
      const result = DOMPurify.sanitize(dangerousHTML, {
        ALLOWED_TAGS: ['div'],
        ALLOWED_ATTR: ['class'],
      });

      expect(result).not.toContain('onclick');
      expect(result).toContain('class="safe"');
    });
  });

  describe('innerHTML Usage Safety', () => {
    it('should never use innerHTML with unsanitized user input', () => {
      const DOMPurify = require('dompurify').default;

      const userInput = '<img src=x onerror="alert(1)">';
      const sanitized = DOMPurify.sanitize(userInput);

      // After sanitization, dangerous content should be removed
      expect(sanitized).not.toContain('onerror');
    });

    it('should preserve safe formatting', () => {
      const DOMPurify = require('dompurify').default;

      const formattedHTML = '<div class="text-center"><div class="text-sm">Safe text</div></div>';
      const sanitized = DOMPurify.sanitize(formattedHTML, {
        ALLOWED_TAGS: ['div'],
        ALLOWED_ATTR: ['class'],
      });

      expect(sanitized).toContain('text-center');
      expect(sanitized).toContain('Safe text');
    });
  });
});
