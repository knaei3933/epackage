import { Request, Response } from 'express';
import pool from '@/config/database';
import { sendSuccessResponse, sendErrorResponse } from '@/utils/response';
import { AuthenticatedRequest } from '@/middleware/auth';

export const createSampleRequest = async (req: AuthenticatedRequest, res: Response) => {
  const { items, shippingAddress, notes } = req.body;

  try {
    if (!req.user) {
      return sendErrorResponse(res, 401, 'Authentication required');
    }

    if (items.length > 5) {
      return sendErrorResponse(res, 400, 'Maximum 5 sample items allowed per request');
    }

    // Validate products
    const validatedItems = [];
    for (const item of items) {
      const productResult = await pool.query(
        'SELECT id, name, stock_quantity FROM products WHERE id = $1 AND is_active = true',
        [item.productId]
      );

      if (productResult.rows.length === 0) {
        return sendErrorResponse(res, 400, `Product with ID ${item.productId} not found`);
      }

      const product = productResult.rows[0];

      if (product.stock_quantity < item.quantity) {
        return sendErrorResponse(res, 400, `Insufficient stock for ${product.name}`);
      }

      validatedItems.push({
        productId: product.id,
        quantity: item.quantity
      });
    }

    // Create sample request
    const result = await pool.query(
      `INSERT INTO sample_requests (user_id, shipping_address, notes)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, status, shipping_address, notes, created_at`,
      [req.user.userId, JSON.stringify(shippingAddress), notes]
    );

    const sampleRequest = result.rows[0];

    // Create sample request items
    for (const item of validatedItems) {
      await pool.query(
        `INSERT INTO sample_request_items (sample_request_id, product_id, quantity)
         VALUES ($1, $2, $3)`,
        [sampleRequest.id, item.productId, item.quantity]
      );
    }

    // Fetch complete sample request with items
    const completeRequest = await pool.query(
      `SELECT sr.*, sri.product_id, sri.quantity,
              p.name as product_name, p.name_ja as product_name_ja, p.category
       FROM sample_requests sr
       LEFT JOIN sample_request_items sri ON sr.id = sri.sample_request_id
       LEFT JOIN products p ON sri.product_id = p.id
       WHERE sr.id = $1
       ORDER BY sri.id`,
      [sampleRequest.id]
    );

    // Format response
    const itemsWithDetails = completeRequest.rows.map(row => ({
      productId: row.product_id,
      quantity: row.quantity,
      productName: row.product_name,
      productNameJa: row.product_name_ja,
      category: row.category
    }));

    sendSuccessResponse(res, 201, {
      id: sampleRequest.id,
      userId: sampleRequest.user_id,
      status: sampleRequest.status,
      shippingAddress: JSON.parse(sampleRequest.shipping_address),
      notes: sampleRequest.notes,
      createdAt: sampleRequest.created_at,
      items: itemsWithDetails
    }, 'Sample request created successfully');

  } catch (error) {
    console.error('Create sample request error:', error);
    sendErrorResponse(res, 500, 'Failed to create sample request');
  }
};

export const getSampleRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 401, 'Authentication required');
    }

    const { page = 1, limit = 20, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = req.user.role === 'admin' ? '' : 'WHERE sr.user_id = $1';
    const queryParams: any[] = req.user.role === 'admin' ? [] : [req.user.userId];

    if (status) {
      if (whereClause) {
        whereClause += ' AND sr.status = $' + (queryParams.length + 1);
      } else {
        whereClause = 'WHERE sr.status = $' + (queryParams.length + 1);
      }
      queryParams.push(status);
    }

    const query = `
      SELECT sr.id, sr.user_id, sr.status, sr.tracking_number, sr.notes,
             sr.created_at, sr.updated_at, u.first_name, u.last_name, u.email
      FROM sample_requests sr
      LEFT JOIN users u ON sr.user_id = u.id
      ${whereClause}
      ORDER BY sr.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(Number(limit), offset);
    const result = await pool.query(query, queryParams);

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM sample_requests sr ${whereClause}`;
    const countResult = await pool.query(countQuery, req.user.role === 'admin' ? [] : [req.user.userId]);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / Number(limit));

    sendSuccessResponse(res, 200, {
      sampleRequests: result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        status: row.status,
        trackingNumber: row.tracking_number,
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
    console.error('Get sample requests error:', error);
    sendErrorResponse(res, 500, 'Failed to get sample requests');
  }
};

export const getSampleRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return sendErrorResponse(res, 401, 'Authentication required');
    }

    let whereClause = 'WHERE sr.id = $1';
    const queryParams = [id];

    if (req.user.role !== 'admin') {
      whereClause += ' AND sr.user_id = $2';
      queryParams.push(req.user.userId);
    }

    const query = `
      SELECT sr.*, u.first_name, u.last_name, u.email, u.company_name,
             sri.product_id, sri.quantity,
             p.name as product_name, p.name_ja as product_name_ja, p.category
      FROM sample_requests sr
      LEFT JOIN users u ON sr.user_id = u.id
      LEFT JOIN sample_request_items sri ON sr.id = sri.sample_request_id
      LEFT JOIN products p ON sri.product_id = p.id
      ${whereClause}
      ORDER BY sri.id
    `;

    const result = await pool.query(query, queryParams);

    if (result.rows.length === 0) {
      return sendErrorResponse(res, 404, 'Sample request not found');
    }

    // Format response
    const firstRow = result.rows[0];
    const items = result.rows.map(row => ({
      productId: row.product_id,
      quantity: row.quantity,
      productName: row.product_name,
      productNameJa: row.product_name_ja,
      category: row.category
    }));

    sendSuccessResponse(res, 200, {
      id: firstRow.id,
      userId: firstRow.user_id,
      status: firstRow.status,
      trackingNumber: firstRow.tracking_number,
      shippingAddress: JSON.parse(firstRow.shipping_address),
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
    console.error('Get sample request error:', error);
    sendErrorResponse(res, 500, 'Failed to get sample request');
  }
};

export const updateSampleRequestStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, trackingNumber } = req.body;

  try {
    if (!req.user) {
      return sendErrorResponse(res, 401, 'Authentication required');
    }

    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return sendErrorResponse(res, 400, 'Invalid status');
    }

    const whereClause = 'WHERE id = $1';
    const queryParams = [id];

    if (req.user.role !== 'admin') {
      return sendErrorResponse(res, 403, 'Only admins can update sample request status');
    }

    const updateFields = ['status = $2', 'updated_at = NOW()'];
    const updateValues = [status];

    if (trackingNumber && ['shipped', 'delivered'].includes(status)) {
      updateFields.push('tracking_number = $' + (updateValues.length + 1));
      updateValues.push(trackingNumber);
    }

    const result = await pool.query(
      `UPDATE sample_requests SET ${updateFields.join(', ')}
       ${whereClause}
       RETURNING id, status, tracking_number, updated_at`,
      [...updateValues, ...queryParams.slice(1)]
    );

    if (result.rows.length === 0) {
      return sendErrorResponse(res, 404, 'Sample request not found');
    }

    sendSuccessResponse(res, 200, {
      id: result.rows[0].id,
      status: result.rows[0].status,
      trackingNumber: result.rows[0].tracking_number,
      updatedAt: result.rows[0].updated_at
    }, 'Sample request status updated successfully');

  } catch (error) {
    console.error('Update sample request status error:', error);
    sendErrorResponse(res, 500, 'Failed to update sample request status');
  }
};