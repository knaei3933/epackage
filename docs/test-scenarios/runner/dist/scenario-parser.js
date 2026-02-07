/**
 * 시나리오 파서
 * .md 파일에서 Playwright MCP 명령어를 파싱
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
/**
 * Playwright MCP 명령어 파싱
 * [Browser_navigate] http://localhost:3006
 * [Browser_click] element="로그인 버튼"]
 */
function parseCommand(line) {
    const trimmedLine = line.trim();
    // 빈 줄 또는 주석 무시
    if (!trimmedLine || trimmedLine.startsWith('#')) {
        return null;
    }
    // [Browser_navigate] url
    const navigateMatch = trimmedLine.match(/\[Browser_navigate\]\s+(.+)/);
    if (navigateMatch) {
        return {
            sequence: 0,
            action: 'navigate',
            params: { url: navigateMatch[1].trim() },
            description: trimmedLine
        };
    }
    // [Browser_click] element="..."
    const clickMatch = trimmedLine.match(/\[Browser_click\]\s+element="([^"]+)"/);
    if (clickMatch) {
        return {
            sequence: 0,
            action: 'click',
            element: clickMatch[1].trim(),
            description: trimmedLine
        };
    }
    // [Browser_type] element="..." text="..."
    const typeMatch = trimmedLine.match(/\[Browser_type\]\s+element="([^"]+)"\s+text="([^"]+)"/);
    if (typeMatch) {
        return {
            sequence: 0,
            action: 'type',
            element: typeMatch[1].trim(),
            params: { text: typeMatch[2].trim() },
            description: trimmedLine
        };
    }
    // [Browser_wait_for] time: 3
    const waitMatch = trimmedLine.match(/\[Browser_wait_for\]\s+time:\s*(\d+)/);
    if (waitMatch) {
        return {
            sequence: 0,
            action: 'wait',
            params: { time: parseInt(waitMatch[1]) * 1000 },
            description: trimmedLine
        };
    }
    // [Browser_snapshot]
    const snapshotMatch = trimmedLine.match(/\[Browser_snapshot\]/);
    if (snapshotMatch) {
        return {
            sequence: 0,
            action: 'snapshot',
            description: trimmedLine
        };
    }
    // [Browser_evaluate] script
    const evaluateMatch = trimmedLine.match(/\[Browser_evaluate\]\s+(.+)/);
    if (evaluateMatch) {
        return {
            sequence: 0,
            action: 'evaluate',
            params: { script: evaluateMatch[1].trim() },
            description: trimmedLine
        };
    }
    // [Browser_verify_text_visible] text="..."
    const verifyMatch = trimmedLine.match(/\[Browser_verify_text_visible\]\s+text="([^"]+)"/);
    if (verifyMatch) {
        return {
            sequence: 0,
            action: 'verify_text_visible',
            params: { text: verifyMatch[1].trim() },
            description: trimmedLine
        };
    }
    return null;
}
/**
 * .md 파일 파싱
 */
export function parseScenarioFile(filePath) {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const scenario = {
        title: '',
        description: '',
        category: '',
        prerequisites: [],
        steps: [],
        databaseQueries: []
    };
    // 헤더에서 제목 추출
    for (const line of lines) {
        if (line.startsWith('# ')) {
            scenario.title = line.substring(2).trim();
            break;
        }
    }
    let currentSection = 'header';
    let codeBlockLines = [];
    let inCodeBlock = false;
    let codeBlockType = '';
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        // 코드 블록 시작 감지
        if (trimmedLine.startsWith('```')) {
            if (!inCodeBlock) {
                // 코드 블록 시작
                inCodeBlock = true;
                codeBlockType = trimmedLine.substring(3).trim(); // bash, sql, etc.
                codeBlockLines = [];
            }
            else {
                // 코드 블록 종료
                inCodeBlock = false;
                // 코드 블록 내용 처리
                const blockContent = codeBlockLines.join('\n');
                if (codeBlockType === 'bash' && currentSection === 'steps') {
                    // bash 코드 블록에서 명령어 추출
                    for (const cmdLine of codeBlockLines) {
                        const parsed = parseCommand(cmdLine);
                        if (parsed) {
                            parsed.sequence = scenario.steps.length;
                            scenario.steps.push(parsed);
                        }
                    }
                }
                else if ((codeBlockType === 'sql' || codeBlockType === '') && currentSection === 'database') {
                    // SQL 코드 블록 저장
                    scenario.databaseQueries.push(blockContent.trim());
                }
                codeBlockLines = [];
                codeBlockType = '';
            }
            continue;
        }
        // 코드 블록 내부
        if (inCodeBlock) {
            codeBlockLines.push(line);
            continue;
        }
        // 섹션 헤더 감지
        if (trimmedLine.includes('전제 조건') || trimmedLine.includes('전제조건')) {
            currentSection = 'prerequisites';
        }
        else if (trimmedLine.includes('테스트 단계') || trimmedLine.includes('테스트단계')) {
            currentSection = 'steps';
        }
        else if (trimmedLine.includes('데이터베이스 검증') || trimmedLine.includes('DB 검증') || trimmedLine.includes('데이터베이스 확인')) {
            currentSection = 'database';
        }
    }
    return scenario;
}
/**
 * 카테고리별 시나리오 파일 로드
 */
