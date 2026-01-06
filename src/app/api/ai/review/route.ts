/**
 * AI Specification Review API
 *
 * AI仕様書レビューAPI
 * - GET: レビュータスク一覧を取得
 * - POST: 新しいレビュータスクを作成
 * - PATCH: レビュー決定を処理
 * - DELETE: レビュータスクを削除
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ProductSpecifications, ReviewDecision } from '@/lib/ai/types';
import {
  createReviewTask,
  getReviewTask,
  getReviewTasks,
  processReviewDecision,
  addReviewComment,
  getReviewLogs,
  getReviewStatistics,
  getExtractionStatistics,
  logExtraction,
} from '@/lib/ai/reviewWorkflow';

// ============================================================
// Types
// ============================================================

interface GetReviewsQueryParams {
  status?: 'pending' | 'approved' | 'rejected' | 'modified';
}

interface CreateReviewRequestBody {
  specs: ProductSpecifications;
  createdBy?: string;
}

interface ProcessReviewRequestBody {
  decision: ReviewDecision;
  reviewer: string;
  modifiedSpecs?: ProductSpecifications;
  comments?: string;
}

interface AddCommentRequestBody {
  commenter: string;
  comment: string;
}

interface ReviewListResponseBody {
  success: boolean;
  tasks?: Array<{
    id: string;
    status: string;
    pouchType: string;
    dimensions: string;
    confidence: number;
    createdAt: string;
    reviewer?: string;
  }>;
  count?: number;
  error?: string;
}

interface ReviewTaskResponseBody {
  success: boolean;
  task?: {
    id: string;
    specs: ProductSpecifications;
    status: string;
    reviewer?: string;
    comments?: string;
    modifiedSpecs?: ProductSpecifications;
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
}

interface StatisticsResponseBody {
  success: boolean;
  reviewStats?: ReturnType<typeof getReviewStatistics>;
  extractionStats?: ReturnType<typeof getExtractionStatistics>;
  error?: string;
}

// ============================================================
// GET Handler - List Review Tasks or Get Statistics
// ============================================================

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action') || 'list'; // list, stats, logs
  const status = searchParams.get('status') as GetReviewsQueryParams['status'] | null;
  const taskId = searchParams.get('taskId');

  try {
    switch (action) {
      case 'list': {
        // Get review tasks list
        const tasks = getReviewTasks(status || undefined);

        const taskSummaries = tasks.map(task => ({
          id: task.id,
          status: task.status,
          pouchType: task.specs.pouchType,
          dimensions: `W:${task.specs.dimensions.width} H:${task.specs.dimensions.height} G:${task.specs.dimensions.gusset}`,
          confidence: task.specs.confidence.overall,
          createdAt: task.createdAt.toISOString(),
          reviewer: task.reviewer,
        }));

        return NextResponse.json({
          success: true,
          tasks: taskSummaries,
          count: taskSummaries.length,
        } as ReviewListResponseBody);
      }

      case 'task': {
        // Get specific task
        if (!taskId) {
          return NextResponse.json(
            { success: false, error: 'taskIdパラメータが必要です' },
            { status: 400 }
          );
        }

        const task = getReviewTask(taskId);
        if (!task) {
          return NextResponse.json(
            { success: false, error: 'レビュータスクが見つかりません' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          task: {
            ...task,
            createdAt: task.createdAt.toISOString(),
            updatedAt: task.updatedAt.toISOString(),
          },
        } as ReviewTaskResponseBody);
      }

      case 'logs': {
        // Get review logs
        if (!taskId) {
          return NextResponse.json(
            { success: false, error: 'taskIdパラメータが必要です' },
            { status: 400 }
          );
        }

        const logs = getReviewLogs(taskId);

        return NextResponse.json({
          success: true,
          logs: logs.map(log => ({
            ...log,
            timestamp: log.timestamp.toISOString(),
          })),
        });
      }

      case 'stats': {
        // Get statistics
        const reviewStats = getReviewStatistics();
        const extractionStats = getExtractionStatistics();

        return NextResponse.json({
          success: true,
          reviewStats,
          extractionStats,
        } as StatisticsResponseBody);
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: '無効なアクション',
            validActions: ['list', 'task', 'logs', 'stats'],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Review GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// POST Handler - Create Review Task or Add Comment
// ============================================================

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action') || 'create'; // create, comment

  try {
    switch (action) {
      case 'create': {
        // Create new review task
        const body = (await request.json()) as CreateReviewRequestBody;

        if (!body.specs) {
          return NextResponse.json(
            { success: false, error: 'specsパラメータが必要です' },
            { status: 400 }
          );
        }

        const task = createReviewTask(body.specs, body.createdBy || 'system');

        return NextResponse.json({
          success: true,
          task: {
            ...task,
            createdAt: task.createdAt.toISOString(),
            updatedAt: task.updatedAt.toISOString(),
          },
        } as ReviewTaskResponseBody);
      }

      case 'comment': {
        // Add comment to task
        const body = (await request.json()) as AddCommentRequestBody;
        const taskId = searchParams.get('taskId');

        if (!taskId) {
          return NextResponse.json(
            { success: false, error: 'taskIdパラメータが必要です' },
            { status: 400 }
          );
        }

        if (!body.commenter || !body.comment) {
          return NextResponse.json(
            { success: false, error: 'commenterとcommentパラメータが必要です' },
            { status: 400 }
          );
        }

        const updatedTask = addReviewComment(taskId, body.commenter, body.comment);

        return NextResponse.json({
          success: true,
          task: {
            ...updatedTask,
            createdAt: updatedTask.createdAt.toISOString(),
            updatedAt: updatedTask.updatedAt.toISOString(),
          },
        } as ReviewTaskResponseBody);
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: '無効なアクション',
            validActions: ['create', 'comment'],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Review POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH Handler - Process Review Decision
// ============================================================

export async function PATCH(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const taskId = searchParams.get('taskId');

  try {
    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'taskIdパラメータが必要です' },
        { status: 400 }
      );
    }

    const body = (await request.json()) as ProcessReviewRequestBody;

    if (!body.decision || !body.reviewer) {
      return NextResponse.json(
        { success: false, error: 'decisionとreviewerパラメータが必要です' },
        { status: 400 }
      );
    }

    const updatedTask = processReviewDecision(
      taskId,
      body.decision,
      body.reviewer,
      body.modifiedSpecs,
      body.comments
    );

    return NextResponse.json({
      success: true,
      task: {
        ...updatedTask,
        createdAt: updatedTask.createdAt.toISOString(),
        updatedAt: updatedTask.updatedAt.toISOString(),
      },
    } as ReviewTaskResponseBody);
  } catch (error) {
    console.error('Review PATCH error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE Handler - Delete Review Task
// ============================================================

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const taskId = searchParams.get('taskId');

  try {
    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'taskIdパラメータが必要です' },
        { status: 400 }
      );
    }

    // For now, we'll just mark as cancelled (soft delete)
    // In production, you might want actual deletion or archiving
    const task = getReviewTask(taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'レビュータスクが見つかりません' },
        { status: 404 }
      );
    }

    // Mark task as cancelled/rejected
    processReviewDecision(taskId, 'reject', 'system', undefined, 'タスクを削除しました');

    return NextResponse.json({
      success: true,
      message: 'レビュータスクを削除しました',
    });
  } catch (error) {
    console.error('Review DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
