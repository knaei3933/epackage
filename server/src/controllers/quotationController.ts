import { Request, Response } from 'express';
import pool from '@/config/database';
import { sendSuccessResponse, sendErrorResponse } from '@/utils/response';
import { AuthenticatedRequest } from '@/middleware/auth';

export const createQuotation = async (req: AuthenticatedRequest, res: Response) => {
  const { items, notes } = req.body;

  try {
    if (!req.user) {
      return sendErrorResponse(res, 401, 'Authentication required');
    }

    // Validate products and calculate total
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const productResult = await pool.query(
        'SELECT id, name, price, stock_quantity, min_order_quantity FROM products WHERE id = $1 AND is_active = true',
        [item.productId]
      );

      if (productResult.rows.length === 0) {
        return sendErrorResponse(res, 400, `Product with ID ${item.productId} not found`);
      }

      const product = productResult.rows[0];

      if (item.quantity < product.min_order_quantity) {
        return sendErrorResponse(res, 400, `Minimum order quantity for ${product.name} is ${product.min_order_quantity}`);
      }

      const unitPrice = product.price;
      const totalPrice = unitPrice * item.quantity;
      totalAmount += totalPrice;

      validatedItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
        totalPrice
      });
    }

    // Create quotation
    const quotationResult = await pool.query(
      `INSERT INTO quotations (user_id, total_amount, valid_until, notes)
       VALUES ($1, $2, NOW() + INTERVAL '30 days', $3)
       RETURNING id, user_id, total_amount, status, valid_until, notes, created_at`,
      [req.user.userId, totalAmount, notes]
    );

    const quotation = quotationResult.rows[0];

    // Create quotation items
    for (const item of validatedItems) {
      await pool.query(
        `INSERT INTO quotation_items (quotation_id, product_id, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [quotation.id, item.productId, item.quantity, item.unitPrice, item.totalPrice]
      );
    }

    // Fetch complete quotation with items
    const completeQuotation = await pool.query(
      `SELECT q.*, qi.product_id, qi.quantity, qi.unit_price, qi.total_price,
              p.name as product_name, p.name_ja as product_name_ja
       FROM quotations q
       LEFT JOIN quotation_items qi ON q.id = qi.quotation_id
       LEFT JOIN products p ON qi.product_id = p.id
       WHERE q.id = $1`,
      [quotation.id]
    );

    // Format response
    const itemsWithDetails = completeQuotation.rows.map(row => ({
      productId: row.product_id,
      quantity: row.quantity,
      unitPrice: parseFloat(row.unit_price),
      totalPrice: parseFloat(row.total_price),
      productName: row.product_name,
      productNameJa: row.product_name_ja
    }));

    sendSuccessResponse(res, 201, {
      id: quotation.id,
      userId: quotation.user_id,
      totalAmount: parseFloat(quotation.total_amount),
      status: quotation.status,
      validUntil: quotation.valid_until,
      notes: quotation.notes,
      createdAt: quotation.created_at,
      items: itemsWithDetails
    }, 'Quotation created successfully');

  } catch (error) {
    console.error('Create quotation error:', error);
    sendErrorResponse(res, 500, 'Failed to create quotation');
  }
};

export const getQuotations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 401, 'Authentication required');
    }

    const { page = 1, limit = 20, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = req.user.role === 'admin' ? '' : 'WHERE user_id = $1';
    const queryParams: any[] = req.user.role === 'admin' ? [] : [req.user.userId];

    if (status) {
      if (whereClause) {
        whereClause += ' AND status = $' + (queryParams.length + 1);
      } else {
        whereClause = 'WHERE status = $' + (queryParams.length + 1);
      }
      queryParams.push(status);
    }

    const query = `
      SELECT q.id, q.user_id, q.total_amount, q.status, q.valid_until, q.notes,
             q.created_at, q.updated_at, u.first_name, u.last_name, u.email
      FROM quotations q
      LEFT JOIN users u ON q.user_id = u.id
      ${whereClause}
      ORDER BY q.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(Number(limit), offset);
    const result = await pool.query(query, queryParams);

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM quotations ${whereClause}`;
    const countResult = await pool.query(countQuery, req.user.role === 'admin' ? [] : [req.user.userId]);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / Number(limit));

    sendSuccessResponse(res, 200, {
      quotations: result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        totalAmount: parseFloat(row.total_amount),
        status: row.status,
        validUntil: row.valid_until,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        userInfo: {
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email
        }
      })),
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
    console.error('Get quotations error:', error);
    sendErrorResponse(res, 500, 'Failed to get quotations');
  }
};

export const getQuotation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return sendErrorResponse(res, 401, 'Authentication required');
    }

    let whereClause = 'WHERE q.id = $1';
    const queryParams = [id];

    if (req.user.role !== 'admin') {
      whereClause += ' AND q.user_id = $2';
      queryParams.push(req.user.userId);
    }

    const query = `
      SELECT q.*, u.first_name, u.last_name, u.email, u.company_name,
             qi.product_id, qi.quantity, qi.unit_price, qi.total_price,
             p.name as product_name, p.name_ja as product_name_ja, p.category
      FROM quotations q
      LEFT JOIN users u ON q.user_id = u.id
      LEFT JOIN quotation_items qi ON q.id = qi.quotation_id
      LEFT JOIN products p ON qi.product_id = p.id
      ${whereClause}
      ORDER BY qi.id
    `;

    const result = await pool.query(query, queryParams);

    if (result.rows.length === 0) {
      return sendErrorResponse(res, 404, 'Quotation not found');
    }

    // Format response
    const firstRow = result.rows[0];
    const items = result.rows.map(row => ({
      productId: row.product_id,
      quantity: row.quantity,
      unitPrice: parseFloat(row.unit_price),
      totalPrice: parseFloat(row.total_price),
      productName: row.product_name,
      productNameJa: row.product_name_ja,
      category: row.category
    }));

    sendSuccessResponse(res, 200, {
      id: firstRow.id,
      userId: firstRow.user_id,
      totalAmount: parseFloat(firstRow.total_amount),
      status: firstRow.status,
      validUntil: firstRow.valid_until,
      notes: firstRow.notes,
      createdAt: firstRow.created_at,
      updatedAt: firstRow.updated_at,
      userInfo: {
        firstName: firstRow.first_name,
        lastName: firstRow.last_name,
        email: firstRow.email,
        companyName: firstRow.company_name
      },
      items
    });

  } catch (error) {
    console.error('Get quotation error:', error);
    sendErrorResponse(res, 500, 'Failed to get quotation');
  }
};

export const updateQuotationStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (!req.user) {
      return sendErrorResponse(res, 401, 'Authentication required');
    }

    if (!['pending', 'approved', 'rejected', 'expired'].includes(status)) {
      return sendErrorResponse(res, 400, 'Invalid status');
    }

    const whereClause = 'WHERE id = $1';
    const queryParams = [id];

    if (req.user.role !== 'admin') {
      return sendErrorResponse(res, 403, 'Only admins can update quotation status');
    }

    const result = await pool.query(
      `UPDATE quotations SET status = $2, updated_at = NOW()
       ${whereClause}
       RETURNING id, status, updated_at`,
      [status, ...queryParams.slice(1)]
    );

    if (result.rows.length === 0) {
      return sendErrorResponse(res, 404, 'Quotation not found');
    }

    sendSuccessResponse(res, 200, {
      id: result.rows[0].id,
      status: result.rows[0].status,
      updatedAt: result.rows[0].updated_at
    }, 'Quotation status updated successfully');

  } catch (error) {
    console.error('Update quotation status error:', error);
    sendErrorResponse(res, 500, 'Failed to update quotation status');
  }
};