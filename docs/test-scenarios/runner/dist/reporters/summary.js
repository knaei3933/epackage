/**
 * JSON 요약 리포터
 * 테스트 결과를 JSON 형식으로 저장
 */
import * as fs from 'fs';
import * as path from 'path';
export class JsonReporter {
    options;
    constructor(options) {
        this.options = options;
        // 출력 디렉토리 생성
        if (!fs.existsSync(options.outputDir)) {
            fs.mkdirSync(options.outputDir, { recursive: true });
        }
    }
    /**
     * 전체 테스트 요약 생성
     */
    generateSummary(results) {
        const totalScenarios = results.length;
        const totalSteps = results.reduce((sum, r) => sum + r.totalSteps, 0);
        const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
        const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
        const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
        // 시나리오별 요약
        const scenarios = results.map(r => ({
            scenario: r.scenario,
            title: r.title,
            totalSteps: r.totalSteps,
            passed: r.passed,
            failed: r.failed,
            successRate: (r.passed / r.totalSteps) * 100,
            duration: r.duration,
            startTime: r.startTime,
            endTime: r.endTime,
            status: r.failed === 0 ? 'passed' : 'failed'
        }));
        // 실패한 단계 목록
        const failedSteps = results.flatMap(r => r.results
            .filter(s => s.status === 'failed')
            .map(s => ({
            scenario: r.scenario,
            step: s.step,
            action: s.action,
            description: s.description,
            error: s.error || 'Unknown error',
            timestamp: s.timestamp
        })));
        return {
            metadata: {
                generatedAt: new Date().toISOString(),
                totalScenarios,
                totalSteps,
                totalPassed,
                totalFailed,
                successRate: (totalPassed / totalSteps) * 100,
                totalDuration
            },
            scenarios,
            failedSteps
        };
    }
    /**
     * JSON 리포트 저장
     */
    saveReport(filename, data) {
        const filepath = path.join(this.options.outputDir, filename);
        const content = this.options.pretty !== false
            ? JSON.stringify(data, null, 2)
            : JSON.stringify(data);
        fs.writeFileSync(filepath, content, 'utf-8');
        console.log(`[Reporter] JSON report saved: ${filepath}`);
    }
    /**
     * 결과를 CSV로 내보내기
     */
    exportToCsv(results, filename) {
        const lines = [];
        // 헤더
        lines.push('Scenario,Status,Total Steps,Passed,Failed,Success Rate,Duration (ms),Start Time,End Time');
        // 데이터
        for (const result of results) {
            const status = result.failed === 0 ? 'PASSED' : 'FAILED';
            const successRate = ((result.passed / result.totalSteps) * 100).toFixed(2);
            lines.push(`"${result.scenario}",${status},${result.totalSteps},${result.passed},${result.failed},${successRate},${result.duration},"${result.startTime}","${result.endTime}"`);
        }
        const filepath = path.join(this.options.outputDir, filename);
        fs.writeFileSync(filepath, lines.join('\n'), 'utf-8');
        console.log(`[Reporter] CSV report saved: ${filepath}`);
    }
    /**
     * JUnit XML 형식으로 내보내기 (CI/CD 툴 연동용)
     */
    exportToJUnitXml(results, filename) {
        const lines = [];
        lines.push('<?xml version="1.0" encoding="UTF-8"?>');
        lines.push('<testsuites>');
        for (const result of results) {
            lines.push(`  <testsuite name="${this.escapeXml(result.scenario)}" tests="${result.totalSteps}" failures="${result.failed}" time="${result.duration / 1000}">`);
            for (const step of result.results) {
                const failure = step.status === 'failed'
                    ? `      <failure message="${this.escapeXml(step.error || 'Unknown error')}"><
![CDATA[${step.error}]]></failure>`
                    : '';
                lines.push(`    <testcase name="Step ${step.step}: ${this.escapeXml(step.action)}" time="0">`);
                if (failure) {
                    lines.push(failure);
                }
                lines.push('    </testcase>');
            }
            lines.push('  </testsuite>');
        }
        lines.push('</testsuites>');
        const filepath = path.join(this.options.outputDir, filename);
        fs.writeFileSync(filepath, lines.join('\n'), 'utf-8');
        console.log(`[Reporter] JUnit XML report saved: ${filepath}`);
    }
    /**
     * XML 이스케이프
     */
    escapeXml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}
export default JsonReporter;
//# sourceMappingURL=summary.js.map