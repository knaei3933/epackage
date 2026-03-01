import { test, expect } from '@playwright/test';

test.describe('ChatBot E2E Tests', () => {
  test('should open chat widget and send message', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // チャットボタンをクリック
    const chatButton = page.locator('button[aria-label="チャットを開く"]');
    await expect(chatButton).toBeVisible();
    await chatButton.click();
    
    // チャットウィンドウが表示されることを確認
    const chatWindow = page.locator('text=カスタマーサポート').first();
    await expect(chatWindow).toBeVisible();
    
    // 接続ステータスが「オンライン」であることを確認
    const statusText = page.locator('text=オンライン');
    await expect(statusText).toBeVisible({ timeout: 5000 });
    
    // 入力フィールドにメッセージを入力
    const input = page.locator('input[placeholder="メッセージを入力..."]');
    await expect(input).toBeVisible();
    await input.fill('こんにちは');
    
    // 送信ボタンが有効になることを確認
    const sendButton = page.locator('button[aria-label="送信"]');
    await expect(sendButton).toBeEnabled();
    
    // 送信ボタンをクリック
    await sendButton.click();
    
    // ローディングインジケーターが表示されることを確認
    const loading = page.locator('text=入力中...');
    await expect(loading).toBeVisible({ timeout: 5000 });
    
    // AIの応答が表示されることを確認（最大30秒待機）
    const aiResponse = page.locator('.bg-gray-100 >> text=/./').first();
    await expect(aiResponse).toBeVisible({ timeout: 30000 });
    
    console.log('✅ Chatbot E2E test passed!');
  });
});
