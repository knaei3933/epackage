'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ErrorBoundaryWrapper } from '@/components/error/ErrorBoundary';
import { LoadingSpinner, PageSpinner, FullPageSpinner } from '@/components/ui/LoadingSpinner';
import {
  Skeleton,
  CardSkeleton,
  ProductCardSkeleton,
  ListSkeleton,
  TableSkeleton,
  FormSkeleton
} from '@/components/ui/SkeletonLoader';
import { useLoadingState } from '@/contexts/LoadingContext';
import { useErrorHandler } from '@/components/error/ErrorBoundary';

// Demo component that throws an error
function ErrorComponent() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('This is a demo error to showcase ErrorBoundary!');
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Error Demo Component</h3>
      <Button onClick={() => setShouldThrow(true)} variant="primary">
        Trigger Error
      </Button>
    </div>
  );
}

// Component with async loading simulation
function AsyncLoadingDemo() {
  const { isLoading, startLoading, stopLoading } = useLoadingState('demo-async');
  const [data, setData] = useState<string[]>([]);

  const simulateApiCall = async () => {
    startLoading('データを読み込み中...');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setData(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']);
    stopLoading();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Async Loading Demo</h3>

      <div className="mb-4">
        <Button
          onClick={simulateApiCall}
          disabled={isLoading}
          variant="primary"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" color="white" className="mr-2" />
              読み込み中...
            </>
          ) : (
            'データを読み込む'
          )}
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <ListSkeleton items={3} />
        </div>
      )}

      {!isLoading && data.length > 0 && (
        <ul className="space-y-2">
          {data.map((item, index) => (
            <li key={index} className="p-3 bg-gray-50 rounded border">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function LoadingErrorDemo() {
  const { handleError } = useErrorHandler();

  const handleManualError = () => {
    try {
      throw new Error('This is a manually triggered error!');
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Unknown error'), 'Manual error demo');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Loading States & Error Handling Demo
        </h1>
        <p className="text-lg text-gray-600">
          Explore different loading states and error handling patterns
        </p>
      </div>

      {/* Loading Spinners Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Loading Spinners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Default Spinner</h3>
            <LoadingSpinner size="md" label="読み込み中..." center />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Dots Variant</h3>
            <LoadingSpinner size="lg" variant="dots" color="secondary" center />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Pulse Variant</h3>
            <LoadingSpinner size="xl" variant="pulse" color="primary" center />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Bars Variant</h3>
            <LoadingSpinner size="md" variant="bars" color="secondary" center />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Bounce Variant</h3>
            <LoadingSpinner size="lg" variant="bounce" color="primary" center />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Page Spinner</h3>
            <PageSpinner />
          </div>
        </div>
      </section>

      {/* Skeleton Loaders Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Skeleton Loaders</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Skeleton</h3>
            <div className="space-y-4">
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton width="100%" height={200} />
              <Skeleton variant="circle" width={60} height={60} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Card Skeleton</h3>
            <CardSkeleton />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Product Card Skeleton</h3>
            <ProductCardSkeleton />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">List Skeleton</h3>
            <ListSkeleton items={3} />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Table Skeleton</h3>
            <TableSkeleton rows={3} />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Form Skeleton</h3>
            <FormSkeleton />
          </div>
        </div>
      </section>

      {/* Error Handling Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Error Handling</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ErrorBoundaryWrapper
            enableRetry={true}
            showDetails={process.env.NODE_ENV === 'development'}
          >
            <ErrorComponent />
          </ErrorBoundaryWrapper>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Manual Error Handling</h3>
            <Button onClick={handleManualError} variant="secondary">
              Trigger Manual Error
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              This will trigger an error that gets logged but won't crash the component.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Full Page Error</h3>
            <Button
              onClick={() => {
                throw new Error('This would trigger the root ErrorBoundary!');
              }}
              variant="outline"
            >
              Trigger Root ErrorBoundary
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              This will trigger the application-wide ErrorBoundary.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Async Loading with Error</h3>
            <AsyncLoadingDemo />
          </div>
        </div>
      </section>

      {/* Full Page Overlay Demo */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Full Page Loading</h2>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <Button
            onClick={() => {
              // Simulate full page loading
              const overlay = document.createElement('div');
              overlay.innerHTML = `
                <div class="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
                  <div class="text-center">
                    <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p class="text-lg font-medium">処理中...</p>
                  </div>
                </div>
              `;
              document.body.appendChild(overlay);

              setTimeout(() => {
                document.body.removeChild(overlay);
              }, 3000);
            }}
            variant="primary"
          >
            Show Full Page Loading
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            Demonstrates a full-page loading overlay for 3 seconds
          </p>
        </div>
      </section>
    </div>
  );
}