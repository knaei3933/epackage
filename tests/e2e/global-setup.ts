import { FullConfig } from '@playwright/test';

// 本番環境とみなすドメイン（テストデータの本番DB混入を防ぐため実行をブロック）
const PRODUCTION_DOMAINS = ['package-lab.com'];

async function globalSetup(config: FullConfig) {
  console.log('Starting E2E test setup...');

  // 本番環境での E2E 実行を防止（テストデータが本番DBに残存する再発防止）
  // BASE_URL が本番ドメインを含む場合、テスト全体を中止する。
  // 参考: global-teardown.ts がクリーンアップを行わないため、本番実行すると
  //   quotations/orders にテストデータが蓄積し、正系データの表示やPDF処理に
  //   悪影響を与える。意図して本番で実行する場合は ALLOW_PRODUCTION_E2E=true を設定。
  const baseUrl = process.env.BASE_URL || config.use?.baseURL || 'http://localhost:3000';
  const isProduction = PRODUCTION_DOMAINS.some((domain) => baseUrl.includes(domain));

  if (isProduction && process.env.ALLOW_PRODUCTION_E2E !== 'true') {
    const message =
      `[E2E Guard] 本番環境 (${baseUrl}) での E2E テスト実行を検出しました。\n` +
      `テストデータが本番DBに残存するのを防ぐため、実行を中止します。\n` +
      `意図して本番で実行する場合は ALLOW_PRODUCTION_E2E=true を設定してください。`;
    console.error(message);
    throw new Error(message);
  }

  console.log(`[E2E] Base URL: ${baseUrl}`);
  console.log('E2E test setup complete');
}

export default globalSetup;
