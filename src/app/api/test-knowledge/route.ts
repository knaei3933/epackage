import { NextRequest, NextResponse } from 'next/server';
import { getRelevantKnowledge, getKnowledgeStats } from '@/lib/ai/knowledge-base';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    const stats = getKnowledgeStats();
    const knowledge = query ? getRelevantKnowledge(query) : '';

    return NextResponse.json({
      success: true,
      stats,
      query,
      knowledgeLength: knowledge.length,
      knowledgePreview: knowledge ? knowledge.substring(0, 500) : 'No knowledge found',
      fullKnowledge: knowledge ? knowledge.substring(0, 2000) : null,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
