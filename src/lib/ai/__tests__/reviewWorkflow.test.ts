/**
 * AI Review Workflow Unit Tests
 *
 * AIレビューワークフロー単体テスト
 * Unit tests for review workflow functionality
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import type { ProductSpecifications, ReviewTask, ReviewDecision } from '../types';
import {
  createReviewTask,
  getReviewTask,
  getReviewTasks,
  processReviewDecision,
  addReviewComment,
  getReviewLogs,
  getAllReviewLogs,
  createReviewForLowConfidence,
  getReviewStatistics,
  getExtractionStatistics,
  logExtraction,
  clearAllData,
} from '../reviewWorkflow';

// ============================================================
// Test Data Helpers
// ============================================================

function createMockSpecifications(
  overrides?: Partial<ProductSpecifications>
): ProductSpecifications {
  return {
    pouchType: 'stand_pouch',
    dimensions: {
      width: 150,
      height: 200,
      gusset: 50,
      tolerance: 2,
    },
    materials: [
      { layer: 'outer', material: 'PET', thickness: 12 },
      { layer: 'middle', material: 'AL', thickness: 7 },
      { layer: 'inner', material: 'PE', thickness: 80 },
    ],
    processing: {
      sealWidth: 10,
      zipperPosition: 'top',
      zipperType: 'standard',
    },
    confidence: {
      overall: 0.85,
      breakdown: {
        pouchType: 0.9,
        dimensions: 0.85,
        materials: 0.88,
        processing: 0.82,
      },
      flags: [],
      level: 'high',
    },
    extractedAt: new Date(),
    sourceFile: 'test.ai',
    ...overrides,
  };
}

// ============================================================
// Setup and Teardown
// ============================================================

beforeEach(() => {
  // Clear all data before each test
  clearAllData();
});

afterEach(() => {
  // Clean up after each test
  clearAllData();
});

// ============================================================
// Review Task Management Tests
// ============================================================

describe('createReviewTask', () => {
  it('should create a new review task', () => {
    const specs = createMockSpecifications();
    const task = createReviewTask(specs, 'test-user');

    expect(task.id).toBeDefined();
    expect(task.specs).toEqual(specs);
    expect(task.status).toBe('pending');
    expect(task.createdAt).toBeInstanceOf(Date);
    expect(task.updatedAt).toBeInstanceOf(Date);
  });

  it('should create unique task IDs', () => {
    const specs = createMockSpecifications();
    const task1 = createReviewTask(specs);
    const task2 = createReviewTask(specs);

    expect(task1.id).not.toBe(task2.id);
  });

  it('should set default reviewer as undefined', () => {
    const specs = createMockSpecifications();
    const task = createReviewTask(specs);

    expect(task.reviewer).toBeUndefined();
  });

  it('should set default comments as undefined', () => {
    const specs = createMockSpecifications();
    const task = createReviewTask(specs);

    expect(task.comments).toBeUndefined();
  });
});

describe('getReviewTask', () => {
  it('should retrieve existing task by ID', () => {
    const specs = createMockSpecifications();
    const created = createReviewTask(specs);
    const retrieved = getReviewTask(created.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(created.id);
  });

  it('should return undefined for non-existent task', () => {
    const retrieved = getReviewTask('non-existent-id');

    expect(retrieved).toBeUndefined();
  });
});

describe('getReviewTasks', () => {
  it('should return all tasks when no filter', () => {
    const specs1 = createMockSpecifications();
    const specs2 = createMockSpecifications({ pouchType: 'flat_pouch' });

    createReviewTask(specs1);
    createReviewTask(specs2);

    const tasks = getReviewTasks();

    expect(tasks).toHaveLength(2);
  });

  it('should filter tasks by status', () => {
    const specs1 = createMockSpecifications();
    const specs2 = createMockSpecifications();

    const task1 = createReviewTask(specs1);
    const task2 = createReviewTask(specs2);

    // Mark one as approved
    processReviewDecision(task1.id, 'approve', 'reviewer1');

    const pendingTasks = getReviewTasks('pending');
    const approvedTasks = getReviewTasks('approved');

    expect(pendingTasks).toHaveLength(1);
    expect(approvedTasks).toHaveLength(1);
  });

  it('should sort tasks by creation date (newest first)', () => {
    // Create tasks with slight delay to ensure different timestamps
    const specs1 = createMockSpecifications();
    const task1 = createReviewTask(specs1);

    // Wait a bit to ensure different timestamp
    const start = Date.now();
    while (Date.now() - start < 10) {
      // Busy wait for 10ms
    }

    const specs2 = createMockSpecifications();
    const task2 = createReviewTask(specs2);

    const tasks = getReviewTasks();

    expect(tasks[0].id).toBe(task2.id); // Newest first
    expect(tasks[1].id).toBe(task1.id);
  });
});

describe('createReviewForLowConfidence', () => {
  it('should create task for low confidence extraction', () => {
    const specs = createMockSpecifications({
      confidence: {
        overall: 0.6,
        breakdown: { pouchType: 0.6, dimensions: 0.6, materials: 0.6, processing: 0.6 },
        flags: ['some warning'],
        level: 'medium',
      },
    });

    const task = createReviewForLowConfidence(specs, 0.8);

    expect(task).toBeDefined();
    expect(task?.status).toBe('pending');
  });

  it('should not create task for high confidence extraction', () => {
    const specs = createMockSpecifications({
      confidence: {
        overall: 0.9,
        breakdown: { pouchType: 0.9, dimensions: 0.9, materials: 0.9, processing: 0.9 },
        flags: [],
        level: 'high',
      },
    });

    const task = createReviewForLowConfidence(specs, 0.8);

    expect(task).toBeNull();
  });

  it('should use default threshold of 0.8', () => {
    const specs = createMockSpecifications({
      confidence: {
        overall: 0.79,
        breakdown: { pouchType: 0.79, dimensions: 0.79, materials: 0.79, processing: 0.79 },
        flags: [],
        level: 'medium',
      },
    });

    const task = createReviewForLowConfidence(specs);

    expect(task).toBeDefined(); // 0.79 < 0.8, so should create review
  });
});

// ============================================================
// Review Decision Processing Tests
// ============================================================

describe('processReviewDecision', () => {
  it('should approve a review task', () => {
    const specs = createMockSpecifications();
    const task = createReviewTask(specs);

    const updated = processReviewDecision(task.id, 'approve', 'reviewer1');

    expect(updated.status).toBe('approved');
    expect(updated.reviewer).toBe('reviewer1');
  });

  it('should reject a review task', () => {
    const specs = createMockSpecifications();
    const task = createReviewTask(specs);

    const updated = processReviewDecision(
      task.id,
      'reject',
      'reviewer1',
      undefined,
      '仕様書が不完全です'
    );

    expect(updated.status).toBe('rejected');
    expect(updated.comments).toContain('仕様書が不完全です');
  });

  it('should modify a review task', () => {
    const specs = createMockSpecifications();
    const task = createReviewTask(specs);

    const modifiedSpecs = createMockSpecifications({
      dimensions: { width: 160, height: 210, gusset: 55, tolerance: 2 },
    });

    const updated = processReviewDecision(
      task.id,
      'modify',
      'reviewer1',
      modifiedSpecs,
      '寸法を修正しました'
    );

    expect(updated.status).toBe('modified');
    expect(updated.modifiedSpecs).toEqual(modifiedSpecs);
    expect(updated.comments).toContain('寸法を修正しました');
  });

  it('should require modifiedSpecs for modify decision', () => {
    const specs = createMockSpecifications();
    const task = createReviewTask(specs);

    expect(() => {
      processReviewDecision(task.id, 'modify', 'reviewer1');
    }).toThrow('修正された仕様書が必要です');
  });

  it('should throw error for non-existent task', () => {
    expect(() => {
      processReviewDecision('non-existent-id', 'approve', 'reviewer1');
    }).toThrow('レビュータスクが見つかりません');
  });

  it('should update updatedAt timestamp', () => {
    const specs = createMockSpecifications();
    const task = createReviewTask(specs);
    const originalUpdatedAt = task.updatedAt;

    // Wait a bit to ensure different timestamp
    const start = Date.now();
    while (Date.now() - start < 10) {
      // Busy wait
    }

    const updated = processReviewDecision(task.id, 'approve', 'reviewer1');

    expect(updated.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });
});

// ============================================================
// Review Comment Tests
// ============================================================

describe('addReviewComment', () => {
  it('should add comment to task', () => {
    const specs = createMockSpecifications();
    const task = createReviewTask(specs);

    const updated = addReviewComment(task.id, 'commenter1', 'これはテストコメントです');

    expect(updated.comments).toBeDefined();
    expect(updated.comments).toContain('commenter1');
    expect(updated.comments).toContain('これはテストコメントです');
  });

  it('should append multiple comments', () => {
    const specs = createMockSpecifications();
    const task = createReviewTask(specs);

    let updated = addReviewComment(task.id, 'commenter1', '最初のコメント');
    updated = addReviewComment(updated.id, 'commenter2', '2番目のコメント');

    expect(updated.comments).toContain('最初のコメント');
    expect(updated.comments).toContain('2番目のコメント');
  });

  it('should throw error for non-existent task', () => {
    expect(() => {
      addReviewComment('non-existent-id', 'commenter1', 'comment');
    }).toThrow('レビュータスクが見つかりません');
  });
});

// ============================================================
// Review Logging Tests
// ============================================================

describe('getReviewLogs', () => {
  it('should return logs for specific task', () => {
    const specs = createMockSpecifications();
    const task = createReviewTask(specs);

    // Create some actions that generate logs
    processReviewDecision(task.id, 'approve', 'reviewer1');

    const logs = getReviewLogs(task.id);

    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].taskId).toBe(task.id);
  });

  it('should return empty array for task with no logs', () => {
    const logs = getReviewLogs('non-existent-task');

    expect(logs).toEqual([]);
  });

  it('should sort logs by timestamp', () => {
    const specs = createMockSpecifications();
    const task = createReviewTask(specs);

    processReviewDecision(task.id, 'approve', 'reviewer1');
    addReviewComment(task.id, 'commenter1', 'comment');

    const logs = getReviewLogs(task.id);

    // Check that logs are in chronological order
    for (let i = 1; i < logs.length; i++) {
      expect(logs[i].timestamp.getTime()).toBeGreaterThanOrEqual(logs[i - 1].timestamp.getTime());
    }
  });
});

describe('getAllReviewLogs', () => {
  it('should return all review logs', () => {
    const specs1 = createMockSpecifications();
    const specs2 = createMockSpecifications();

    const task1 = createReviewTask(specs1);
    const task2 = createReviewTask(specs2);

    processReviewDecision(task1.id, 'approve', 'reviewer1');
    processReviewDecision(task2.id, 'reject', 'reviewer2');

    const allLogs = getAllReviewLogs();

    expect(allLogs.length).toBeGreaterThan(0);
  });

  it('should sort all logs by timestamp', () => {
    const specs = createMockSpecifications();
    const task = createReviewTask(specs);

    processReviewDecision(task.id, 'approve', 'reviewer1');
    addReviewComment(task.id, 'commenter1', 'comment');

    const allLogs = getAllReviewLogs();

    for (let i = 1; i < allLogs.length; i++) {
      expect(allLogs[i].timestamp.getTime()).toBeGreaterThanOrEqual(
        allLogs[i - 1].timestamp.getTime()
      );
    }
  });
});

// ============================================================
// Extraction Logging Tests
// ============================================================

describe('logExtraction', () => {
  it('should log extraction event', () => {
    const specs = createMockSpecifications();

    const log = logExtraction('test.ai', specs.confidence, 1500);

    expect(log.id).toBeDefined();
    expect(log.sourceFile).toBe('test.ai');
    expect(log.confidence).toBe(0.85);
    expect(log.processingTime).toBe(1500);
    expect(log.status).toBe('approved'); // High confidence = auto-approved
  });

  it('should set status to pending_review for low confidence', () => {
    const specs = createMockSpecifications({
      confidence: {
        overall: 0.5,
        breakdown: { pouchType: 0.5, dimensions: 0.5, materials: 0.5, processing: 0.5 },
        flags: ['low confidence'],
        level: 'low',
      },
    });

    const log = logExtraction('test.ai', specs.confidence);

    expect(log.status).toBe('pending_review');
  });
});

// ============================================================
// Statistics Tests
// ============================================================

describe('getReviewStatistics', () => {
  it('should return zero statistics for empty state', () => {
    const stats = getReviewStatistics();

    expect(stats.total).toBe(0);
    expect(stats.pending).toBe(0);
    expect(stats.approved).toBe(0);
    expect(stats.rejected).toBe(0);
    expect(stats.modified).toBe(0);
    expect(stats.averageConfidence).toBe(0);
  });

  it('should calculate statistics correctly', () => {
    const specs1 = createMockSpecifications({
      confidence: {
        overall: 0.9,
        breakdown: { pouchType: 0.9, dimensions: 0.9, materials: 0.9, processing: 0.9 },
        flags: [],
        level: 'high',
      },
    });
    const specs2 = createMockSpecifications({
      confidence: {
        overall: 0.7,
        breakdown: { pouchType: 0.7, dimensions: 0.7, materials: 0.7, processing: 0.7 },
        flags: ['some warning'],
        level: 'medium',
      },
    });

    const task1 = createReviewTask(specs1);
    const task2 = createReviewTask(specs2);

    processReviewDecision(task1.id, 'approve', 'reviewer1');
    processReviewDecision(task2.id, 'reject', 'reviewer2');

    const stats = getReviewStatistics();

    expect(stats.total).toBe(2);
    expect(stats.approved).toBe(1);
    expect(stats.rejected).toBe(1);
    expect(stats.averageConfidence).toBe(0.8);
  });

  it('should count low confidence extractions', () => {
    const specs = createMockSpecifications({
      confidence: {
        overall: 0.4,
        breakdown: { pouchType: 0.4, dimensions: 0.4, materials: 0.4, processing: 0.4 },
        flags: ['very low'],
        level: 'low',
      },
    });

    createReviewTask(specs);

    const stats = getReviewStatistics();

    expect(stats.lowConfidenceCount).toBe(1);
  });
});

describe('getExtractionStatistics', () => {
  it('should return zero statistics for empty state', () => {
    const stats = getExtractionStatistics();

    expect(stats.total).toBe(0);
    expect(stats.averageConfidence).toBe(0);
    expect(stats.averageProcessingTime).toBe(0);
  });

  it('should calculate extraction statistics', () => {
    const specs1 = createMockSpecifications({
      confidence: {
        overall: 0.9,
        breakdown: { pouchType: 0.9, dimensions: 0.9, materials: 0.9, processing: 0.9 },
        flags: [],
        level: 'high',
      },
    });
    const specs2 = createMockSpecifications({
      confidence: {
        overall: 0.7,
        breakdown: { pouchType: 0.7, dimensions: 0.7, materials: 0.7, processing: 0.7 },
        flags: ['warning'],
        level: 'medium',
      },
    });

    logExtraction('test1.ai', specs1.confidence, 1000);
    logExtraction('test2.ai', specs2.confidence, 2000);

    const stats = getExtractionStatistics();

    expect(stats.total).toBe(2);
    expect(stats.averageConfidence).toBe(0.8);
    expect(stats.averageProcessingTime).toBe(1500);
  });

  it('should count auto-approved and pending review extractions', () => {
    const specsHigh = createMockSpecifications({
      confidence: {
        overall: 0.9,
        breakdown: { pouchType: 0.9, dimensions: 0.9, materials: 0.9, processing: 0.9 },
        flags: [],
        level: 'high',
      },
    });
    const specsLow = createMockSpecifications({
      confidence: {
        overall: 0.5,
        breakdown: { pouchType: 0.5, dimensions: 0.5, materials: 0.5, processing: 0.5 },
        flags: ['low'],
        level: 'low',
      },
    });

    logExtraction('high.ai', specsHigh.confidence);
    logExtraction('low.ai', specsLow.confidence);

    const stats = getExtractionStatistics();

    expect(stats.autoApproved).toBe(1);
    expect(stats.pendingReview).toBe(1);
  });
});

// ============================================================
// Integration Tests
// ============================================================

describe('Integration Tests', () => {
  it('should handle complete review workflow', () => {
    // 1. Extract with low confidence
    const specs = createMockSpecifications({
      confidence: {
        overall: 0.6,
        breakdown: { pouchType: 0.6, dimensions: 0.6, materials: 0.6, processing: 0.6 },
        flags: ['Low confidence'],
        level: 'medium',
      },
    });

    // 2. Log extraction
    const extractionLog = logExtraction('test.ai', specs.confidence, 1200);
    expect(extractionLog.status).toBe('pending_review');

    // 3. Create review task
    const task = createReviewForLowConfidence(specs, 0.8);
    expect(task).toBeDefined();

    // 4. Add comments
    const updatedTask = addReviewComment(task!.id, 'reviewer1', '確認が必要です');
    expect(updatedTask.comments).toBeDefined();

    // 5. Process decision
    const finalized = processReviewDecision(task!.id, 'approve', 'reviewer1', undefined, '確認完了');
    expect(finalized.status).toBe('approved');

    // 6. Check statistics
    const stats = getReviewStatistics();
    expect(stats.approved).toBe(1);

    // 7. Verify logs
    const logs = getReviewLogs(task!.id);
    expect(logs.length).toBeGreaterThan(1); // Created + Approved
  });

  it('should handle multiple concurrent reviews', () => {
    // Create multiple tasks
    const tasks = [];
    for (let i = 0; i < 5; i++) {
      const specs = createMockSpecifications();
      tasks.push(createReviewTask(specs));
    }

    expect(getReviewTasks()).toHaveLength(5);

    // Approve half, reject half
    for (let i = 0; i < 5; i++) {
      const decision: ReviewDecision = i % 2 === 0 ? 'approve' : 'reject';
      processReviewDecision(tasks[i].id, decision, `reviewer${i}`);
    }

    const stats = getReviewStatistics();
    expect(stats.approved).toBe(3); // 0, 2, 4
    expect(stats.rejected).toBe(2); // 1, 3
  });

  it('should maintain data consistency across operations', () => {
    const specs = createMockSpecifications();
    const task = createReviewTask(specs);

    // Multiple operations
    addReviewComment(task.id, 'user1', 'comment1');
    addReviewComment(task.id, 'user2', 'comment2');
    processReviewDecision(task.id, 'modify', 'reviewer1', specs, 'modified');

    // Retrieve and verify
    const retrieved = getReviewTask(task.id);
    expect(retrieved?.status).toBe('modified');
    expect(retrieved?.comments).toContain('user1');
    expect(retrieved?.comments).toContain('user2');

    // Verify logs
    const logs = getReviewLogs(task.id);
    expect(logs.length).toBeGreaterThanOrEqual(3); // Created + 2 comments + Modified
  });
});
