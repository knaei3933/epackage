/**
 * Download Manager for handling large file downloads with chunking and progress tracking
 */

interface DownloadChunk {
  index: number;
  start: number;
  end: number;
  data: ArrayBuffer | null;
  loaded: boolean;
}

interface DownloadProgress {
  sessionId: string;
  totalSize: number;
  downloadedSize: number;
  percentage: number;
  speed: number; // bytes per second
  estimatedTimeRemaining: number; // seconds
  startTime: number;
  lastUpdateTime: number;
}

interface DownloadOptions {
  chunkSize?: number; // bytes
  maxRetries?: number;
  retryDelay?: number; // milliseconds
  onProgress?: (progress: DownloadProgress) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export class DownloadManager {
  private static instance: DownloadManager;
  private activeDownloads = new Map<string, DownloadChunk[]>();
  private progressTrackers = new Map<string, DownloadProgress>();

  static getInstance(): DownloadManager {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager();
    }
    return DownloadManager.instance;
  }

  /**
   * Download a large file in chunks
   */
  async downloadInChunks(
    url: string,
    sessionId: string,
    options: DownloadOptions = {}
  ): Promise<Blob> {
    const {
      chunkSize = 1024 * 1024 * 5, // 5MB chunks
      maxRetries = 3,
      retryDelay = 1000,
      onProgress,
      onComplete,
      onError
    } = options;

    try {
      // Get file size first
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Failed to get file info: ${response.status}`);
      }

      const contentLength = parseInt(response.headers.get('content-length') || '0');
      const acceptRanges = response.headers.get('accept-ranges') === 'bytes';

      if (!acceptRanges) {
        // Server doesn't support range requests, download normally
        return this.downloadNormally(url, sessionId, options);
      }

      // Initialize progress tracking
      const progress: DownloadProgress = {
        sessionId,
        totalSize: contentLength,
        downloadedSize: 0,
        percentage: 0,
        speed: 0,
        estimatedTimeRemaining: 0,
        startTime: Date.now(),
        lastUpdateTime: Date.now()
      };

      this.progressTrackers.set(sessionId, progress);

      // Create chunks
      const chunks: DownloadChunk[] = [];
      for (let i = 0; i < contentLength; i += chunkSize) {
        chunks.push({
          index: i / chunkSize,
          start: i,
          end: Math.min(i + chunkSize - 1, contentLength - 1),
          data: null,
          loaded: false
        });
      }

      this.activeDownloads.set(sessionId, chunks);

      // Download chunks with concurrency control
      const concurrency = Math.min(4, chunks.length); // Max 4 concurrent downloads
      const results: ArrayBuffer[] = new Array(chunks.length);

      for (let i = 0; i < chunks.length; i += concurrency) {
        const batch = chunks.slice(i, i + concurrency);

        const promises = batch.map(chunk =>
          this.downloadChunk(url, chunk, maxRetries, retryDelay)
        );

        try {
          const batchResults = await Promise.all(promises);

          batchResults.forEach((result, index) => {
            const chunkIndex = i + index;
            results[chunkIndex] = result.data!;

            // Update progress
            progress.downloadedSize += result.data!.byteLength;
            progress.percentage = (progress.downloadedSize / contentLength) * 100;

            // Calculate speed
            const now = Date.now();
            const timeElapsed = (now - progress.startTime) / 1000;
            progress.speed = progress.downloadedSize / timeElapsed;

            // Calculate estimated time remaining
            const remainingBytes = contentLength - progress.downloadedSize;
            progress.estimatedTimeRemaining = remainingBytes / progress.speed;

            progress.lastUpdateTime = now;

            // Call progress callback
            if (onProgress) {
              onProgress(progress);
            }
          });
        } catch (error) {
          if (onError) {
            onError(error as Error);
          }
          throw error;
        }
      }

      // Combine all chunks
      const blob = new Blob(results, { type: 'application/pdf' });

      // Clean up
      this.activeDownloads.delete(sessionId);
      this.progressTrackers.delete(sessionId);

      if (onComplete) {
        onComplete();
      }

      return blob;

    } catch (error) {
      this.activeDownloads.delete(sessionId);
      this.progressTrackers.delete(sessionId);
      throw error;
    }
  }

  /**
   * Download a single chunk with retry logic
   */
  private async downloadChunk(
    url: string,
    chunk: DownloadChunk,
    maxRetries: number,
    retryDelay: number
  ): Promise<DownloadChunk> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            'Range': `bytes=${chunk.start}-${chunk.end}`,
            'Cache-Control': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error(`Chunk download failed: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        const data = await response.arrayBuffer();

        return {
          ...chunk,
          data,
          loaded: true
        };

      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Chunk download failed after retries');
  }

  /**
   * Fallback to normal download if server doesn't support range requests
   */
  private async downloadNormally(
    url: string,
    sessionId: string,
    options: DownloadOptions
  ): Promise<Blob> {
    const { onProgress } = options;

    const progress: DownloadProgress = {
      sessionId,
      totalSize: 0,
      downloadedSize: 0,
      percentage: 0,
      speed: 0,
      estimatedTimeRemaining: 0,
      startTime: Date.now(),
      lastUpdateTime: Date.now()
    };

    this.progressTrackers.set(sessionId, progress);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    const contentLength = parseInt(response.headers.get('content-length') || '0');
    progress.totalSize = contentLength;

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedLength = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      receivedLength += value.length;

      // Update progress
      progress.downloadedSize = receivedLength;
      progress.percentage = contentLength > 0 ? (receivedLength / contentLength) * 100 : 0;

      // Calculate speed
      const now = Date.now();
      const timeElapsed = (now - progress.startTime) / 1000;
      progress.speed = receivedLength / timeElapsed;

      // Calculate estimated time remaining
      if (contentLength > 0) {
        const remainingBytes = contentLength - receivedLength;
        progress.estimatedTimeRemaining = remainingBytes / progress.speed;
      }

      progress.lastUpdateTime = now;

      // Call progress callback
      if (onProgress) {
        onProgress(progress);
      }
    }

    // Combine chunks
    const totalLength = chunks.reduce((total, chunk) => total + chunk.length, 0);
    const combinedChunks = new Uint8Array(totalLength);
    let position = 0;

    for (const chunk of chunks) {
      combinedChunks.set(chunk, position);
      position += chunk.length;
    }

    const blob = new Blob([combinedChunks], { type: 'application/pdf' });

    // Clean up
    this.progressTrackers.delete(sessionId);

    return blob;
  }

  /**
   * Get current progress for a session
   */
  getProgress(sessionId: string): DownloadProgress | null {
    return this.progressTrackers.get(sessionId) || null;
  }

  /**
   * Cancel a download
   */
  cancelDownload(sessionId: string): void {
    this.activeDownloads.delete(sessionId);
    this.progressTrackers.delete(sessionId);
  }

  /**
   * Clean up old/abandoned downloads
   */
  cleanup(): void {
    const now = Date.now();
    const timeout = 10 * 60 * 1000; // 10 minutes

    for (const [sessionId, progress] of this.progressTrackers.entries()) {
      if (now - progress.lastUpdateTime > timeout) {
        this.cancelDownload(sessionId);
      }
    }
  }
}

/**
 * Utility function to format bytes into human readable format
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Utility function to format seconds into human readable time
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}秒`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}分${remainingSeconds}秒`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}時間${minutes}分`;
  }
}

/**
 * Check if browser supports streaming downloads
 */
export function supportsStreaming(): boolean {
  return typeof ReadableStream !== 'undefined' &&
         typeof Response !== 'undefined' &&
         'body' in Response.prototype;
}