/**
 * RSS Feed Types
 *
 * Type definitions for RSS 2.0 feed generation
 */

export interface RSSFeed {
  title: string
  link: string
  description: string
  language: string
  lastBuildDate: string
  items: RSSItem[]
}

export interface RSSItem {
  title: string
  link: string
  guid: string
  description: string
  content: string
  pubDate: string
  author: string
  category: string
  tags?: string[]
}
