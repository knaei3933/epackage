/**
 * Blog Post List Component
 *
 * Admin table component for displaying blog posts
 * with status badges, filters, and actions
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pencil, Eye, Trash2, MoreVertical, Search, Plus } from 'lucide-react';
import type { BlogPostListItem, BlogPostStatus, BlogCategoryId } from '@/lib/types/blog';
import { BLOG_POST_STATUS_LABELS, BLOG_CATEGORIES } from '@/lib/types/blog';

// ============================================================
// Status Badge Component
// ============================================================

function StatusBadge({ status }: { status: BlogPostStatus }) {
  const statusConfig = {
    draft: { variant: 'secondary' as const, label: BLOG_POST_STATUS_LABELS.draft.ja },
    review: { variant: 'default' as const, label: BLOG_POST_STATUS_LABELS.review.ja },
    published: { variant: 'default' as const, label: BLOG_POST_STATUS_LABELS.published.ja },
    archived: { variant: 'outline' as const, label: BLOG_POST_STATUS_LABELS.archived.ja },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={status === 'published' ? 'default' : status === 'draft' ? 'secondary' : 'outline'}>
      {config.label}
    </Badge>
  );
}

// ============================================================
// Category Badge Component
// ============================================================

function CategoryBadge({ categoryId }: { categoryId: BlogCategoryId }) {
  const category = BLOG_CATEGORIES.find(c => c.id === categoryId);
  return (
    <Badge variant="outline">
      {category?.name_ja || categoryId}
    </Badge>
  );
}

// ============================================================
// Props
// ============================================================

interface BlogPostListProps {
  initialPosts?: BlogPostListItem[];
  initialTotal?: number;
}

// ============================================================
// Main Component
// ============================================================

export function BlogPostList({ initialPosts = [], initialTotal = 0 }: BlogPostListProps) {
  const [posts, setPosts] = useState<BlogPostListItem[]>(initialPosts);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch posts
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/admin/blog?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`「${title}」をアーカイブしてもよろしいですか？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh list
        fetchPosts();
      } else {
        const data = await response.json();
        alert(data.error || '削除に失敗しました。');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('削除に失敗しました。');
    }
  };

  // Fetch on filter change
  useEffect(() => {
    setPage(1);
    fetchPosts();
  }, [statusFilter, categoryFilter]);

  // Fetch on page change
  useEffect(() => {
    fetchPosts();
  }, [page]);

  // Handle search
  const handleSearch = () => {
    setPage(1);
    fetchPosts();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">ブログ記事管理</h2>
          <p className="text-muted-foreground">
            全 {total} 件の記事
          </p>
        </div>
        <Link href="/admin/blog/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新規作成
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="タイトル・本文を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-64"
          />
          <Button size="icon" variant="outline" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'すべて' },
            { value: 'draft', label: '下書き' },
            { value: 'review', label: 'レビュー中' },
            { value: 'published', label: '公開済み' },
            { value: 'archived', label: 'アーカイブ' },
          ]}
          placeholder="ステータス"
          size="md"
          className="w-40"
        />

        {/* Category Filter */}
        <Select
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={[
            { value: 'all', label: 'すべて' },
            ...BLOG_CATEGORIES.map((cat) => ({ value: cat.id, label: cat.name_ja })),
          ]}
          placeholder="カテゴリ"
          size="md"
          className="w-40"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>タイトル</TableHead>
              <TableHead>カテゴリ</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>作成者</TableHead>
              <TableHead>公開日</TableHead>
              <TableHead>閲覧数</TableHead>
              <TableHead className="text-right">アクション</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  記事がありません
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="max-w-md">
                      <p className="font-medium truncate">{post.title}</p>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground truncate">{post.excerpt}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <CategoryBadge categoryId={post.category} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={post.status} />
                  </TableCell>
                  <TableCell>{post.author?.name || '-'}</TableCell>
                  <TableCell>
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString('ja-JP')
                      : '-'}
                  </TableCell>
                  <TableCell>{post.view_count.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/blog/${post.id}`} className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" />
                            編集
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/blog/${post.slug}`} target="_blank" className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            プレビュー
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(post.id, post.title)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          アーカイブ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {Math.min((page - 1) * limit + 1, total)} - {Math.min(page * limit, total)} 件 / 全 {total} 件
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              前へ
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              次へ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
