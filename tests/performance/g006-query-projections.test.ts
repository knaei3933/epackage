import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(__dirname, '../..');

function source(path: string): string {
  return readFileSync(resolve(repoRoot, path), 'utf8');
}

function compact(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function expectProjectedProperty(source: string, field: string): void {
  expect(source).toMatch(new RegExp(`(?:^|\\n)\\s*${field}\\s*[?:]`));
}

const narrowPages = [
  'src/app/admin/blog/page.tsx',
  'src/app/admin/customers/orders/page.tsx',
  'src/app/admin/customers/profile/page.tsx',
  'src/app/admin/orders/page.tsx',
  'src/app/designer-order/[token]/page.tsx',
  'src/app/designer/orders/[id]/page.tsx',
  'src/app/upload/[token]/page.tsx',
] as const;

describe('G006 query projection and access behavior', () => {
  it('uses exact consumed columns and retains admin blog count, order, and page window', () => {
    const page = source('src/app/admin/blog/page.tsx');
    expect(page).toContain(
      "'id, title, slug, excerpt, category, status, author_id, published_at, created_at, view_count'",
    );
    expect(page).toContain("{ count: 'exact' }");
    expect(page).toContain(".order('created_at', { ascending: false })");
    expect(page).toContain('.range(0, 19)');
    expect(page).toContain(".in('id', authorIds)");
    expect(page).toContain("'id, kanji_last_name, kanji_first_name, company_name'");
  });

  it('retains customer-order filters and sorting while projecting consumed fields', () => {
    const page = source('src/app/admin/customers/orders/page.tsx');
    expect(page).toContain(
      "'id, order_number, customer_name, status, total_amount, created_at'",
    );
    expect(page).toContain(".order('created_at', { ascending: false })");
    expect(page).toContain(".eq('status', searchParams.status as OrderStatus)");
    expect(page).toContain(
      ".or(`order_number.ilike.%${searchParams.search}%,customer_name.ilike.%${searchParams.search}%`)",
    );
    expect(page).toContain('key={order.id}');
    expect(page).toContain('<OrderSummaryCard key={order.id} order={order} />');
  });

  it('retains user-scoped profile reads/updates and exact profile/company display fields', () => {
    const page = source('src/app/admin/customers/profile/page.tsx');
    expect(compact(page)).toContain(compact(
      'id, email, kanji_last_name, kanji_first_name, kana_last_name, kana_first_name, business_type, corporate_phone, personal_phone, company_name, position, department, company_url, postal_code, prefecture, city, street, building',
    ));
    expect(compact(page)).toContain(compact(".select('corporate_number, industry')"));
    expect(page).toContain(".eq('id', context.userId)");
    expect(page.match(/\.eq\('id', context\.userId\)/g)).toHaveLength(3);
    expect(page).toContain('id: profile.id');
    expect(page).toContain('company.corporate_number');
    expect(page).toContain('company.industry');
  });

  it('retains admin-order authorization context, filters, sorting, and client fields', () => {
    const page = source('src/app/admin/orders/page.tsx');
    const client = source('src/app/admin/orders/AdminOrdersClient.tsx');
    expect(page).toContain(
      "'id, order_number, customer_name, customer_email, status, total_amount, created_at'",
    );
    expect(page).toContain(".order('created_at', { ascending: false })");
    expect(page).toContain(".eq('status', initialStatus as OrderStatus)");
    expect(page).toContain(".eq('quotation_id', quotationId)");
    expect(page).toContain("await getAdminAuth(['order:read']");
    for (const field of [
      'id', 'order_number', 'customer_name', 'customer_email', 'status', 'total_amount', 'created_at',
    ]) {
      expectProjectedProperty(client, field);
    }
  });

  it('projects token-scoped designer assignment data without changing token or order scoping', () => {
    const page = source('src/app/designer-order/[token]/page.tsx');
    const client = source('src/app/designer-order/[token]/DesignerOrderTokenClient.tsx');
    expect(compact(page)).toContain(compact(
      'id, status, order_id, assigned_at, completed_at, last_accessed_at, access_token_expires_at, orders ( id, order_number, customer_name, status, created_at )',
    ));
    expect(page).toContain(".eq('access_token_hash', tokenHash)");
    expect(page).toContain(".eq('order_id', order.id)");
    expect(page).toContain(".eq('order_id', assignmentData.order_id)");
    expect(page).toContain(".eq('uploaded_by_type', 'korea_designer')");
    expect(page).toContain(".eq('file_type', 'upload')");
    expect(page).toContain(".order('revision_number', { ascending: false })");
    expect(page).toContain(".order('uploaded_at', { ascending: false })");
    for (const field of [
      'product_name', 'quantity', 'sku_name', 'specifications',
      'revision_number', 'order_item_id', 'approval_status',
    ]) {
      expectProjectedProperty(client, field);
    }
  });

  it('projects designer-order revisions and preserves auth-selected client access', () => {
    const page = source('src/app/designer/orders/[id]/page.tsx');
    const client = source('src/app/designer/DesignerOrderDetailClient.tsx');
    expect(compact(page)).toContain(compact(
      'id, order_item_id, revision_number, approval_status, partner_comment, preview_image_url, original_file_url, created_at',
    ));
    expect(page).toContain(".eq('id', user.id)");
    expect(page).toContain(".eq('key', 'korea_designer_emails')");
    expect(page).toContain(".eq('id', orderId)");
    expect(page).toContain(".eq('order_id', orderId)");
    expect(page).toContain(".order('created_at', { ascending: false })");
    for (const field of [
      'revision_number', 'order_item_id', 'approval_status', 'partner_comment',
      'preview_image_url', 'original_file_url', 'created_at',
    ]) {
      expect(client).toContain(`revision.${field}`);
    }
    expect(page).not.toMatch(/^\s*(?:order_id|revision_name|updated_at):/m);
  });

  it('projects upload-token data without changing token scoping or revision filters', () => {
    const page = source('src/app/upload/[token]/page.tsx');
    const client = source('src/app/upload/[token]/TokenUploadClient.tsx');
    // token id remains selected because TokenUploadClient's required prop contract includes it.
    expect(compact(page)).toContain(compact(
      'id, status, expires_at, order_id, upload_count, orders ( order_number, customer_name, total_amount, created_at )',
    ));
    expect(page).toContain(".eq('token_hash', tokenHash)");
    expect(page).toContain(".eq('order_id', tokenData.order_id)");
    expect(page).toContain(".eq('uploaded_by_type', 'korea_designer')");
    expect(page).toContain(".order('revision_number', { ascending: false })");
    for (const field of [
      'status', 'expires_at', 'upload_count', 'order_id', 'id',
      'revision_number', 'preview_image_url', 'original_file_url',
      'original_customer_filename', 'generated_correction_filename',
      'comment_ko', 'comment_ja',
    ]) {
      expectProjectedProperty(client, field);
    }
    for (const path of [
      'src/app/designer-order/[token]/page.tsx',
      'src/app/designer-order/[token]/DesignerOrderTokenClient.tsx',
    ]) {
      expect(source(path)).not.toMatch(/^\s*(?:original_customer_filename|generated_correction_filename)\s*[?:]/m);
    }
  });

  it('parallelizes only independent blog post work and preserves view/error behavior', () => {
    const page = source('src/app/blog/[slug]/page.tsx');
    expect(page).toContain('const post = await getPublishedPostBySlug(slug);');
    expect(page).toContain('incrementViewCount(post.id).catch(console.error);');
    expect(page).toContain('await Promise.all([');
    expect(page).toContain('parseMarkdown(post.content),');
    expect(page).toContain('getRelatedPosts(post.id, post.category, 10),');
    expect(page.indexOf('incrementViewCount')).toBeLessThan(page.indexOf('Promise.all'));
    expect(page).not.toContain('await getRelatedPosts');
  });

  it('keeps samples dependency-ordered auth, profile, and delivery access', () => {
    const page = source('src/app/samples/page.tsx');
    const prefill = source('src/lib/member/sample-prefill.ts');
    expect(page).toContain('await supabase.auth.getUser()');
    expect(page).toContain('await loadSamplePrefill(supabase, authentication.userId);');
    expect(page.indexOf('await supabase.auth.getUser()')).toBeLessThan(
      page.indexOf('await loadSamplePrefill'),
    );
    expect(prefill).toContain('.eq(\'id\', userId)');
    expect(prefill.indexOf(".eq('id', userId)")).toBeLessThan(prefill.indexOf(".eq('user_id', userId)"));
    expect(prefill).toContain(".order('is_default', { ascending: false })");
    expect(prefill).toContain('.limit(1)');
  });

  it('leaves no narrow-select smell in the seven audited pages', () => {
    for (const path of narrowPages) {
      expect(source(path)).not.toMatch(/\.select\(\s*['"`]\*/);
    }
  });
});
