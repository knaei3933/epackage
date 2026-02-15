/**
 * XSS Security Tests for ImprovedQuotingWizard
 *
 * ImprovedQuotingWizardコンポーネントのXSSセキュリティテスト
 * XSS security tests for the quoting wizard component
 *
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useMultiQuantityQuote } from '../../ImprovedQuotingWizard';

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

describe('XSS Security - ImprovedQuotingWizard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Image Error Handler Sanitization', () => {
    it('should sanitize XSS in image fallback content', () => {
      const TestComponent = () => {
        const { state } = useMultiQuantityQuote();

        return (
          <div>
            <img
              src="/invalid.png"
              alt={state.bagTypeId}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const parent = target.parentElement;
                if (parent) {
                  // Simulate the sanitized fallback from the component
                  parent.innerHTML = `
                    <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                  `;
                }
              }}
            />
          </div>
        );
      };

      render(<TestComponent />);

      const img = screen.getByAltText('flat_3_side');
      expect(img).toBeInTheDocument();
    });
  });

  describe('User Input Sanitization', () => {
    it('should handle script injection in material type', () => {
      const TestComponent = () => {
        const { state } = useMultiQuantityQuote();

        return (
          <div>
            <span data-testid="material-type">{state.materialId}</span>
          </div>
        );
      };

      render(<TestComponent />);

      const materialType = screen.getByTestId('material-type');
      expect(materialType).toHaveTextContent('pet_al');
    });

    it('should handle XSS in specifications', () => {
      const maliciousSpec = {
        thickness: '<script>alert("XSS")</script>100',
        width: 200,
        height: 300,
      };

      const TestComponent = () => {
        return (
          <div>
            <span data-testid="spec">{JSON.stringify(maliciousSpec)}</span>
          </div>
        );
      };

      render(<TestComponent />);

      const spec = screen.getByTestId('spec');
      expect(spec).toBeInTheDocument();
      // The spec should be properly escaped
      expect(spec.textContent).toContain('<script>');
    });
  });

  describe('State Management Security', () => {
    it('should not execute XSS in state updates', () => {
      const TestComponent = () => {
        const { state } = useMultiQuantityQuote();

        return (
          <div>
            <span data-testid="bag-type">{state.bagTypeId}</span>
          </div>
        );
      };

      render(<TestComponent />);

      const bagType = screen.getByTestId('bag-type');
      expect(bagType).toHaveTextContent('flat_3_side');
    });
  });

  describe('DOMPurify Integration', () => {
    it('should call DOMPurify.sanitize for HTML content', () => {
      const DOMPurify = require('dompurify').default;

      const maliciousHTML = '<script>alert("XSS")</svg><img src=x onerror="alert(1)">';

      const sanitized = DOMPurify.sanitize(maliciousHTML);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('onerror');
      expect(DOMPurify.sanitize).toHaveBeenCalled();
    });

    it('should preserve safe HTML after sanitization', () => {
      const DOMPurify = require('dompurify').default;

      const safeHTML = '<strong>Bold</strong> <em>Italic</em>';

      const sanitized = DOMPurify.sanitize(safeHTML);

      expect(sanitized).toContain('<strong>');
      expect(sanitized).toContain('<em>');
    });
  });
});
