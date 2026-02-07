/**
 * 테스트 러너 메인
 * 시나리오 파싱 → 실행 → 검증 → 리포팅
 */
import 'dotenv/config';
import { resolve } from 'path';
import { loadScenarios } from './scenario-parser.js';
import { PlaywrightExecutor } from './playwright-executor.js';
import { DatabaseVerifier } from './database-verifier.js';
import { MarkdownReporter } from './reporters/markdown.js';
import { JsonReporter } from './reporters/summary.js';
import { config } from './config/test-config.js';
/**
 * 테스트 러너
 */
export class TestRunner {
    executor;
    dbVerifier;
    markdownReporter;
    jsonReporter;
    options;
    constructor(options = {}) {
        this.options = {
            baseDir: options.baseDir || 'C:\\Users\\kanei\\claudecode\\02.Homepage_Dev\\02.epac_homepagever1.1\\docs\\test-scenarios',
            outputDir: options.outputDir || resolve(process.cwd(), 'results'),
            scenarios: options.scenarios || [],
            skipDatabase: options.skipDatabase || false,
            includeScreenshots: options.includeScreenshots !== false
        };
        console.log('[TestRunner] baseDir:', this.options.baseDir);
        this.executor = new PlaywrightExecutor();
        this.dbVerifier = new DatabaseVerifier();
        this.markdownReporter = new MarkdownReporter({
            outputDir: this.options.outputDir,
            includeScreenshots: this.options.includeScreenshots
        });
        this.jsonReporter = new JsonReporter({
            outputDir: this.options.outputDir,
            pretty: true
        });
    }
    /**
     * 시나리오 카테고리에 따른 필요한 인증 타입 반환
     */
    getRequiredAuthType(scenarioKey) {
        if (scenarioKey.startsWith('admin/')) {
            return 'admin';
        }
        else if (scenarioKey.startsWith('member/')) {
            return 'member';
        }
        return null;
    }
    /**
     * 단일 시나리오 실행
     */
    async runScenario(scenarioKey, scenario) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Running Scenario: ${scenario.title}`);
        console.log(`Category: ${scenarioKey}`);
        console.log(`${'='.repeat(60)}`);
        // 인증이 필요한 경우 로그인 수행
        const authType = this.getRequiredAuthType(scenarioKey);
        if (authType) {
            console.log(`\n[Auth] ${authType === 'admin' ? '管理者' : '会員'} 인증이 필요합니다.`);
            const loginSuccess = authType === 'admin'
                ? await this.executor.loginAsAdmin()
                : await this.executor.loginAsMember();
            if (!loginSuccess) {
                console.error(`[Auth] ログイン失敗: ${authType}`);
                // 로그인 실패 시에도 계속 진행 (테스트 결과로 실패 기록)
            }
            else {
                console.log(`[Auth] ✓ ログイン成功`);
            }
        }
        // DB 상태 기록 (Before)
        let beforeState;
        if (!this.options.skipDatabase) {
            beforeState = await this.dbVerifier.captureBeforeState();
        }
        // 시나리오 시작
        this.executor.startScenario(scenarioKey);
        // 각 단계 실행
        for (const step of scenario.steps) {
            await this.executor.executeStep(scenarioKey, step.sequence, step.action, step.element, step.params);
            // 대기 시간 추가 (액션 간)
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        // DB 검증 쿼리 실행
        if (scenario.databaseQueries.length > 0 && !this.options.skipDatabase) {
            console.log('\n[Database Verification] Running queries...');
            const queries = scenario.databaseQueries.map(query => ({
                name: 'Database Verification',
                query: query.trim()
            }));
            await this.dbVerifier.verifyQueries(queries);
        }
        // 시나리오 종료
        const scenarioResult = this.executor.endScenario();
        // DB 상태 기록 (After)
        let afterState;
        if (!this.options.skipDatabase) {
            afterState = await this.dbVerifier.captureAfterState();
            // 상태 비교
            const changes = this.dbVerifier.compareStates(beforeState, afterState);
            console.log('\n[Database Changes]:', changes);
        }
        // 개별 리포트 생성
        const markdown = this.markdownReporter.generateScenarioReport(scenarioResult, beforeState, afterState);
        const filename = `${scenarioKey.replace(/\//g, '-')}.md`;
        this.markdownReporter.saveReport(filename, markdown);
        // 인증이 필요했던 시나리오의 경우 로그아웃 수행
        if (authType) {
            console.log(`\n[Auth] ログアウト中...`);
            await this.executor.logout();
            console.log(`[Auth] ✓ ログアウト完了`);
        }
        return { scenarioResult, beforeState, afterState };
    }
    /**
     * 모든 시나리오 실행
     */
    async runAll() {
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║           EPAC Homepage Test Runner                        ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log(`\nBase Dir: ${this.options.baseDir}`);
        console.log(`Output Dir: ${this.options.outputDir}`);
        console.log(`Base URL: ${config.baseUrl}`);
        console.log(`Database Verification: ${this.options.skipDatabase ? 'Disabled' : 'Enabled'}`);
        // 시나리오 로드
        console.log('\n[1/4] Loading scenarios...');
        const allScenarios = loadScenarios(this.options.baseDir);
        // 필터링
        const scenariosToRun = this.options.scenarios.length > 0
            ? Object.entries(allScenarios).filter(([key]) => this.options.scenarios.includes(key))
            : Object.entries(allScenarios);
        console.log(`Loaded ${scenariosToRun.length} scenarios`);
        for (const [key, scenario] of scenariosToRun) {
            console.log(`  - ${key}: ${scenario.title} (${scenario.steps.length} steps)`);
        }
        // 실행
        console.log('\n[2/4] Running scenarios...');
        // 브라우저 시작
        await this.executor.startBrowser();
        const results = [];
        const startTime = Date.now();
        try {
            for (const [key, scenario] of scenariosToRun) {
                try {
                    const result = await this.runScenario(key, scenario);
                    results.push(result);
                }
                catch (error) {
                    console.error(`[ERROR] Scenario ${key} failed:`, error);
                }
            }
        }
        finally {
            // 브라우저 종료
            await this.executor.stopBrowser();
        }
        const totalDuration = Date.now() - startTime;
        // 요약 생성
        console.log('\n[3/4] Generating summary...');
        const scenarioResults = results.map(r => r.scenarioResult);
        const summary = this.jsonReporter.generateSummary(scenarioResults);
        summary.metadata.totalDuration = totalDuration;
        // JSON 리포트 저장
        this.jsonReporter.saveReport('summary.json', summary);
        this.jsonReporter.exportToCsv(scenarioResults, 'results.csv');
        this.jsonReporter.exportToJUnitXml(scenarioResults, 'junit.xml');
        // 마크다운 요약 리포트
        const summaryMarkdown = this.markdownReporter.generateSummaryReport(scenarioResults, {
            title: 'EPAC Homepage 테스트 실행 결과',
            date: new Date().toISOString()
        });
        this.markdownReporter.saveReport('SUMMARY.md', summaryMarkdown);
        // 완료
        console.log('\n[4/4] Test run complete!');
        console.log(`\nResults:`);
        console.log(`  Total Scenarios: ${summary.metadata.totalScenarios}`);
        console.log(`  Passed: ✅ ${summary.scenarios.filter(s => s.status === 'passed').length}`);
        console.log(`  Failed: ${summary.scenarios.filter(s => s.status === 'failed').length > 0 ? '❌ ' : ''}${summary.scenarios.filter(s => s.status === 'failed').length}`);
        console.log(`  Success Rate: ${summary.metadata.successRate.toFixed(1)}%`);
        console.log(`  Duration: ${(totalDuration / 1000).toFixed(1)}s`);
        console.log(`\nReports saved to: ${this.options.outputDir}`);
        return { summary, scenarioResults };
    }
    /**
     * 특정 카테고리만 실행
     */
    async runCategory(category) {
        const allScenarios = loadScenarios(this.options.baseDir);
        const categoryScenarios = Object.entries(allScenarios)
            .filter(([key]) => key.startsWith(category));
        console.log(`Running ${category} scenarios (${categoryScenarios.length} files)`);
        this.options.scenarios = categoryScenarios.map(([key]) => key);
        return this.runAll();
    }
}
/**
 * CLI 진입점
 */
export async function main() {
    const args = process.argv.slice(2);
    // 카테고리 파싱
    const category = args.find(arg => ['homepage', 'member', 'admin', 'integration'].includes(arg));
    // 특정 시나리오 파싱
    const scenarioIndex = args.indexOf('--scenario');
    const scenarios = scenarioIndex !== -1 ? args.slice(scenarioIndex + 1).filter(a => !a.startsWith('-')) : [];
    // 옵션 파싱
    const skipDb = args.includes('--skip-db');
    const noScreenshots = args.includes('--no-screenshots');
    const runner = new TestRunner({
        scenarios,
        skipDatabase: skipDb,
        includeScreenshots: !noScreenshots
    });
    if (category) {
        await runner.runCategory(category);
    }
    else {
        await runner.runAll();
    }
}
// 직접 실행 시 (Windows 경로 호환성 개선)
// tsx로 실행할 때 process.argv[1]이 undefined일 수 있음
const isDirectExecution = process.argv[1] && (process.argv[1].includes('index.ts') || process.argv[1].includes('index.js'));
if (isDirectExecution || !process.argv[1]) {
    main().catch(console.error);
}
export default TestRunner;
//# sourceMappingURL=index.js.map