/**
 * JSON 요약 리포터
 * 테스트 결과를 JSON 형식으로 저장
 */
import { ScenarioResult } from '../playwright-executor.js';
export interface JsonReportOptions {
    outputDir: string;
    pretty?: boolean;
}
export interface TestSummary {
    metadata: {
        generatedAt: string;
        totalScenarios: number;
        totalSteps: number;
        totalPassed: number;
        totalFailed: number;
        successRate: number;
        totalDuration: number;
    };
    scenarios: ScenarioSummary[];
    failedSteps: FailedStepSummary[];
}
export interface ScenarioSummary {
    scenario: string;
    title: string;
    totalSteps: number;
    passed: number;
    failed: number;
    successRate: number;
    duration: number;
    startTime: string;
    endTime: string;
    status: 'passed' | 'failed';
}
export interface FailedStepSummary {
    scenario: string;
    step: number;
    action: string;
    description: string;
    error: string;
    timestamp: string;
}
export declare class JsonReporter {
    private options;
    constructor(options: JsonReportOptions);
    /**
     * 전체 테스트 요약 생성
     */
    generateSummary(results: ScenarioResult[]): TestSummary;
    /**
     * JSON 리포트 저장
     */
    saveReport(filename: string, data: any): void;
    /**
     * 결과를 CSV로 내보내기
     */
    exportToCsv(results: ScenarioResult[], filename: string): void;
    /**
     * JUnit XML 형식으로 내보내기 (CI/CD 툴 연동용)
     */
    exportToJUnitXml(results: ScenarioResult[], filename: string): void;
    /**
     * XML 이스케이프
     */
    private escapeXml;
}
export default JsonReporter;
//# sourceMappingURL=summary.d.ts.map