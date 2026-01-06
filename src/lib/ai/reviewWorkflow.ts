/**
 * AI Specification Review Workflow
 *
 * AI仕様書レビューワークフロー
 * Review workflow for low-confidence specification extractions
 */

import type {
  ProductSpecifications,
  ReviewTask,
  ReviewDecision,
  ReviewLog,
  ExtractionLog,
  ConfidenceScore,
} from './types';

// ============================================================
// In-Memory Storage (Replace with database in production)
// ============================================================

const reviewTasks = new Map<string, ReviewTask>();
const reviewLogs = new Map<string, ReviewLog>();
const extractionLogs = new Map<string, ExtractionLog>();

// ============================================================
// Review Task Management
// ============================================================

/**
 * レビュータスクを作成
 * Create a review task for low-confidence extraction
 */
export function createReviewTask(
  specs: ProductSpecifications,
  createdBy: string = 'system'
): ReviewTask {
  const taskId = generateTaskId();

  const task: ReviewTask = {
    id: taskId,
    specs,
    status: 'pending',
    reviewer: undefined,
    comments: undefined,
    modifiedSpecs: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  reviewTasks.set(taskId, task);

  // Log the task creation
  addReviewLog({
    id: generateLogId(),
    taskId,
    action: 'created',
    actor: createdBy,
    timestamp: new Date(),
    comment: `レビュータスクを作成しました (信頼度: ${formatConfidence(specs.confidence.overall)})`,
  });

  return task;
}

/**
 * レビュータスクを取得
 * Get a review task by ID
 */
export function getReviewTask(taskId: string): ReviewTask | undefined {
  return reviewTasks.get(taskId);
}

/**
 * すべてのレビュータスクを取得
 * Get all review tasks, optionally filtered by status
 */
export function getReviewTasks(status?: ReviewTask['status']): ReviewTask[] {
  const tasks = Array.from(reviewTasks.values());

  if (status) {
    return tasks.filter(t => t.status === status);
  }

  // Sort by creation date (newest first)
  return tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * 低信頼度の抽出に対してレビュータスクを作成
 * Create review tasks for low-confidence extractions
 */
export function createReviewForLowConfidence(
  specs: ProductSpecifications,
  threshold: number = 0.8,
  createdBy: string = 'system'
): ReviewTask | null {
  if (specs.confidence.overall >= threshold) {
    return null; // No review needed for high confidence
  }

  return createReviewTask(specs, createdBy);
}

// ============================================================
// Review Decision Processing
// ============================================================

/**
 * レビュー決定を処理
 * Process a review decision
 */
export function processReviewDecision(
  taskId: string,
  decision: ReviewDecision,
  reviewer: string,
  modifiedSpecs?: ProductSpecifications,
  comments?: string
): ReviewTask {
  const task = reviewTasks.get(taskId);

  if (!task) {
    throw new Error(`レビュータスクが見つかりません: ${taskId}`);
  }

  // Update task based on decision
  switch (decision) {
    case 'approve':
      task.status = 'approved';
      task.reviewer = reviewer;
      task.comments = comments;
      break;

    case 'reject':
      task.status = 'rejected';
      task.reviewer = reviewer;
      task.comments = comments || '仕様書を却下しました';
      break;

    case 'modify':
      if (!modifiedSpecs) {
        throw new Error('修正された仕様書が必要です');
      }
      task.status = 'modified';
      task.reviewer = reviewer;
      task.modifiedSpecs = modifiedSpecs;
      task.comments = comments || '仕様書を修正しました';
      break;
  }

  task.updatedAt = new Date();

  // Log the decision
  addReviewLog({
    id: generateLogId(),
    taskId,
    action: decision === 'approve' ? 'approved' :
            decision === 'reject' ? 'rejected' : 'modified',
    actor: reviewer,
    timestamp: new Date(),
    comment: comments || `レビュー決定: ${decision}`,
  });

  return task;
}

/**
 * レビューコメントを追加
 * Add comments to a review task
 */
export function addReviewComment(
  taskId: string,
  commenter: string,
  comment: string
): ReviewTask {
  const task = reviewTasks.get(taskId);

  if (!task) {
    throw new Error(`レビュータスクが見つかりません: ${taskId}`);
  }

  // Append comment to existing comments
  const timestamp = new Date().toLocaleString('ja-JP');
  const newComment = `[${timestamp}] ${commenter}: ${comment}`;

  task.comments = task.comments
    ? `${task.comments}\n${newComment}`
    : newComment;

  task.updatedAt = new Date();

  // Log the comment
  addReviewLog({
    id: generateLogId(),
    taskId,
    action: 'commented',
    actor: commenter,
    timestamp: new Date(),
    comment,
  });

  return task;
}

// ============================================================
// Review Logging
// ============================================================

/**
 * レビューログを追加
 * Add a review log entry
 */
export function addReviewLog(log: ReviewLog): void {
  reviewLogs.set(log.id, log);
}

/**
 * タスクのレビューログを取得
 * Get review logs for a specific task
 */
export function getReviewLogs(taskId: string): ReviewLog[] {
  const logs = Array.from(reviewLogs.values())
    .filter(l => l.taskId === taskId)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  return logs;
}

/**
 * すべてのレビューログを取得
 * Get all review logs
 */
export function getAllReviewLogs(): ReviewLog[] {
  return Array.from(reviewLogs.values())
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

// ============================================================
// Extraction Logging
// ============================================================

/**
 * 抽出ログを記録
 * Log an extraction event
 */
export function logExtraction(
  sourceFile: string,
  confidence: ConfidenceScore,
  processingTime?: number
): ExtractionLog {
  const log: ExtractionLog = {
    id: generateLogId(),
    timestamp: new Date(),
    sourceFile,
    confidence: confidence.overall,
    flags: confidence.flags,
    status: confidence.level === 'high' ? 'approved' : 'pending_review',
    processingTime,
  };

  extractionLogs.set(log.id, log);

  return log;
}

/**
 * 抽出ログを取得
 * Get extraction logs, optionally filtered
 */
export function getExtractionLogs(filters?: {
  sourceFile?: string;
  status?: ExtractionLog['status'];
  minConfidence?: number;
  maxConfidence?: number;
}): ExtractionLog[] {
  let logs = Array.from(extractionLogs.values());

  if (filters) {
    if (filters.sourceFile) {
      logs = logs.filter(l => l.sourceFile.includes(filters.sourceFile!));
    }
    if (filters.status) {
      logs = logs.filter(l => l.status === filters.status);
    }
    if (filters.minConfidence !== undefined) {
      logs = logs.filter(l => l.confidence >= filters.minConfidence!);
    }
    if (filters.maxConfidence !== undefined) {
      logs = logs.filter(l => l.confidence <= filters.maxConfidence!);
    }
  }

  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// ============================================================
// Statistics and Reporting
// ============================================================

/**
 * レビュー統計を取得
 * Get review statistics
 */
export function getReviewStatistics(): {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  modified: number;
  averageConfidence: number;
  lowConfidenceCount: number;
} {
  const tasks = Array.from(reviewTasks.values());

  const total = tasks.length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const approved = tasks.filter(t => t.status === 'approved').length;
  const rejected = tasks.filter(t => t.status === 'rejected').length;
  const modified = tasks.filter(t => t.status === 'modified').length;

  const confidenceSum = tasks.reduce((sum, t) => sum + t.specs.confidence.overall, 0);
  const averageConfidence = total > 0 ? confidenceSum / total : 0;

  const lowConfidenceCount = tasks.filter(t => t.specs.confidence.level === 'low').length;

  return {
    total,
    pending,
    approved,
    rejected,
    modified,
    averageConfidence: Math.round(averageConfidence * 100) / 100,
    lowConfidenceCount,
  };
}

/**
 * 抽出統計を取得
 * Get extraction statistics
 */
export function getExtractionStatistics(): {
  total: number;
  averageConfidence: number;
  averageProcessingTime: number;
  pendingReview: number;
  autoApproved: number;
} {
  const logs = Array.from(extractionLogs.values());

  const total = logs.length;
  const confidenceSum = logs.reduce((sum, l) => sum + l.confidence, 0);
  const averageConfidence = total > 0 ? confidenceSum / total : 0;

  const timeLogs = logs.filter(l => l.processingTime !== undefined);
  const timeSum = timeLogs.reduce((sum, l) => sum + (l.processingTime || 0), 0);
  const averageProcessingTime = timeLogs.length > 0 ? timeSum / timeLogs.length : 0;

  const pendingReview = logs.filter(l => l.status === 'pending_review').length;
  const autoApproved = logs.filter(l => l.status === 'approved').length;

  return {
    total,
    averageConfidence: Math.round(averageConfidence * 100) / 100,
    averageProcessingTime: Math.round(averageProcessingTime),
    pendingReview,
    autoApproved,
  };
}

// ============================================================
// Batch Operations
// ============================================================

/**
 * 複数の抽出に対してレビュータスクを作成
 * Create review tasks for multiple extractions
 */
export function batchCreateReviews(
  specsList: ProductSpecifications[],
  threshold: number = 0.8,
  createdBy: string = 'system'
): ReviewTask[] {
  const tasks: ReviewTask[] = [];

  for (const specs of specsList) {
    const task = createReviewForLowConfidence(specs, threshold, createdBy);
    if (task) {
      tasks.push(task);
    }
  }

  return tasks;
}

/**
 * 保留中のレビュータスクを一括処理
 * Batch process pending review tasks
 */
export function batchProcessPendingReviews(
  decision: ReviewDecision,
  reviewer: string,
  comments?: string
): ReviewTask[] {
  const pendingTasks = getReviewTasks('pending');
  const processed: ReviewTask[] = [];

  for (const task of pendingTasks) {
    try {
      const processedTask = processReviewDecision(
        task.id,
        decision,
        reviewer,
        undefined,
        comments
      );
      processed.push(processedTask);
    } catch (error) {
      console.error(`Failed to process task ${task.id}:`, error);
    }
  }

  return processed;
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * タスクIDを生成
 * Generate a unique task ID
 */
function generateTaskId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * ログIDを生成
 * Generate a unique log ID
 */
function generateLogId(): string {
  return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 信頼度をパーセンテージでフォーマット
 * Format confidence as percentage
 */
function formatConfidence(score: number): string {
  return `${Math.round(score * 100)}%`;
}

// ============================================================
// Cleanup Functions (for testing/management)
// ============================================================

/**
 * すべてのデータをクリア
 * Clear all data (use with caution)
 */
export function clearAllData(): void {
  reviewTasks.clear();
  reviewLogs.clear();
  extractionLogs.clear();
}

/**
 * 古いデータを削除
 * Delete old data older than specified days
 */
export function deleteOldData(daysOld: number = 30): void {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  // Delete old review tasks
  for (const [id, task] of reviewTasks.entries()) {
    if (task.updatedAt < cutoffDate && task.status !== 'pending') {
      reviewTasks.delete(id);
    }
  }

  // Delete old logs
  for (const [id, log] of reviewLogs.entries()) {
    if (log.timestamp < cutoffDate) {
      reviewLogs.delete(id);
    }
  }

  for (const [id, log] of extractionLogs.entries()) {
    if (log.timestamp < cutoffDate) {
      extractionLogs.delete(id);
    }
  }
}
