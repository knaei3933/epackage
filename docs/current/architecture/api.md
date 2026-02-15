# API Reference

Complete API documentation for the Epackage Lab Web system.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Public Endpoints](#public-endpoints)
- [Customer Endpoints](#customer-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Signature Endpoints](#signature-endpoints)
- [File Endpoints](#file-endpoints)
- [Error Codes](#error-codes)
- [Rate Limiting](#rate-limiting)

## Overview

### Base URL

```
Production:  https://epackage-lab.com/api
Development: http://localhost:3000/api
```

### Authentication

Most endpoints require authentication using JWT tokens:

```http
Authorization: Bearer <access_token>
```

Tokens are included in HTTP-only cookies and automatically sent with requests.

### Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "2025-01-01T00:00:00Z",
    "requestId": "uuid"
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2025-01-01T00:00:00Z",
    "requestId": "uuid"
  }
}
```

## Authentication

### Sign In

Authenticate a user and receive access tokens.

```http
POST /api/auth/signin
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "customer",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "company": "Example Corp"
      }
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token"
    }
  }
}
```

### Sign Up

Create a new user account.

```http
POST /api/auth/signup
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "company": "Example Corp",
    "phone": "+81-3-1234-5678"
  }
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "customer"
    },
    "message": "Account created successfully. Please check your email to verify your account."
  }
}
```

### Sign Out

End the current session.

```http
POST /api/auth/signout
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Signed out successfully"
  }
}
```

### Refresh Token

Refresh an expired access token.

```http
POST /api/auth/refresh
Content-Type: application/json
```

**Request Body:**

```json
{
  "refreshToken": "refresh-token"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-token",
    "refreshToken": "new-refresh-token"
  }
}
```

### Get Session

Get current user session.

```http
GET /api/auth/session
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "customer",
      "profile": { ... }
    }
  }
}
```

## Public Endpoints

These endpoints do not require authentication.

### Contact Form

Submit a general inquiry.

```http
POST /api/contact
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "John Doe",
  "company": "Example Corp",
  "email": "john@example.com",
  "phone": "+81-3-1234-5678",
  "subject": "Product Inquiry",
  "inquiryType": "general",
  "urgency": "medium",
  "preferredContact": "email",
  "message": "I am interested in your products..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "message": "Thank you for your inquiry. We will respond within 24 hours."
  }
}
```

### Sample Request

Request product samples.

```http
POST /api/samples
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "John Doe",
  "company": "Example Corp",
  "email": "john@example.com",
  "phone": "+81-3-1234-5678",
  "address": {
    "postalCode": "100-0001",
    "prefecture": "Tokyo",
    "city": "Chiyoda-ku",
    "addressLine1": "1-1-1 Otemachi",
    "addressLine2": "Building 1, Floor 10"
  },
  "samples": [
    {
      "productId": "uuid",
      "productName": "Envelope A4",
      "quantity": 2,
      "specifications": "Window envelope, gummed flap"
    },
    {
      "productId": "uuid",
      "productName": "Box Small",
      "quantity": 1,
      "specifications": "Cardboard, brown"
    }
  ],
  "projectDetails": "We are looking for packaging for our new product launch...",
  "privacyConsent": true
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "requestNumber": "SMP-2025-00001",
    "message": "Your sample request has been received. We will ship your samples within 3-5 business days."
  }
}
```

### Calculate Quotation

Calculate quotation price (public preview).

```http
POST /api/quotation/calculate
Content-Type: application/json
```

**Request Body:**

```json
{
  "product": {
    "type": "envelope",
    "size": "A4",
    "material": "paper80",
    "quantity": 1000
  },
  "postProcessing": [
    {
      "type": "window",
      "position": "bottom-left"
    },
    {
      "type": "printing",
      "sides": 1,
      "colors": 2
    }
  ]
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "basePrice": 15000,
    "postProcessingPrice": 5000,
    "totalPrice": 20000,
    "tax": 2000,
    "grandTotal": 22000,
    "currency": "JPY",
    "breakdown": {
      "unitPrice": 15,
      "quantity": 1000,
      "postProcessing": {
        "window": 2000,
        "printing": 3000
      }
    }
  }
}
```

## Customer Endpoints

These endpoints require customer authentication.

### List Orders

Get customer's orders with pagination and filtering.

```http
GET /api/orders?page=1&limit=20&status=pending
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20) |
| status | string | No | Filter by status |
| search | string | No | Search in order number |
| dateFrom | string | No | Filter by date range (ISO 8601) |
| dateTo | string | No | Filter by date range (ISO 8601) |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "orderNumber": "ORD-2025-00001",
        "status": "pending",
        "items": [ ... ],
        "totalAmount": 50000,
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### Get Order Details

