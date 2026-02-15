<!-- Generated: 2026-02-08 | Updated: 2026-02-08 -->
<!-- Parent: ../AGENTS.md -->

# public/ - Static Assets Directory

## Purpose
This directory contains all static assets served directly by Next.js, including images, templates, catalogs, videos, and Web Workers. Files in this directory are publicly accessible via the root URL path (`/`).

## Key Files

| File | Description |
|------|-------------|
| `favicon-16x16.png` | Small favicon (16x16) for browser tabs |
| `favicon-32x32.png` | Standard favicon (32x32) for modern browsers |
| `logo.svg` | Main EpackageLab logo (vector) |
| `vercel.svg` | Vercel deployment badge |
| `next.svg` | Next.js branding icon |
| `file.svg`, `globe.svg`, `window.svg` | UI icons for interface elements |
| `robots.txt` | Search engine crawler directives (if present) |
| `sitemap.xml` | SEO sitemap (generated) |

## Subdirectories

### `catalog/`
Product catalog downloads.

| File | Description |
|------|-------------|
| `EpackageLab_Catalog.pdf` | Main product catalog PDF |

### `downloads/`
Reserved for downloadable customer resources (currently empty, planned for price sheets, brochures).

### `images/`
Static image assets organized by purpose.

#### Root Images
- `epackage-lab-logo.png` - Company logo
- `hero-manufacturing-facility.{png,webp}` - Manufacturing facility hero image
- `hero-packaging-closeup.{png,webp}` - Packaging closeup hero image
- `og-image.jpg` - Open Graph image for social sharing
- `stand-pouch-real.jpg`, `sambangjil-real.jpg`, `m-bang-real.jpg` - Product photography
- `material-*.jpg` - Material samples (PET, NY, Kraft)
- `option-*.jpg` - Option images (valve, window, zipper)
- `cut.png`, `print.png`, `pouch.png`, `rami.png` - Process icons

#### Subdirectories

| Directory | Purpose |
|-----------|---------|
| `about/` | About page images (factory photos, posters) |
| `archives/` | Historical product archive images |
| `cases/` | Case study images |
| `flow/` | Production flow diagrams (process-1 through process-4) |
| `inbound-data/` | Adobe Illustrator files for data ingestion |
| `main/` | Main page images |
| `portfolio/` | Portfolio/project showcase images |
| `post-processing/` | Post-processing option illustrations (sealing, zipper, finishing) |
| `process/` - Process step images (process-01 through process-04) |
| `processing-icons/` | UI icons for processing options |
| `products/` | Product category images (stand pouch, gusset, spout, etc.) |
| `real-products/` | Real product photography |

### `templates/`
Design template files for customer downloads.

| File | Description |
|------|-------------|
| `README.md` | Template documentation |
| `quotation-epackage-lab.xlsx` | Quotation Excel template |
| `template-flat_3_side.ai` | Three-side seal pouch template |
| `template-stand_up.ai` - Stand-up pouch template |
| `template-box.ai` | Box pouch template |
| `template-spout_pouch.ai` | Spout pouch template |
| `template-roll_film.ai` | Roll film template |

**Categories:**
- `flat_3_side` - Three-side seal pouch
- `stand_up` - Stand-up pouch
- `box` - Box-type pouch
- `spout_pouch` - Spout pouch
- `roll_film` - Roll film

### `videos/`
Video assets for the website.

| Directory | Purpose |
|-----------|---------|
| `about/` | About page videos (epackage-intro.{mp4,webm}) |

### `workers/`
Web Workers for background processing.

| File | Purpose |
|------|---------|
| `calculator.worker.js` | Multi-quantity calculator worker (prevents UI blocking) |

**Worker API:**
- `CALCULATE_BATCH` - Batch quote calculations for multiple quantities
- `CALCULATE_COMPARISON` - Compare prices across quantities
- `GENERATE_RECOMMENDATIONS` - Generate quantity recommendations

## For AI Agents

### Working In This Directory

**Static Asset Rules:**
- All files are publicly accessible at `/filename` or `/directory/filename`
- No authentication required for access
- Files are served directly by Next.js static file serving
- Images should be optimized (WebP format preferred for photos)

**Adding New Assets:**
- Images: Place in appropriate `images/` subdirectory
- Templates: Add `.ai` files to `templates/` and update `templates/README.md`
- Catalogs: Add PDF files to `catalog/`
- Videos: Add to `videos/` with appropriate subdirectory

**File Naming Conventions:**
- Use lowercase with hyphens for new files: `my-product-image.jpg`
- Japanese filenames are preserved for existing assets
- WebP format preferred for photos (keep PNG for transparent graphics)

**Image Optimization:**
- Use WebP format for photos (`.webp`)
- Keep PNG for transparent graphics
- Provide fallbacks (`.jpg` + `.webp`) for browser compatibility
- Consider next/image component for automatic optimization

### Asset Usage in Code

**Importing Assets:**
```typescript
// For Next.js Image component
import Image from 'next/image';
import heroImage from '@/public/images/hero-packaging-closeup.webp';

<Image src={heroImage} alt="Packaging" />

// Direct path reference (not recommended for performance)
<img src="/images/hero-packaging-closeup.webp" alt="Packaging" />
```

**Worker Usage:**
```typescript
const worker = new Worker('/workers/calculator.worker.js');
worker.postMessage({ type: 'CALCULATE_BATCH', payload: { ... } });
```

### Dependencies

**Internal:**
- `src/lib/pricing/` - Pricing engine used by calculator worker
- `src/components/` - Components that reference these assets

**External:**
- None (static assets only)

## Special Notes

**Post-Processing Images:**
Japanese filenames indicate processing options (ジッパー=Zipper, 光沢=Glossy, マット=Matte, etc.)

**Template Files:**
Adobe Illustrator (`.ai`) files require vector graphics editor for modification.

**Worker Security:**
Calculator worker runs in browser context - ensure no sensitive data processing.

<!-- MANUAL: Add new asset directories or special file handling instructions here -->
