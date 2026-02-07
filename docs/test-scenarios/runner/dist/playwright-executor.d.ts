/**
 * Playwright MCP 실행기
 * 실제 Playwright 브라우저를 사용하여 테스트 실행
 */
export interface TestResult {
    scenario: string;
    step: number;
    action: string;
    status: 'pending' | 'running' | 'passed' | 'failed';
    description: string;
    expectedResult?: string;
    actualResult?: string;
    screenshotPath?: string;
    error?: string;
    timestamp: string;
}
export interface ScenarioResult {
    scenario: string;
    title: string;
    totalSteps: number;
    passed: number;
    failed: number;
    duration: number;
    results: TestResult[];
    startTime: string;
    endTime: string;
}
/**
 * 실제 Playwright 브라우저를 사용한 실행기
 */
export declare class PlaywrightExecutor {
    private results;
    private scenarioStartTime?;
    private scenarioName;
    private browser?;
    private context?;
    private page?;
    private screenshotDir;
    constructor();
    /**
     * 브라우저 시작
     */
    startBrowser(): Promise<void>;
    /**
     * 브라우저 종료
     */
    stopBrowser(): Promise<void>;
    /**
     * 페이지 스냅샷 찍기 (요소 검색용)
     * Note: accessibility.snapshot은 Playwright MCP에서만 사용 가능
     */
    getSnapshot(): Promise<string>;
    /**
     * 要素が非表示かどうかをチェック（隠しinputを除外）
     */
    private isElementVisible;
    /**
     * 要素を見つける（複数の戦略を試行）
     */
    private findElement;
    executeStep(scenario: string, step: number, action: string, element?: string, params?: Record<string, any>): Promise<TestResult>;
    startScenario(name: string): void;
    endScenario(): ScenarioResult;
    getResults(): TestResult[];
    /**
     * 現在のページ URL を返す
     */
    getCurrentUrl(): string;
    /**
     * ログイン実行（管理者用）
     */
    loginAsAdmin(): Promise<boolean>;
    /**
     * ログイン実行（会員用）
     */
    loginAsMember(): Promise<boolean>;
    /**
     * ログアウト実行
     */
    logout(): Promise<void>;
}
export default PlaywrightExecutor;
//# sourceMappingURL=playwright-executor.d.ts.map