/**
 * 마크다운 리포터
 * 테스트 결과를 마크다운 형식으로 생성
 */
import { ScenarioResult } from '../playwright-executor.js';
import { DatabaseState } from '../database-verifier.js';
export interface MarkdownReportOptions {
    outputDir: string;
    includeScreenshots: boolean;
    screenshotBaseUrl?: string;
}
export declare class MarkdownReporter {
    private options;
    constructor(options: MarkdownReportOptions);
    /**
     * 시나리오 결과를 마크다운으로 변환
     */
    generateScenarioReport(result: ScenarioResult, beforeState?: DatabaseState, afterState?: DatabaseState): string;
    /**
     * 전체 테스트 결과를 마크다운으로 변환
     */
    generateSummaryReport(results: ScenarioResult[], options?: {
        title?: string;
        date?: string;
    }): string;
    /**
     * 리포트 저장
     */
    saveReport(filename: string, content: string): void;
    /**
     * 상태 배지 생성
     */
    private getStatusBadge;
    /**
     * 시간 포맷
     */
    private formatDuration;
}
export default MarkdownReporter;
//# sourceMappingURL=markdown.d.ts.map