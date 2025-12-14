import { NextRequest, NextResponse } from 'next/server';

// Store active download sessions
interface DownloadSession {
  sessionId: string;
  email: string;
  startTime: number;
  totalBytes: number;
  downloadedBytes: number;
  status: 'preparing' | 'downloading' | 'completed' | 'error';
  estimatedTimeRemaining?: number;
  speed?: number; // bytes per second
}

const activeDownloads: Map<string, DownloadSession> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, email, totalBytes } = body;

    // Create new download session
    const session: DownloadSession = {
      sessionId,
      email,
      startTime: Date.now(),
      totalBytes,
      downloadedBytes: 0,
      status: 'preparing',
    };

    activeDownloads.set(sessionId, session);

    return NextResponse.json({
      success: true,
      sessionId,
      status: 'started',
    });

  } catch (error) {
    console.error('Download session creation error:', error);
    return NextResponse.json(
      { error: 'ダウンロードセッションの開始に失敗しました' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'セッションIDが必要です' },
        { status: 400 }
      );
    }

    const session = activeDownloads.get(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'ダウンロードセッションが見つかりません' },
        { status: 404 }
      );
    }

    // Calculate download progress
    const progress = session.totalBytes > 0
      ? Math.round((session.downloadedBytes / session.totalBytes) * 100)
      : 0;

    // Calculate estimated time remaining
    const elapsed = Date.now() - session.startTime;
    let estimatedTimeRemaining: number | undefined;

    if (session.downloadedBytes > 0 && elapsed > 1000) {
      const speed = session.downloadedBytes / (elapsed / 1000); // bytes per second
      session.speed = speed;
      const remainingBytes = session.totalBytes - session.downloadedBytes;
      estimatedTimeRemaining = remainingBytes / speed;
      session.estimatedTimeRemaining = estimatedTimeRemaining;
    }

    return NextResponse.json({
      sessionId,
      progress,
      downloadedBytes: session.downloadedBytes,
      totalBytes: session.totalBytes,
      status: session.status,
      speed: session.speed,
      estimatedTimeRemaining,
      elapsed,
    });

  } catch (error) {
    console.error('Download progress tracking error:', error);
    return NextResponse.json(
      { error: '進捗状況の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, downloadedBytes, status } = body;

    const session = activeDownloads.get(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'ダウンロードセッションが見つかりません' },
        { status: 404 }
      );
    }

    // Update session
    if (downloadedBytes !== undefined) {
      session.downloadedBytes = downloadedBytes;
    }

    if (status) {
      session.status = status;
    }

    return NextResponse.json({
      success: true,
      sessionId,
      updated: true,
    });

  } catch (error) {
    console.error('Download session update error:', error);
    return NextResponse.json(
      { error: 'ダウンロードセッションの更新に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (sessionId) {
      activeDownloads.delete(sessionId);
    } else {
      // Clean up completed or old sessions
      const now = Date.now();
      const timeout = 5 * 60 * 1000; // 5 minutes

      for (const [id, session] of activeDownloads.entries()) {
        const age = now - session.startTime;
        if (age > timeout || session.status === 'completed' || session.status === 'error') {
          activeDownloads.delete(id);
        }
      }
    }

    return NextResponse.json({ success: true, cleaned: true });

  } catch (error) {
    console.error('Download session cleanup error:', error);
    return NextResponse.json(
      { error: 'セッションのクリーンアップに失敗しました' },
      { status: 500 }
    );
  }
}