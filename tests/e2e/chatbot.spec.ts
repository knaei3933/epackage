import { test, expect } from '@playwright/test';

test.describe('ChatBot E2E Tests', () => {
  test('should open chat widget and send message', async ({ page }) => {
    await page.goto('/');

    // 同意バナーがチャットボタンの操作を妨げるため、先に閉じる。
    const rejectButton = page.getByRole('button', { name: 'すべて拒否' });
    await rejectButton.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
    if (await rejectButton.isVisible()) {
      await rejectButton.click();
    }
    
    // チャットボタンをクリック
    const chatButton = page.locator('button[aria-label="チャットを開く"]');
    await expect(chatButton).toBeVisible();
    await chatButton.click();
    
    // チャットウィンドウが表示されることを確認
    const chatWindow = page.locator('text=カスタマーサポート').first();
    await expect(chatWindow).toBeVisible();
    
    // 接続ステータスが「オンライン」であることを確認
    const statusText = page.getByTestId('connection-status');
    await expect(statusText).toHaveText('オンライン', { timeout: 5000 });
    
    // 入力フィールドにメッセージを入力
    const input = page.locator('input[placeholder="メッセージを入力..."]');
    await expect(input).toBeVisible();
    await input.fill('こんにちは');
    
    // 送信ボタンが有効になることを確認
    const sendButton = page.locator('button[aria-label="送信"]');
    await expect(sendButton).toBeEnabled();
    
    // 送信ボタンをクリック
    await sendButton.click();
    
    // AIの応答が表示されることを確認（最大30秒待機）
    const aiResponse = page.getByTestId('assistant-message').first();
    await expect(aiResponse).toBeVisible({ timeout: 30000 });

    // ページ遷移・ウィジェット再マウント後も同一タブの会話履歴を保持する。
    await page.goto('/catalog');
    await expect(chatButton).toBeVisible();
    await chatButton.click();
    await expect(page.getByTestId('assistant-message').first()).toBeVisible({
      timeout: 5000,
    });
  });
});
