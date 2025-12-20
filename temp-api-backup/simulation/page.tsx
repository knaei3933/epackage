'use client';

import React from 'react';
import { SimulationProvider } from '@/components/simulation/SimulationContext';
import { SimulationWizard } from '@/components/simulation/SimulationWizard';
import { Layout } from '@/components/layout/Layout';

export default function SimulationPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-navy-50">
        <SimulationProvider>
          <SimulationWizard />
        </SimulationProvider>
      </div>
    </Layout>
  );
}