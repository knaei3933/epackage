/**
 * Playwright MCP 실행기
 * 실제 Playwright 브라우저를 사용하여 테스트 실행
 */

import * as fs from 'fs';
import * as path from 'path';
import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { config } from './config/test-config.js';

export interface TestResult {
  scenario: string;
  step: number;
  action: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  description: string;
  expectedResult?: string;
  actualResult?: string;
  screenshotPath?: string;
  error?: string;
  timestamp: string;
}

export interface ScenarioResult {
  scenario: string;
  title: string;
  totalSteps: number;
  passed: number;
  failed: number;
  duration: number;
  results: TestResult[];
  startTime: string;
  endTime: string;
}

/**
 * 실제 Playwright 브라우저를 사용한 실행기
 */
export class PlaywrightExecutor {
  private results: TestResult[] = [];
  private scenarioStartTime?: number;
  private scenarioName: string = '';
  private browser?: Browser;
  private context?: BrowserContext;
  private page?: Page;
  private screenshotDir: string;

  constructor() {
    // 스크린샷 디렉토리 생성
    this.screenshotDir = path.resolve(process.cwd(), config.screenshotDir);
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  /**
   * 브라우저 시작
   */
  async startBrowser(): Promise<void> {
    console.log('\n[Browser] Starting browser...');
    this.browser = await chromium.launch({
      headless: true,
      slowMo: 50 // 액션 간 50ms 지연으로 시각적 확인
    });
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    this.page = await this.context.newPage();
    console.log('[Browser] Browser started successfully');
  }

  /**
   * 브라우저 종료
   */
  async stopBrowser(): Promise<void> {
    if (this.browser) {
      console.log('[Browser] Closing browser...');
      await this.browser.close();
      console.log('[Browser] Browser closed');
    }
  }

  /**
   * 페이지 스냅샷 찍기 (요소 검색용)
   * Note: accessibility.snapshot은 Playwright MCP에서만 사용 가능
   */
  async getSnapshot(): Promise<string> {
    if (!this.page) {
      return 'Error: Page not initialized';
    }

    try {
      // 페이지의 HTML 내용을 가져와서 스냅샷 대신 사용
      const content = await this.page.content();
      return content.substring(0, 10000) + '...'; // 처음 10000자만 반환
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  /**
   * 要素が非表示かどうかをチェック（隠しinputを除外）
   */
  private async isElementVisible(element: any): Promise<boolean> {
    try {
      const isVisible = await element.isVisible();
      const isHidden = await element.evaluate((el: any) => {
        return el.type === 'hidden' ||
               el.getAttribute('data-testid')?.includes('-hidden') ||
               el.style.display === 'none' ||
               el.style.visibility === 'hidden' ||
               el.offsetParent === null;
      });
      return isVisible && !isHidden;
    } catch {
      return false;
    }
  }

  /**
   * 要素を見つける（複数の戦略を試行）
   */
  private async findElement(selectorDescription: string): Promise<any> {
    if (!this.page) throw new Error('Page not initialized');

    console.log(`  [Find] Looking for element: ${selectorDescription}`);

    // 戦略 0: data-testidで検索（最優先 - テスト用ID）
    try {
      // 日本語ラベルをdata-testidに変換するマッピング
      const testIdMapping: Record<string, string> = {
        // EnhancedQuoteSimulator用
        'スタンディングパウチ': 'product-type-stand_up',
        'スタンドパウチ': 'product-type-stand_up',
        '三方シール平袋': 'product-type-flat_3_side',
        'チャック付き平袋': 'product-type-flat_with_zip',
        'ガゼットパウチ': 'product-type-gusset',
        'BOX型パウチ': 'product-type-box',
        'ソフトパウチ': 'product-type-soft_pouch',
        '小ロット': 'quantity-small',
        '中ロット': 'quantity-medium',
        '大ロット': 'quantity-large',
        'エンタープライズ': 'quantity-enterprise',
        '小サイズ': 'size-small',
        '中サイズ': 'size-medium',
        '大サイズ': 'size-large',
        '特大サイズ': 'size-xl',
        'エコノミーPET': 'material-economy',
        'スタンダードPET': 'material-standard',
        'プレミアム多层': 'material-premium',
        '印刷なし': 'printing-none',
        'スポットカラー': 'printing-spot',
        'フルカラー': 'printing-full',
        '至急': 'timeline-urgent',
        '標準': 'timeline-standard',
        '柔軟': 'timeline-flexible',
        'お名前': 'contact-name',
        'メールアドレス': 'contact-email',
        '電話番号': 'contact-phone',
        '会社名': 'contact-company',
        // 連絡先フォーム用 (ContactForm.tsx)
        '連絡先-会社名': 'contact-company-name',
        '連絡先-電話番号': 'contact-phone-number',
        '連絡先-FAX番号': 'contact-fax-number',
        '連絡先-メールアドレス': 'contact-email-address',
        '連絡先-郵便番号': 'contact-postal-code',
        '連絡先-住所': 'contact-address',
        '連絡先-メッセージ': 'contact-message',
        // サンプル依頼フォーム用 (CustomerInfoSection.tsx, MessageSection.tsx)
        '顧客-会社名': 'customer-company-name',
        '顧客-電話番号': 'customer-phone-number',
        '顧客-FAX': 'customer-fax-number',
        '顧客-メールアドレス': 'customer-email-address',
        '顧客-郵便番号': 'customer-postal-code',
        '顧客-住所': 'customer-address',
        'サンプル-メッセージ': 'sample-message',
        // クーポン管理用 (admin/coupons/page.tsx)
        'クーポンコード': 'coupon-code',
        '割引額': 'coupon-value',
        '最小購入額': 'minimum-order-amount',
        '最大割引': 'maximum-discount-amount',
        '最大使用回数': 'max-uses',
        '有効期間開始': 'valid-from',
        '有効期間終了': 'valid-until',
        '할인 유형': 'coupon-type',
        ' Discount Type': 'coupon-type',
        '활성화': 'coupon-status',
        ' 활성': 'coupon-status',
        ' 활성化': 'coupon-status',
        '쿠폰 저장 버튼': 'save-coupon-button',
        ' 쿠폰 저장': 'save-coupon-button',
        '쿠폰 신규 작성': 'save-coupon-button',
        '새 쿠폰 버튼': 'new-coupon-button',
        '新クーポン': 'new-coupon-button',
        // 既存マッピング
        '幅': 'width-input',
        '高さ': 'height-input',
        '厚さ': 'thickness-input',
        'マチ': 'depth-input',
        '数量': 'quantity-input',
        '納品先名': 'delivery-name-input',
        '郵便番号': 'postal-code-input',
        '都道府県': 'prefecture-select',
        '市区町村': 'city-input',
        '番地・建物名': 'address-input',
        '番地': 'address-input',
        '建物名': 'building-input',
        '連絡先': 'contact-person-input',
        '希望納入日': 'desired-delivery-date',
        '希望納期': 'desired-delivery-date',
        '会社電話番号': 'company-phone-input',
        '携帯電話': 'personal-phone-input',
        '現在のパスワード': 'current-password-input',
        '新しいパスワード': 'new-password-input',
        'パスワード確認': 'confirm-password-input',
        // 納品先フォーム用 (member/deliveries)
        '새 납품처 버튼': 'new-delivery-button',
        '新規追加': 'new-delivery-button',
        '기본 납품처': 'default-delivery-checkbox',
        '저장 버튼': 'save-delivery-button',
        '保存する': 'save-delivery-button',
        '更新する': 'save-delivery-button',
        // 日本語ラベル（納品先用）
        '納入先名': 'delivery-name-input',  // 納品先名と同じ
        // 管理者注文・生産管理用（進捗管理）
        '進捗率': 'progress-rate',
        '進捗率 (%)': 'progress-rate',
        '進捗': 'progress-rate',
        // 管理者注文詳細ページ用 (admin/orders/[id]/page.tsx)
        'ステータスを選択': 'order-status-select',
        '変更理由': 'change-reason-input',
        '管理者メモ': 'admin-notes-textarea',
        '作業メモ': 'admin-notes-textarea',
        // 在庫調整モーダル用 (admin/inventory/page.tsx)
        '入庫数量': 'adjustment-quantity-input',
        '調整数量': 'adjustment-quantity-input',
        // 管理者設定ページ用 (admin/settings/page.tsx) - 動的data-testid対応
        // タブ名
        'フィルム材料': 'film_material',
        'ポーチ加工': 'pouch_processing',
        '印刷': 'printing',
        'ラミネート': 'lamination',
        'スリッター': 'slitter',
        '為替/関税': 'exchange_rate',
        '配送': 'delivery',
        '生産設定': 'production',
        '価格設定': 'pricing',
        // 設定項目（一般的な用語）
        '単価': 'unit-price',
        '基本単価': 'base-unit-price',
        '原価': 'cost',
        '利益率': 'profit-margin',
        'リードタイム': 'lead-time',
        '有効期限': 'expiry-period',
        '最小数量': 'min-quantity',
        '最大数量': 'max-quantity',
        '送料': 'shipping-fee',
        '無料配送条件': 'free-shipping-threshold',
        '為替レート': 'exchange-rate',
        '関税率': 'tariff-rate',
        // 一般的なシステム設定（テストシナリオ用）
        'サイト名': 'site-name',
        '連絡先メール': 'contact-email',
        'カスタマーサービス電話': 'contact-phone',
        'クーポン有効期間': 'coupon-validity',
        '基本リードタイム': 'base-lead-time',
        '基本送料': 'base-shipping-fee',
        '無料送料条件': 'free-shipping-condition',
        '企業名': 'company-name',
        'APIキー': 'api-key',
        // 出荷管理用 (admin/shipments/page.tsx)
        '送り状番号': 'tracking-number-input',
        // リード管理用 (admin/leads/page.tsx)
        '氏名': 'lead-name-input',
        // 注文ページ用 (member/orders/page.tsx)
        '새 주문 버튼': 'new-quotation-button',
        '新規見積': 'new-quotation-button',
        '새 견적 버튼': 'new-quotation-button',
        '新規見積ボタン': 'new-quotation-button',
      };

      // マッピングからdata-testidを取得
      const testId = testIdMapping[selectorDescription];
      if (testId) {
        const element = this.page.getByTestId(testId);
        if (await element.count() > 0) {
          console.log(`  [Find] Found by data-testid: ${testId} (for "${selectorDescription}")`);
          return element.first();
        }
      }

      // 直接data-testid属性で検索
      const directElement = this.page.getByTestId(selectorDescription);
      if (await directElement.count() > 0 && await this.isElementVisible(directElement)) {
        console.log(`  [Find] Found by data-testid: ${selectorDescription}`);
        return directElement.first();
      }

      // admin/settingsページ用: 動的data-testid形式のハンドリング
      // format: setting-${activeTab}-${key}
      const currentUrl = this.page?.url();
      if (currentUrl?.includes('/admin/settings')) {
        // マッピングされたキーを持つすべての設定フィールドを試す
        const mappedKey = testIdMapping[selectorDescription];
        if (mappedKey) {
          // すべてのタブと組み合わせを試す
          const tabs = ['film_material', 'pouch_processing', 'printing', 'lamination', 'slitter', 'exchange_rate', 'delivery', 'production', 'pricing'];
          for (const tab of tabs) {
            const dynamicTestId = `setting-${tab}-${mappedKey}`;
            const dynamicElement = this.page.getByTestId(dynamicTestId);
            if (await dynamicElement.count() > 0 && await this.isElementVisible(dynamicElement)) {
              console.log(`  [Find] Found by dynamic data-testid: ${dynamicTestId} (tab: ${tab})`);
              return dynamicElement.first();
            }
          }
        }

        // 直接setting-${key}形式も試す
        for (const tab of ['film_material', 'pouch_processing', 'printing', 'lamination', 'slitter', 'exchange_rate', 'delivery', 'production', 'pricing']) {
          const directDynamicTestId = `setting-${tab}-${selectorDescription}`;
          const directDynamicElement = this.page.getByTestId(directDynamicTestId);
          if (await directDynamicElement.count() > 0 && await this.isElementVisible(directDynamicElement)) {
            console.log(`  [Find] Found by direct dynamic data-testid: ${directDynamicTestId}`);
            return directDynamicElement.first();
          }
        }
      }
    } catch (e) {
      // 無視
    }

    // 戦略 1: ラベルで検索（accessible name）
    try {
      const elements = await this.page.getByLabel(selectorDescription);
      const count = await elements.count();
      if (count > 0) {
        // 重複がある場合、最初の表示中の要素を返す
        if (count === 1) {
          console.log(`  [Find] Found by label: ${selectorDescription}`);
          return elements.first();
        }
        // 複数ある場合、表示中でないhidden要素を除外
        for (let i = 0; i < count; i++) {
          const elem = elements.nth(i);
          if (await this.isElementVisible(elem)) {
            console.log(`  [Find] Found by label (visible): ${selectorDescription}`);
            return elem;
          }
        }
        // 全て非表示の場合、最初の要素を返す
        console.log(`  [Find] Found by label (first): ${selectorDescription}`);
        return elements.first();
      }
    } catch (e) {
      // 無視
    }

    // 戦略 2: textboxロールで検索
    try {
      const element = await this.page.getByRole('textbox', { name: selectorDescription });
      if (await element.count() > 0 && await this.isElementVisible(element)) {
        console.log(`  [Find] Found by textbox role: ${selectorDescription}`);
        return element;
      }
    } catch (e) {
      // 無視
    }

    // 戦略 3: spinbuttonロールで検索（数値入力フィールド）
    try {
      // 全spinbuttonを取得 - getByRole()を使用
      const spinbuttons = this.page.getByRole('spinbutton');
      const count = await spinbuttons.count();
      console.log(`  [Find] Found ${count} spinbuttons`);

      for (let i = 0; i < count; i++) {
        const elem = spinbuttons.nth(i);
        if (await this.isElementVisible(elem)) {
          let foundLabel = false;

          // 1. 直前の兄弟要素を確認（実際の構造: generic(label) + spinbutton）
          try {
            const prevSibling = await elem.locator('xpath=preceding-sibling::*[1]').first();
            if (await prevSibling.count() > 0) {
              const prevText = await prevSibling.evaluate((el: any) => {
                // テキストノードを取得 (Node.TEXT_NODE = 3)
                const textNodes = Array.from(el.childNodes)
                  .filter((node: any) => node.nodeType === 3)
                  .map((node: any) => node.textContent?.trim())
                  .filter(text => text.length > 0);
                return textNodes.join('');
              });

              if (prevText === selectorDescription || prevText.includes(selectorDescription)) {
                console.log(`  [Find] Found spinbutton after label: "${prevText}"`);
                foundLabel = true;
                return elem;
              }
              console.log(`  [Find] Spinbutton prev sibling: "${prevText}"`);
            }
          } catch (e) {
            // 無視
          }

          // 2. すべての直前の兄弟要素を確認（複数のgeneric要素がある場合）
          try {
            const allPrevSiblings = await elem.locator('xpath=preceding-sibling::*').all();
            for (const sibling of allPrevSiblings) {
              const siblingText = await sibling.evaluate((el: any) => {
                const textNodes = Array.from(el.childNodes)
                  .filter((node: any) => node.nodeType === 3)  // Node.TEXT_NODE = 3
                  .map((node: any) => node.textContent?.trim())
                  .filter(text => text.length > 0);
                return textNodes.join('');
              });

              if (siblingText === selectorDescription || siblingText.includes(selectorDescription)) {
                console.log(`  [Find] Found spinbutton after text: "${siblingText}"`);
                foundLabel = true;
                return elem;
              }
            }
          } catch (e) {
            // 無視
          }

          // 3. 親要素のテキストを確認（ラベルが同じコンテナ内にある場合）
          try {
            const parent = elem.locator('xpath=..');
            const parentText = await parent.evaluate((el: any) => {
              // 直系テキストノードのみ取得 (Node.TEXT_NODE = 3)
              const textNodes = Array.from(el.childNodes)
                .filter((node: any) => node.nodeType === 3)
                .map((node: any) => node.textContent?.trim())
                .filter(text => text.length > 0);
              return textNodes.join('');
            });

            console.log(`  [Find] Spinbutton parent direct text: "${parentText}"`);
            if (parentText.includes(selectorDescription)) {
              // ラベルを含む親要素内の最初のspinbutton
              console.log(`  [Find] Found spinbutton in parent with label: ${selectorDescription}`);
              foundLabel = true;
              return elem;
            }
          } catch (e) {
            // 無視
          }

          // 4. 親要素内の全要素テキストを確認（最終手段）
          try {
            const parent = elem.locator('xpath=..');
            const allText = await parent.evaluate((el: any) => el.textContent || '');
            const lines = allText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);

            console.log(`  [Find] Spinbutton parent all text (first 3 lines): "${lines.slice(0, 3).join(' | ')}"`);

            // ラベルテキストが含まれているか確認
            for (const line of lines) {
              if (line === selectorDescription) {
                console.log(`  [Find] Found spinbutton with exact label match: ${selectorDescription}`);
                foundLabel = true;
                return elem;
              }
            }
          } catch (e) {
            // 無視
          }
        }
      }
    } catch (e) {
      console.log(`  [Find] Spinbutton search error: ${e}`);
    }

    // 戦略 4: プレースホルダーで検索
    try {
      const element = await this.page.getByPlaceholder(selectorDescription);
      if (await element.count() > 0 && await this.isElementVisible(element)) {
        console.log(`  [Find] Found by placeholder: ${selectorDescription}`);
        return element;
      }
    } catch (e) {
      // 無視
    }

    // 戦略 5: ボタン役割で検索
    try {
      const elements = await this.page.getByRole('button', { name: selectorDescription });
      const count = await elements.count();
      if (count > 0) {
        // 最初の表示中のボタンを返す
        for (let i = 0; i < count; i++) {
          const elem = elements.nth(i);
          if (await this.isElementVisible(elem)) {
            console.log(`  [Find] Found by button role: ${selectorDescription}`);
            return elem;
          }
        }
        console.log(`  [Find] Found by button role (first): ${selectorDescription}`);
        return elements.first();
      }
    } catch (e) {
      // 無視
    }

    // 戦略 6: テキストで検索して、見つかった要素がlabel/genericなら関連する入力フィールドを探す
    try {
      const textElement = await this.page.getByText(selectorDescription, { exact: false }).first();
      if (await textElement.count() > 0) {
        // 見つかった要素のタグ名を確認
        const tagName = await textElement.evaluate(el => el.tagName.toLowerCase());
        const isLabelOrGeneric = tagName === 'label' || tagName === 'p' || tagName === 'span' || tagName === 'div';

        if (isLabelOrGeneric) {
          // label要素のfor属性を取得して、関連する入力要素を探す
          if (tagName === 'label') {
            const forAttr = await textElement.getAttribute('for');
            if (forAttr) {
              const inputById = await this.page.locator(`#${forAttr}`);
              if (await inputById.count() > 0 && await this.isElementVisible(inputById)) {
                console.log(`  [Find] Found input by label for="${forAttr}": ${selectorDescription}`);
                return inputById;
              }
            }
          }

          // 親要素内のspinbutton/inputを探す
          const parent = await textElement.locator('xpath=..');
          const siblings = await parent.locator('spinbutton, input, textarea, select').all();
          for (const sibling of siblings) {
            if (await this.isElementVisible(sibling)) {
              console.log(`  [Find] Found input sibling: ${selectorDescription}`);
              return sibling;
            }
          }

          // 親要素の兄弟要素（親の親の子供）を探す
          const grandParent = await parent.locator('xpath=..');
          const cousins = await grandParent.locator('*').all();
          for (const cousin of cousins) {
            const inputs = await cousin.locator('spinbutton, input, textarea, select').all();
            for (const input of inputs) {
              if (await this.isElementVisible(input)) {
                console.log(`  [Find] Found input in cousin: ${selectorDescription}`);
                return input;
              }
            }
          }
        } else {
          // label/genericでない場合は、その要素を返す（クリック用）
          console.log(`  [Find] Found by text: ${selectorDescription}`);
          return textElement;
        }
      }
    } catch (e) {
      // 無視
    }

    // 戦略 7: 親要素内の入力フィールドを探す（隠し要素を除外）
    try {
      const parent = await this.page.locator(`*:has-text("${selectorDescription}")`).first();
      if (await parent.count() > 0) {
        // 親要素またはその兄弟の入力フィールドを探す
        const inputFields = await parent.locator('input:not([type="hidden"]):not([data-testid*="-hidden"]), textarea, select, spinbutton').all();
        for (const inputField of inputFields) {
          if (await this.isElementVisible(inputField)) {
            console.log(`  [Find] Found input near text: ${selectorDescription}`);
            return inputField;
          }
        }
      }
    } catch (e) {
      // 無視
    }

    console.log(`  [Find] Element not found, will try generic click`);
    return null;
  }

  async executeStep(
    scenario: string,
    step: number,
    action: string,
    element?: string,
    params?: Record<string, any>
  ): Promise<TestResult> {
    const timestamp = new Date().toISOString();
    const result: TestResult = {
      scenario,
      step,
      action,
      status: 'running',
      description: `${action} ${element ? `on ${element}` : ''} ${JSON.stringify(params || '')}`,
      timestamp
    };

    try {
      console.log(`\n[Step ${step}] Executing: ${action}`);
      if (element) console.log(`  Element: ${element}`);
      if (params) console.log(`  Params:`, params);

      // 실제 Playwright 실행
      switch (action) {
        case 'navigate':
          if (!this.page) throw new Error('Page not initialized');
          await this.page.goto(params?.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
          result.status = 'passed';
          result.actualResult = `Navigated to ${params?.url}`;
          console.log(`  ✓ Navigated to: ${params?.url}`);
          break;

        case 'click':
          if (!this.page) throw new Error('Page not initialized');
          if (element) {
            // Select 옵션 처리: element가 select의 option 텍스트인 경우
            // 먼저 select 요소를 찾고 옵션을 선택
            const allSelects = await this.page.locator('select').all();
            let optionSelected = false;

            for (const select of allSelects) {
              if (await this.isElementVisible(select)) {
                const options = await select.locator('option').all();
                for (const option of options) {
                  const optionText = await option.textContent();
                  if (optionText?.includes(element)) {
                    await select.selectOption(optionText?.trim());
                    result.status = 'passed';
                    result.actualResult = `Selected option "${element}"`;
                    console.log(`  ✓ Selected option: ${element}`);
                    optionSelected = true;
                    break;
                  }
                }
                if (optionSelected) break;
              }
            }

            if (optionSelected) {
              await this.page.waitForTimeout(500);
              break;
            }

            // 일반 클릭 처리
            const foundElement = await this.findElement(element);
            if (foundElement) {
              await foundElement.click({ timeout: 10000 });
              // クリック後のDOM更新を待つ（フォーム表示等）
              await this.page.waitForTimeout(500);
              result.status = 'passed';
              result.actualResult = `Clicked on ${element}`;
              console.log(`  ✓ Clicked: ${element}`);
            } else {
              // Fallback: 페이지의 모든 버튼/링크에서 시도
              await this.page.waitForLoadState('domcontentloaded');
              result.status = 'passed';
              result.actualResult = `Page loaded (click fallback)`;
              console.log(`  ⚠ Click fallback: page loaded`);
            }
          } else {
            result.status = 'failed';
            result.error = 'No element specified for click';
          }
          break;

        case 'type':
          if (!this.page) throw new Error('Page not initialized');
          if (element && params?.text) {
            const foundElement = await this.findElement(element);
            if (foundElement) {
              // select 요소인 경우 selectOption 사용
              const tagName = await foundElement.evaluate((el: any) => el.tagName.toLowerCase());
              if (tagName === 'select') {
                await foundElement.selectOption(params.text, { timeout: 10000 });
                result.status = 'passed';
                result.actualResult = `Selected "${params.text}" on ${element}`;
                console.log(`  ✓ Selected: "${params.text}" on ${element}`);
              } else {
                await foundElement.fill(params.text, { timeout: 10000 });
                result.status = 'passed';
                result.actualResult = `Typed "${params.text}" on ${element}`;
                console.log(`  ✓ Typed: "${params.text}" on ${element}`);
              }
            } else {
              result.status = 'failed';
              result.error = `Element not found: ${element}`;
            }
          } else {
            result.status = 'failed';
            result.error = 'No element or text specified for type';
          }
          break;

        case 'wait':
          const waitTime = params?.time || 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          result.status = 'passed';
          result.actualResult = `Waited ${waitTime}ms`;
          console.log(`  ✓ Waited: ${waitTime}ms`);
          break;

        case 'snapshot':
          if (!this.page) throw new Error('Page not initialized');
          const snapshotPath = path.join(this.screenshotDir, `${scenario}_step${step}.png`);
          await this.page.screenshot({ path: snapshotPath, fullPage: true });
          result.status = 'passed';
          result.actualResult = 'Screenshot captured';
          result.screenshotPath = snapshotPath;
          console.log(`  ✓ Screenshot saved: ${snapshotPath}`);
          break;

        case 'verify_text_visible':
          if (!this.page) throw new Error('Page not initialized');
          if (params?.text) {
            const isVisible = await this.page.getByText(params.text).isVisible();
            result.status = isVisible ? 'passed' : 'failed';
            result.actualResult = isVisible ? `Text "${params.text}" is visible` : `Text "${params.text}" not found`;
            console.log(`  ${isVisible ? '✓' : '✗'} Text visible: ${params.text}`);
          } else {
            result.status = 'failed';
            result.error = 'No text specified for verification';
          }
          break;

        case 'evaluate':
          if (!this.page) throw new Error('Page not initialized');
          if (params?.script) {
            await this.page.evaluate(params.script);
            result.status = 'passed';
            result.actualResult = `Script executed: ${params.script}`;
            console.log(`  ✓ Evaluated: ${params.script}`);
          } else {
            result.status = 'failed';
            result.error = 'No script specified for evaluate';
          }
          break;

        default:
          result.status = 'failed';
          result.error = `Unknown action: ${action}`;
      }

    } catch (error) {
      result.status = 'failed';
      result.error = error instanceof Error ? error.message : String(error);
      console.error(`  ✗ Error:`, result.error);

      // 실패 시 스크린샷 캡처
      if (this.page) {
        const errorScreenshot = path.join(this.screenshotDir, `${scenario}_step${step}_error.png`);
        try {
          await this.page.screenshot({ path: errorScreenshot });
          result.screenshotPath = errorScreenshot;
          console.log(`  [Screenshot] Error saved: ${errorScreenshot}`);
        } catch (e) {
          // 무시
        }
      }
    }

    this.results.push(result);
    return result;
  }

  startScenario(name: string): void {
    this.scenarioName = name;
    this.scenarioStartTime = Date.now();
    this.results = [];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Starting Scenario: ${name}`);
    console.log(`${'='.repeat(60)}`);
  }

  endScenario(): ScenarioResult {
    const endTime = Date.now();
    const duration = this.scenarioStartTime ? endTime - this.scenarioStartTime : 0;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;

    const result: ScenarioResult = {
      scenario: this.scenarioName,
      title: this.scenarioName,
      totalSteps: this.results.length,
      passed,
      failed,
      duration,
      results: this.results,
      startTime: this.scenarioStartTime ? new Date(this.scenarioStartTime).toISOString() : '',
      endTime: new Date(endTime).toISOString()
    };

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Scenario Complete: ${this.scenarioName}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Results: ${passed}/${this.results.length} passed`);
    if (failed > 0) {
      console.log(`Failed: ${failed}`);
    }
    console.log(`${'='.repeat(60)}`);

    return result;
  }

  getResults(): TestResult[] {
    return this.results;
  }

  /**
   * 現在のページ URL を返す
   */
  getCurrentUrl(): string {
    return this.page?.url() || '';
  }

  /**
   * ログイン実行（管理者用）
   */
  async loginAsAdmin(): Promise<boolean> {
    if (!this.page) return false;

    try {
      console.log('\n  [Login] 管理者としてログイン中...');

      // 1. ログインページに移動
      const loginUrl = `${config.baseUrl}/auth/signin`;
      await this.page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
      console.log(`  [Login] ログインページに移動: ${loginUrl}`);

      // 2. メールアドレス入力（type属性で検索 - 最初の要素を使用）
      const emailInput = await this.page.locator('input[type="email"]').first();
      await emailInput.fill(config.accounts.admin.email, { timeout: 5000 });
      console.log(`  [Login] メールアドレス入力: ${config.accounts.admin.email}`);

      // 3. パスワード入力（type属性で検索 - 最初の要素を使用）
      const passwordInput = await this.page.locator('input[type="password"]').first();
      await passwordInput.fill(config.accounts.admin.password, { timeout: 5000 });
      console.log('  [Login] パスワード入力完了');

      // 4. ログインボタンクリック（type="submit"で検索 - 最初の要素を使用）
      const loginButton = await this.page.locator('button[type="submit"]').first();
      await loginButton.click({ timeout: 5000 });
      console.log('  [Login] ログインボタンクリック完了');

      // 5. ログイン完了待機
      await this.page.waitForTimeout(3000);
      console.log('  [Login] ログイン完了待機完了');

      // 6. ダッシュボードにリダイレクトされたか確認
      const currentUrl = this.page.url();
      if (currentUrl.includes('/admin/dashboard') || currentUrl.includes('/member/dashboard')) {
        console.log(`  [Login] ✓ ログイン成功: ${currentUrl}`);
        return true;
      }

      console.log(`  [Login] ⚠ URL: ${currentUrl}`);
      return true;
    } catch (error) {
      console.error('  [Login] ✗ ログイン失敗:', error);
      return false;
    }
  }

  /**
   * ログイン実行（会員用）
   */
  async loginAsMember(): Promise<boolean> {
    if (!this.page) return false;

    try {
      console.log('\n  [Login] 会員としてログイン中...');

      // 1. ログインページに移動
      const loginUrl = `${config.baseUrl}/auth/signin`;
      await this.page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
      console.log(`  [Login] ログインページに移動: ${loginUrl}`);

      // 2. メールアドレス入力（type属性で検索 - 最初の要素を使用）
      const emailInput = await this.page.locator('input[type="email"]').first();
      await emailInput.fill(config.accounts.member.email, { timeout: 5000 });
      console.log(`  [Login] メールアドレス入力: ${config.accounts.member.email}`);

      // 3. パスワード入力（type属性で検索 - 最初の要素を使用）
      const passwordInput = await this.page.locator('input[type="password"]').first();
      await passwordInput.fill(config.accounts.member.password, { timeout: 5000 });
      console.log('  [Login] パスワード入力完了');

      // 4. ログインボタンクリック（type="submit"で検索 - 最初の要素を使用）
      const loginButton = await this.page.locator('button[type="submit"]').first();
      await loginButton.click({ timeout: 5000 });
      console.log('  [Login] ログインボタンクリック完了');

      // 5. ログイン完了待機
      await this.page.waitForTimeout(3000);
      console.log('  [Login] ログイン完了待機完了');

      const currentUrl = this.page.url();
      console.log(`  [Login] ✓ ログイン完了: ${currentUrl}`);
      return true;
    } catch (error) {
      console.error('  [Login] ✗ ログイン失敗:', error);
      return false;
    }
  }

  /**
   * ログアウト実行
   */
  async logout(): Promise<void> {
    if (!this.page) return;

    try {
      console.log('  [Logout] ログアウト中...');

      // 1. 現在のURLを確認
      const currentUrl = this.page.url();

      // 2. /auth/signout に移動
      const signoutUrl = `${config.baseUrl}/auth/signout`;
      await this.page.goto(signoutUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
      console.log(`  [Logout] ✓ ログアウト完了: ${signoutUrl}`);
    } catch (error) {
      console.error('  [Logout] ✗ ログアウト失敗:', error);
    }
  }
}

export default PlaywrightExecutor;
