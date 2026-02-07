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
  // 실전 모드: DEV_MODE 비활성화
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

export const config: TestConfig = {
  baseUrl: 'http://localhost:3002',
  screenshots: true,
  screenshotDir: './results/screenshots',

  // 실전 모드 강제 활성화
  productionMode: true,

  database: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ijlgpzjdfipzmjvawofp.supabase.co',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    // URL에서 project_ref 추출: https://ijlgpzjdfipzmjvawofp.supabase.co → ijlgpzjdfipzmjvawofp
    projectId: process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1] || 'ijlgpzjdfipzmjvawofp',
    // 또는 URL에서 자동 추출
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  },
  accounts: {
    admin: {
      email: 'admin@epackage-lab.com',
      password: 'Admin1234!'
    },
    member: {
      email: 'member@test.com',
      password: 'Member1234!'
    }
  },
  timeouts: {
    navigation: 10000,
    action: 5000,
    dbVerification: 1000
  }
};

export default config;