Get specific order details.

```http
GET /api/orders/{id}
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderNumber": "ORD-2025-00001",
    "status": "pending",
    "items": [
      {
        "id": "uuid",
        "product": {
          "id": "uuid",
          "name": "Envelope A4",
          "sku": "ENV-A4-001"
        },
        "quantity": 1000,
        "unitPrice": 15,
        "totalPrice": 15000,
        "specifications": { ... }
      }
    ],
    "totalAmount": 50000,
    "tax": 5000,
    "grandTotal": 55000,
    "shippingAddress": { ... },
    "billingAddress": { ... },
    "documents": [
      {
        "type": "quotation",
        "url": "https://storage.epackage-lab.com/quotes/ORD-2025-00001.pdf"
      }
    ],
    "timeline": [
      {
        "status": "pending",
        "timestamp": "2025-01-01T00:00:00Z",
        "note": "Order received"
      }
    ],
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

### Create Order

Create a new order from quotation.

```http
POST /api/orders
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "quotationId": "uuid",
  "shippingAddress": {
    "name": "John Doe",
    "company": "Example Corp",
    "postalCode": "100-0001",
    "prefecture": "Tokyo",
    "city": "Chiyoda-ku",
    "addressLine1": "1-1-1 Otemachi",
    "addressLine2": "Building 1, Floor 10",
    "phone": "+81-3-1234-5678"
  },
  "billingAddress": {
    "sameAsShipping": true
  },
  "notes": "Please deliver after 2 PM"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderNumber": "ORD-2025-00001",
    "status": "pending_approval",
    "message": "Order created successfully. awaiting approval."
  }
}
```

### List Quotations

Get customer's quotations.

```http
GET /api/quotations?page=1&limit=20
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "quotations": [
      {
        "id": "uuid",
        "quotationNumber": "QT-2025-00001",
        "validUntil": "2025-02-01T00:00:00Z",
        "totalAmount": 55000,
        "status": "pending",
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

### Get Quotation Details

Get specific quotation details with PDF.

```http
GET /api/quotations/{id}
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "quotationNumber": "QT-2025-00001",
    "validUntil": "2025-02-01T00:00:00Z",
    "items": [ ... ],
    "totalAmount": 55000,
    "pdfUrl": "https://storage.epackage-lab.com/quotes/QT-2025-00001.pdf",
    "canConvertToOrder": true
  }
}
```

### Generate Quotation PDF

Generate PDF for a quotation.

```http
POST /api/quotation/pdf
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "quotationData": {
    "items": [ ... ],
    "customer": { ... },
    "validityDays": 30
  }
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "pdfUrl": "https://storage.epackage-lab.com/quotes/QT-2025-00001.pdf",
    "downloadUrl": "https://storage.epackage-lab.com/quotes/QT-2025-00001.pdf?download=true"
  }
}
```

### List Documents

Get customer's documents.

```http
GET /api/documents?type=quotation&page=1&limit=20
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | string | No | Filter by document type (quotation, invoice, delivery_slip) |
| orderId | string | No | Filter by order ID |
| page | number | No | Page number |
| limit | number | No | Items per page |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "uuid",
        "type": "quotation",
        "orderNumber": "ORD-2025-00001",
        "url": "https://storage.epackage-lab.com/docs/...",
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

### Download Document

Download a specific document.

```http
GET /api/documents/{id}/download
Authorization: Bearer <access_token>
```

**Response (200 OK):**

Returns the document file with appropriate Content-Type headers.

### Update Profile

Update customer profile.

```http
PUT /api/profile
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "company": "Example Corp",
  "phone": "+81-3-1234-5678",
  "address": {
    "postalCode": "100-0001",
    "prefecture": "Tokyo",
    "city": "Chiyoda-ku",
    "addressLine1": "1-1-1 Otemachi",
    "addressLine2": ""
  }
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "profile": { ... },
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

## Admin Endpoints

These endpoints require admin authentication.

### Dashboard Stats

Get dashboard statistics.

```http
GET /api/admin/dashboard
Authorization: Bearer <admin_access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "stats": {
      "pendingOrders": 15,
      "pendingApprovals": 8,
      "inProduction": 23,
      "readyForShipment": 5,
      "totalCustomers": 145,
      "monthlyRevenue": 4500000
    },
    "recentOrders": [ ... ],
    "productionSchedule": [ ... ]
  }
}
```

### List All Orders

Get all orders with advanced filtering.

```http
GET /api/admin/orders?page=1&limit=50&status=pending&customer=uuid
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number |
| limit | number | No | Items per page |
| status | string | No | Filter by status |
| customer | string | No | Filter by customer ID |
| search | string | No | Search in order number |
| dateFrom | string | No | Filter by date range |
| dateTo | string | No | Filter by date range |
| sortBy | string | No | Sort field |
| sortOrder | string | No | Sort direction (asc, desc) |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "orders": [ ... ],
    "pagination": { ... }
  }
}
```

### Approve Order

Approve a pending order.

```http
POST /api/admin/orders/{id}/approve
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "note": "Order approved. Production will start within 2 business days."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderNumber": "ORD-2025-00001",
    "status": "approved",
    "approvedAt": "2025-01-01T00:00:00Z",
    "approvedBy": "admin@epackage-lab.com",
    "message": "Order approved and production order created."
  }
}
```

### Reject Order

Reject a pending order.

```http
POST /api/admin/orders/{id}/reject
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "reason": "Product out of stock. Suggested alternative product.",
  "alternativeProducts": ["uuid", "uuid"]
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderNumber": "ORD-2025-00001",
    "status": "rejected",
    "rejectedAt": "2025-01-01T00:00:00Z",
    "rejectedBy": "admin@epackage-lab.com",
    "reason": "Product out of stock. Suggested alternative product."
  }
}
```

### Create Production Order

Create a production order from approved order.

```http
POST /api/admin/production
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "orderId": "uuid",
  "scheduledDate": "2025-01-15",
  "priority": "normal",
  "notes": "Standard production timeline"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "productionNumber": "PRD-2025-00001",
    "orderId": "uuid",
    "orderNumber": "ORD-2025-00001",
    "status": "scheduled",
    "scheduledDate": "2025-01-15",
    "estimatedCompletion": "2025-01-20"
  }
}
```

### Update Production Order

Update production order status.

```http
PUT /api/admin/production/{id}
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "in_progress",
  "stage": "printing",
  "completionPercentage": 45,
  "notes": "Printing in progress. Quality checks passed."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "productionNumber": "PRD-2025-00001",
    "status": "in_progress",
    "stage": "printing",
    "completionPercentage": 45,
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

### Complete Production Order

Mark production order as complete.

```http
POST /api/admin/production/{id}/complete
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "quantityProduced": 1000,
  "qualityChecked": true,
  "notes": "Production completed successfully. All quality checks passed."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "productionNumber": "PRD-2025-00001",
    "status": "completed",
    "completedAt": "2025-01-01T00:00:00Z",
    "readyForShipment": true,
    "message": "Production completed. Order is ready for shipment."
  }
}
```

### List Shipments

Get all shipments.

```http
GET /api/admin/shipments?page=1&limit=50&status=pending
Authorization: Bearer <admin_access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "shipments": [
      {
        "id": "uuid",
        "shipmentNumber": "SHP-2025-00001",
        "orderNumber": "ORD-2025-00001",
        "status": "pending",
        "carrier": "yamato",
        "estimatedDelivery": "2025-01-10",
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

### Create Shipment

Create a shipment for completed production.

```http
POST /api/admin/shipments
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "productionOrderId": "uuid",
  "carrier": "yamato",
  "serviceType": "standard",
  "shippingAddress": { ... },
  "packages": [
    {
      "weight": 5,
      "dimensions": {
        "length": 30,
        "width": 20,
        "height": 10
      }
    }
  ],
  "estimatedDelivery": "2025-01-10"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "shipmentNumber": "SHP-2025-00001",
    "status": "pending",
    "carrier": "yamato",
    "trackingNumber": "1234-5678-9012",
    "estimatedDelivery": "2025-01-10",
    "shippingLabelUrl": "https://storage.epackage-lab.com/labels/..."
  }
}
```

### Update Shipment Status

Update shipment tracking status.

```http
PUT /api/admin/shipments/{id}
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "shipped",
  "trackingNumber": "1234-5678-9012",
  "shippedAt": "2025-01-05T10:00:00Z",
  "notes": "Package picked up by carrier"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "shipmentNumber": "SHP-2025-00001",
    "status": "shipped",
    "trackingNumber": "1234-5678-9012",
    "shippedAt": "2025-01-05T10:00:00Z"
  }
}
```

### Track Shipment

Track shipment status via carrier API.

```http
GET /api/admin/shipments/{id}/track
Authorization: Bearer <admin_access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "shipmentNumber": "SHP-2025-00001",
    "carrier": "yamato",
    "trackingNumber": "1234-5678-9012",
    "status": "in_transit",
    "estimatedDelivery": "2025-01-10",
    "trackingHistory": [
      {
        "status": "picked_up",
        "location": "Tokyo",
        "timestamp": "2025-01-05T10:00:00Z",
        "description": "Package picked up"
      },
      {
        "status": "in_transit",
        "location": "Tokyo Distribution Center",
        "timestamp": "2025-01-05T18:00:00Z",
        "description": "Package in transit"
      }
    ]
  }
}
```

### Generate Document

Generate any document type (quotation, invoice, delivery slip).

```http
POST /api/admin/documents
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "type": "invoice",
  "orderId": "uuid",
  "data": {
    "invoiceNumber": "INV-2025-00001",
    "issueDate": "2025-01-01",
    "dueDate": "2025-01-31",
    "items": [ ... ],
    "notes": "Payment due within 30 days"
  }
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "invoice",
    "orderNumber": "ORD-2025-00001",
    "documentNumber": "INV-2025-00001",
    "url": "https://storage.epackage-lab.com/docs/INV-2025-00001.pdf",
    "downloadUrl": "https://storage.epackage-lab.com/docs/INV-2025-00001.pdf?download=true"
  }
}
```

## Signature Endpoints

Request electronic signatures for documents (DocuSign integration).

### Request Signature

Request signature for a document.

```http
POST /api/documents/{id}/sign
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "signers": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  ],
  "subject": "Please sign quotation QT-2025-00001",
  "message": "Please review and sign the attached quotation.",
  "expiresAt": "2025-01-15T00:00:00Z"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "envelopeId": "uuid",
    "status": "sent",
    "signingUrl": "https://docusign.com/Signing/...",
    "expiresAt": "2025-01-15T00:00:00Z"
  }
}
```

### Check Signature Status

Check signature status for a document.

```http
GET /api/documents/{id}/sign/status
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "documentId": "uuid",
    "envelopeId": "uuid",
    "status": "completed",
    "signers": [
      {
        "name": "John Doe",
        "email": "john@example.com",
        "status": "completed",
        "signedAt": "2025-01-02T10:30:00Z"
      }
    ],
    "completedAt": "2025-01-02T10:30:00Z"
  }
}
```

### Signature Webhook

Webhook endpoint for DocuSign events.

```http
POST /api/webhooks/docusign
```

**Request Body:** (DocuSign webhook payload)

```json
{
  "envelopeId": "uuid",
  "status": "completed",
  "recipients": { ... },
  "timestamp": "2025-01-02T10:30:00Z"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Webhook received"
  }
}
```

## File Endpoints

### Upload File

Upload a file (for customer attachments, etc.).

```http
POST /api/files/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body:**

```
file: <binary>
type: "customer_attachment"
orderId: "uuid" (optional)
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "filename": "document.pdf",
    "url": "https://storage.epackage-lab.com/files/...",
    "size": 1024000,
    "mimeType": "application/pdf",
    "uploadedAt": "2025-01-01T00:00:00Z"
  }
}
```

### Get File

Get a file by ID.

```http
GET /api/files/{id}
Authorization: Bearer <access_token>
```

**Response (200 OK):**

Returns the file with appropriate Content-Type headers.

### Delete File

Delete a file by ID.

```http
DELETE /api/files/{id}
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "File deleted successfully"
  }
}
```

## Error Codes

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required or invalid |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

### Authentication Errors

| Code | Description |
|------|-------------|
| `INVALID_CREDENTIALS` | Invalid email or password |
| `TOKEN_EXPIRED` | Access token has expired |
| `TOKEN_INVALID` | Invalid access token |
| `USER_NOT_FOUND` | User not found |
| `USER_DISABLED` | User account is disabled |
| `EMAIL_NOT_VERIFIED` | Email address not verified |

### Order Errors

| Code | Description |
|------|-------------|
| `ORDER_NOT_FOUND` | Order not found |
| `ORDER_ALREADY_APPROVED` | Order is already approved |
| `ORDER_ALREADY_CANCELLED` | Order is already cancelled |
| `ORDER_CANNOT_MODIFY` | Order cannot be modified in current state |
| `INSUFFICIENT_INVENTORY` | Insufficient inventory for order |
| `INVALID_QUANTITY` | Invalid quantity specified |

### Payment Errors

| Code | Description |
|------|-------------|
| `PAYMENT_REQUIRED` | Payment required for this action |
| `PAYMENT_FAILED` | Payment processing failed |
| `INVALID_PAYMENT_METHOD` | Invalid payment method |
| `PAYMENT_EXPIRED` | Payment window has expired |

### Document Errors

| Code | Description |
|------|-------------|
| `DOCUMENT_NOT_FOUND` | Document not found |
| `DOCUMENT_GENERATION_FAILED` | Failed to generate document |
| `INVALID_DOCUMENT_TYPE` | Invalid document type |
| `DOCUMENT_EXPIRED` | Document has expired |
| `SIGNATURE_FAILED` | Electronic signature failed |

### File Upload Errors

| Code | Description |
|------|-------------|
| `FILE_TOO_LARGE` | File size exceeds limit |
| `INVALID_FILE_TYPE` | Invalid file type |
| `FILE_UPLOAD_FAILED` | File upload failed |
| `VIRUS_DETECTED` | Virus detected in file |

## Rate Limiting

### Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Public endpoints | 10 requests | 1 minute |
| Customer endpoints | 60 requests | 1 minute |
| Admin endpoints | 120 requests | 1 minute |
| File uploads | 5 requests | 1 minute |

### Rate Limit Headers

Rate limit information is included in response headers:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1704067200
```

