/**
 * Blog Image Processing Utilities
 *
 * Handles image optimization, WebP conversion,
 * and Supabase Storage upload for blog images.
 */

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import type {
  ImageOptimizeOptions,
  OptimizedImage,
  ResponsiveImageVariant,
} from '@/types/blog';

/**
 * Blog images directory
 */
const BLOG_IMAGES_DIR = path.join(process.cwd(), 'src/content/blog/images');

/**
 * Supabase storage bucket name for blog images
 */
const BLOG_IMAGES_BUCKET = 'blog-images';

/**
 * Default optimization options
 */
const DEFAULT_OPTIONS: ImageOptimizeOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 85,
  convertToWebP: true,
  generateSizes: true,
  sizes: [640, 768, 1024, 1280, 1920],
};

/**
 * Optimize a single image
 */
export async function optimizeImage(
  imagePath: string,
  options: ImageOptimizeOptions = {}
): Promise<OptimizedImage> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const fullPath = path.resolve(imagePath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Image not found: ${imagePath}`);
  }

  // Get image metadata
  const metadata = await sharp(fullPath).metadata();
  const originalFormat = metadata.format || 'jpg';
  const originalWidth = metadata.width || 0;
  const originalHeight = metadata.height || 0;

  // Calculate new dimensions (maintain aspect ratio)
  const { width, height } = calculateDimensions(
    originalWidth,
    originalHeight,
    opts.maxWidth!,
    opts.maxHeight!
  );

  // Prepare output path
  const parsedPath = path.parse(fullPath);
  const outputFormat = opts.convertToWebP ? 'webp' : originalFormat;
  const outputPath = path.join(
    parsedPath.dir,
    `${parsedPath.name}-optimized.${outputFormat}`
  );

  // Process main image
  let processor = sharp(fullPath).resize(width, height, {
    fit: 'inside',
    withoutEnlargement: true,
  });

  // Convert format if needed
  if (opts.convertToWebP && originalFormat !== 'webp') {
    processor = processor.webp({ quality: opts.quality });
  } else if (originalFormat === 'jpeg' || originalFormat === 'jpg') {
    processor = processor.jpeg({ quality: opts.quality });
  } else if (originalFormat === 'png') {
    processor = processor.png({ quality: opts.quality });
  }

  await processor.toFile(outputPath);

  // Get file size
  const stats = fs.statSync(outputPath);

  // Generate responsive variants
  const variants: ResponsiveImageVariant[] = [];
  if (opts.generateSizes && opts.sizes) {
    for (const size of opts.sizes) {
      if (size < originalWidth) {
        const variant = await createVariant(fullPath, size, outputFormat, opts.quality!);
        variants.push(variant);
      }
    }
  }

  // Generate blurhash (placeholder)
  const blurhash = await generateBlurhash(fullPath);

  return {
    originalPath: imagePath,
    optimizedPath: outputPath,
    width,
    height,
    format: outputFormat,
    size: stats.size,
    blurhash,
    variants,
  };
}

/**
 * Create a responsive image variant
 */
async function createVariant(
  imagePath: string,
  targetWidth: number,
  format: string,
  quality: number
): Promise<ResponsiveImageVariant> {
  const metadata = await sharp(imagePath).metadata();
  const originalWidth = metadata.width || 1;
  const originalHeight = metadata.height || 1;
  const aspectRatio = originalWidth / originalHeight;
  const targetHeight = Math.round(targetWidth / aspectRatio);

  const parsedPath = path.parse(imagePath);
  const outputPath = path.join(
    parsedPath.dir,
    `${parsedPath.name}-${targetWidth}w.${format}`
  );

  let processor = sharp(imagePath).resize(targetWidth, targetHeight, {
    fit: 'inside',
    withoutEnlargement: true,
  });

  if (format === 'webp') {
    processor = processor.webp({ quality });
  } else if (format === 'jpeg' || format === 'jpg') {
    processor = processor.jpeg({ quality });
  } else if (format === 'png') {
    processor = processor.png({ quality });
  }

  await processor.toFile(outputPath);

  const stats = fs.statSync(outputPath);

  return {
    width: targetWidth,
    height: targetHeight,
    path: outputPath,
    size: stats.size,
  };
}

/**
 * Calculate dimensions maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth) {
    width = maxWidth;
    height = Math.round(width / aspectRatio);
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = Math.round(height * aspectRatio);
  }

  return { width, height };
}

/**
 * Generate blurhash for placeholder
 * Note: This is a simplified version. For production, use the blurhash package
 */
async function generateBlurhash(imagePath: string): Promise<string | undefined> {
  try {
    // Generate a small base64 thumbnail for placeholder
    const buffer = await sharp(imagePath)
      .resize(20, 20, { fit: 'cover' })
      .webp({ quality: 50 })
      .toBuffer();

    return `data:image/webp;base64,${buffer.toString('base64')}`;
  } catch {
    return undefined;
  }
}

/**
 * Optimize all images in the blog images directory
 */
export async function optimizeAllImages(
  options: ImageOptimizeOptions = {}
): Promise<OptimizedImage[]> {
  const results: OptimizedImage[] = [];

  if (!fs.existsSync(BLOG_IMAGES_DIR)) {
    return results;
  }

  const imageFiles = getImageFiles(BLOG_IMAGES_DIR);

  for (const file of imageFiles) {
    try {
      const result = await optimizeImage(file, options);
      results.push(result);
    } catch (error) {
      console.error(`Failed to optimize ${file}:`, error);
    }
  }

  return results;
}

/**
 * Get all image files from a directory
 */
function getImageFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getImageFiles(fullPath));
    } else if (isImageFile(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Check if file is an image
 */
function isImageFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'].includes(ext);
}

/**
 * Upload optimized image to Supabase Storage
 */
export async function uploadToSupabase(
  optimizedImage: OptimizedImage,
  supabaseUrl: string,
  supabaseKey: string
): Promise<string> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Ensure bucket exists
  await ensureBucketExists(supabase);

  // Read file
  const fileBuffer = fs.readFileSync(optimizedImage.optimizedPath);
  const fileName = path.basename(optimizedImage.optimizedPath);

  // Upload to Supabase
  const { data, error } = await supabase.storage
    .from(BLOG_IMAGES_BUCKET)
    .upload(fileName, fileBuffer, {
      contentType: `image/${optimizedImage.format}`,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload to Supabase: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BLOG_IMAGES_BUCKET)
    .getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Upload responsive variants to Supabase
 */
export async function uploadVariantsToSupabase(
  optimizedImage: OptimizedImage,
  supabaseUrl: string,
  supabaseKey: string
): Promise<void> {
  if (!optimizedImage.variants) {
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  for (const variant of optimizedImage.variants) {
    const fileBuffer = fs.readFileSync(variant.path);
    const fileName = path.basename(variant.path);

    await supabase.storage
      .from(BLOG_IMAGES_BUCKET)
      .upload(fileName, fileBuffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BLOG_IMAGES_BUCKET)
      .getPublicUrl(fileName);

    variant.storageUrl = publicUrl;
  }

  // Also update main image URL
  if (optimizedImage.optimizedPath) {
    const mainFileName = path.basename(optimizedImage.optimizedPath);
    const { data: { publicUrl } } = supabase.storage
      .from(BLOG_IMAGES_BUCKET)
      .getPublicUrl(mainFileName);

    optimizedImage.storageUrl = publicUrl;
  }
}

/**
 * Ensure Supabase bucket exists
 */
async function ensureBucketExists(supabase: ReturnType<typeof createClient>): Promise<void> {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === BLOG_IMAGES_BUCKET);

  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(BLOG_IMAGES_BUCKET, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/*'],
    });

    if (error) {
      throw new Error(`Failed to create bucket: ${error.message}`);
    }
  }
}

/**
 * Get image statistics
 */
export function getImageStats(): {
  total: number;
  byFormat: Record<string, number>;
  totalSize: number;
  largestFile: { path: string; size: number } | null;
} {
  const files = getImageFiles(BLOG_IMAGES_DIR);
  const stats = {
    total: files.length,
    byFormat: {} as Record<string, number>,
    totalSize: 0,
    largestFile: null as { path: string; size: number } | null,
  };

  let maxSize = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    stats.byFormat[ext] = (stats.byFormat[ext] || 0) + 1;

    const fileSize = fs.statSync(file).size;
    stats.totalSize += fileSize;

    if (fileSize > maxSize) {
      maxSize = fileSize;
      stats.largestFile = { path: file, size: fileSize };
    }
  }

  return stats;
}

/**
 * Clean up optimized images
 */
export function cleanupOptimizedImages(): void {
  const files = getImageFiles(BLOG_IMAGES_DIR);

  for (const file of files) {
    if (file.includes('-optimized.') || file.includes('-640w.') ||
        file.includes('-768w.') || file.includes('-1024w.') ||
        file.includes('-1280w.') || file.includes('-1920w.')) {
      try {
        fs.unlinkSync(file);
      } catch (error) {
        console.warn(`Failed to delete ${file}:`, error);
      }
    }
  }
}

/**
 * Generate responsive image srcset attribute
 */
export function generateSrcset(variants: ResponsiveImageVariant[]): string {
  return variants
    .map(v => `${v.storageUrl || v.path} ${v.width}w`)
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(): string {
  return '(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 1920px';
}
