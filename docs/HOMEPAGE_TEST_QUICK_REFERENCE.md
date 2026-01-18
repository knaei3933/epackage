# Homepage E2E Test Quick Reference

## Test Files Created

### 1. Test Suite: `tests/e2e/homepage-comprehensive.spec.ts`
Complete Playwright E2E test suite with 55+ test cases covering all homepage functionality.

### 2. Test Plan: `docs/HOMEPAGE_E2E_TEST_PLAN.md`
Comprehensive documentation with detailed test scenarios, steps, and expected results.

---

## Quick Test Execution

```bash
# Run all homepage tests
npx playwright test homepage-comprehensive.spec.ts

# Run specific test category
npx playwright test homepage-comprehensive.spec.ts --grep "[NAV-001]"

# Run with UI mode
npx playwright test homepage-comprehensive.spec.ts --ui

# Run on specific device
npx playwright test homepage-comprehensive.spec.ts --project="Mobile Chrome"
```

---

## Test Categories Summary

| Category | Test Cases | Coverage |
|----------|-----------|----------|
| Navigation & Header | 5 | Logo, menu links, active states, mobile menu |
| Hero Section | 8 | Headline, stats, CTAs, trust indicators, badges, images |
| Product Showcase | 5 | Section display, cards, information, navigation |
| Manufacturing Process | 5 | 4 steps, images, features, quality stats |
| CTA Section | 4 | Section display, cards, navigation, trust indicators |
| Announcement Banner | 1 | Conditional display |
| Footer | 10 | Company info, social links, privacy links, newsletter, back-to-top |
| Responsive Design | 4 | Desktop, tablet, mobile, navigation |
| Accessibility | 5 | Headings, alt text, links, buttons, forms |
| Performance | 2 | Load time, image loading |
| User Flows | 4 | Navigation, sample request, contact, newsletter |
| SEO & Metadata | 3 | Title, description, canonical |
| Edge Cases | 3 | Missing images, rapid clicks, scroll behavior |
| **TOTAL** | **55+** | **Complete Homepage Coverage** |

---

## Key Test Data

### Navigation Items
- ホーム (Home) → `/`
- 製品カタログ (Product Catalog) → `/catalog`
- 会社概要 (Company Profile) → `/about`
- お見積り (Quote) → `/roi-calculator`
- お問い合わせ (Contact) → `/contact`

### Hero CTAs
- 製品を見る (View Products) → `/catalog`
- 即時見積もり (Instant Quote) → `/quote-simulator`
- 無料サンプル (Free Samples) → `/samples`

### Key Statistics
- 500+ product types
- 10-day early delivery
- 100+ companies served
- 21-day average lead time
- 100% inspection pass rate
- 30% cost reduction

### Manufacturing Steps
1. デジタル印刷 (Digital Printing)
2. ラミネート加工 (Laminating)
3. スリッティング/切断 (Slitting/Cutting)
4. パウチ加工 (Pouch Forming)

### CTA Section Options
- 製品カタログ (Product Catalog) → `/catalog`
- 価格計算 (Price Calculator) → `/roi-calculator`
- 無料サンプル (Free Samples) → `/samples`
- お問合せ (Contact) → `/contact`

### Social Media
- Facebook, Twitter, LinkedIn, Instagram, YouTube

### Privacy Links
- 個人情報保護方針 (Privacy Policy) → `/privacy`
- 利用規約 (Terms of Service) → `/terms`
- 特定商取引法 (Commercial Law) → `/legal`
- 社会的責任 (CSR) → `/csr`

---

## Test Priorities

### P0 (Critical) - Must Pass
- Navigation functionality
- CTA button clicks
- Page load performance
- Core user flows

### P1 (High) - Should Pass
- Content display
- Image loading
- Form validation
- Mobile responsiveness

### P2 (Medium) - Nice to Pass
- Accessibility features
- SEO metadata
- Edge cases
- Animations

---

## Common Issues & Solutions

### Issue: Tests failing due to missing data
**Solution**: Ensure database has featured products and announcements

### Issue: Images not loading
**Solution**: Verify image files exist in `/public/images/`

### Issue: Navigation not working
**Solution**: Check server is running on correct port (3002)

### Issue: Mobile tests failing
**Solution**: Verify responsive design and mobile menu functionality

---

## Success Criteria

✓ All 55+ tests passing
✓ No console errors
✓ No network errors
✓ Page load time < 5 seconds
✓ All images loading
✓ All links functional
✓ Mobile responsive
✓ Accessible (WCAG 2.1 AA)

---

## Maintenance Checklist

- [ ] Update test data when content changes
- [ ] Add new tests for new features
- [ ] Review and update quarterly
- [ ] Check for broken links monthly
- [ ] Verify image paths after deployments
- [ ] Update navigation items when menu changes
- [ ] Add new CTA tests when CTAs change

---

## Next Steps

1. **Run Initial Test Suite**
   ```bash
   npx playwright test homepage-comprehensive.spec.ts
   ```

2. **Review Results**
   - Check HTML report: `playwright-report/index.html`
   - Review any failures
   - Fix critical issues first

3. **Integrate with CI/CD**
   - Add to test pipeline
   - Run on every PR
   - Block deployment on failure

4. **Schedule Regular Runs**
   - Nightly test execution
   - Weekly result review
   - Monthly maintenance

---

## Contact & Support

For questions about the test suite:
- Review the comprehensive test plan: `docs/HOMEPAGE_E2E_TEST_PLAN.md`
- Check Playwright documentation: https://playwright.dev
- Consult with QA team

---

**Last Updated**: 2026-01-13
**Test Suite Version**: 1.0
**Status**: Ready for Execution
