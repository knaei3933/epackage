/**
 * RSS Feed Route for Blog
 *
 * Returns RSS 2.0 feed with latest 20 published posts
 * Route: /blog/rss.xml
 */

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { RSSFeed } from '@/types/rss'

// Site configuration
const SITE_URL = 'https://package-lab.com'
const BLOG_TITLE = 'EPackage Lab ブログ'
const BLOG_DESCRIPTION = '包装資材・印刷の最新情報と技術情報をお届けします'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Generate RSS 2.0 feed
 */
export async function GET() {
  const supabase = createServiceClient()

  try {
    // Fetch latest 20 published posts
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        content,
        category,
        tags,
        published_at,
        updated_at,
        author:profiles!blog_posts_author_id_fkey(
          email,
          kanji_last_name,
          kanji_first_name
        )
      `)
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('[RSS Feed] Error fetching posts:', error)
      return new NextResponse('Failed to generate RSS feed', { status: 500 })
    }

    // Get the latest post date for lastBuildDate
    const latestPost = posts?.[0]
    const lastBuildDate = latestPost?.published_at
      ? new Date(latestPost.published_at).toUTCString()
      : new Date().toUTCString()

    // Generate RSS XML
    const rssXml = generateRSSXml(posts || [], lastBuildDate)

    // Return RSS with proper content type
    return new NextResponse(rssXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('[RSS Feed] Unexpected error:', error)
    return new NextResponse('Failed to generate RSS feed', { status: 500 })
  }
}

/**
 * Generate RSS 2.0 XML string
 */
function generateRSSXml(posts: any[], lastBuildDate: string): string {
  const items = posts
    .map((post) => generateRSSItem(post, SITE_URL))
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(BLOG_TITLE)}</title>
    <link>${SITE_URL}/blog</link>
    <description>${escapeXml(BLOG_DESCRIPTION)}</description>
    <language>ja</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml"/>
${items  }
  </channel>
</rss>`
}

/**
 * Generate RSS item XML for a single post
 */
function generateRSSItem(post: any, siteUrl: string): string {
  const postUrl = `${siteUrl}/blog/${post.slug}`
  const pubDate = post.published_at
    ? new Date(post.published_at).toUTCString()
    : new Date().toUTCString()

  // Get author email or name
  const authorEmail = post.author?.email || 'noreply@package-lab.com'
  const authorName = post.author
    ? `${post.author.kanji_last_name} ${post.author.kanji_first_name}`
    : 'EPackage Lab'

  // Get excerpt or truncate content
  const description = post.excerpt || truncateText(stripMarkdown(post.content), 200)

  // Get category name in Japanese
  const categoryNames: Record<string, string> = {
    news: 'ニュース',
    technical: '技術情報',
    industry: '業界情報',
    company: '会社情報',
  }
  const categoryName = categoryNames[post.category] || post.category

  // Generate tags as categories
  const tagCategories = post.tags
    ? post.tags
        .map((tag: string) => `      <category>${escapeXml(tag)}</category>`)
        .join('\n')
    : ''

  return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(description)}</description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
      <author>${authorEmail} (${escapeXml(authorName)})</author>
      <category>${escapeXml(categoryName)}</category>
${tagCategories ? tagCategories + '\n' : ''}    </item>`
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Strip markdown syntax for plain text preview
 */
function stripMarkdown(markdown: string): string {
  return markdown
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic
    .replace(/\*\*\*/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/___/g, '')
    .replace(/__/g, '')
    .replace(/_/g, '')
    // Remove links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Truncate text to specified length
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}
