// Local Storage Utilities for Offline Functionality

export interface StoredComparison {
  id: string;
  shareId: string;
  title?: string;
  description?: string;
  customerName?: string;
  projectName?: string;
  createdAt: string;
  expiresAt: string;
  viewCount?: number;
  shareUrl: string;
  baseParams: any;
  quantities: number[];
  calculations: Record<string, any>;
  comparison: any;
  userPreferences: any;
  metadata: any;
}

export interface StorageConfig {
  maxComparisons: number;
  maxAge: number; // in days
  compressionEnabled: boolean;
}

const DEFAULT_CONFIG: StorageConfig = {
  maxComparisons: 50,
  maxAge: 90,
  compressionEnabled: true,
};

class StorageManager {
  private config: StorageConfig;
  private storageKey: string;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.storageKey = 'epackage-comparisons';
  }

  // Save comparison to localStorage
  saveComparison(comparison: StoredComparison): boolean {
    try {
      const existing = this.getAllComparisons();

      // Remove expired comparisons
      const filtered = existing.filter(c => !this.isExpired(c.expiresAt));

      // Add new comparison
      const updated = [comparison, ...filtered].slice(0, this.config.maxComparisons);

      // Save to localStorage
      const data = this.config.compressionEnabled
        ? this.compress(JSON.stringify(updated))
        : JSON.stringify(updated);

      localStorage.setItem(this.storageKey, data);
      return true;
    } catch (error) {
      console.error('Failed to save comparison to localStorage:', error);
      return false;
    }
  }

  // Get all comparisons from localStorage
  getAllComparisons(): StoredComparison[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];

      const parsed = this.config.compressionEnabled
        ? JSON.parse(this.decompress(data))
        : JSON.parse(data);

      // Filter expired items
      return parsed.filter((item: StoredComparison) => !this.isExpired(item.expiresAt));
    } catch (error) {
      console.error('Failed to load comparisons from localStorage:', error);
      return [];
    }
  }

  // Get specific comparison by ID
  getComparison(id: string): StoredComparison | null {
    const comparisons = this.getAllComparisons();
    return comparisons.find(c => c.id === id) || null;
  }

  // Delete comparison
  deleteComparison(id: string): boolean {
    try {
      const comparisons = this.getAllComparisons();
      const filtered = comparisons.filter(c => c.id !== id);

      const data = this.config.compressionEnabled
        ? this.compress(JSON.stringify(filtered))
        : JSON.stringify(filtered);

      localStorage.setItem(this.storageKey, data);
      return true;
    } catch (error) {
      console.error('Failed to delete comparison from localStorage:', error);
      return false;
    }
  }

  // Clear all comparisons
  clearComparisons(): boolean {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Failed to clear comparisons from localStorage:', error);
      return false;
    }
  }

  // Get storage usage information
  getStorageInfo(): { used: number; available: number; comparisons: number } {
    try {
      const data = localStorage.getItem(this.storageKey);
      const used = data ? new Blob([data]).size : 0;
      const comparisons = this.getAllComparisons().length;

      // Estimate available space (localStorage typically has 5-10MB limit)
      const available = 5 * 1024 * 1024 - used; // 5MB limit estimation

      return { used, available, comparisons };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, available: 0, comparisons: 0 };
    }
  }

  // Cleanup expired and old comparisons
  cleanup(): number {
    try {
      const comparisons = this.getAllComparisons();
      const filtered = comparisons.filter(c =>
        !this.isExpired(c.expiresAt) &&
        !this.isOlderThan(c.createdAt, this.config.maxAge)
      );

      const removed = comparisons.length - filtered.length;

      if (removed > 0) {
        const data = this.config.compressionEnabled
          ? this.compress(JSON.stringify(filtered))
          : JSON.stringify(filtered);

        localStorage.setItem(this.storageKey, data);
      }

      return removed;
    } catch (error) {
      console.error('Failed to cleanup localStorage:', error);
      return 0;
    }
  }

  // Export data for backup
  exportData(): string {
    try {
      const comparisons = this.getAllComparisons();
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        comparisons,
      };
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return '';
    }
  }

  // Import data from backup
  importData(data: string): { success: boolean; imported: number; errors: string[] } {
    const errors: string[] = [];
    let imported = 0;

    try {
      const importData = JSON.parse(data);

      if (!importData.comparisons || !Array.isArray(importData.comparisons)) {
        return { success: false, imported: 0, errors: ['Invalid data format'] };
      }

      for (const comparison of importData.comparisons) {
        try {
          // Validate comparison data
          if (this.validateComparison(comparison)) {
            this.saveComparison(comparison);
            imported++;
          } else {
            errors.push(`Invalid comparison: ${comparison.id || 'unknown'}`);
          }
        } catch (error) {
          errors.push(`Failed to import comparison: ${comparison.id || 'unknown'}`);
        }
      }

      return { success: true, imported, errors };
    } catch (error) {
      errors.push('Failed to parse import data');
      return { success: false, imported: 0, errors };
    }
  }

  // Helper methods
  private isExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
  }

  private isOlderThan(createdAt: string, days: number): boolean {
    const created = new Date(createdAt);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return created < cutoff;
  }

  private validateComparison(comparison: any): boolean {
    return !!(
      comparison &&
      comparison.id &&
      comparison.shareId &&
      comparison.createdAt &&
      comparison.expiresAt &&
      comparison.baseParams &&
      Array.isArray(comparison.quantities)
    );
  }

  private compress(data: string): string {
    try {
      // Simple compression - replace repeated patterns
      // In production, you might want to use a proper compression library
      return data.replace(/"baseParams":/g, '"bp":')
                .replace(/"calculations":/g, '"calc":')
                .replace(/"comparison":/g, '"comp":')
                .replace(/"metadata":/g, '"meta":');
    } catch {
      return data;
    }
  }

  private decompress(data: string): string {
    try {
      // Reverse the compression
      return data.replace(/"bp":/g, '"baseParams":')
                .replace(/"calc":/g, '"calculations":')
                .replace(/"comp":/g, '"comparison":')
                .replace(/"meta":/g, '"metadata":');
    } catch {
      return data;
    }
  }
}

// Singleton instance
export const storageManager = new StorageManager();

// Utility functions
export const saveToLocalStorage = (comparison: StoredComparison): boolean => {
  return storageManager.saveComparison(comparison);
};

export const loadFromLocalStorage = (): StoredComparison[] => {
  return storageManager.getAllComparisons();
};

export const deleteFromLocalStorage = (id: string): boolean => {
  return storageManager.deleteComparison(id);
};

export const getLocalStorageInfo = () => {
  return storageManager.getStorageInfo();
};

export const cleanupLocalStorage = (): number => {
  return storageManager.cleanup();
};

export const exportLocalStorageData = (): string => {
  return storageManager.exportData();
};

export const importLocalStorageData = (data: string) => {
  return storageManager.importData(data);
};