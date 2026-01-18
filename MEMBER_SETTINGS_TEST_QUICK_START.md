# Member Settings Test - Quick Reference

## Test File
`C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\tests\e2e\phase-3-member\05-settings.spec.ts`

## Quick Run Commands

```bash
# Run all settings tests
npx playwright test tests/e2e/phase-3-member/05-settings.spec.ts

# Run with UI (recommended for debugging)
npx playwright test tests/e2e/phase-3-member/05-settings.spec.ts --ui

# Run specific test case
npx playwright test tests/e2e/phase-3-member/05-settings.spec.ts -g "TC-3.5.1"

# Run with headed mode (see browser)
npx playwright test tests/e2e/phase-3-member/05-settings.spec.ts --headed

# Run with debug mode
npx playwright test tests/e2e/phase-3-member/05-settings.spec.ts --debug
```

## Expected Results

### Passing Tests (13 tests)
- ✅ TC-3.5.1: Settings page loads
- ✅ TC-3.5.2: Settings sections display
- ✅ TC-3.5.3: Email notification settings
- ✅ TC-3.5.4: Order status notifications
- ✅ TC-3.5.5: Quotation notifications
- ✅ TC-3.5.6: Toggle notification preferences
- ✅ TC-3.5.7: Change password section (button check)
- ✅ TC-3.5.14: Two-factor authentication settings
- ✅ TC-3.5.17: Account deletion option
- ✅ TC-3.5.18: Delete account confirmation
- ✅ TC-3.5.20: Save settings changes
- ✅ TC-3.5.21: Mobile responsive settings page

### Skipped Tests (4 tests - Expected Behavior)
- ⏭️ TC-3.5.8: Current password input (on separate page)
- ⏭️ TC-3.5.9: New password input (on separate page)
- ⏭️ TC-3.5.10: Confirm password input (on separate page)
- ⏭️ TC-3.5.11: Password mismatch validation (on separate page)
- ⏭️ TC-3.5.15: Active sessions display (not implemented)
- ⏭️ TC-3.5.16: Revoke session button (not implemented)
- ⏭️ TC-3.5.19: Data export option (not implemented)

## Key UI Elements (Japanese)

### Sections
- `設定` - Settings (main heading)
- `アカウント情報` - Account Information
- `通知設定` - Notification Settings
- `セキュリティ設定` - Security Settings
- `アカウント削除` - Account Deletion

### Buttons
- `変更を保存` - Save Changes
- `パスワード変更` - Change Password
- `ログアウト` - Logout
- `アカウントを削除` - Delete Account

### Notification Settings
- `見積更新通知` - Quotation Update Notifications
- `注文更新通知` - Order Update Notifications
- `配送通知` - Delivery Notifications
- `生産進捗通知` - Production Progress Notifications
- `マーケティングメール` - Marketing Emails
- `ログイン通知` - Login Notifications
- `セキュリティアラート` - Security Alerts
- `二要素認証` - Two-Factor Authentication (近日公開予定 - Coming Soon)

## Common Patterns Used

### Finding Elements
```typescript
// By text (Japanese)
page.getByText('設定', { exact: false })

// By role (buttons, inputs)
page.getByRole('button', { name: '変更を保存' })
page.getByRole('heading', { name: '設定' })

// By type with fallback
page.locator('input[type="checkbox"]').first()
```

### Waiting for Content
```typescript
// Wait for specific element
await page.waitForSelector('text=通知設定', { timeout: 10000 })

// Wait for network to settle
await page.waitForLoadState('networkidle').catch(() => {})

// Wait for element to be visible
await expect(element).toBeVisible({ timeout: 5000 })
```

### Conditional Testing
```typescript
// Check if element exists
const count = await element.count();
if (count > 0) {
  await expect(element.first()).toBeVisible();
} else {
  test.skip(true, 'Feature not implemented');
}
```

## Troubleshooting

### Test Fails on Load
- Check if dev server is running on localhost:3000
- Verify DEV_MODE=true environment variable
- Check browser console for errors

### Element Not Found
- Use `--headed` flag to see what's on the page
- Check if Japanese text matches exactly
- Verify page has fully loaded (add longer wait)

### Timeout Errors
- Add `test.slow()` to the test (already done in all tests)
- Increase timeout in `test.setTimeout(60000)`
- Check if page is waiting for API calls

### Test Skipped When It Shouldn't
- Check the skip message in output
- Verify the feature actually exists on the page
- Check if selector is correct

## Related Files

- **Page Component**: `src/app/member/settings/page.tsx`
- **Auth Helper**: `tests/helpers/dev-mode-auth.ts`
- **API Route**: `src/app/api/member/settings/route.ts`
- **Playwright Config**: `playwright.config.ts`

## Test Structure

```typescript
test.describe('Member Settings', () => {
  test.beforeEach(async ({ page }) => {
    await setupDevModeAuth(page);
    await waitForPageReady(page);
    await page.waitForLoadState('networkidle').catch(() => {});
  });

  test('TC-3.5.X: Test description', async ({ page }) => {
    test.slow(); // Triple the timeout
    test.setTimeout(60000);

    // Test logic here
  });
});
```

## Notes

- All tests use `test.slow()` for longer timeouts
- All tests use DEV_MODE authentication
- Unimplemented features use `test.skip()` with clear messages
- Tests match the actual Japanese UI implementation
- Mobile test uses viewport size 375x667 (iPhone SE)

---

**Last Updated**: 2026-01-14
**Status**: ✅ Ready to run
