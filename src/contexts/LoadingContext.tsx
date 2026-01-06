'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface LoadingState {
  [key: string]: {
    isLoading: boolean;
    message?: string;
    progress?: number;
  };
}

interface LoadingContextType {
  loadingStates: LoadingState;
  setLoading: (key: string, isLoading: boolean, message?: string) => void;
  setLoadingWithProgress: (key: string, isLoading: boolean, progress?: number, message?: string) => void;
  clearLoading: (key: string) => void;
  clearAllLoading: () => void;
  isAnyLoading: () => boolean;
  getLoadingKeys: () => string[];
  getLoadingMessage: (key: string) => string | undefined;
  getLoadingProgress: (key: string) => number | undefined;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const setLoading = useCallback((key: string, isLoading: boolean, message?: string) => {
    setLoadingStates(prev => {
      if (isLoading) {
        return {
          ...prev,
          [key]: {
            isLoading: true,
            message,
            progress: prev[key]?.progress
          }
        };
      } else {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      }
    });
  }, []);

  const setLoadingWithProgress = useCallback((key: string, isLoading: boolean, progress?: number, message?: string) => {
    setLoadingStates(prev => {
      if (isLoading) {
        return {
          ...prev,
          [key]: {
            isLoading: true,
            message: message || prev[key]?.message,
            progress: progress ?? prev[key]?.progress
          }
        };
      } else {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      }
    });
  }, []);

  const clearLoading = useCallback((key: string) => {
    setLoadingStates(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  }, []);

  const clearAllLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(state => state.isLoading);
  }, [loadingStates]);

  const getLoadingKeys = useCallback(() => {
    return Object.keys(loadingStates).filter(key => loadingStates[key].isLoading);
  }, [loadingStates]);

  const getLoadingMessage = useCallback((key: string) => {
    return loadingStates[key]?.message;
  }, [loadingStates]);

  const getLoadingProgress = useCallback((key: string) => {
    return loadingStates[key]?.progress;
  }, [loadingStates]);

  return (
    <LoadingContext.Provider
      value={{
        loadingStates,
        setLoading,
        setLoadingWithProgress,
        clearLoading,
        clearAllLoading,
        isAnyLoading,
        getLoadingKeys,
        getLoadingMessage,
        getLoadingProgress,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

// Hook for specific loading states
export function useLoadingState(key: string) {
  const {
    setLoading,
    setLoadingWithProgress,
    clearLoading,
    getLoadingMessage,
    getLoadingProgress,
    loadingStates
  } = useLoading();

  const isLoading = loadingStates[key]?.isLoading || false;
  const message = getLoadingMessage(key);
  const progress = getLoadingProgress(key);

  const startLoading = useCallback((loadingMessage?: string) => {
    setLoading(key, true, loadingMessage);
  }, [key, setLoading]);

  const stopLoading = useCallback(() => {
    clearLoading(key);
  }, [key, clearLoading]);

  const updateProgress = useCallback((newProgress: number, progressMessage?: string) => {
    setLoadingWithProgress(key, true, newProgress, progressMessage);
  }, [key, setLoadingWithProgress]);

  return {
    isLoading,
    message,
    progress,
    startLoading,
    stopLoading,
    updateProgress,
  };
}