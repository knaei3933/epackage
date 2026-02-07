/**
 * 테스트 러너 메인
 * 시나리오 파싱 → 실행 → 검증 → 리포팅
 */
import 'dotenv/config';
import { ParsedScenario } from './scenario-parser.js';
import { TestSummary } from './reporters/summary.js';
export interface TestRunnerOptions {
    baseDir?: string;
    outputDir?: string;
    scenarios?: string[];
    skipDatabase?: boolean;
    includeScreenshots?: boolean;
}
export interface TestRunResult {
    summary: TestSummary;
    scenarioResults: any[];
}
/**
 * 테스트 러너
 */
export declare class TestRunner {
    private executor;
    private dbVerifier;
    private markdownReporter;
    private jsonReporter;
    private options;
    constructor(options?: TestRunnerOptions);
    /**
     * 시나리오 카테고리에 따른 필요한 인증 타입 반환
     */
    private getRequiredAuthType;
    /**
     * 단일 시나리오 실행
     */
    runScenario(scenarioKey: string, scenario: ParsedScenario): Promise<any>;
    /**
     * 모든 시나리오 실행
     */
    runAll(): Promise<TestRunResult>;
    /**
     * 특정 카테고리만 실행
     */
    runCategory(category: 'homepage' | 'member' | 'admin' | 'integration'): Promise<TestRunResult>;
}
/**
 * CLI 진입점
 */
export declare function main(): Promise<void>;
export default TestRunner;
//# sourceMappingURL=index.d.ts.map