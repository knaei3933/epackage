import request from 'supertest';
import app from '@/index';
import pool from '@/config/database';

describe('API Endpoints', () => {
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    // Test database setup
    await pool.query('BEGIN');
  });

  afterAll(async () => {
    await pool.query('ROLLBACK');
    await pool.end();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User',
        companyName: 'Test Company',
        phone: '+81-3-1234-5678'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();

      authToken = response.body.data.accessToken;
      userId = response.body.data.user.id;
    });

    it('should not register user with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not register user with weak password', async () => {
      const userData = {
        email: 'weak@example.com',
        password: 'weak',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();

      authToken = response.body.data.accessToken;
    });

    it('should not login with invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/products', () => {
    it('should get products list', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products?category=boxes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeInstanceOf(Array);
    });

    it('should search products', async () => {
      const response = await request(app)
        .get('/api/products/search?q=box')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeInstanceOf(Array);
      expect(response.body.data.query).toBe('box');
    });
  });

  describe('GET /api/products/categories', () => {
    it('should get product categories', async () => {
      const response = await request(app)
        .get('/api/products/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/quotations', () => {
    it('should create a quotation', async () => {
      const quotationData = {
        items: [
          {
            productId: 1,
            quantity: 100
          }
        ],
        notes: 'Test quotation'
      };

      const response = await request(app)
        .post('/api/quotations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(quotationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toBeInstanceOf(Array);
      expect(response.body.data.totalAmount).toBeGreaterThan(0);
    });

    it('should not create quotation without authentication', async () => {
      const quotationData = {
        items: [
          {
            productId: 1,
            quantity: 100
          }
        ]
      };

      const response = await request(app)
        .post('/api/quotations')
        .send(quotationData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/sample-requests', () => {
    it('should create a sample request', async () => {
      const sampleRequestData = {
        items: [
          {
            productId: 1,
            quantity: 1
          }
        ],
        shippingAddress: {
          postalCode: '100-0001',
          prefecture: 'Tokyo',
          city: 'Chiyoda',
          addressLine1: '1-1 Chiyoda',
          buildingName: 'Test Building'
        }
      };

      const response = await request(app)
        .post('/api/sample-requests')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sampleRequestData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toBeInstanceOf(Array);
      expect(response.body.data.status).toBe('pending');
    });
  });

  describe('POST /api/inquiries', () => {
    it('should create an inquiry', async () => {
      const inquiryData = {
        type: 'general',
        subject: 'Test Inquiry',
        message: 'This is a test inquiry message with sufficient length.',
        contactInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '+81-3-1234-5678',
          company: 'Test Company'
        },
        priority: 'medium'
      };

      const response = await request(app)
        .post('/api/inquiries')
        .send(inquiryData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('general');
      expect(response.body.data.status).toBe('open');
    });

    it('should not create inquiry with insufficient message length', async () => {
      const inquiryData = {
        type: 'general',
        subject: 'Test Inquiry',
        message: 'Short',
        contactInfo: {
          name: 'Test User',
          email: 'test@example.com'
        }
      };

      const response = await request(app)
        .post('/api/inquiries')
        .send(inquiryData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });

  describe('GET /api', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.body.name).toBe('Epackage Lab API');
      expect(response.body.endpoints).toBeDefined();
    });
  });
});