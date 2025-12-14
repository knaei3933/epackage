# Epackage Lab Website - Updated Modification Requirements PRD

## Executive Summary

This PRD outlines comprehensive updates and modifications required for the Epackage Lab website based on the latest client feedback. These modifications focus on content accuracy, user experience improvements, service flow restructuring, and system integration.

### Current Status Overview
- Previous Implementation: 100% Complete (7/7 tasks)
- New Requirements: 13 additional modification items
- Priority Focus: Content accuracy, UX improvements, system integration

---

## New Feature Requirements

### Priority 1: Homepage Content Updates

#### 1.1 Statistics and Content Modifications
**Business Requirement**: Update homepage statistics and remove outdated sections
**Current Status**: 0% Complete
**Priority**: High

**Specific Changes Required**:
- Change "500 社以上実績" to "100" (number of companies)
- Change "10日最短納期" to "21日最短納期" (minimum delivery period)
- Remove "ISO 9001認証" box completely
- Remove the entire "500+取引実績企業 日本市場15年" 4-box content section below

**Technical Requirements**:
- Target Files: Homepage components, hero sections
- Update numeric displays and text content
- Remove entire component sections
- Ensure responsive design maintenance

**Acceptance Criteria**:
- [ ] Homepage statistics updated to new numbers
- [ ] ISO 9001 certification section completely removed
- [ ] 4-box company achievement section removed
- [ ] Page layout remains balanced after removals

#### 1.2 Manufacturing Process Content Update
**Business Requirement**: Update manufacturing process description with new content and images
**Current Status**: 0% Complete
**Priority**: High

**Requirements**:
- Replace "最新鋭技術による高品質製造 日本製の品質と信頼性" content
- New content: "一貫したパウチ製作サービス로 인쇄, 라미네이터, 슬리팅, 파우치 가공을 일관해서 제작하고 있다"
- Use images from `C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\images\process`
- Replace existing process images with 4 new process images

**Technical Requirements**:
- Target Files: Homepage manufacturing process section
- Image replacement with new process images
- Content translation and localization
- Maintain visual consistency

**Acceptance Criteria**:
- [ ] Manufacturing process content updated with new description
- [ ] New process images from /images/process properly integrated
- [ ] Responsive image optimization maintained
- [ ] Content properly localized for Japanese market

---

### Priority 2: Page Structure Modifications

#### 2.1 Section Deletions
**Business Requirement**: Remove outdated or unnecessary sections across multiple pages
**Current Status**: 0% Complete
**Priority**: High

**Sections to Remove**:
1. "認証・規格証明" content section
2. "工場見学・製造工程のご案内" content section
3. Entire company overview page ("/about" route)
4. Service flow page "製造工程を見学しませんか？" section

**Technical Requirements**:
- Target Files: Homepage, service flow page, routing configuration
- Complete component removal from page structure
- Route deletion for company overview page
- Navigation menu updates to remove deleted page links

**Acceptance Criteria**:
- [ ] All specified sections completely removed
- [ ] Company overview page route deleted and redirected appropriately
- [ ] Navigation menus updated to reflect deletions
- [ ] No broken links or 404 errors

---

### Priority 3: Catalog Page Design Improvements

#### 3.1 Visibility and Contrast Fixes
**Business Requirement**: Fix white text on white background visibility issues
**Current Status**: 0% Complete
**Priority**: High

**Problem Description**:
Current catalog page design has white text on white background elements, making content difficult to read.

