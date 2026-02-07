/**
 * 마크다운 리포터
 * 테스트 결과를 마크다운 형식으로 생성
 */

import * as fs from 'fs';
import * as path from 'path';
import { ScenarioResult, TestResult } from '../playwright-executor.js';
import { DatabaseState } from '../database-verifier.js';

export interface MarkdownReportOptions {
  outputDir: string;
  includeScreenshots: boolean;
  screenshotBaseUrl?: string;
}

export class MarkdownReporter {
  private options: MarkdownReportOptions;

  constructor(options: MarkdownReportOptions) {
    this.options = options;

    // 출력 디렉토리 생성
    if (!fs.existsSync(options.outputDir)) {
      fs.mkdirSync(options.outputDir, { recursive: true });
    }
  }

  /**
   * 시나리오 결과를 마크다운으로 변환
   */
  generateScenarioReport(result: ScenarioResult, beforeState?: DatabaseState, afterState?: DatabaseState): string {
    const lines: string[] = [];

    // 헤더
    lines.push(`# ${result.title}`);
    lines.push('');
    lines.push(`**시나리오**: ${result.scenario}`);
    lines.push(`**시작 시간**: ${result.startTime}`);
    lines.push(`**종료 시간**: ${result.endTime}`);
    lines.push(`**소요 시간**: ${this.formatDuration(result.duration)}`);
    lines.push('');

    // 요약
    lines.push('## 요약');
    lines.push('');
    lines.push('| 항목 | 값 |');
    lines.push('|------|-----|');
    lines.push(`| 총 단계 | ${result.totalSteps} |`);
    lines.push(`| 성공 | ✅ ${result.passed} |`);
    lines.push(`| 실패 | ${result.failed > 0 ? '❌ ' : ''}${result.failed} |`);
    lines.push(`| 성공률 | ${((result.passed / result.totalSteps) * 100).toFixed(1)}% |`);
    lines.push('');

    // 데이터베이스 상태 변화
    if (beforeState && afterState) {
      lines.push('## 데이터베이스 상태 변화');
      lines.push('');
      lines.push('| 테이블 | Before | After | 변화 |');
      lines.push('|--------|--------|-------|------|');

      for (const [table, afterCount] of Object.entries(afterState.tables)) {
        const beforeCount = beforeState.tables[table as keyof typeof beforeState.tables] || 0;
        const change = afterCount - beforeCount;
        const changeStr = change > 0 ? `+${change}` : change.toString();
        lines.push(`| ${table} | ${beforeCount} | ${afterCount} | ${changeStr} |`);
      }
      lines.push('');
    }

    // 단계별 결과
    lines.push('## 단계별 결과');
    lines.push('');

    for (const step of result.results) {
      lines.push(`### 단계 ${step.step}: ${step.action}`);
      lines.push('');

      // 상태 배지
      const statusBadge = this.getStatusBadge(step.status);
      lines.push(`**상태**: ${statusBadge}`);
      lines.push(`**시간**: ${step.timestamp}`);
      lines.push('');

      if (step.description) {
        lines.push(`**설명**: ${step.description}`);
        lines.push('');
      }

      if (step.expectedResult) {
        lines.push(`**예상 결과**: ${step.expectedResult}`);
        lines.push('');
      }

      if (step.actualResult) {
        lines.push(`**실제 결과**: ${step.actualResult}`);
        lines.push('');
      }

      if (step.error) {
        lines.push(`**에러**:`);
        lines.push('```');
        lines.push(step.error);
        lines.push('```');
        lines.push('');
      }

      if (this.options.includeScreenshots && step.screenshotPath) {
        const screenshotUrl = this.options.screenshotBaseUrl
          ? `${this.options.screenshotBaseUrl}/${step.screenshotPath}`
          : step.screenshotPath;
        lines.push(`**스크린샷**:`);
        lines.push('');
        lines.push(`![Screenshot](${screenshotUrl})`);
        lines.push('');
      }

      lines.push('---');
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * 전체 테스트 결과를 마크다운으로 변환
   */
  generateSummaryReport(results: ScenarioResult[], options: {
    title?: string;
    date?: string;
  } = {}): string {
    const lines: string[] = [];

    const totalScenarios = results.length;
    const totalPassed = results.filter(r => r.failed === 0).length;
    const totalFailed = results.filter(r => r.failed > 0).length;
    const totalSteps = results.reduce((sum, r) => sum + r.totalSteps, 0);
    const totalPassedSteps = results.reduce((sum, r) => sum + r.passed, 0);
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    // 헤더
    lines.push(`# ${options.title || '테스트 실행 결과'}`);
    lines.push('');
    lines.push(`**날짜**: ${options.date || new Date().toISOString()}`);
    lines.push('');

    // 전체 요약
    lines.push('## 전체 요약');
    lines.push('');
    lines.push('| 항목 | 값 |');
    lines.push('|------|-----|');
    lines.push(`| 총 시나리오 | ${totalScenarios} |`);
    lines.push(`| 성공 시나리오 | ✅ ${totalPassed} |`);
    lines.push(`| 실패 시나리오 | ${totalFailed > 0 ? '❌ ' : ''}${totalFailed} |`);
    lines.push(`| 총 단계 | ${totalSteps} |`);
    lines.push(`| 성공 단계 | ✅ ${totalPassedSteps} |`);
    lines.push(`| 실패 단계 | ${totalSteps - totalPassedSteps} |`);
    lines.push(`| 성공률 | ${((totalPassedSteps / totalSteps) * 100).toFixed(1)}% |`);
    lines.push(`| 총 소요 시간 | ${this.formatDuration(totalDuration)} |`);
    lines.push('');

    // 시나리오별 결과
    lines.push('## 시나리오별 결과');
    lines.push('');
    lines.push('| 시나리오 | 상태 | 단계 | 성공 | 실패 | 성공률 | 소요 시간 |');
    lines.push('|----------|------|------|------|------|--------|----------|');

    for (const result of results) {
      const status = result.failed === 0 ? '✅' : '❌';
      const successRate = ((result.passed / result.totalSteps) * 100).toFixed(1);
      lines.push(`| ${result.scenario} | ${status} | ${result.totalSteps} | ${result.passed} | ${result.failed} | ${successRate}% | ${this.formatDuration(result.duration)} |`);
    }
    lines.push('');

    // 실패한 단계 목록
    const failedSteps = results.flatMap(r =>
      r.results.filter(s => s.status === 'failed').map(s => ({ scenario: r.scenario, step: s }))
    );

    if (failedSteps.length > 0) {
      lines.push('## 실패한 단계');
      lines.push('');

      for (const { scenario, step } of failedSteps) {
        lines.push(`### ${scenario} - 단계 ${step.step}`);
        lines.push('');
        lines.push(`**액션**: ${step.action}`);
        lines.push('');
        if (step.error) {
          lines.push('**에러**:');
          lines.push('```');
          lines.push(step.error);
          lines.push('```');
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  /**
   * 리포트 저장
   */
  saveReport(filename: string, content: string): void {
    const filepath = path.join(this.options.outputDir, filename);
    fs.writeFileSync(filepath, content, 'utf-8');
    console.log(`[Reporter] Report saved: ${filepath}`);
  }

  /**
   * 상태 배지 생성
   */
  private getStatusBadge(status: string): string {
    switch (status) {
      case 'passed':
        return '✅ Passed';
      case 'failed':
        return '❌ Failed';
      case 'running':
        return '🔄 Running';
      case 'pending':
        return '⏳ Pending';
      default:
        return status;
    }
  }

  /**
   * 시간 포맷
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    } else {
      const minutes = Math.floor(ms / 60000);
      const seconds = ((ms % 60000) / 1000).toFixed(1);
      return `${minutes}m ${seconds}s`;
    }
  }
}

export default MarkdownReporter;
