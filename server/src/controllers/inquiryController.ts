import { Request, Response } from 'express';
import pool from '@/config/database';
import { sendSuccessResponse, sendErrorResponse } from '@/utils/response';
import { AuthenticatedRequest } from '@/middleware/auth';

export const createInquiry = async (req: Request, res: Response) => {
  const { type, subject, message, contactInfo, priority = 'medium' } = req.body;

  try {
    const user = (req as AuthenticatedRequest).user;

    // Validate inquiry data
    if (!['general', 'technical', 'sales', 'support'].includes(type)) {
      return sendErrorResponse(res, 400, 'Invalid inquiry type');
    }

    if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return sendErrorResponse(res, 400, 'Invalid priority level');
    }

    // Create inquiry
    const result = await pool.query(
      `INSERT INTO inquiries (user_id, type, subject, message, contact_info, priority)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, type, subject, priority, status, created_at`,
      [
        user?.userId || null,
        type,
        subject,
        message,
        JSON.stringify(contactInfo),
        priority
      ]
    );

    const inquiry = result.rows[0];

    sendSuccessResponse(res, 201, {
      id: inquiry.id,
      userId: inquiry.user_id,
      type: inquiry.type,
      subject: inquiry.subject,
      priority: inquiry.priority,
      status: inquiry.status,
      createdAt: inquiry.created_at
    }, 'Inquiry submitted successfully');

  } catch (error) {
    console.error('Create inquiry error:', error);
    sendErrorResponse(res, 500, 'Failed to submit inquiry');
  }
};

export const getInquiries = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 401, 'Authentication required');
    }

    const { page = 1, limit = 20, type, status, priority } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = req.user.role === 'admin' ? '' : 'WHERE i.user_id = $1';
    const queryParams: any[] = req.user.role === 'admin' ? [] : [req.user.userId];

    // Add filters
    if (type) {
      if (whereClause) {
        whereClause += ' AND i.type = $' + (queryParams.length + 1);
      } else {
        whereClause = 'WHERE i.type = $' + (queryParams.length + 1);
      }
      queryParams.push(type);
    }

    if (status) {
      if (whereClause) {
        whereClause += ' AND i.status = $' + (queryParams.length + 1);
      } else {
        whereClause = 'WHERE i.status = $' + (queryParams.length + 1);
      }
      queryParams.push(status);
    }

    if (priority) {
      if (whereClause) {
        whereClause += ' AND i.priority = $' + (queryParams.length + 1);
      } else {
        whereClause = 'WHERE i.priority = $' + (queryParams.length + 1);
      }
      queryParams.push(priority);
    }

    const query = `
      SELECT i.id, i.user_id, i.type, i.subject, i.priority, i.status,
             i.assigned_to, i.created_at, i.updated_at,
             u.first_name, u.last_name, u.email,
             a.first_name as assigned_first_name, a.last_name as assigned_last_name,
             a.email as assigned_email
      FROM inquiries i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN users a ON i.assigned_to = a.id
      ${whereClause}
      ORDER BY i.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(Number(limit), offset);
    const result = await pool.query(query, queryParams);

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM inquiries i ${whereClause}`;
    const countResult = await pool.query(countQuery, req.user.role === 'admin' ? [] : [req.user.userId]);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / Number(limit));

    sendSuccessResponse(res, 200, {
      inquiries: result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        type: row.type,
        subject: row.subject,
        priority: row.priority,
        status: row.status,
        assignedTo: row.assigned_to ? {
          id: row.assigned_to,
          firstName: row.assigned_first_name,
          lastName: row.assigned_last_name,
          email: row.assigned_email
        } : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        userInfo: row.user_id ? {
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email
        } : null
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
    console.error('Get inquiries error:', error);
    sendErrorResponse(res, 500, 'Failed to get inquiries');
  }
};

export const getInquiry = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return sendErrorResponse(res, 401, 'Authentication required');
    }

    let whereClause = 'WHERE i.id = $1';
    const queryParams = [id];

    if (req.user.role !== 'admin') {
      whereClause += ' AND i.user_id = $2';
      queryParams.push(req.user.userId);
    }

    const query = `
      SELECT i.*, u.first_name, u.last_name, u.email, u.company_name,
             a.first_name as assigned_first_name, a.last_name as assigned_last_name,
             a.email as assigned_email
      FROM inquiries i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN users a ON i.assigned_to = a.id
      ${whereClause}
    `;

    const result = await pool.query(query, queryParams);

    if (result.rows.length === 0) {
      return sendErrorResponse(res, 404, 'Inquiry not found');
    }

    const inquiry = result.rows[0];

    sendSuccessResponse(res, 200, {
      id: inquiry.id,
      userId: inquiry.user_id,
      type: inquiry.type,
      subject: inquiry.subject,
      message: inquiry.message,
      contactInfo: JSON.parse(inquiry.contact_info),
      priority: inquiry.priority,
      status: inquiry.status,
      assignedTo: inquiry.assigned_to ? {
        id: inquiry.assigned_to,
        firstName: inquiry.assigned_first_name,
        lastName: inquiry.assigned_last_name,
        email: inquiry.assigned_email
      } : null,
      createdAt: inquiry.created_at,
      updatedAt: inquiry.updated_at,
      userInfo: inquiry.user_id ? {
        firstName: inquiry.first_name,
        lastName: inquiry.last_name,
        email: inquiry.email,
        companyName: inquiry.company_name
      } : null
    });

  } catch (error) {
    console.error('Get inquiry error:', error);
    sendErrorResponse(res, 500, 'Failed to get inquiry');
  }
};

export const updateInquiryStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, assignedTo } = req.body;

  try {
    if (!req.user) {
      return sendErrorResponse(res, 401, 'Authentication required');
    }

    if (!['open', 'in_progress', 'closed'].includes(status)) {
      return sendErrorResponse(res, 400, 'Invalid status');
    }

    if (req.user.role !== 'admin') {
      return sendErrorResponse(res, 403, 'Only admins can update inquiry status');
    }

    const result = await pool.query(
      `UPDATE inquiries SET status = $1, assigned_to = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, status, assigned_to, updated_at`,
      [status, assignedTo || null, id]
    );

    if (result.rows.length === 0) {
      return sendErrorResponse(res, 404, 'Inquiry not found');
    }

    sendSuccessResponse(res, 200, {
      id: result.rows[0].id,
      status: result.rows[0].status,
      assignedTo: result.rows[0].assigned_to,
      updatedAt: result.rows[0].updated_at
    }, 'Inquiry status updated successfully');

  } catch (error) {
    console.error('Update inquiry status error:', error);
    sendErrorResponse(res, 500, 'Failed to update inquiry status');
  }
};