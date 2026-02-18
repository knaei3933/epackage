/**
 * SEO Score Indicator Component
 *
 * Score display (0-100) with checklist.
 * Shows:
 * - Overall SEO score with color-coded ring
 * - Individual checklist items with pass/fail status
 * - Detailed recommendations for improvement
 */

'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Check, AlertCircle, X, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SEOScore, SEOScoreCheck } from '@/lib/types/blog';

// ============================================================
// Types
// ============================================================

export interface SEOScoreIndicatorProps {
  title: string;
  description: string;
  content: string;
  slug?: string;
  ogImage?: string | null;
  keywords?: string[];
}

// ============================================================
// SEO Analysis Logic
// ============================================================

function calculateSEOScore(props: SEOScoreIndicatorProps): SEOScore {
  const checks: SEOScoreCheck[] = [];
  let totalScore = 0;

  // 1. Title length (50-60 chars): 20 points
  const titleLength = props.title.length;
  const titleLengthPass = titleLength >= 50 && titleLength <= 60;
  checks.push({
    id: 'title-length',
    label: 'Title Length (50-60 characters)',
    label_ja: 'タイトルの長さ (50-60文字)',
    passed: titleLengthPass,
    points: titleLengthPass ? 20 : Math.max(0, 20 - Math.abs(titleLength - 55) * 2),
    maxPoints: 20,
  });
  totalScore += checks[checks.length - 1].points;

  // 2. Description length (120-160 chars): 20 points
  const descLength = props.description.length;
  const descLengthPass = descLength >= 120 && descLength <= 160;
  checks.push({
    id: 'desc-length',
    label: 'Description Length (120-160 characters)',
    label_ja: 'メタ説明の長さ (120-160文字)',
    passed: descLengthPass,
    points: descLengthPass ? 20 : descLength > 0 ? Math.max(0, 20 - Math.abs(descLength - 140) * 2) : 0,
    maxPoints: 20,
  });
  totalScore += checks[checks.length - 1].points;

  // 3. Title contains keyword: 15 points
  const hasKeywordInTitle = props.keywords && props.keywords.length > 0
    ? props.keywords.some(kw => props.title.toLowerCase().includes(kw.toLowerCase()))
    : true; // Pass if no keywords defined
  checks.push({
    id: 'keyword-in-title',
    label: 'Keyword in Title',
    label_ja: 'タイトルにキーワードを含む',
    passed: hasKeywordInTitle,
    points: hasKeywordInTitle ? 15 : 0,
    maxPoints: 15,
  });
  totalScore += checks[checks.length - 1].points;

  // 4. First paragraph contains keyword: 15 points
  const firstParagraph = props.content.split('\n\n')[0] || '';
  const hasKeywordInFirstPara = props.keywords && props.keywords.length > 0
    ? props.keywords.some(kw => firstParagraph.toLowerCase().includes(kw.toLowerCase()))
    : true; // Pass if no keywords defined
  checks.push({
    id: 'keyword-in-intro',
    label: 'Keyword in First Paragraph',
    label_ja: '最初の段落にキーワードを含む',
    passed: hasKeywordInFirstPara,
    points: hasKeywordInFirstPara ? 15 : 0,
    maxPoints: 15,
  });
  totalScore += checks[checks.length - 1].points;

  // 5. Content length > 300 words: 10 points
  const wordCount = props.content.split(/\s+/).filter(w => w.length > 0).length;
  const contentLengthPass = wordCount >= 300;
  checks.push({
    id: 'content-length',
    label: 'Content Length (300+ words)',
    label_ja: 'コンテンツの長さ (300語以上)',
    passed: contentLengthPass,
    points: contentLengthPass ? 10 : Math.max(0, Math.floor(wordCount / 30)),
    maxPoints: 10,
  });
  totalScore += checks[checks.length - 1].points;

  // 6. OG image present: 10 points
  const hasOgImage = !!props.ogImage;
  checks.push({
    id: 'og-image',
    label: 'OG Image Set',
    label_ja: 'OGP画像が設定されている',
    passed: hasOgImage,
    points: hasOgImage ? 10 : 0,
    maxPoints: 10,
  });
  totalScore += checks[checks.length - 1].points;

  // 7. Valid slug format: 5 points
  const slugValid = !props.slug || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(props.slug);
  checks.push({
    id: 'slug-format',
    label: 'Valid URL Slug',
    label_ja: '有効なURLスラッグ',
    passed: slugValid,
    points: slugValid ? 5 : 0,
    maxPoints: 5,
  });
  totalScore += checks[checks.length - 1].points;

  // 8. Has internal links (check for markdown links): 5 points
  const hasInternalLinks = /\[([^\]]+)\]\((\/[^)]+)\)/.test(props.content);
  checks.push({
    id: 'internal-links',
    label: 'Internal Links',
    label_ja: '内部リンクを含む',
    passed: hasInternalLinks,
    points: hasInternalLinks ? 5 : 0,
    maxPoints: 5,
  });
  totalScore += checks[checks.length - 1].points;

  // Calculate color
  const score = Math.round(totalScore);
  let color: SEOScore['color'] = 'red';
  if (score >= 80) color = 'green';
  else if (score >= 50) color = 'yellow';

  return {
    score,
    color,
    checks,
  };
}

