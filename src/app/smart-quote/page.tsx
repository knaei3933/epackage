'use client';

import React from 'react';
import { QuoteProvider } from '@/contexts/QuoteContext';
import { MultiQuantityQuoteProvider } from '@/contexts/MultiQuantityQuoteContext';
import { ImprovedQuotingWizard } from '@/components/quote/ImprovedQuotingWizard';

export default function SmartQuotePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <QuoteProvider>
        <MultiQuantityQuoteProvider>
          <ImprovedQuotingWizard />
        </MultiQuantityQuoteProvider>
      </QuoteProvider>
    </div>
  );
}