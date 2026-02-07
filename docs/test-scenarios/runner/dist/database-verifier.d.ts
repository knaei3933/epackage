/**
 * 데이터베이스 검증기
 * 테스트 전후 데이터베이스 상태를 검증
 * Supabase 클라이언트와 REST API를 사용하여 SQL 쿼리 실행
 */
export interface DatabaseState {
    timestamp: string;
    tables: {
        quotations?: number;
        orders?: number;
        contracts?: number;
        users?: number;
        notifications?: number;
        samples?: number;
    };
    details?: Record<string, any>;
}
export interface VerificationQuery {
    name: string;
    query: string;
    expected?: any;
    actual?: any;
    passed?: boolean;
}
export declare class DatabaseVerifier {
    private client;
    private projectId;
    private supabaseUrl;
    private serviceKey;
    private beforeState;
    constructor();
    /**
     * Supabase URL에서 project_ref 추출
     */
    private extractProjectId;
    /**
     * 테스트 전 상태 기록
     */
    captureBeforeState(): Promise<DatabaseState>;
    /**
     * 테스트 후 상태 기록
     */
    captureAfterState(): Promise<DatabaseState>;
    /**
     * SQL 쿼리 실행 (Supabase REST API 사용)
     * SELECT, INSERT, UPDATE, DELETE 지원
     */
    executeSql(sql: string): Promise<{
        data: any[] | null;
        error: string | null;
        rowsAffected?: number;
    }>;
    /**
     * INSERT 쿼리 실행
     */
    private executeInsertQuery;
    /**
     * UPDATE 쿼리 실행
     */
    private executeUpdateQuery;
    /**
     * DELETE 쿼리 실행
     */
    private executeDeleteQuery;
    /**
     * SELECT 쿼리 실행 (Supabase REST API 사용)
     */
    private executeSelectQuery;
    /**
     * 검증 쿼리 실행
     */
    verifyQueries(queries: VerificationQuery[]): Promise<VerificationQuery[]>;
    /**
     * SQL 쿼리를 파싱하여 Supabase 클라이언트 메서드로 변환 실행
     * 간단한 SELECT 쿼리만 지원
     */
    private tryParseAndExecuteQuery;
    /**
     * 테이블 레코드 수 확인
     */
    private countTable;
    /**
     * 예상값 검증
     */
    private verifyExpected;
    /**
     * 상태 비교
     */
    compareStates(before: DatabaseState, after: DatabaseState): Record<string, number>;
    /**
     * 특정 레코드 상세 검증
     */
    verifyRecord(tableName: string, filters: Record<string, any>): Promise<any>;
    /**
     * 최신 레코드 확인
     */
    getLatestRecord(tableName: string): Promise<any>;
    /**
     * 프로젝트 ID 반환 (MCP 사용용)
     */
    getProjectId(): string;
    /**
     * Supabase 클라이언트 반환 (직접 사용용)
     */
    getClient(): any;
}
export default DatabaseVerifier;
//# sourceMappingURL=database-verifier.d.ts.map