export function loadScenarios(baseDir) {
    // 홈페이지 (README 제외)
    const guestQuotation = parseScenarioFile(resolve(baseDir, 'homepage/guest-quotation.md'));
    const catalogBrowsing = parseScenarioFile(resolve(baseDir, 'homepage/catalog-browsing.md'));
    const contactForm = parseScenarioFile(resolve(baseDir, 'homepage/contact-form.md'));
    const caseStudies = parseScenarioFile(resolve(baseDir, 'homepage/case-studies.md'));
    // 회원 (README 제외)
    const loginDashboard = parseScenarioFile(resolve(baseDir, 'member/login-dashboard.md'));
    const orders = parseScenarioFile(resolve(baseDir, 'member/orders.md'));
    const quotations = parseScenarioFile(resolve(baseDir, 'member/quotations.md'));
    const contracts = parseScenarioFile(resolve(baseDir, 'member/contracts.md'));
    const deliveries = parseScenarioFile(resolve(baseDir, 'member/deliveries.md'));
    const invoices = parseScenarioFile(resolve(baseDir, 'member/invoices.md'));
    const samples = parseScenarioFile(resolve(baseDir, 'member/samples.md'));
    const inquiries = parseScenarioFile(resolve(baseDir, 'member/inquiries.md'));
    const profile = parseScenarioFile(resolve(baseDir, 'member/profile.md'));
    const edit = parseScenarioFile(resolve(baseDir, 'member/edit.md'));
    const settings = parseScenarioFile(resolve(baseDir, 'member/settings.md'));
    const notifications = parseScenarioFile(resolve(baseDir, 'member/notifications.md'));
    // 관리자 (README 제외)
    const adminLogin = parseScenarioFile(resolve(baseDir, 'admin/login-dashboard.md'));
    const adminQuotations = parseScenarioFile(resolve(baseDir, 'admin/quotation-approval.md'));
    const adminApprovals = parseScenarioFile(resolve(baseDir, 'admin/approvals.md'));
    const customers = parseScenarioFile(resolve(baseDir, 'admin/customers.md'));
    const adminOrders = parseScenarioFile(resolve(baseDir, 'admin/orders.md'));
    const adminContracts = parseScenarioFile(resolve(baseDir, 'admin/contracts.md'));
    const production = parseScenarioFile(resolve(baseDir, 'admin/production.md'));
    const inventory = parseScenarioFile(resolve(baseDir, 'admin/inventory.md'));
    const shipments = parseScenarioFile(resolve(baseDir, 'admin/shipments.md'));
    const leads = parseScenarioFile(resolve(baseDir, 'admin/leads.md'));
    const coupons = parseScenarioFile(resolve(baseDir, 'admin/coupons.md'));
    const adminSettings = parseScenarioFile(resolve(baseDir, 'admin/settings.md'));
    const adminNotifications = parseScenarioFile(resolve(baseDir, 'admin/notifications.md'));
    // 통합 (README 제외)
    const guestQuotationFlow = parseScenarioFile(resolve(baseDir, 'integration/guest-quotation-flow.md'));
    const memberRegistrationFlow = parseScenarioFile(resolve(baseDir, 'integration/member-registration-flow.md'));
    const orderShippingFlow = parseScenarioFile(resolve(baseDir, 'integration/order-shipping-flow.md'));
    const notificationFlow = parseScenarioFile(resolve(baseDir, 'integration/notification-flow.md'));
    const realtimeUpdates = parseScenarioFile(resolve(baseDir, 'integration/realtime-updates.md'));
    const errorPerformance = parseScenarioFile(resolve(baseDir, 'integration/error-performance.md'));
    return {
        'homepage/guest-quotation': guestQuotation,
        'homepage/catalog-browsing': catalogBrowsing,
        'homepage/contact-form': contactForm,
        'homepage/case-studies': caseStudies,
        'member/login-dashboard': loginDashboard,
        'member/orders': orders,
        'member/quotations': quotations,
        'member/contracts': contracts,
        'member/deliveries': deliveries,
        'member/invoices': invoices,
        'member/samples': samples,
        'member/inquiries': inquiries,
        'member/profile': profile,
        'member/edit': edit,
        'member/settings': settings,
        'member/notifications': notifications,
        'admin/login-dashboard': adminLogin,
        'admin/quotations': adminQuotations,
        'admin/approvals': adminApprovals,
        'admin/customers': customers,
        'admin/orders': adminOrders,
        'admin/contracts': adminContracts,
        'admin/production': production,
        'admin/inventory': inventory,
        'admin/shipments': shipments,
        'admin/leads': leads,
        'admin/coupons': coupons,
        'admin/settings': adminSettings,
        'admin/notifications': adminNotifications,
        'integration/guest-quotation-flow': guestQuotationFlow,
        'integration/member-registration-flow': memberRegistrationFlow,
        'integration/order-shipping-flow': orderShippingFlow,
        'integration/notification-flow': notificationFlow,
        'integration/realtime-updates': realtimeUpdates,
        'integration/error-performance': errorPerformance
    };
}
//# sourceMappingURL=scenario-parser.js.map