**Technical Requirements**:
- Target Files: `/src/app/catalog/` components and pages
- Color contrast improvements for better readability
- Typography adjustments for visibility
- Maintain brand color consistency (#5EB6AC, #2F333D)

**Acceptance Criteria**:
- [ ] White text on white background issues resolved
- [ ] WCAG AA contrast ratios maintained
- [ ] Brand color consistency preserved
- [ ] Mobile readability improved

#### 3.2 Product Box Layout Reorganization
**Business Requirement**: Reorganize product boxes and improve button layout
**Current Status**: 0% Complete
**Priority**: Medium

**Specific Requirements**:
- Fix sample/quote buttons to display on single line (icon above text)
- Reorder product boxes in specific sequence:
  1. 3방실 파우치 (Three-side seal pouch)
  2. 스탠드파우치 (Stand pouch)
  3. 가젯 파우치 (Box pouch) - 박스파우치
  4. 스파우트파우치 (Spout pouch)
  5. 롤 필름 (Roll film)

**Technical Requirements**:
- Target Files: Product catalog components
- Button layout restructuring for single-line display
- Product reordering in component data
- Responsive grid layout adjustments

**Acceptance Criteria**:
- [ ] Sample/quote buttons display on single line
- [ ] Product boxes ordered in specified sequence
- [ ] Mobile responsive layout maintained
- [ ] Interactive elements properly positioned

---

### Priority 4: Navigation Menu Updates

#### 4.1 Product Catalog Dropdown Modifications
**Business Requirement**: Update dropdown menu items in product catalog
**Current Status**: 0% Complete
**Priority**: Medium

**Specific Changes Required**:
- Remove: "ピローパウチ" (Pillow pouch)
- Remove: "自立チャック袋" (Self-standing zip bag)
- Add: "ロールフィルム" (Roll film)

**Technical Requirements**:
- Target Files: `/src/components/layout/Header.tsx`
- Dropdown menu item updates
- Maintain proper spacing and visual hierarchy
- Test all navigation interactions

**Acceptance Criteria**:
- [ ] Specified menu items removed from dropdown
- [ ] Roll film item properly added
- [ ] Menu functionality preserved
- [ ] Mobile responsive menu works correctly

---

### Priority 5: Service Flow Page Restructuring

#### 5.1 Complete Service Flow Reorganization
**Business Requirement**: Restructure service flow page with 4 new process stages
**Current Status**: 0% Complete
**Priority**: High

**Requirements**:
- Replace current 1-3 process images with 4 new processes
- Use images from `C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\images\process`
- Update content to match provided Japanese technical specifications
- Remove "製造工程を見学しませんか？" section

**Content Specifications**:
Based on provided Japanese content about:
1. Digital printing with HP Indigo 25000
2. Environmentally friendly manufacturing (NON-VOC, solvent-free)
3. High-precision processing (KARLVILLE SLIT-HS-Classic-1300)
4. Integrated production line advantages

**Technical Requirements**:
- Target Files: Service flow page components
- Image replacement and optimization
- Content translation and localization
- Section deletion and restructuring

**Acceptance Criteria**:
- [ ] Service flow page restructured with 4 new processes
- [ ] New process images properly integrated
- [ ] Japanese content properly localized
- [ ] "Manufacturing tour" section completely removed

---

### Priority 6: Quote System Integration

#### 6.1 Unified Quote System Implementation
**Business Requirement**: Consolidate quote functionality and enhance user input methods
**Current Status**: 0% Complete
**Priority**: High

**Requirements**:
- Merge quote-simulator/ design with roi-calculator/ functionality
- Enable both drag AND manual input for size settings
- Remove unit prices and setup fees from public display
- Create single, cohesive quote experience

**Technical Requirements**:
- Target Files: `/src/app/quote-simulator/`, `/src/app/roi-calculator/`
- Unified quote interface with dual input methods
- Backend API modifications for price hiding
- Enhanced UX for size selection
- Mobile-responsive quote interface

**Acceptance Criteria**:
- [ ] Single unified quote system implemented
- [ ] Both drag and manual input available for size parameters
- [ ] Unit prices and setup fees hidden from public users
- [ ] Mobile-optimized quote interface
- [ ] Real-time quote calculations working properly

---

### Priority 7: Post-Processing Preview Enhancement

#### 7.1 Integrated Preview System
**Business Requirement**: Enhance post-processing preview integration in quote system
**Current Status**: 0% Complete
**Priority**: Medium

**Requirements**:
- Show visual previews when customers select processing options
- Use images from `/images/post-processing/` folder
- Allow customers to understand processing results before and after selection
- Integrate seamlessly into quote workflow
- Enhanced preview visibility and interactivity

**Technical Requirements**:
- Target Files: Quote system components
- Dynamic preview system based on selection
- Tooltip/modal display for processing options
- Performance optimization for real-time updates
- Image optimization for web performance

**Acceptance Criteria**:
- [ ] Visual previews appear for processing selections
- [ ] All processing type images integrated
- [ ] Smooth interaction with tooltips/modals
- [ ] Mobile-responsive preview system
- [ ] Performance optimized (no lag on selection changes)

---

### Priority 8: Comprehensive UI/UX Review

#### 8.1 Global Design Consistency Check
**Business Requirement**: Review and improve visibility across all pages
**Current Status**: 0% Complete
**Priority**: Medium

**Requirements**:
- Conduct comprehensive UI design review using UI design agent
- Improve visibility and readability across all pages
- Ensure consistent design language
- Optimize color contrast and typography

**Technical Requirements**:
- Target Files: All page components and styles
- Color contrast analysis and improvements
- Typography optimization
- Responsive design verification
- Accessibility compliance checks

**Acceptance Criteria**:
- [ ] All pages reviewed for visibility issues
- [ ] Color contrast ratios meet WCAG standards
- [ ] Typography optimized for readability
- [ ] Consistent design language maintained
- [ ] Mobile responsiveness verified

---

## Technical Implementation Strategy

### Phase 1: Critical Content Updates (Immediate)
1. Homepage statistics and content modifications
2. Section deletions (ISO certification, company achievements)
3. Service flow page restructuring
4. Navigation menu updates

### Phase 2: Design and UX Improvements (Week 1)
1. Catalog page visibility fixes
2. Product box layout reorganization
3. Manufacturing process content updates
4. Global UI/UX review

### Phase 3: System Integration (Week 2)
1. Quote system unification
2. Post-processing preview enhancement
3. Testing and validation
4. Documentation updates

### Quality Assurance Requirements

### Testing Checklist:
- [ ] All content updates accurately implemented
- [ ] All specified sections properly removed
- [ ] Navigation functionality preserved
- [ ] Mobile responsiveness maintained
- [ ] Color contrast and visibility improved
- [ ] Quote system integration working
- [ ] Post-processing previews functional
- [ ] No broken links or 404 errors

### Performance Testing:
- [ ] Page load speed testing (before/after changes)
- [ ] Image optimization verification
- [ ] Mobile performance testing
- [ ] Cross-browser compatibility validation

### Accessibility Testing:
- [ ] WCAG 2.1 AA compliance verification
- [ ] Color contrast ratio testing
- [ ] Screen reader compatibility
- [ ] Keyboard navigation testing

---

## Implementation Notes

### Content Localization
- All Japanese content must be properly localized
- Maintain cultural appropriateness for Japanese market
- Ensure accurate translations and terminology

### Brand Consistency
- Maintain brand colors (#5EB6AC, #2F333D)
- Preserve visual identity consistency
- Ensure professional presentation

### Performance Considerations
- Optimize images for web performance
- Implement lazy loading where appropriate
- Monitor bundle size impact

### SEO Implications
- Update meta descriptions for removed content
- Implement proper redirects for deleted pages
- Maintain search engine optimization

---

## Conclusion

This comprehensive update addresses 13 major modification requirements focusing on content accuracy, user experience improvements, and system integration. The phased approach ensures systematic completion with minimal disruption to existing functionality.

**Expected Outcome**: Enhanced website with accurate content, improved user experience, integrated quote system, and maintained brand consistency.

**Success Metrics**:
- All modification requirements implemented
- User experience improvements measured
- System integration completed
- Performance standards maintained