#!/usr/bin/env node

/**
 * Test Execution Script for Epackage Lab
 *
 * This script runs tests in phases and generates comprehensive reports
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test phases configuration
const testPhases = [
    {
        name: 'Phase 1: Functional Tests',
        description: 'Core functionality testing',
        tests: ['catalog.spec.ts', 'navigation.spec.ts', 'post-processing.spec.ts', 'download.spec.ts'],
        critical: true
    },
    {
        name: 'Phase 2: Localization Tests',
        description: 'Japanese language and locale testing',
        tests: ['localization.spec.ts'],
        critical: true
    },
    {
        name: 'Phase 3: Responsive Design Tests',
        description: 'Mobile and tablet compatibility',
        tests: ['responsive.spec.ts'],
        critical: true
    },
    {
        name: 'Phase 4: Accessibility Tests',
        description: 'WCAG compliance and accessibility',
        tests: ['accessibility.spec.ts'],
        critical: true
    },
    {
        name: 'Phase 5: Performance Tests',
        description: 'Performance and speed testing',
        tests: ['performance.spec.ts'],
        critical: false
    },
    {
        name: 'Phase 6: API Integration Tests',
        description: 'Backend API testing',
        tests: ['api.spec.ts'],
        critical: true
    },
    {
        name: 'Phase 7: Security Tests',
        description: 'Security vulnerability testing',
        tests: ['security.spec.ts'],
        critical: false
    },
    {
        name: 'Phase 8: User Journey Tests',
        description: 'End-to-end user flows',
        tests: ['user-journey.spec.ts'],
        critical: true
    }
];

// ANSI color codes for output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, options = {}) {
    try {
        log(`Running: ${command}`, 'cyan');
        const output = execSync(command, {
            encoding: 'utf8',
            ...options
        });
        return { success: true, output };
    } catch (error) {
        return {
            success: false,
            output: error.stdout || error.message,
            error: error.stderr || error.message
        };
    }
}

function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function generateReport(results) {
    const reportDir = path.join(process.cwd(), 'test-reports');
    ensureDirectoryExists(reportDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportDir, `test-report-${timestamp}.md`);

    let reportContent = `# Epackage Lab Test Report\n\n`;
    reportContent += `Generated: ${new Date().toLocaleString('ja-JP')}\n\n`;
    reportContent += `## Test Summary\n\n`;
    reportContent += `| Phase | Status | Tests | Duration |\n`;
    reportContent += `|-------|--------|-------|----------|\n`;

    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalDuration = 0;

    results.forEach(result => {
        const status = result.success ? '✅ PASSED' : '❌ FAILED';
        const duration = result.duration ? `${(result.duration / 1000).toFixed(2)}s` : 'N/A';

        reportContent += `| ${result.phase} | ${status} | ${result.tests || 0} | ${duration} |\n`;

        totalTests += result.tests || 0;
        totalDuration += result.duration || 0;

        if (result.success) {
            totalPassed += result.tests || 0;
        } else {
            totalFailed += result.tests || 0;
        }

        if (result.error) {
            reportContent += `\n### ❌ ${result.phase} Errors\n\n`;
            reportContent += `\`\`\`\n${result.error}\n\`\`\`\n\n`;
        }
    });

    reportContent += `\n## Overall Results\n\n`;
    reportContent += `- **Total Tests**: ${totalTests}\n`;
    reportContent += `- **Passed**: ${totalPassed}\n`;
    reportContent += `- **Failed**: ${totalFailed}\n`;
    reportContent += `- **Success Rate**: ${((totalPassed / totalTests) * 100).toFixed(2)}%\n`;
    reportContent += `- **Total Duration**: ${(totalDuration / 1000).toFixed(2)}s\n\n`;

    reportContent += `## Recommendations\n\n`;

    if (totalFailed > 0) {
        reportContent += `- 🔴 **Critical**: ${totalFailed} tests failed. Immediate attention required.\n`;
        reportContent += `- Review failed tests and fix issues before deployment.\n`;
    } else {
        reportContent += `- ✅ All critical tests passed. System is ready for deployment.\n`;
    }

    reportContent += `- Consider adding more edge case tests based on current coverage.\n`;
    reportContent += `- Set up automated test runs in CI/CD pipeline.\n`;

    fs.writeFileSync(reportFile, reportContent);
    log(`Test report generated: ${reportFile}`, 'green');
}

async function main() {
    log('\n🚀 Starting Epackage Lab Test Suite', 'bright');
    log('=====================================\n');

    const results = [];
    const startTime = Date.now();

    // Check if dev server is running
    log('Checking if development server is running...', 'yellow');
    const serverCheck = runCommand('curl -s http://localhost:3002 > /dev/null', { stdio: 'ignore' });

    if (!serverCheck.success) {
        log('❌ Development server is not running on port 3002', 'red');
        log('Please start the server with: npm run dev', 'yellow');
        process.exit(1);
    }

    log('✅ Development server is running', 'green');

    // Run each test phase
    for (const phase of testPhases) {
        log(`\n${'='.repeat(50)}`, 'cyan');
        log(`📋 ${phase.name}`, 'bright');
        log(`   ${phase.description}`, 'yellow');
        log('='.repeat(50), 'cyan');

        const phaseStartTime = Date.now();
        const phaseResults = {
            phase: phase.name,
            tests: 0,
            duration: 0,
            success: true
        };

        // Check if test files exist
        const existingTests = phase.tests.filter(testFile => {
            return fs.existsSync(path.join('tests', testFile));
        });

        if (existingTests.length === 0) {
            log(`⚠️  No test files found for ${phase.name}`, 'yellow');
            continue;
        }

        // Run tests for this phase
        for (const testFile of existingTests) {
            log(`\n🔍 Running ${testFile}...`, 'cyan');

            const testCommand = `npx playwright test tests/${testFile} --reporter=list`;
            const result = runCommand(testCommand);

            if (result.success) {
                // Parse test results from output
                const output = result.output;
                const passedMatch = output.match(/(\d+) passed/);
                const failedMatch = output.match(/(\d+) failed/);

                const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
                const failed = failedMatch ? parseInt(failedMatch[1]) : 0;

                phaseResults.tests += passed + failed;

                if (failed > 0) {
                    phaseResults.success = false;
                    phaseResults.error = result.output;
                    log(`❌ ${testFile} - ${failed} tests failed`, 'red');
                } else {
                    log(`✅ ${testFile} - ${passed} tests passed`, 'green');
                }
            } else {
                phaseResults.success = false;
                phaseResults.error = result.error;
                log(`❌ ${testFile} - Execution failed`, 'red');
                log(result.error, 'red');
            }
        }

        phaseResults.duration = Date.now() - phaseStartTime;
        results.push(phaseResults);

        // If this is a critical phase and it failed, ask whether to continue
        if (!phaseResults.success && phase.critical) {
            log(`\n⚠️  Critical test phase failed!`, 'red');
            log('Do you want to continue with remaining tests? (y/n)', 'yellow');

            // In CI environment, continue automatically
            if (process.env.CI) {
                log('CI environment detected, continuing with tests...', 'cyan');
            } else {
                // For manual execution, you might want to add interactive prompt here
                log('Continuing with tests...', 'cyan');
            }
        }
    }

    // Generate final report
    const totalDuration = Date.now() - startTime;
    generateReport(results);

    // Generate HTML report with Playwright
    log('\n📊 Generating HTML report...', 'cyan');
    runCommand('npx playwright test --reporter=html', { stdio: 'inherit' });

    // Summary
    log('\n' + '='.repeat(50), 'bright');
    log('📋 Test Suite Summary', 'bright');
    log('='.repeat(50), 'bright');

    const totalTests = results.reduce((sum, r) => sum + r.tests, 0);
    const passedPhases = results.filter(r => r.success).length;

    log(`Total duration: ${(totalDuration / 1000).toFixed(2)}s`, 'cyan');
    log(`Total tests run: ${totalTests}`, 'cyan');
    log(`Phases passed: ${passedPhases}/${results.length}`, 'cyan');

    if (passedPhases === results.length) {
        log('\n✅ All test phases completed successfully!', 'green');
        log('System is ready for deployment!', 'green');
    } else {
        log('\n❌ Some test phases failed. Please review the report.', 'red');
        process.exit(1);
    }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    log(`\n❌ Uncaught error: ${error.message}`, 'red');
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    log(`\n❌ Unhandled rejection: ${reason}`, 'red');
    process.exit(1);
});

// Run the test suite
main();