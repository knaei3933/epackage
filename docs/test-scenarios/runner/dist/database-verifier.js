/**
 * 데이터베이스 검증기
 * 테스트 전후 데이터베이스 상태를 검증
 * Supabase 클라이언트와 REST API를 사용하여 SQL 쿼리 실행
 */
import { createClient } from '@supabase/supabase-js';
import { config } from './config/test-config.js';
export class DatabaseVerifier {
    client;
    projectId;
    supabaseUrl;
    serviceKey;
    beforeState = { timestamp: '', tables: {} };
    constructor() {
        this.supabaseUrl = config.database.supabaseUrl;
        this.serviceKey = config.database.serviceKey;
        // URL에서 project_ref 추출: https://ijlgpzjdfipzmjvawofp.supabase.co → ijlgpzjdfipzmjvawofp
        this.projectId = config.database.projectId || this.extractProjectId(this.supabaseUrl);
        // serviceKeyがない場合は空文字列のまま（--skip-dbオプション時用）
        if (!this.serviceKey) {
            console.warn('[DatabaseVerifier] No service key provided. Database verification will be skipped.');
            this.client = null;
        }
        else {
            this.client = createClient(this.supabaseUrl, this.serviceKey);
        }
    }
    /**
     * Supabase URL에서 project_ref 추출
     */
    extractProjectId(url) {
        const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
        return match ? match[1] : '';
    }
    /**
     * 테스트 전 상태 기록
     */
    async captureBeforeState() {
        const timestamp = new Date().toISOString();
        // 각 테이블의 레코드 수 확인
        const quotationsCount = await this.countTable('quotations');
        const ordersCount = await this.countTable('orders');
        const contractsCount = await this.countTable('contracts');
        const usersCount = await this.countTable('profiles');
        const notificationsCount = await this.countTable('unified_notifications');
        const samplesCount = await this.countTable('sample_requests');
        this.beforeState = {
            timestamp,
            tables: {
                quotations: quotationsCount,
                orders: ordersCount,
                contracts: contractsCount,
                users: usersCount,
                notifications: notificationsCount,
                samples: samplesCount
            }
        };
        console.log('\n[DB] Before state captured:', this.beforeState);
        return this.beforeState;
    }
    /**
     * 테스트 후 상태 기록
     */
    async captureAfterState() {
        const timestamp = new Date().toISOString();
        const quotationsCount = await this.countTable('quotations');
        const ordersCount = await this.countTable('orders');
        const contractsCount = await this.countTable('contracts');
        const usersCount = await this.countTable('profiles');
        const notificationsCount = await this.countTable('unified_notifications');
        const samplesCount = await this.countTable('sample_requests');
        const afterState = {
            timestamp,
            tables: {
                quotations: quotationsCount,
                orders: ordersCount,
                contracts: contractsCount,
                users: usersCount,
                notifications: notificationsCount,
                samples: samplesCount
            }
        };
        console.log('[DB] After state captured:', afterState);
        return afterState;
    }
    /**
     * SQL 쿼리 실행 (Supabase REST API 사용)
     * SELECT, INSERT, UPDATE, DELETE 지원
     */
    async executeSql(sql) {
        try {
            console.log(`[DB] Executing SQL: ${sql.substring(0, 100)}...`);
            const sqlUpper = sql.trim().toUpperCase();
            // SELECT 쿼리
            if (sqlUpper.startsWith('SELECT')) {
                return await this.executeSelectQuery(sql);
            }
            // INSERT 쿼리
            if (sqlUpper.startsWith('INSERT')) {
                return await this.executeInsertQuery(sql);
            }
            // UPDATE 쿼리
            if (sqlUpper.startsWith('UPDATE')) {
                return await this.executeUpdateQuery(sql);
            }
            // DELETE 쿼리
            if (sqlUpper.startsWith('DELETE')) {
                return await this.executeDeleteQuery(sql);
            }
            // 지원하지 않는 쿼리
            return {
                data: null,
                error: `Unsupported SQL command. Supported: SELECT, INSERT, UPDATE, DELETE`
            };
        }
        catch (error) {
            return {
                data: null,
                error: error.message || String(error)
            };
        }
    }
    /**
     * INSERT 쿼리 실행
     */
    async executeInsertQuery(sql) {
        try {
            // 간단한 INSERT 쿼리 파싱
            // INSERT INTO table_name (...) VALUES (...)
            const insertMatch = sql.match(/INSERT\s+INTO\s+(\w+)\s+\(([^)]+)\)\s+VALUES\s+\(([^)]+)\)/i);
            if (insertMatch) {
                const tableName = insertMatch[1];
                const columns = insertMatch[2].split(',').map((c) => c.trim().replace(/"/g, ''));
                const values = insertMatch[3].split(',').map((v) => {
                    const trimmed = v.trim();
                    // 문자열 값 처리
                    if ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
                        (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
                        return trimmed.slice(1, -1);
                    }
                    // 함수 처리 (gen_random_uuid(), NOW() 등)
                    if (trimmed.includes('(') && trimmed.includes(')')) {
                        return null; // 함수는 나중에 처리
                    }
                    // 숫자
                    return isNaN(Number(trimmed)) ? null : Number(trimmed);
                });
                // 데이터 객체 생성
                const insertData = {};
                columns.forEach((col, index) => {
                    const value = values[index];
                    // 함수나 NULL이 아닌 값만 추가
                    if (value !== null || !['gen_random_uuid()', 'NOW()', 'now()'].includes(sql.match(/VALUES\s*\([^)]*\)/i)?.[0]?.split(',').map(s => s.trim())[index] || '')) {
                        insertData[col] = value;
                    }
                });
                const { data, error } = await this.client
                    .from(tableName)
                    .insert(insertData)
                    .select();
                if (error)
                    throw error;
                return {
                    data: data || [],
                    rowsAffected: data?.length || 0,
                    error: null
                };
            }
            // 복잡한 INSERT는 RPC로 시도
            return await this.executeSelectQuery(sql);
        }
        catch (error) {
            return {
                data: null,
                error: error.message || String(error)
            };
        }
    }
    /**
     * UPDATE 쿼리 실행
     */
    async executeUpdateQuery(sql) {
        try {
            // 간단한 UPDATE 쿼리 파싱
            // UPDATE table_name SET column1 = value1, column2 = value2 WHERE condition
            const updateMatch = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+(.+)/i);
            if (updateMatch) {
                const tableName = updateMatch[1];
                const setClause = updateMatch[2];
                const whereClause = updateMatch[3];
                // SET 절 파싱
                const setData = {};
                const setPairs = setClause.split(',').map(s => s.trim());
                setPairs.forEach(pair => {
                    const [column, value] = pair.split('=').map(s => s.trim());
                    const trimmedValue = value.replace(/'/g, '').replace(/"/g, '');
                    setData[column] = trimmedValue;
                });
                // WHERE 절 파싱 (간단한 경우만)
                let query = this.client.from(tableName).update(setData);
                const whereMatch = whereClause.match(/(\w+)\s*=\s*['"]([^'"]+)['"]/i);
                if (whereMatch) {
                    const column = whereMatch[1];
                    const value = whereMatch[2];
                    query = query.eq(column, value);
                }
                const { data, error } = await query.select();
                if (error)
                    throw error;
                return {
                    data: data || [],
                    rowsAffected: data?.length || 0,
                    error: null
                };
            }
            // 복잡한 UPDATE는 RPC로 시도
            return await this.executeSelectQuery(sql);
        }
        catch (error) {
            return {
                data: null,
                error: error.message || String(error)
            };
        }
    }
    /**
     * DELETE 쿼리 실행
     */
    async executeDeleteQuery(sql) {
        try {
            // 간단한 DELETE 쿼리 파싱
            // DELETE FROM table_name WHERE condition
            const deleteMatch = sql.match(/DELETE\s+FROM\s+(\w+)\s+WHERE\s+(.+)/i);
            if (deleteMatch) {
                const tableName = deleteMatch[1];
                const whereClause = deleteMatch[2];
                let query = this.client.from(tableName).delete();
                // WHERE 절 파싱 (간단한 경우만)
                const whereMatch = whereClause.match(/(\w+)\s*=\s*['"]([^'"]+)['"]/i);
                if (whereMatch) {
                    const column = whereMatch[1];
                    const value = whereMatch[2];
                    query = query.eq(column, value);
                }
                const { data, error } = await query.select();
                if (error)
                    throw error;
                return {
                    data: data || [],
                    rowsAffected: data?.length || 0,
                    error: null
                };
            }
            // 복잡한 DELETE는 RPC로 시도
            return await this.executeSelectQuery(sql);
        }
        catch (error) {
            return {
                data: null,
                error: error.message || String(error)
            };
        }
    }
    /**
     * SELECT 쿼리 실행 (Supabase REST API 사용)
     */
    async executeSelectQuery(sql) {
        try {
            // Supabase REST API의 rpc 엔드포인트를 사용하여 임의 SQL 실행
            // 이를 위해서는 PostgreSQL에서 sql_exec 같은 함수가 미리 정의되어야 함
            const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/execute_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.serviceKey,
                    'Authorization': `Bearer ${this.serviceKey}`
                },
                body: JSON.stringify({ query: sql })
            });
            if (!response.ok) {
                const errorText = await response.text();
                return {
                    data: null,
                    error: `HTTP ${response.status}: ${errorText}`
                };
            }
            const data = await response.json();
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: error.message || String(error)
            };
        }
    }
    /**
     * 검증 쿼리 실행
     */
    async verifyQueries(queries) {
        const results = [];
        for (const queryObj of queries) {
            try {
                console.log(`\n[DB Verifying] ${queryObj.name}`);
                // SQL 쿼리 실행 시도
                const result = await this.executeSql(queryObj.query);
                if (result.error) {
                    queryObj.passed = false;
                    queryObj.actual = result.error;
                    console.error(`  ❌ Error:`, result.error);
                    // fallback: 쿼리 파싱하여 Supabase 클라이언트 메서드로 변환 시도
                    const fallbackResult = await this.tryParseAndExecuteQuery(queryObj.query);
                    if (fallbackResult) {
                        queryObj.actual = fallbackResult;
                        queryObj.passed = this.verifyExpected(queryObj.expected, fallbackResult);
                        console.log(`  Fallback Result:`, fallbackResult);
                    }
                }
                else {
                    queryObj.actual = result.data;
                    queryObj.passed = this.verifyExpected(queryObj.expected, result.data);
                    console.log(`  Result:`, result.data);
                    console.log(`  Expected:`, queryObj.expected);
                    console.log(`  Passed: ${queryObj.passed ? '✅' : '❌'}`);
                }
                results.push(queryObj);
            }
            catch (error) {
                queryObj.passed = false;
                queryObj.actual = error instanceof Error ? error.message : String(error);
                console.error(`  ❌ Query failed:`, error);
                results.push(queryObj);
            }
        }
        return results;
    }
    /**
     * SQL 쿼리를 파싱하여 Supabase 클라이언트 메서드로 변환 실행
     * 간단한 SELECT 쿼리만 지원
     */
    async tryParseAndExecuteQuery(sql) {
        try {
            // 간단한 SELECT COUNT(*) 쿼리 처리
            const countMatch = sql.match(/SELECT\s+COUNT\(\*\)\s+FROM\s+(\w+)/i);
            if (countMatch) {
                const tableName = countMatch[1];
                const { count } = await this.client
                    .from(tableName)
                    .select('*', { count: 'exact', head: true });
                return { count };
            }
            // 간단한 SELECT * FROM table WHERE condition 처리
            const selectMatch = sql.match(/SELECT\s+\*\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i);
            if (selectMatch) {
                const tableName = selectMatch[1];
                const whereClause = selectMatch[2];
                let query = this.client.from(tableName).select('*');
                // WHERE 절 파싱 (간단한 경우만)
                if (whereClause) {
                    // 예: email = 'test@example.com'
                    const whereMatch = whereClause.match(/(\w+)\s*=\s*'([^']*)'/);
                    if (whereMatch) {
                        const column = whereMatch[1];
                        const value = whereMatch[2];
                        query = query.eq(column, value);
                    }
                }
                const { data, error } = await query;
                if (error)
                    throw error;
                return data;
            }
            return null;
        }
        catch (error) {
            console.error('[DB] Fallback query failed:', error);
            return null;
        }
    }
    /**
     * 테이블 레코드 수 확인
     */
    async countTable(tableName) {
        try {
            const { count, error } = await this.client
                .from(tableName)
                .select('*', { count: 'exact', head: true });
            if (error) {
                console.error(`[DB] Error counting ${tableName}:`, error);
                return 0;
            }
            return count || 0;
        }
        catch (error) {
            console.error(`[DB] Exception counting ${tableName}:`, error);
            return 0;
        }
    }
    /**
     * 예상값 검증
     */
    verifyExpected(expected, actual) {
        if (expected === undefined)
            return true;
        if (typeof expected === 'object' && expected !== null) {
            return JSON.stringify(expected) === JSON.stringify(actual);
        }
        return expected === actual;
    }
    /**
     * 상태 비교
     */
    compareStates(before, after) {
        const changes = {};
        for (const [table, beforeCount] of Object.entries(before.tables)) {
            const afterCount = after.tables[table];
            if (afterCount !== undefined) {
                changes[table] = afterCount - beforeCount;
            }
        }
        return changes;
    }
    /**
     * 특정 레코드 상세 검증
     */
    async verifyRecord(tableName, filters) {
        try {
            let query = this.client.from(tableName);
            for (const [key, value] of Object.entries(filters)) {
                query = query.eq(key, value);
            }
            const { data, error } = await query.select('*').single();
            if (error) {
                console.error(`[DB] Error verifying ${tableName}:`, error);
                return null;
            }
            return data;
        }
        catch (error) {
            console.error(`[DB] Exception verifying ${tableName}:`, error);
            return null;
        }
    }
    /**
     * 최신 레코드 확인
     */
    async getLatestRecord(tableName) {
        try {
            const { data, error } = await this.client
                .from(tableName)
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1);
            if (error) {
                console.error(`[DB] Error getting latest ${tableName}:`, error);
                return null;
            }
            return data && data.length > 0 ? data[0] : null;
        }
        catch (error) {
            console.error(`[DB] Exception getting latest ${tableName}:`, error);
            return null;
        }
    }
    /**
     * 프로젝트 ID 반환 (MCP 사용용)
     */
    getProjectId() {
        return this.projectId;
    }
    /**
     * Supabase 클라이언트 반환 (직접 사용용)
     */
    getClient() {
        return this.client;
    }
}
export default DatabaseVerifier;
//# sourceMappingURL=database-verifier.js.map