// ============================================================
// Score Ring Component
// ============================================================

interface ScoreRingProps {
  score: number;
  color: SEOScore['color'];
  size?: number;
}

function ScoreRing({ score, color, size = 120 }: ScoreRingProps) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const colorClasses = {
    red: {
      stroke: '#ef4444',
      bg: 'bg-error-500',
      text: 'text-error-600',
      ring: 'ring-error-200',
    },
    yellow: {
      stroke: '#f59e0b',
      bg: 'bg-warning-500',
      text: 'text-warning-600',
      ring: 'ring-warning-200',
    },
    green: {
      stroke: '#22c55e',
      bg: 'bg-success-500',
      text: 'text-success-600',
      ring: 'ring-success-200',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={cn('relative', colors.ring, 'rounded-full p-1')}>
      <svg width={size} height={size} viewBox="0 0 120 120" className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
        />
        {/* Progress circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {/* Score text */}
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className={cn('text-3xl font-bold', colors.text)}>
          {score}
        </span>
        <span className="text-xs text-text-tertiary">/100</span>
      </div>
    </div>
  );
}

// ============================================================
// Checklist Item Component
// ============================================================

interface ChecklistItemProps {
  check: SEOScoreCheck;
}

function ChecklistItem({ check }: ChecklistItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-md bg-bg-secondary">
      <div className={cn(
        'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center',
        check.passed ? 'bg-success-100' : 'bg-error-100'
      )}>
        {check.passed ? (
          <Check className="h-3 w-3 text-success-600" />
        ) : (
          <X className="h-3 w-3 text-error-600" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium',
          check.passed ? 'text-text-primary' : 'text-text-secondary'
        )}>
          {check.label_ja}
        </p>
        <p className="text-xs text-text-tertiary">{check.label}</p>
      </div>

      <Badge
        variant={check.passed ? 'success' : 'secondary'}
        size="sm"
      >
        {check.points}/{check.maxPoints}
      </Badge>
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export function SEOScoreIndicator(props: SEOScoreIndicatorProps) {
  const seoScore = useMemo(() => calculateSEOScore(props), [props]);

  const passedCount = seoScore.checks.filter(c => c.passed).length;
  const totalCount = seoScore.checks.length;

  // Get score level text
  const getScoreLevel = () => {
    if (seoScore.score >= 80) return { text: '優秀', color: 'text-success-600' };
    if (seoScore.score >= 50) return { text: '普通', color: 'text-warning-600' };
    return { text: '要改善', color: 'text-error-600' };
  };

  const scoreLevel = getScoreLevel();

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              SEOスコア
            </CardTitle>
            <p className="text-sm text-text-tertiary mt-1">
              検索エンジン最適化の評価
            </p>
          </div>
          <ScoreRing score={seoScore.score} color={seoScore.color} size={80} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-md">
          <div>
            <p className="text-sm font-medium text-text-primary">
              総合評価
            </p>
            <p className="text-xs text-text-tertiary">
              {passedCount}/{totalCount} 項目クリア
            </p>
          </div>
          <span className={cn('text-lg font-bold', scoreLevel.color)}>
            {scoreLevel.text}
          </span>
        </div>

        {/* Checklist */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-text-tertiary uppercase tracking-wide">
            チェックリスト
          </p>
          {seoScore.checks.map(check => (
            <ChecklistItem key={check.id} check={check} />
          ))}
        </div>

        {/* Recommendations */}
        {seoScore.score < 80 && (
          <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-warning-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning-900">改善の推奨事項:</p>
                <ul className="mt-1 space-y-1 text-warning-800">
                  {seoScore.checks
                    .filter(c => !c.passed)
                    .slice(0, 3)
                    .map(check => (
                      <li key={check.id} className="text-xs">
                        ・{check.label_ja}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
