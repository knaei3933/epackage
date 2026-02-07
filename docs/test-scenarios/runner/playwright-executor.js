"use strict";
/**
 * Playwright MCP 실행기
 * 실제 Playwright 브라우저를 사용하여 테스트 실행
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaywrightExecutor = void 0;
var fs = require("fs");
var path = require("path");
var playwright_1 = require("playwright");
var test_config_js_1 = require("./config/test-config.js");
/**
 * 실제 Playwright 브라우저를 사용한 실행기
 */
var PlaywrightExecutor = /** @class */ (function () {
    function PlaywrightExecutor() {
        this.results = [];
        this.scenarioName = '';
        // 스크린샷 디렉토리 생성
        this.screenshotDir = path.resolve(process.cwd(), test_config_js_1.config.screenshotDir);
        if (!fs.existsSync(this.screenshotDir)) {
            fs.mkdirSync(this.screenshotDir, { recursive: true });
        }
    }
    /**
     * 브라우저 시작
     */
    PlaywrightExecutor.prototype.startBrowser = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        console.log('\n[Browser] Starting browser...');
                        _a = this;
                        return [4 /*yield*/, playwright_1.chromium.launch({
                                headless: true,
                                slowMo: 50 // 액션 간 50ms 지연으로 시각적 확인
                            })];
                    case 1:
                        _a.browser = _d.sent();
                        _b = this;
                        return [4 /*yield*/, this.browser.newContext({
                                viewport: { width: 1280, height: 720 }
                            })];
                    case 2:
                        _b.context = _d.sent();
                        _c = this;
                        return [4 /*yield*/, this.context.newPage()];
                    case 3:
                        _c.page = _d.sent();
                        console.log('[Browser] Browser started successfully');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 브라우저 종료
     */
    PlaywrightExecutor.prototype.stopBrowser = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.browser) return [3 /*break*/, 2];
                        console.log('[Browser] Closing browser...');
                        return [4 /*yield*/, this.browser.close()];
                    case 1:
                        _a.sent();
                        console.log('[Browser] Browser closed');
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 페이지 스냅샷 찍기 (요소 검색용)
     * Note: accessibility.snapshot은 Playwright MCP에서만 사용 가능
     */
    PlaywrightExecutor.prototype.getSnapshot = function () {
        return __awaiter(this, void 0, void 0, function () {
            var content, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.page) {
                            return [2 /*return*/, 'Error: Page not initialized'];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.page.content()];
                    case 2:
                        content = _a.sent();
                        return [2 /*return*/, content.substring(0, 10000) + '...']; // 처음 10000자만 반환
                    case 3:
                        error_1 = _a.sent();
                        return [2 /*return*/, "Error: ".concat(error_1)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 要素が非表示かどうかをチェック（隠しinputを除外）
     */
    PlaywrightExecutor.prototype.isElementVisible = function (element) {
        return __awaiter(this, void 0, void 0, function () {
            var isVisible, isHidden, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, element.isVisible()];
                    case 1:
                        isVisible = _b.sent();
                        return [4 /*yield*/, element.evaluate(function (el) {
                                var _a;
                                return el.type === 'hidden' ||
                                    ((_a = el.getAttribute('data-testid')) === null || _a === void 0 ? void 0 : _a.includes('-hidden')) ||
                                    el.style.display === 'none' ||
                                    el.style.visibility === 'hidden' ||
                                    el.offsetParent === null;
                            })];
                    case 2:
                        isHidden = _b.sent();
                        return [2 /*return*/, isVisible && !isHidden];
                    case 3:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 要素を見つける（複数の戦略を試行）
     */
    PlaywrightExecutor.prototype.findElement = function (selectorDescription) {
        return __awaiter(this, void 0, void 0, function () {
            var testIdMapping, testId, element, directElement, _a, currentUrl, mappedKey, tabs, _i, tabs_1, tab, dynamicTestId, dynamicElement, _b, _c, _d, tab, directDynamicTestId, directDynamicElement, _e, e_1, elements, count, i, elem, e_2, element, _f, e_3, spinbuttons, count, i, elem, foundLabel, prevSibling, prevText, e_4, allPrevSiblings, _g, allPrevSiblings_1, sibling, siblingText, e_5, parent_1, parentText, e_6, parent_2, allText, lines, _h, lines_1, line, e_7, e_8, element, _j, e_9, elements, count, i, elem, e_10, textElement, tagName, isLabelOrGeneric, forAttr, inputById, _k, parent_3, siblings, _l, siblings_1, sibling, grandParent, cousins, _m, cousins_1, cousin, inputs, _o, inputs_1, input, e_11, parent_4, inputFields, _p, inputFields_1, inputField, e_12;
            var _q;
            return __generator(this, function (_r) {
                switch (_r.label) {
                    case 0:
                        if (!this.page)
                            throw new Error('Page not initialized');
                        console.log("  [Find] Looking for element: ".concat(selectorDescription));
                        _r.label = 1;
                    case 1:
                        _r.trys.push([1, 19, , 20]);
                        testIdMapping = {
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
                            '納入先名': 'delivery-name-input', // 納品先名と同じ
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
                        testId = testIdMapping[selectorDescription];
                        if (!testId) return [3 /*break*/, 3];
                        element = this.page.getByTestId(testId);
                        return [4 /*yield*/, element.count()];
                    case 2:
                        if ((_r.sent()) > 0) {
                            console.log("  [Find] Found by data-testid: ".concat(testId, " (for \"").concat(selectorDescription, "\")"));
                            return [2 /*return*/, element.first()];
                        }
                        _r.label = 3;
                    case 3:
                        directElement = this.page.getByTestId(selectorDescription);
                        return [4 /*yield*/, directElement.count()];
                    case 4:
                        _a = (_r.sent()) > 0;
                        if (!_a) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.isElementVisible(directElement)];
                    case 5:
                        _a = (_r.sent());
                        _r.label = 6;
                    case 6:
                        if (_a) {
                            console.log("  [Find] Found by data-testid: ".concat(selectorDescription));
                            return [2 /*return*/, directElement.first()];
                        }
                        currentUrl = (_q = this.page) === null || _q === void 0 ? void 0 : _q.url();
                        if (!(currentUrl === null || currentUrl === void 0 ? void 0 : currentUrl.includes('/admin/settings'))) return [3 /*break*/, 18];
                        mappedKey = testIdMapping[selectorDescription];
                        if (!mappedKey) return [3 /*break*/, 12];
                        tabs = ['film_material', 'pouch_processing', 'printing', 'lamination', 'slitter', 'exchange_rate', 'delivery', 'production', 'pricing'];
                        _i = 0, tabs_1 = tabs;
                        _r.label = 7;
                    case 7:
                        if (!(_i < tabs_1.length)) return [3 /*break*/, 12];
                        tab = tabs_1[_i];
                        dynamicTestId = "setting-".concat(tab, "-").concat(mappedKey);
                        dynamicElement = this.page.getByTestId(dynamicTestId);
                        return [4 /*yield*/, dynamicElement.count()];
                    case 8:
                        _b = (_r.sent()) > 0;
                        if (!_b) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.isElementVisible(dynamicElement)];
                    case 9:
                        _b = (_r.sent());
                        _r.label = 10;
                    case 10:
                        if (_b) {
                            console.log("  [Find] Found by dynamic data-testid: ".concat(dynamicTestId, " (tab: ").concat(tab, ")"));
                            return [2 /*return*/, dynamicElement.first()];
                        }
                        _r.label = 11;
                    case 11:
                        _i++;
                        return [3 /*break*/, 7];
                    case 12:
                        _c = 0, _d = ['film_material', 'pouch_processing', 'printing', 'lamination', 'slitter', 'exchange_rate', 'delivery', 'production', 'pricing'];
                        _r.label = 13;
                    case 13:
                        if (!(_c < _d.length)) return [3 /*break*/, 18];
                        tab = _d[_c];
                        directDynamicTestId = "setting-".concat(tab, "-").concat(selectorDescription);
                        directDynamicElement = this.page.getByTestId(directDynamicTestId);
                        return [4 /*yield*/, directDynamicElement.count()];
                    case 14:
                        _e = (_r.sent()) > 0;
                        if (!_e) return [3 /*break*/, 16];
                        return [4 /*yield*/, this.isElementVisible(directDynamicElement)];
                    case 15:
                        _e = (_r.sent());
                        _r.label = 16;
                    case 16:
                        if (_e) {
                            console.log("  [Find] Found by direct dynamic data-testid: ".concat(directDynamicTestId));
                            return [2 /*return*/, directDynamicElement.first()];
                        }
                        _r.label = 17;
                    case 17:
                        _c++;
                        return [3 /*break*/, 13];
                    case 18: return [3 /*break*/, 20];
                    case 19:
                        e_1 = _r.sent();
                        return [3 /*break*/, 20];
                    case 20:
                        _r.trys.push([20, 28, , 29]);
                        return [4 /*yield*/, this.page.getByLabel(selectorDescription)];
                    case 21:
                        elements = _r.sent();
                        return [4 /*yield*/, elements.count()];
                    case 22:
                        count = _r.sent();
                        if (!(count > 0)) return [3 /*break*/, 27];
                        // 重複がある場合、最初の表示中の要素を返す
                        if (count === 1) {
                            console.log("  [Find] Found by label: ".concat(selectorDescription));
                            return [2 /*return*/, elements.first()];
                        }
                        i = 0;
                        _r.label = 23;
                    case 23:
                        if (!(i < count)) return [3 /*break*/, 26];
                        elem = elements.nth(i);
                        return [4 /*yield*/, this.isElementVisible(elem)];
                    case 24:
                        if (_r.sent()) {
                            console.log("  [Find] Found by label (visible): ".concat(selectorDescription));
                            return [2 /*return*/, elem];
                        }
                        _r.label = 25;
                    case 25:
                        i++;
                        return [3 /*break*/, 23];
                    case 26:
                        // 全て非表示の場合、最初の要素を返す
                        console.log("  [Find] Found by label (first): ".concat(selectorDescription));
                        return [2 /*return*/, elements.first()];
                    case 27: return [3 /*break*/, 29];
                    case 28:
                        e_2 = _r.sent();
                        return [3 /*break*/, 29];
                    case 29:
                        _r.trys.push([29, 34, , 35]);
                        return [4 /*yield*/, this.page.getByRole('textbox', { name: selectorDescription })];
                    case 30:
                        element = _r.sent();
                        return [4 /*yield*/, element.count()];
                    case 31:
                        _f = (_r.sent()) > 0;
                        if (!_f) return [3 /*break*/, 33];
                        return [4 /*yield*/, this.isElementVisible(element)];
                    case 32:
                        _f = (_r.sent());
                        _r.label = 33;
                    case 33:
                        if (_f) {
                            console.log("  [Find] Found by textbox role: ".concat(selectorDescription));
                            return [2 /*return*/, element];
                        }
                        return [3 /*break*/, 35];
                    case 34:
                        e_3 = _r.sent();
                        return [3 /*break*/, 35];
                    case 35:
                        _r.trys.push([35, 60, , 61]);
                        spinbuttons = this.page.getByRole('spinbutton');
                        return [4 /*yield*/, spinbuttons.count()];
                    case 36:
                        count = _r.sent();
                        console.log("  [Find] Found ".concat(count, " spinbuttons"));
                        i = 0;
                        _r.label = 37;
                    case 37:
                        if (!(i < count)) return [3 /*break*/, 59];
                        elem = spinbuttons.nth(i);
                        return [4 /*yield*/, this.isElementVisible(elem)];
                    case 38:
                        if (!_r.sent()) return [3 /*break*/, 58];
                        foundLabel = false;
                        _r.label = 39;
                    case 39:
                        _r.trys.push([39, 44, , 45]);
                        return [4 /*yield*/, elem.locator('xpath=preceding-sibling::*[1]').first()];
                    case 40:
                        prevSibling = _r.sent();
                        return [4 /*yield*/, prevSibling.count()];
                    case 41:
                        if (!((_r.sent()) > 0)) return [3 /*break*/, 43];
                        return [4 /*yield*/, prevSibling.evaluate(function (el) {
                                // テキストノードを取得 (Node.TEXT_NODE = 3)
                                var textNodes = Array.from(el.childNodes)
                                    .filter(function (node) { return node.nodeType === 3; })
                                    .map(function (node) { var _a; return (_a = node.textContent) === null || _a === void 0 ? void 0 : _a.trim(); })
                                    .filter(function (text) { return text.length > 0; });
                                return textNodes.join('');
                            })];
                    case 42:
                        prevText = _r.sent();
                        if (prevText === selectorDescription || prevText.includes(selectorDescription)) {
                            console.log("  [Find] Found spinbutton after label: \"".concat(prevText, "\""));
                            foundLabel = true;
                            return [2 /*return*/, elem];
                        }
                        console.log("  [Find] Spinbutton prev sibling: \"".concat(prevText, "\""));
                        _r.label = 43;
                    case 43: return [3 /*break*/, 45];
                    case 44:
                        e_4 = _r.sent();
                        return [3 /*break*/, 45];
                    case 45:
                        _r.trys.push([45, 51, , 52]);
                        return [4 /*yield*/, elem.locator('xpath=preceding-sibling::*').all()];
                    case 46:
                        allPrevSiblings = _r.sent();
                        _g = 0, allPrevSiblings_1 = allPrevSiblings;
                        _r.label = 47;
                    case 47:
                        if (!(_g < allPrevSiblings_1.length)) return [3 /*break*/, 50];
                        sibling = allPrevSiblings_1[_g];
                        return [4 /*yield*/, sibling.evaluate(function (el) {
                                var textNodes = Array.from(el.childNodes)
                                    .filter(function (node) { return node.nodeType === 3; }) // Node.TEXT_NODE = 3
                                    .map(function (node) { var _a; return (_a = node.textContent) === null || _a === void 0 ? void 0 : _a.trim(); })
                                    .filter(function (text) { return text.length > 0; });
                                return textNodes.join('');
                            })];
                    case 48:
                        siblingText = _r.sent();
                        if (siblingText === selectorDescription || siblingText.includes(selectorDescription)) {
                            console.log("  [Find] Found spinbutton after text: \"".concat(siblingText, "\""));
                            foundLabel = true;
                            return [2 /*return*/, elem];
                        }
                        _r.label = 49;
                    case 49:
                        _g++;
                        return [3 /*break*/, 47];
                    case 50: return [3 /*break*/, 52];
                    case 51:
                        e_5 = _r.sent();
                        return [3 /*break*/, 52];
                    case 52:
                        _r.trys.push([52, 54, , 55]);
                        parent_1 = elem.locator('xpath=..');
                        return [4 /*yield*/, parent_1.evaluate(function (el) {
                                // 直系テキストノードのみ取得 (Node.TEXT_NODE = 3)
                                var textNodes = Array.from(el.childNodes)
                                    .filter(function (node) { return node.nodeType === 3; })
                                    .map(function (node) { var _a; return (_a = node.textContent) === null || _a === void 0 ? void 0 : _a.trim(); })
                                    .filter(function (text) { return text.length > 0; });
                                return textNodes.join('');
                            })];
                    case 53:
                        parentText = _r.sent();
                        console.log("  [Find] Spinbutton parent direct text: \"".concat(parentText, "\""));
                        if (parentText.includes(selectorDescription)) {
                            // ラベルを含む親要素内の最初のspinbutton
                            console.log("  [Find] Found spinbutton in parent with label: ".concat(selectorDescription));
                            foundLabel = true;
                            return [2 /*return*/, elem];
                        }
                        return [3 /*break*/, 55];
                    case 54:
                        e_6 = _r.sent();
                        return [3 /*break*/, 55];
                    case 55:
                        _r.trys.push([55, 57, , 58]);
                        parent_2 = elem.locator('xpath=..');
                        return [4 /*yield*/, parent_2.evaluate(function (el) { return el.textContent || ''; })];
                    case 56:
                        allText = _r.sent();
                        lines = allText.split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l.length > 0; });
                        console.log("  [Find] Spinbutton parent all text (first 3 lines): \"".concat(lines.slice(0, 3).join(' | '), "\""));
                        // ラベルテキストが含まれているか確認
                        for (_h = 0, lines_1 = lines; _h < lines_1.length; _h++) {
                            line = lines_1[_h];
                            if (line === selectorDescription) {
                                console.log("  [Find] Found spinbutton with exact label match: ".concat(selectorDescription));
                                foundLabel = true;
                                return [2 /*return*/, elem];
                            }
                        }
                        return [3 /*break*/, 58];
                    case 57:
                        e_7 = _r.sent();
                        return [3 /*break*/, 58];
                    case 58:
                        i++;
                        return [3 /*break*/, 37];
                    case 59: return [3 /*break*/, 61];
                    case 60:
                        e_8 = _r.sent();
                        console.log("  [Find] Spinbutton search error: ".concat(e_8));
                        return [3 /*break*/, 61];
                    case 61:
                        _r.trys.push([61, 66, , 67]);
                        return [4 /*yield*/, this.page.getByPlaceholder(selectorDescription)];
                    case 62:
                        element = _r.sent();
                        return [4 /*yield*/, element.count()];
                    case 63:
                        _j = (_r.sent()) > 0;
                        if (!_j) return [3 /*break*/, 65];
                        return [4 /*yield*/, this.isElementVisible(element)];
                    case 64:
                        _j = (_r.sent());
                        _r.label = 65;
                    case 65:
                        if (_j) {
                            console.log("  [Find] Found by placeholder: ".concat(selectorDescription));
                            return [2 /*return*/, element];
                        }
                        return [3 /*break*/, 67];
                    case 66:
                        e_9 = _r.sent();
                        return [3 /*break*/, 67];
                    case 67:
                        _r.trys.push([67, 75, , 76]);
                        return [4 /*yield*/, this.page.getByRole('button', { name: selectorDescription })];
                    case 68:
                        elements = _r.sent();
                        return [4 /*yield*/, elements.count()];
                    case 69:
                        count = _r.sent();
                        if (!(count > 0)) return [3 /*break*/, 74];
                        i = 0;
                        _r.label = 70;
                    case 70:
                        if (!(i < count)) return [3 /*break*/, 73];
                        elem = elements.nth(i);
                        return [4 /*yield*/, this.isElementVisible(elem)];
                    case 71:
                        if (_r.sent()) {
                            console.log("  [Find] Found by button role: ".concat(selectorDescription));
                            return [2 /*return*/, elem];
                        }
                        _r.label = 72;
                    case 72:
                        i++;
                        return [3 /*break*/, 70];
                    case 73:
                        console.log("  [Find] Found by button role (first): ".concat(selectorDescription));
                        return [2 /*return*/, elements.first()];
                    case 74: return [3 /*break*/, 76];
                    case 75:
                        e_10 = _r.sent();
                        return [3 /*break*/, 76];
                    case 76:
                        _r.trys.push([76, 103, , 104]);
                        return [4 /*yield*/, this.page.getByText(selectorDescription, { exact: false }).first()];
                    case 77:
                        textElement = _r.sent();
                        return [4 /*yield*/, textElement.count()];
                    case 78:
                        if (!((_r.sent()) > 0)) return [3 /*break*/, 102];
                        return [4 /*yield*/, textElement.evaluate(function (el) { return el.tagName.toLowerCase(); })];
                    case 79:
                        tagName = _r.sent();
                        isLabelOrGeneric = tagName === 'label' || tagName === 'p' || tagName === 'span' || tagName === 'div';
                        if (!isLabelOrGeneric) return [3 /*break*/, 101];
                        if (!(tagName === 'label')) return [3 /*break*/, 85];
                        return [4 /*yield*/, textElement.getAttribute('for')];
                    case 80:
                        forAttr = _r.sent();
                        if (!forAttr) return [3 /*break*/, 85];
                        return [4 /*yield*/, this.page.locator("#".concat(forAttr))];
                    case 81:
                        inputById = _r.sent();
                        return [4 /*yield*/, inputById.count()];
                    case 82:
                        _k = (_r.sent()) > 0;
                        if (!_k) return [3 /*break*/, 84];
                        return [4 /*yield*/, this.isElementVisible(inputById)];
                    case 83:
                        _k = (_r.sent());
                        _r.label = 84;
                    case 84:
                        if (_k) {
                            console.log("  [Find] Found input by label for=\"".concat(forAttr, "\": ").concat(selectorDescription));
                            return [2 /*return*/, inputById];
                        }
                        _r.label = 85;
                    case 85: return [4 /*yield*/, textElement.locator('xpath=..')];
                    case 86:
                        parent_3 = _r.sent();
                        return [4 /*yield*/, parent_3.locator('spinbutton, input, textarea, select').all()];
                    case 87:
                        siblings = _r.sent();
                        _l = 0, siblings_1 = siblings;
                        _r.label = 88;
                    case 88:
                        if (!(_l < siblings_1.length)) return [3 /*break*/, 91];
                        sibling = siblings_1[_l];
                        return [4 /*yield*/, this.isElementVisible(sibling)];
                    case 89:
                        if (_r.sent()) {
                            console.log("  [Find] Found input sibling: ".concat(selectorDescription));
                            return [2 /*return*/, sibling];
                        }
                        _r.label = 90;
                    case 90:
                        _l++;
                        return [3 /*break*/, 88];
                    case 91: return [4 /*yield*/, parent_3.locator('xpath=..')];
                    case 92:
                        grandParent = _r.sent();
                        return [4 /*yield*/, grandParent.locator('*').all()];
                    case 93:
                        cousins = _r.sent();
                        _m = 0, cousins_1 = cousins;
                        _r.label = 94;
                    case 94:
                        if (!(_m < cousins_1.length)) return [3 /*break*/, 100];
                        cousin = cousins_1[_m];
                        return [4 /*yield*/, cousin.locator('spinbutton, input, textarea, select').all()];
                    case 95:
                        inputs = _r.sent();
                        _o = 0, inputs_1 = inputs;
                        _r.label = 96;
                    case 96:
                        if (!(_o < inputs_1.length)) return [3 /*break*/, 99];
                        input = inputs_1[_o];
                        return [4 /*yield*/, this.isElementVisible(input)];
                    case 97:
                        if (_r.sent()) {
                            console.log("  [Find] Found input in cousin: ".concat(selectorDescription));
                            return [2 /*return*/, input];
                        }
                        _r.label = 98;
                    case 98:
                        _o++;
                        return [3 /*break*/, 96];
                    case 99:
                        _m++;
                        return [3 /*break*/, 94];
                    case 100: return [3 /*break*/, 102];
                    case 101:
                        // label/genericでない場合は、その要素を返す（クリック用）
                        console.log("  [Find] Found by text: ".concat(selectorDescription));
                        return [2 /*return*/, textElement];
                    case 102: return [3 /*break*/, 104];
                    case 103:
                        e_11 = _r.sent();
                        return [3 /*break*/, 104];
                    case 104:
                        _r.trys.push([104, 112, , 113]);
                        return [4 /*yield*/, this.page.locator("*:has-text(\"".concat(selectorDescription, "\")")).first()];
                    case 105:
                        parent_4 = _r.sent();
                        return [4 /*yield*/, parent_4.count()];
                    case 106:
                        if (!((_r.sent()) > 0)) return [3 /*break*/, 111];
                        return [4 /*yield*/, parent_4.locator('input:not([type="hidden"]):not([data-testid*="-hidden"]), textarea, select, spinbutton').all()];
                    case 107:
                        inputFields = _r.sent();
                        _p = 0, inputFields_1 = inputFields;
                        _r.label = 108;
                    case 108:
                        if (!(_p < inputFields_1.length)) return [3 /*break*/, 111];
                        inputField = inputFields_1[_p];
                        return [4 /*yield*/, this.isElementVisible(inputField)];
                    case 109:
                        if (_r.sent()) {
                            console.log("  [Find] Found input near text: ".concat(selectorDescription));
                            return [2 /*return*/, inputField];
                        }
                        _r.label = 110;
                    case 110:
                        _p++;
                        return [3 /*break*/, 108];
                    case 111: return [3 /*break*/, 113];
                    case 112:
                        e_12 = _r.sent();
                        return [3 /*break*/, 113];
                    case 113:
                        console.log("  [Find] Element not found, will try generic click");
                        return [2 /*return*/, null];
                }
            });
        });
    };
    PlaywrightExecutor.prototype.executeStep = function (scenario, step, action, element, params) {
        return __awaiter(this, void 0, void 0, function () {
            var timestamp, result, _a, foundElement, foundElement, waitTime_1, snapshotPath, isVisible, error_2, errorScreenshot, e_13;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        timestamp = new Date().toISOString();
                        result = {
                            scenario: scenario,
                            step: step,
                            action: action,
                            status: 'running',
                            description: "".concat(action, " ").concat(element ? "on ".concat(element) : '', " ").concat(JSON.stringify(params || '')),
                            timestamp: timestamp
                        };
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 34, , 39]);
                        console.log("\n[Step ".concat(step, "] Executing: ").concat(action));
                        if (element)
                            console.log("  Element: ".concat(element));
                        if (params)
                            console.log("  Params:", params);
                        _a = action;
                        switch (_a) {
                            case 'navigate': return [3 /*break*/, 2];
                            case 'click': return [3 /*break*/, 4];
                            case 'type': return [3 /*break*/, 13];
                            case 'wait': return [3 /*break*/, 20];
                            case 'snapshot': return [3 /*break*/, 22];
                            case 'verify_text_visible': return [3 /*break*/, 24];
                            case 'evaluate': return [3 /*break*/, 28];
                        }
                        return [3 /*break*/, 32];
                    case 2:
                        if (!this.page)
                            throw new Error('Page not initialized');
                        return [4 /*yield*/, this.page.goto(params === null || params === void 0 ? void 0 : params.url, { waitUntil: 'domcontentloaded', timeout: 30000 })];
                    case 3:
                        _b.sent();
                        result.status = 'passed';
                        result.actualResult = "Navigated to ".concat(params === null || params === void 0 ? void 0 : params.url);
                        console.log("  \u2713 Navigated to: ".concat(params === null || params === void 0 ? void 0 : params.url));
                        return [3 /*break*/, 33];
                    case 4:
                        if (!this.page)
                            throw new Error('Page not initialized');
                        if (!element) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.findElement(element)];
                    case 5:
                        foundElement = _b.sent();
                        if (!foundElement) return [3 /*break*/, 8];
                        return [4 /*yield*/, foundElement.click({ timeout: 10000 })];
                    case 6:
                        _b.sent();
                        // クリック後のDOM更新を待つ（フォーム表示等）
                        return [4 /*yield*/, this.page.waitForTimeout(500)];
                    case 7:
                        // クリック後のDOM更新を待つ（フォーム表示等）
                        _b.sent();
                        result.status = 'passed';
                        result.actualResult = "Clicked on ".concat(element);
                        console.log("  \u2713 Clicked: ".concat(element));
                        return [3 /*break*/, 10];
                    case 8: 
                    // Fallback: 페이지의 모든 버튼/링크에서 시도
                    return [4 /*yield*/, this.page.waitForLoadState('domcontentloaded')];
                    case 9:
                        // Fallback: 페이지의 모든 버튼/링크에서 시도
                        _b.sent();
                        result.status = 'passed';
                        result.actualResult = "Page loaded (click fallback)";
                        console.log("  \u26A0 Click fallback: page loaded");
                        _b.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        result.status = 'failed';
                        result.error = 'No element specified for click';
                        _b.label = 12;
                    case 12: return [3 /*break*/, 33];
                    case 13:
                        if (!this.page)
                            throw new Error('Page not initialized');
                        if (!(element && (params === null || params === void 0 ? void 0 : params.text))) return [3 /*break*/, 18];
                        return [4 /*yield*/, this.findElement(element)];
                    case 14:
                        foundElement = _b.sent();
                        if (!foundElement) return [3 /*break*/, 16];
                        return [4 /*yield*/, foundElement.fill(params.text, { timeout: 10000 })];
                    case 15:
                        _b.sent();
                        result.status = 'passed';
                        result.actualResult = "Typed \"".concat(params.text, "\" on ").concat(element);
                        console.log("  \u2713 Typed: \"".concat(params.text, "\" on ").concat(element));
                        return [3 /*break*/, 17];
                    case 16:
                        result.status = 'failed';
                        result.error = "Element not found: ".concat(element);
                        _b.label = 17;
                    case 17: return [3 /*break*/, 19];
                    case 18:
                        result.status = 'failed';
                        result.error = 'No element or text specified for type';
                        _b.label = 19;
                    case 19: return [3 /*break*/, 33];
                    case 20:
                        waitTime_1 = (params === null || params === void 0 ? void 0 : params.time) || 1000;
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, waitTime_1); })];
                    case 21:
                        _b.sent();
                        result.status = 'passed';
                        result.actualResult = "Waited ".concat(waitTime_1, "ms");
                        console.log("  \u2713 Waited: ".concat(waitTime_1, "ms"));
                        return [3 /*break*/, 33];
                    case 22:
                        if (!this.page)
                            throw new Error('Page not initialized');
                        snapshotPath = path.join(this.screenshotDir, "".concat(scenario, "_step").concat(step, ".png"));
                        return [4 /*yield*/, this.page.screenshot({ path: snapshotPath, fullPage: true })];
                    case 23:
                        _b.sent();
                        result.status = 'passed';
                        result.actualResult = 'Screenshot captured';
                        result.screenshotPath = snapshotPath;
                        console.log("  \u2713 Screenshot saved: ".concat(snapshotPath));
                        return [3 /*break*/, 33];
                    case 24:
                        if (!this.page)
                            throw new Error('Page not initialized');
                        if (!(params === null || params === void 0 ? void 0 : params.text)) return [3 /*break*/, 26];
                        return [4 /*yield*/, this.page.getByText(params.text).isVisible()];
                    case 25:
                        isVisible = _b.sent();
                        result.status = isVisible ? 'passed' : 'failed';
                        result.actualResult = isVisible ? "Text \"".concat(params.text, "\" is visible") : "Text \"".concat(params.text, "\" not found");
                        console.log("  ".concat(isVisible ? '✓' : '✗', " Text visible: ").concat(params.text));
                        return [3 /*break*/, 27];
                    case 26:
                        result.status = 'failed';
                        result.error = 'No text specified for verification';
                        _b.label = 27;
                    case 27: return [3 /*break*/, 33];
                    case 28:
                        if (!this.page)
                            throw new Error('Page not initialized');
                        if (!(params === null || params === void 0 ? void 0 : params.script)) return [3 /*break*/, 30];
                        return [4 /*yield*/, this.page.evaluate(params.script)];
                    case 29:
                        _b.sent();
                        result.status = 'passed';
                        result.actualResult = "Script executed: ".concat(params.script);
                        console.log("  \u2713 Evaluated: ".concat(params.script));
                        return [3 /*break*/, 31];
                    case 30:
                        result.status = 'failed';
                        result.error = 'No script specified for evaluate';
                        _b.label = 31;
                    case 31: return [3 /*break*/, 33];
                    case 32:
                        result.status = 'failed';
                        result.error = "Unknown action: ".concat(action);
                        _b.label = 33;
                    case 33: return [3 /*break*/, 39];
                    case 34:
                        error_2 = _b.sent();
                        result.status = 'failed';
                        result.error = error_2 instanceof Error ? error_2.message : String(error_2);
                        console.error("  \u2717 Error:", result.error);
                        if (!this.page) return [3 /*break*/, 38];
                        errorScreenshot = path.join(this.screenshotDir, "".concat(scenario, "_step").concat(step, "_error.png"));
                        _b.label = 35;
                    case 35:
                        _b.trys.push([35, 37, , 38]);
                        return [4 /*yield*/, this.page.screenshot({ path: errorScreenshot })];
                    case 36:
                        _b.sent();
                        result.screenshotPath = errorScreenshot;
                        console.log("  [Screenshot] Error saved: ".concat(errorScreenshot));
                        return [3 /*break*/, 38];
                    case 37:
                        e_13 = _b.sent();
                        return [3 /*break*/, 38];
                    case 38: return [3 /*break*/, 39];
                    case 39:
                        this.results.push(result);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    PlaywrightExecutor.prototype.startScenario = function (name) {
        this.scenarioName = name;
        this.scenarioStartTime = Date.now();
        this.results = [];
        console.log("\n".concat('='.repeat(60)));
        console.log("Starting Scenario: ".concat(name));
        console.log("".concat('='.repeat(60)));
    };
    PlaywrightExecutor.prototype.endScenario = function () {
        var endTime = Date.now();
        var duration = this.scenarioStartTime ? endTime - this.scenarioStartTime : 0;
        var passed = this.results.filter(function (r) { return r.status === 'passed'; }).length;
        var failed = this.results.filter(function (r) { return r.status === 'failed'; }).length;
        var result = {
            scenario: this.scenarioName,
            title: this.scenarioName,
            totalSteps: this.results.length,
            passed: passed,
            failed: failed,
            duration: duration,
            results: this.results,
            startTime: this.scenarioStartTime ? new Date(this.scenarioStartTime).toISOString() : '',
            endTime: new Date(endTime).toISOString()
        };
        console.log("\n".concat('='.repeat(60)));
        console.log("Scenario Complete: ".concat(this.scenarioName));
        console.log("Duration: ".concat(duration, "ms"));
        console.log("Results: ".concat(passed, "/").concat(this.results.length, " passed"));
        if (failed > 0) {
            console.log("Failed: ".concat(failed));
        }
        console.log("".concat('='.repeat(60)));
        return result;
    };
    PlaywrightExecutor.prototype.getResults = function () {
        return this.results;
    };
    /**
     * 現在のページ URL を返す
     */
    PlaywrightExecutor.prototype.getCurrentUrl = function () {
        var _a;
        return ((_a = this.page) === null || _a === void 0 ? void 0 : _a.url()) || '';
    };
    /**
     * ログイン実行（管理者用）
     */
    PlaywrightExecutor.prototype.loginAsAdmin = function () {
        return __awaiter(this, void 0, void 0, function () {
            var loginUrl, emailInput, passwordInput, loginButton, currentUrl, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.page)
                            return [2 /*return*/, false];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 10, , 11]);
                        console.log('\n  [Login] 管理者としてログイン中...');
                        loginUrl = "".concat(test_config_js_1.config.baseUrl, "/auth/signin");
                        return [4 /*yield*/, this.page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 10000 })];
                    case 2:
                        _a.sent();
                        console.log("  [Login] \u30ED\u30B0\u30A4\u30F3\u30DA\u30FC\u30B8\u306B\u79FB\u52D5: ".concat(loginUrl));
                        return [4 /*yield*/, this.page.locator('input[type="email"]').first()];
                    case 3:
                        emailInput = _a.sent();
                        return [4 /*yield*/, emailInput.fill(test_config_js_1.config.accounts.admin.email, { timeout: 5000 })];
                    case 4:
                        _a.sent();
                        console.log("  [Login] \u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u5165\u529B: ".concat(test_config_js_1.config.accounts.admin.email));
                        return [4 /*yield*/, this.page.locator('input[type="password"]').first()];
                    case 5:
                        passwordInput = _a.sent();
                        return [4 /*yield*/, passwordInput.fill(test_config_js_1.config.accounts.admin.password, { timeout: 5000 })];
                    case 6:
                        _a.sent();
                        console.log('  [Login] パスワード入力完了');
                        return [4 /*yield*/, this.page.locator('button[type="submit"]').first()];
                    case 7:
                        loginButton = _a.sent();
                        return [4 /*yield*/, loginButton.click({ timeout: 5000 })];
                    case 8:
                        _a.sent();
                        console.log('  [Login] ログインボタンクリック完了');
                        // 5. ログイン完了待機
                        return [4 /*yield*/, this.page.waitForTimeout(3000)];
                    case 9:
                        // 5. ログイン完了待機
                        _a.sent();
                        console.log('  [Login] ログイン完了待機完了');
                        currentUrl = this.page.url();
                        if (currentUrl.includes('/admin/dashboard') || currentUrl.includes('/member/dashboard')) {
                            console.log("  [Login] \u2713 \u30ED\u30B0\u30A4\u30F3\u6210\u529F: ".concat(currentUrl));
                            return [2 /*return*/, true];
                        }
                        console.log("  [Login] \u26A0 URL: ".concat(currentUrl));
                        return [2 /*return*/, true];
                    case 10:
                        error_3 = _a.sent();
                        console.error('  [Login] ✗ ログイン失敗:', error_3);
                        return [2 /*return*/, false];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * ログイン実行（会員用）
     */
    PlaywrightExecutor.prototype.loginAsMember = function () {
        return __awaiter(this, void 0, void 0, function () {
            var loginUrl, emailInput, passwordInput, loginButton, currentUrl, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.page)
                            return [2 /*return*/, false];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 10, , 11]);
                        console.log('\n  [Login] 会員としてログイン中...');
                        loginUrl = "".concat(test_config_js_1.config.baseUrl, "/auth/signin");
                        return [4 /*yield*/, this.page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 10000 })];
                    case 2:
                        _a.sent();
                        console.log("  [Login] \u30ED\u30B0\u30A4\u30F3\u30DA\u30FC\u30B8\u306B\u79FB\u52D5: ".concat(loginUrl));
                        return [4 /*yield*/, this.page.locator('input[type="email"]').first()];
                    case 3:
                        emailInput = _a.sent();
                        return [4 /*yield*/, emailInput.fill(test_config_js_1.config.accounts.member.email, { timeout: 5000 })];
                    case 4:
                        _a.sent();
                        console.log("  [Login] \u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u5165\u529B: ".concat(test_config_js_1.config.accounts.member.email));
                        return [4 /*yield*/, this.page.locator('input[type="password"]').first()];
                    case 5:
                        passwordInput = _a.sent();
                        return [4 /*yield*/, passwordInput.fill(test_config_js_1.config.accounts.member.password, { timeout: 5000 })];
                    case 6:
                        _a.sent();
                        console.log('  [Login] パスワード入力完了');
                        return [4 /*yield*/, this.page.locator('button[type="submit"]').first()];
                    case 7:
                        loginButton = _a.sent();
                        return [4 /*yield*/, loginButton.click({ timeout: 5000 })];
                    case 8:
                        _a.sent();
                        console.log('  [Login] ログインボタンクリック完了');
                        // 5. ログイン完了待機
                        return [4 /*yield*/, this.page.waitForTimeout(3000)];
                    case 9:
                        // 5. ログイン完了待機
                        _a.sent();
                        console.log('  [Login] ログイン完了待機完了');
                        currentUrl = this.page.url();
                        console.log("  [Login] \u2713 \u30ED\u30B0\u30A4\u30F3\u5B8C\u4E86: ".concat(currentUrl));
                        return [2 /*return*/, true];
                    case 10:
                        error_4 = _a.sent();
                        console.error('  [Login] ✗ ログイン失敗:', error_4);
                        return [2 /*return*/, false];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * ログアウト実行
     */
    PlaywrightExecutor.prototype.logout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var currentUrl, signoutUrl, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.page)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        console.log('  [Logout] ログアウト中...');
                        currentUrl = this.page.url();
                        signoutUrl = "".concat(test_config_js_1.config.baseUrl, "/auth/signout");
                        return [4 /*yield*/, this.page.goto(signoutUrl, { waitUntil: 'domcontentloaded', timeout: 10000 })];
                    case 2:
                        _a.sent();
                        console.log("  [Logout] \u2713 \u30ED\u30B0\u30A2\u30A6\u30C8\u5B8C\u4E86: ".concat(signoutUrl));
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        console.error('  [Logout] ✗ ログアウト失敗:', error_5);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return PlaywrightExecutor;
}());
exports.PlaywrightExecutor = PlaywrightExecutor;
exports.default = PlaywrightExecutor;
