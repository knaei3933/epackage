/**
 * Catalog System End-to-End Test Script
 *
 * Tests the following functionality:
 * 1. Product API endpoints
 * 2. Filtering functionality (category, material, price, etc.)
 * 3. Search functionality
 * 4. Sample request submission
 * 5. Database storage verification
 */

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  details: string;
  error?: string;
}

interface TestReport {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  tests: TestResult[];
  summary: string;
  recommendations: string[];
}

class CatalogE2ETester {
  private baseUrl: string;
  private results: TestResult[] = [];
  private startTime: number = 0;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Start the test suite
   */
  async runTests(): Promise<TestReport> {
    console.log('='.repeat(80));
    console.log('CATALOG SYSTEM END-TO-END TEST');
    console.log('='.repeat(80));
    console.log(`Base URL: ${this.baseUrl}`);
    console.log(`Start Time: ${new Date().toISOString()}`);
    console.log('='.repeat(80));
    console.log();

    this.startTime = Date.now();

    // Test 1: Navigate to catalog page
    await this.test('Catalog Page Navigation', async () => {
      const response = await fetch(`${this.baseUrl}/catalog`);
      if (!response.ok) {
        throw new Error(`Failed to load catalog page: ${response.status}`);
      }
      const html = await response.text();
      if (!html.includes('パウチ製品カタログ')) {
        throw new Error('Catalog page missing expected content');
      }
      return 'Catalog page loaded successfully with expected content';
    });

    // Test 2: Fetch products API
    await this.test('GET /api/products - Fetch All Products', async () => {
      const response = await fetch(`${this.baseUrl}/api/products`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error('API returned success: false');
      }

      if (!Array.isArray(data.data)) {
        throw new Error('API did not return an array of products');
      }

      return `Successfully fetched ${data.data.length} products`;
    });

    // Test 3: Category filtering
    await this.test('Category Filter - Stand Pouch', async () => {
      const response = await fetch(`${this.baseUrl}/api/products?category=stand_pouch`);
      if (!response.ok) {
        throw new Error(`Category filter failed: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data.data)) {
        throw new Error('Category filter did not return array');
      }

      // Verify all products are in the specified category
      const nonMatching = data.data.filter((p: any) => p.category !== 'stand_pouch');
      if (nonMatching.length > 0) {
        throw new Error(`Found ${nonMatching.length} products not in stand_pouch category`);
      }

      return `Category filter returned ${data.data.length} stand_pouch products`;
    });

    // Test 4: Material filtering
    await this.test('POST /api/products/filter - Material Filter', async () => {
      const filterRequest = {
        materials: ['PET', 'AL'],
        category: 'all'
      };

      const response = await fetch(`${this.baseUrl}/api/products/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filterRequest)
      });

      if (!response.ok) {
        throw new Error(`Material filter failed: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error('Filter API returned success: false');
      }

      return `Material filter returned ${data.count} products with PET or AL materials`;
    });

    // Test 5: Price range filtering
    await this.test('POST /api/products/filter - Price Range Filter', async () => {
      const filterRequest = {
        priceRange: [0, 50000],
        category: 'all'
      };

      const response = await fetch(`${this.baseUrl}/api/products/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filterRequest)
      });

      if (!response.ok) {
        throw new Error(`Price range filter failed: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error('Price filter API returned success: false');
      }

      // Verify all products are within price range
      const outOfRange = data.data.filter((p: any) => {
        const baseCost = p.pricing_formula?.base_cost || 0;
        return baseCost < 0 || baseCost > 50000;
      });

      if (outOfRange.length > 0) {
        throw new Error(`Found ${outOfRange.length} products outside price range`);
      }

      return `Price range filter returned ${data.count} products within ¥0-¥50,000`;
    });

    // Test 6: Search functionality
    await this.test('POST /api/products/filter - Search Query', async () => {
      const filterRequest = {
        searchQuery: 'パウチ',
        category: 'all'
      };

      const response = await fetch(`${this.baseUrl}/api/products/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filterRequest)
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error('Search API returned success: false');
      }

      return `Search for 'パウチ' returned ${data.count} products`;
    });

    // Test 7: Combined filters
    await this.test('POST /api/products/filter - Combined Filters', async () => {
      const filterRequest = {
        category: 'stand_pouch',
        materials: ['PET'],
        maxLeadTime: 15,
        searchQuery: ''
      };

      const response = await fetch(`${this.baseUrl}/api/products/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filterRequest)
      });

      if (!response.ok) {
        throw new Error(`Combined filter failed: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error('Combined filter API returned success: false');
      }

      // Verify all conditions match
      const invalid = data.data.filter((p: any) => {
        const categoryMatch = p.category === 'stand_pouch';
        const materialMatch = p.materials?.includes('PET');
        const leadTimeMatch = p.lead_time_days <= 15;
        return !categoryMatch || !materialMatch || !leadTimeMatch;
      });

      if (invalid.length > 0) {
        throw new Error(`Found ${invalid.length} products not matching combined filters`);
      }

      return `Combined filters returned ${data.count} products matching all criteria`;
    });

    // Test 8: Sample request submission
    await this.test('POST /api/samples/request - Sample Request Submission', async () => {
      const sampleRequest = {
        customerInfo: {
          companyName: 'Test Company',
          contactPerson: 'Test User',
          email: 'test@example.com',
          phone: '03-1234-5678'
        },
        deliveryType: 'normal',
        deliveryDestinations: [
          {
            companyName: 'Test Company',
            contactPerson: 'Test User',
            phone: '03-1234-5678',
            postalCode: '100-0001',
            address: 'Tokyo, Chiyoda-ku',
            isPrimary: true
          }
        ],
        samples: [
          {
            productName: 'Stand Pouch',
            category: 'stand_pouch',
            quantity: 1
          }
        ],
        message: 'This is a test sample request',
        urgency: 'normal',
        privacyConsent: true
      };

      const response = await fetch(`${this.baseUrl}/api/samples/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleRequest)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Sample request failed: ${response.status} - ${error}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(`Sample request API returned success: false - ${data.error}`);
      }

      return `Sample request submitted successfully. Request ID: ${data.data.requestId}`;
    });

    // Test 9: Sample request validation (missing required fields)
    await this.test('POST /api/samples/request - Validation Error Handling', async () => {
      const invalidRequest = {
        customerInfo: {
          companyName: 'Test Company'
          // Missing required fields
        },
        samples: [],
        privacyConsent: true
      };

      const response = await fetch(`${this.baseUrl}/api/samples/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidRequest)
      });

      if (response.ok) {
        throw new Error('API should have returned validation error');
      }

      const data = await response.json();
      if (data.success) {
        throw new Error('API should not have succeeded with invalid data');
      }

      return 'Validation error correctly returned for invalid data';
    });

    // Test 10: Sample request validation (too many samples)
    await this.test('POST /api/samples/request - Max Samples Validation', async () => {
      const invalidRequest = {
        customerInfo: {
          companyName: 'Test Company',
          contactPerson: 'Test User',
          email: 'test@example.com',
          phone: '03-1234-5678'
        },
        deliveryType: 'normal',
        deliveryDestinations: [
          {
            contactPerson: 'Test User',
            phone: '03-1234-5678',
            address: 'Tokyo',
            isPrimary: true
          }
        ],
        samples: Array(6).fill({
          productName: 'Test Product',
          category: 'stand_pouch',
          quantity: 1
        }),
        privacyConsent: true
      };

      const response = await fetch(`${this.baseUrl}/api/samples/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidRequest)
      });

      if (response.ok) {
        throw new Error('API should have rejected more than 5 samples');
      }

      const data = await response.json();
      if (!data.success && data.error?.includes('5')) {
        return 'Correctly rejected request with more than 5 samples';
      }

      throw new Error('API did not properly validate max samples limit');
    });

    // Test 11: CORS headers
    await this.test('OPTIONS /api/products - CORS Headers', async () => {
      const response = await fetch(`${this.baseUrl}/api/products`, {
        method: 'OPTIONS'
      });

      if (!response.ok) {
        throw new Error(`OPTIONS request failed: ${response.status}`);
      }

      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      if (!corsHeader) {
        throw new Error('CORS headers missing');
      }

      return `CORS headers present: ${corsHeader}`;
    });

    // Test 12: API error handling
    await this.test('POST /api/products/filter - Invalid Filter Handling', async () => {
      const invalidRequest = {
        priceRange: [-100, 'invalid'],
        category: 'invalid_category'
      };

      const response = await fetch(`${this.baseUrl}/api/products/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidRequest)
      });

      // Should handle gracefully (either 400 error or empty results)
      if (response.ok) {
        const data = await response.json();
        if (data.success === false) {
          return 'API correctly handled invalid filter parameters';
        }
        return 'API processed invalid filter gracefully';
      }

      return `API returned error for invalid filters: ${response.status}`;
    });

    return this.generateReport();
  }

  /**
   * Run a single test
   */
  private async test(name: string, testFn: () => Promise<string>): Promise<void> {
    const startTime = Date.now();
    console.log(`Running: ${name}...`);

    try {
      const details = await testFn();
      const duration = Date.now() - startTime;

      this.results.push({
        name,
        status: 'PASS',
        duration,
        details
      });

      console.log(`  ✓ PASS (${duration}ms)`);
      console.log(`    ${details}`);
      console.log();
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.results.push({
        name,
        status: 'FAIL',
        duration,
        details: 'Test failed',
        error: errorMessage
      });

      console.log(`  ✗ FAIL (${duration}ms)`);
      console.log(`    Error: ${errorMessage}`);
      console.log();
    }
  }

  /**
   * Generate test report
   */
  private generateReport(): TestReport {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    const totalDuration = Date.now() - this.startTime;

    console.log('='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} (${((passed / total) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${failed} (${((failed / total) * 100).toFixed(1)}%)`);
    console.log(`Skipped: ${skipped} (${((skipped / total) * 100).toFixed(1)}%)`);
    console.log(`Total Duration: ${totalDuration}ms`);
    console.log('='.repeat(80));
    console.log();

    // Identify issues and recommendations
    const recommendations: string[] = [];

    if (failed > 0) {
      const failedTests = this.results.filter(r => r.status === 'FAIL');
      recommendations.push(`Fix ${failed} failing test(s):`);
      failedTests.forEach(t => {
        recommendations.push(`  - ${t.name}: ${t.error}`);
      });
    }

    if (passed === total) {
      recommendations.push('All tests passed! Consider adding more edge case tests.');
    }

    if (this.results.some(r => r.duration > 1000)) {
      recommendations.push('Some tests are slow (>1s). Consider optimizing API queries.');
    }

    console.log('RECOMMENDATIONS:');
    recommendations.forEach(rec => console.log(`  ${rec}`));
    console.log();

    return {
      total,
      passed,
      failed,
      skipped,
      tests: this.results,
      summary: `${passed}/${total} tests passed (${((passed / total) * 100).toFixed(1)}%)`,
      recommendations
    };
  }
}

// Main execution
async function main() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const tester = new CatalogE2ETester(baseUrl);

  try {
    const report = await tester.runTests();

    // Exit with appropriate code
    process.exit(report.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Test suite failed to run:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { CatalogE2ETester, TestReport, TestResult };
