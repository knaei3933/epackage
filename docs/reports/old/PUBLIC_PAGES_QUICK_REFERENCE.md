# Public Pages Quick Reference
**Last Updated**: 2025-01-05

---

## Page URLs

```
/archives          - Portfolio/Projects showcase
/news              - News articles listing
/premium-content   - Premium downloadable resources
```

---

## Component Architecture

### Archives Page
```
page.tsx (Server Component)
  └─> ArchivePage.tsx (Client Component)
       ├─> ArchiveFilters.tsx
       ├─> SearchBar.tsx
       ├─> ArchiveGrid.tsx
       │    └─> ProjectCard
       ├─> Pagination.tsx
       └─> ArchiveDetailModal.tsx
```

### News Page
```
page.tsx (Server Component)
  └─> NewsClient.tsx (Client Component)
       └─> NewsCard (inline)
```

### Premium Content Page
```
page.tsx (Server Component - but uses client components)
  └─> PremiumContentSection.tsx (Client Component)
       └─> DownloadModal (inline)
```

---

## Data Structures

### Archive Project
```typescript
interface TradeRecord {
  id: string
  title: string
  clientName: string
  industry: 'cosmetics' | 'food' | 'pharmaceutical' | 'retail'
  projectType: string
  description: string
  technicalSpec: string
  results: string[]
  images: Array<{
    id: string
    url: string
    alt: string
    isMain: boolean
    sortOrder: number
  }>
  startDate: string
  endDate: string
  featured: boolean
  sortOrder: number
  tags: string[]
  createdAt: string
  updatedAt: string
}
```

### News Article
```typescript
interface NewsArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  authorRole?: string
  publishedAt: string
  updatedAt: string
  category: 'pouch-product' | 'pouch-case' | 'pouch-industry' | 'pouch-technology'
  tags: string[]
  featured: boolean
  imageUrl?: string
  readTime: number
  views: number
}
```

### Premium Content
```typescript
interface PremiumContent {
  id: string
  title: string
  description: string
  category: string
  fileSize: string
  pageCount: number
  format: string
  thumbnail: string
  featured: boolean
  tags: string[]
  leadScore: number // 1-10
}
```

---

## API Endpoints

### Premium Content Download
```
POST /api/premium-content/download
Content-Type: application/json

Request:
{
  "name": "山田 太郎",
  "company": "株式会社サンプル",
  "email": "example@company.com",
  "phone": "03-1234-5678",
  "industry": "food",
  "role": "manager",
  "contentId": "japan-market-report-2024",
  "consent": true,
  "newsletter": true
}

Response (200 OK):
{
  "success": true,
  "message": "ダウンロード情報を登録しました",
  "downloadUrl": "/api/premium-content/files/japan-market-report-2024",
  "contentId": "japan-market-report-2024"
}

Error (400 Bad Request):
{
  "error": "入力内容を確認してください",
  "details": "..."
}

Error (500 Server Error):
{
  "error": "ダウンロードの処理中にエラーが発生しました",
  "message": "しばらくしてからもう一度お試しください"
}
```

### Download Statistics (Admin)
```
GET /api/premium-content/download?contentId=japan-market-report-2024

Response:
{
  "contentId": "japan-market-report-2024",
  "totalDownloads": 150,
  "downloads": [...]
}
```

---

## Database Schema

### premium_downloads Table
```sql
CREATE TABLE premium_downloads (
  id UUID PRIMARY KEY,
  content_id TEXT NOT NULL,
  content_title TEXT,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  industry TEXT NOT NULL,
  role TEXT NOT NULL,
  consent BOOLEAN NOT NULL,
  newsletter BOOLEAN DEFAULT FALSE,
  lead_score INTEGER DEFAULT 5,
  contacted BOOLEAN DEFAULT FALSE,
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Key Indexes
- `idx_premium_downloads_content_id`
- `idx_premium_downloads_email`
- `idx_premium_downloads_industry`
- `idx_premium_downloads_role`
- `idx_premium_downloads_downloaded_at`
- `idx_premium_downloads_lead_score`
- `idx_premium_downloads_contacted`

### Views
```sql
-- Download statistics
CREATE VIEW premium_download_stats AS
SELECT
  content_id,
  content_title,
  COUNT(*) as total_downloads,
  COUNT(DISTINCT email) as unique_downloads,
  AVG(lead_score) as avg_lead_score,
  COUNT(*) FILTER (WHERE newsletter = TRUE) as newsletter_signups,
  COUNT(*) FILTER (WHERE contacted = FALSE) as pending_followups,
  MAX(downloaded_at) as last_download_at
FROM premium_downloads
GROUP BY content_id, content_title;
```

### Functions
```sql
-- Get high-priority leads (score >= 8)
get_high_priority_leads(min_score INTEGER DEFAULT 8)
RETURNS TABLE (...)

-- Auto-calculate lead score on insert
calculate_lead_score()
RETURNS TRIGGER
```

---

## Lead Scoring Logic

Automatic scoring (1-10 scale):
- **Base score**: 5 points
- **+1**: Phone number provided
- **+1**: Company name provided
- **+1**: Newsletter opt-in
- **+1**: Target industry (food, cosmetics, medical)
- **+1**: Decision maker role (president, manager)

Maximum score: 10

---

## UI Components Used

```typescript
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
```

### Icon Library
```typescript
import {
  Package,
  Calendar,
  User,
  Tag,
  Search,
  Clock,
  ArrowRight,
  Download,
  FileText,
  Calculator,
  TrendingUp,
  Shield,
  Leaf,
  CheckCircle
} from 'lucide-react'
```

---

## Color Scheme

```css
/* Primary Colors */
--brixa-primary: #5EB6AC
--brixa-primary-600: #3A827B
--brixa-primary-700: #2D6C65

