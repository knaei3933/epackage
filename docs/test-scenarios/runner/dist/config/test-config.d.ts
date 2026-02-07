/**
 * 테스트 설정
 *
 * 중요: 이 테스트 러너는 실전 환경(Production Mode)에서 동작합니다.
 * DEV_MODE, 모 데이터, 가상 인증을 사용하지 않습니다.
 */
export interface TestConfig {
    baseUrl: string;
    screenshots: boolean;
    screenshotDir: string;
    productionMode: boolean;
    database: {
        supabaseUrl: string;
        serviceKey: string;
        projectId?: string;
        anonKey?: string;
    };
    accounts: {
        admin: {
            email: string;
            password: string;
        };
        member: {
            email: string;
            password: string;
        };
    };
    timeouts: {
        navigation: number;
        action: number;
        dbVerification: number;
    };
}
export declare const config: TestConfig;
export default config;
//# sourceMappingURL=test-config.d.ts.map