### Rate Limit Response

When rate limit is exceeded:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

## Webhooks

### SendGrid Webhook

Handle SendGrid events (email delivery, opens, clicks).

```http
POST /api/webhooks/sendgrid
```

### DocuSign Webhook

Handle DocuSign envelope events.

```http
POST /api/webhooks/docusign
```

### Webhook Security

Webhook endpoints verify signatures:

```javascript
// Example webhook verification
const signature = req.headers['x-webhook-signature'];
const payload = req.body;
const isValid = verifySignature(signature, payload, WEBHOOK_SECRET);
```

## API Versioning

The API is versioned using the URL path:

```
/api/v1/...
/api/v2/...
```

Current version: `v1` (implicit in `/api/` endpoints)

## SDKs and Libraries

Official SDKs:

- **JavaScript/TypeScript**: `@epackage-lab/sdk`
- **Python**: `epackage-lab-python`

Example usage:

```typescript
import { EpackageClient } from '@epackage-lab/sdk';

const client = new EpackageClient({
  apiKey: process.env.EPACKAGE_API_KEY,
  baseURL: 'https://epackage-lab.com/api'
});

const orders = await client.orders.list({ status: 'pending' });
```

## Support

For API support, contact:
- Email: api-support@epackage-lab.com
- Documentation: https://docs.epackage-lab.com
- Status Page: https://status.epackage-lab.com