/* Secondary Navy */
--brixa-secondary: #2F333D

/* Semantic Colors */
--success-500: #10B981
--warning-500: #F59E0B
--error-500: #EF4444
--info-500: #3B82F6
```

---

## Form Validation Rules

### Premium Content Download Form
```typescript
{
  name: string (2-50 chars, required)
  company: string (max 100 chars, optional)
  email: email format (required)
  phone: Japanese phone format (optional)
  industry: enum (required)
  role: enum (required)
  consent: boolean (must be true)
  newsletter: boolean (optional)
}

Industry Options:
- food, cosmetics, medical, retail, electronics,
  agriculture, chemical, automotive, other

Role Options:
- president, manager, engineer, purchasing, marketing, other
```

---

## Mock Data Locations

### Archives
File: `src/components/archives/ArchivePage.tsx`
Variable: `sampleRecords`
Count: 6+ projects

### News
File: `src/app/news/NewsClient.tsx`
Variable: `samplePouchNews`
Count: 8 articles

### Premium Content
File: `src/types/premium-content.ts`
Variable: `premiumContents`
Count: 5 resources

---

## SEO Metadata Examples

### Archives Page
```typescript
{
  title: "パウチ導入実績 | Epackage Lab",
  description: "Epackage Labのパウチ包装導入実績と成功事例...",
  keywords: ["パウチ導入実績", "パウチ成功事例", ...]
}
```

### News Page
```typescript
{
  title: "パウチ包装ニュース | Epackage Lab",
  description: "Epackage Labのパウチ包装に関する最新ニュース...",
  keywords: ["パウチニュース", "連包裝材", ...]
}
```

### Premium Content Page
```typescript
{
  title: "プレミアムコンテンツ | Epackage Lab",
  description: "日本パウチ包装市場レポート、ROI計算テンプレート...",
  keywords: ["パウチ市場レポート", "ROI計算", ...]
}
```

---

## Common Tasks

### Add New Archive Project
```typescript
// Edit: src/components/archives/ArchivePage.tsx
// Add to sampleRecords array:
{
  id: "pouch-XXX",
  title: "プロジェクト名",
  clientName: "クライアント名",
  industry: "food", // or cosmetics, pharmaceutical, retail
  // ... rest of fields
}
```

### Add New Article
```typescript
// Edit: src/app/news/NewsClient.tsx
// Add to samplePouchNews array:
{
  id: "news-XXX",
  title: "記事タイトル",
  category: "pouch-product", // or pouch-case, pouch-industry, pouch-technology
  // ... rest of fields
}
```

### Add Premium Content
```typescript
// Edit: src/types/premium-content.ts
// Add to premiumContents array:
{
  id: "content-XXX",
  title: "コンテンツ名",
  category: "市場レポート", // or コスト計算, 技術資料, etc.
  // ... rest of fields
}
```

---

## Testing Commands

```bash
# Run development server
npm run dev

# Visit pages
http://localhost:3000/archives
http://localhost:3000/news
http://localhost:3000/premium-content

# Test API endpoint
curl -X POST http://localhost:3000/api/premium-content/download \
  -H "Content-Type: application/json" \
  -d '{...}'

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

---

## Deployment Checklist

- [ ] Apply database migration (`supabase db push`)
- [ ] Verify RLS policies in Supabase dashboard
- [ ] Upload premium files to Supabase Storage
- [ ] Configure SendGrid for email notifications
- [ ] Test API endpoint with real data
- [ ] Verify SEO metadata on staging
- [ ] Test form submissions end-to-end
- [ ] Check responsive design on mobile devices
- [ ] Run Lighthouse audit
- [ ] Set up analytics tracking

---

## File Locations Summary

```
Pages:
  src/app/archives/page.tsx
  src/app/news/page.tsx
  src/app/premium-content/page.tsx

Components:
  src/components/archives/
  src/components/premium-content/

API:
  src/app/api/premium-content/download/route.ts

Types:
  src/types/premium-content.ts

Database:
  supabase/migrations/20250105_premium_downloads_table.sql

Documentation:
  docs/PUBLIC_PAGES_IMPLEMENTATION_REPORT.md
  docs/PUBLIC_PAGES_COMPLETION_SUMMARY.md
  docs/PUBLIC_PAGES_QUICK_REFERENCE.md (this file)
```

---

## Support & Troubleshooting

### Common Issues

**Issue**: Form submission fails
- Check: Supabase connection string
- Check: RLS policies allow inserts
- Check: Required fields are filled

**Issue**: Images not displaying
- Check: Image files exist in `/public/images/`
- Check: File paths are correct
- Check: Image file permissions

**Issue**: Filters not working
- Check: Console for JavaScript errors
- Check: Mock data is loaded
- Check: Filter state updates

### Debug Tips

```typescript
// Enable React DevTools
// Add console.log for filter changes
useEffect(() => {
  console.log('Filter changed:', { selectedCategory, searchTerm })
}, [selectedCategory, searchTerm])

// Check mock data loading
useEffect(() => {
  console.log('Articles loaded:', articles.length)
}, [articles])
```

---

## Contact & Support

For questions or issues:
- Check documentation in `/docs` folder
- Review TypeScript types in `/src/types`
- Examine similar components for patterns
- Test with mock data before integrating database

---

**Last Updated**: 2025-01-05
**Maintained By**: Frontend Development Team
