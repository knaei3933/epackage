# Customer Management System

## Overview
A comprehensive customer management interface for admin users to view, search, filter, and manage customer accounts.

## Features

### Main Page (`/admin/customers/management`)
- **Search Functionality**: Real-time search across customer names, emails, company names, and phone numbers
- **Advanced Filtering**:
  - Status filters (Active, Pending, Suspended, All)
  - Registration period filters (Week, Month, Quarter, Year, All)
  - Combined filter support
- **Statistics Dashboard**:
  - Total customers count
  - Active customers count
  - Pending approvals count
  - New customers this month
- **Customer Table**:
  - Paginated display (10 items per page)
  - Bulk selection with checkboxes
  - Row actions (View, Email, More options)
  - Customer avatar with initial
  - Company information display
  - Order statistics per customer
  - Status badges with color coding
- **Bulk Actions**:
  - Bulk email sending
  - Bulk data export (CSV/Excel)
  - Selection management
- **Animations**:
  - Staggered row animations on load
  - Smooth transitions for filters
  - Framer Motion powered interactions

### Customer Detail Modal
- **Full Customer Profile**:
  - Basic information (status, type, registration date, last login)
  - Contact information (phones, company, position)
  - Order statistics (total orders, total spent, last order date)
- **Contact History**:
  - Email interactions
  - Call logs
  - Internal notes
  - Timeline with icons and dates
- **Quick Actions**:
  - Send email (mailto: link)
  - Export customer data
  - Close modal

### Export Functionality
- **CSV Export**: Standard CSV format with proper escaping
- **Excel Export**:
  - Formatted Excel workbook
  - Column headers with styling
  - Auto-filter enabled
  - Frozen header row
  - Proper column widths
- **Data Fields**:
  - Customer identification
  - Contact details
  - Company information
  - Order statistics
  - Registration and login data

## API Routes

### GET `/api/admin/customers/management`
Fetch customers with filtering, search, and pagination support.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `search` (string) - Search query
- `status` (string) - Filter by status
- `period` (string) - Registration period filter
- `sortBy` (string, default: 'createdAt') - Sort field
- `sortOrder` (string, default: 'desc') - Sort direction

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### POST `/api/admin/customers/management`
Create a new customer account.

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "hashed_password",
  "kanjiLastName": "山田",
  "kanjiFirstName": "太郎",
  ...
}
```

### PATCH `/api/admin/customers/management`
Bulk update customers.

**Request Body:**
```json
{
  "customerIds": ["id1", "id2"],
  "updates": {
    "status": "ACTIVE"
  }
}
```

### DELETE `/api/admin/customers/management`
Bulk soft-delete customers (sets status to DELETED).

**Query Parameters:**
- `ids` (string) - Comma-separated customer IDs

### GET `/api/admin/customers/[id]`
Fetch single customer with full details and statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    ...customerData,
    "statistics": {
      "totalOrders": 10,
      "totalSpent": 500000,
      "lastOrderDate": "2024-01-15"
    },
    "recentOrders": [...],
    "contactHistory": [...]
  }
}
```

### PATCH `/api/admin/customers/[id]`
Update individual customer.

### DELETE `/api/admin/customers/[id]`
Soft-delete individual customer.

### GET `/api/admin/customers/[id]/contact-history`
Fetch contact history for a customer.

### POST `/api/admin/customers/[id]/contact-history`
Add new contact history entry.

**Request Body:**
```json
{
  "type": "email" | "call" | "note",
  "subject": "Optional subject",
  "content": "Contact details",
  "createdBy": "Admin name"
}
```

### POST `/api/admin/customers/management/export`
Export customer data in CSV or Excel format.

**Request Body:**
```json
{
  "customerIds": ["id1", "id2"], // Optional
  "format": "csv" | "excel"
}
```

## Design Patterns

### Matching Settings Page Aesthetic
- **Gradient Backgrounds**: `from-slate-50 to-blue-50/30`
- **Card-Based Layout**: White cards with subtle shadows
- **Sticky Header**: Fixed header with shadow
- **Modern Spacing**: Consistent padding and gaps
- **Smooth Animations**: Framer Motion for transitions
- **Professional Typography**: Clear hierarchy with proper sizing
- **Interactive Elements**: Hover states and active indicators

### Color System
- **Primary**: Blue-600 for main actions
- **Success**: Green for active status
- **Warning**: Yellow/Amber for pending status
- **Error**: Red for suspended/deleted status
- **Neutral**: Gray for secondary elements

### Component Usage
- **Badge Component**: Status indicators with variants
- **Card Component**: Consistent card styling
- **Dialog Component**: Modal overlays
- **Framer Motion**: Page animations and transitions

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   └── customers/
│   │       └── management/
│   │           └── page.tsx                    # Main customer management page
│   └── api/
│       └── admin/
│           └── customers/
│               ├── management/
│               │   ├── route.ts                 # CRUD operations
│               │   └── export/
│               │       └── route.ts             # Export functionality
│               └── [id]/
│                   ├── route.ts                 # Individual customer CRUD
│                   └── contact-history/
│                       └── route.ts             # Contact history management
└── components/
    └── admin/
        └── AdminNavigation.tsx                 # Updated with customer link
```

## Future Enhancements

### Potential Features
1. **Advanced Analytics**:
   - Customer lifetime value calculation
   - Purchase frequency analysis
   - Customer segmentation
   - Churn prediction

2. **Communication Tools**:
   - Email template system
   - Bulk email campaigns
   - SMS notifications
   - In-app messaging

3. **Data Import**:
   - CSV import wizard
   - Excel import with validation
   - Bulk updates via file upload

4. **Advanced Filtering**:
   - Custom date ranges
   - Multiple status selection
   - Order value ranges
   - Product category filters

5. **Customer Profiles**:
   - Profile picture upload
   - Custom fields
   - Tags and labels
   - Customer notes

## Database Schema Notes

The system assumes the following tables exist:

### `users` table
- Standard user fields (email, password_hash, role, status)
- Japanese name fields (kanji/kana, first/last)
- Company information (company_name, position, department)
- Contact information (corporate_phone, personal_phone)
- Address fields (postal_code, prefecture, city, street)
- Business fields (business_type, product_category, legal_entity_number)

### `customer_contacts` table (optional)
- `id`: UUID
- `customer_id`: UUID reference to users
- `type`: 'email' | 'call' | 'note'
- `subject`: Optional subject line
- `content`: Contact details
- `created_by`: Admin/user name
- `created_at`: Timestamp

If the `customer_contacts` table doesn't exist, the API gracefully returns empty arrays.

## Security Considerations

1. **Authentication**: All routes require admin authentication
2. **Password Handling**: Passwords should be hashed before storage
3. **Data Access**: Service role client bypasses RLS for admin operations
4. **Soft Delete**: Customers are marked as DELETED, not actually removed
5. **Input Validation**: API validates required fields and data types

## Performance Optimizations

1. **Pagination**: Limits database queries to 10 items per page
2. **Efficient Filtering**: Database-level filtering before pagination
3. **Statistics Caching**: Order stats fetched in bulk query
4. **Lazy Loading**: Contact history loaded on demand
5. **Staggered Animations**: Reduces initial render impact

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile and tablet
- Graceful degradation for older browsers
- Reduced motion support for accessibility

## Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- Focus indicators on all inputs
- High contrast mode support
- Screen reader friendly table structure
