import { Request, Response } from 'express';
import pool from '@/config/database';
import { sendSuccessResponse, sendErrorResponse } from '@/utils/response';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, category, search, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    let whereClause = 'WHERE is_active = true';
    const queryParams: any[] = [];

    // Filter by category
    if (category) {
      whereClause += ' AND category = $' + (queryParams.length + 1);
      queryParams.push(category);
    }

    // Search functionality
    if (search) {
      whereClause += ' AND (name ILIKE $' + (queryParams.length + 1) +
                    ' OR name_ja ILIKE $' + (queryParams.length + 1) +
                    ' OR description ILIKE $' + (queryParams.length + 1) +
                    ' OR description_ja ILIKE $' + (queryParams.length + 1) + ')';
      queryParams.push(`%${search}%`);
    }

    // Validate sort column
    const allowedSortColumns = ['name', 'price', 'category', 'created_at', 'stock_quantity'];
    const sortColumn = allowedSortColumns.includes(sortBy as string) ? sortBy : 'created_at';
    const sortDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get products
    const productsQuery = `
      SELECT id, name, name_ja, description, description_ja, category, price,
             stock_quantity, min_order_quantity, images, created_at, updated_at
      FROM products
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(Number(limit), offset);
    const productsResult = await pool.query(productsQuery, queryParams);

    const totalPages = Math.ceil(total / Number(limit));

    sendSuccessResponse(res, 200, {
      products: productsResult.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    sendErrorResponse(res, 500, 'Failed to get products');
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, name, name_ja, description, description_ja, category, price,
              stock_quantity, min_order_quantity, specifications, images,
              created_at, updated_at
       FROM products
       WHERE id = $1 AND is_active = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return sendErrorResponse(res, 404, 'Product not found');
    }

    sendSuccessResponse(res, 200, result.rows[0]);

  } catch (error) {
    console.error('Get product error:', error);
    sendErrorResponse(res, 500, 'Failed to get product');
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT category, COUNT(*) as product_count
       FROM products
       WHERE is_active = true
       GROUP BY category
       ORDER BY category`
    );

    sendSuccessResponse(res, 200, result.rows);

  } catch (error) {
    console.error('Get categories error:', error);
    sendErrorResponse(res, 500, 'Failed to get categories');
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q: query, page = 1, limit = 20 } = req.query;

    if (!query || typeof query !== 'string') {
      return sendErrorResponse(res, 400, 'Search query is required');
    }

    const offset = (Number(page) - 1) * Number(limit);

    // Search with full-text search
    const searchQuery = `
      SELECT id, name, name_ja, description, description_ja, category, price,
             stock_quantity, min_order_quantity, images, created_at,
             ts_rank(search_vector, plainto_tsquery($1)) as rank
      FROM (
        SELECT *, to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' ||
                           COALESCE(name_ja, '') || ' ' || COALESCE(description_ja, '') || ' ' ||
                           COALESCE(category, '')) as search_vector
        FROM products
        WHERE is_active = true
      ) AS products_with_vector
      WHERE search_vector @@ plainto_tsquery($1)
      ORDER BY rank DESC, created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(searchQuery, [query, Number(limit), offset]);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM (
        SELECT to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' ||
                           COALESCE(name_ja, '') || ' ' || COALESCE(description_ja, '') || ' ' ||
                           COALESCE(category, '')) as search_vector
        FROM products
        WHERE is_active = true
      ) AS products_with_vector
      WHERE search_vector @@ plainto_tsquery($1)
    `;

    const countResult = await pool.query(countQuery, [query]);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / Number(limit));

    sendSuccessResponse(res, 200, {
      products: result.rows,
      query,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    });

  } catch (error) {
    console.error('Search products error:', error);
    sendErrorResponse(res, 500, 'Failed to search products');
  }
};