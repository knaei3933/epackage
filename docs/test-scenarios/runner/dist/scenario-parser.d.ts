/**
 * 시나리오 파서
 * .md 파일에서 Playwright MCP 명령어를 파싱
 */
export interface ParsedStep {
    sequence: number;
    action: string;
    element?: string;
    params?: Record<string, any>;
    description: string;
    expectedResult?: string;
}
export interface ParsedScenario {
    title: string;
    description: string;
    category: string;
    prerequisites: string[];
    steps: ParsedStep[];
    databaseQueries: string[];
}
export interface ParsedScenarios {
    [key: string]: ParsedScenario;
}
/**
 * .md 파일 파싱
 */
export declare function parseScenarioFile(filePath: string): ParsedScenario;
/**
 * 카테고리별 시나리오 파일 로드
 */
export declare function loadScenarios(baseDir: string): ParsedScenarios;
//# sourceMappingURL=scenario-parser.d.ts.map