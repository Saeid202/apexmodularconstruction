# Contractor API Routes - Phase 2 Implementation

## Overview
All remaining contractor API routes have been implemented for Phase 2. These routes handle contractor profile management and admin operations.

## Routes Implemented

### Contractor Routes

#### 1. GET `/api/contractor/profile`
**File:** `app/api/contractor/profile/route.ts`

Fetches the current contractor's profile data.

**Auth:** ✅ Required (contractor role)
**Authorization:** ✅ Contractors can only access their own profile

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "string",
    "companyName": "string",
    "contactName": "string",
    "contactEmail": "string",
    "contactPhone": "string",
    "website": "string?",
    "description": "string?",
    "serviceTypes": ["string"],
    "serviceAreas": ["string"],
    "yearsExperience": "number",
    "certifications": [{"name", "issuedBy", "expiryDate"}],
    "primaryLocation": "string",
    "province": "string",
    "address": "string?",
    "status": "pending|approved|rejected|suspended",
    "featured": "boolean",
    "averageRating": "number",
    "totalReviews": "number",
    "createdAt": "string",
    "approvedAt": "string?"
  }
}
```

#### 2. PUT `/api/contractor/profile`
**File:** `app/api/contractor/profile/route.ts`

Updates the current contractor's profile data.

**Auth:** ✅ Required (contractor role)
**Authorization:** ✅ Contractors can only update their own profile

**Request Body:** All fields optional
```json
{
  "companyName": "string?",
  "contactName": "string?",
  "contactPhone": "string?",
  "website": "string?",
  "description": "string?",
  "serviceTypes": ["string"]?,
  "serviceAreas": ["string"]?,
  "yearsExperience": "number?",
  "certifications": [{"name", "issuedBy", "expiryDate"}]?,
  "primaryLocation": "string?",
  "province": "string?",
  "address": "string?"
}
```

**Response:** Same as GET

---

### Admin Routes

#### 3. GET `/api/admin/contractors`
**File:** `app/api/admin/contractors/route.ts`

Lists all contractors with filtering, sorting, and pagination.

**Auth:** ✅ Required (admin role)
**Authorization:** ✅ Admins only

**Query Parameters:**
- `search` (string) - Search by company name, email, contact name
- `status` (string) - Filter: pending, approved, rejected, suspended, all
- `serviceType` (string) - Filter by service type
- `province` (string) - Filter by province
- `experienceLevel` (string) - Filter: all, beginner (0-4 yrs), intermediate (5-9 yrs), expert (10+ yrs)
- `featuredOnly` (boolean) - Show only featured contractors
- `ratingMin` (number) - Minimum rating filter
- `sortBy` (string) - Sort field: name, status, rating, created (default: created)
- `sortOrder` (string) - asc or desc (default: desc)
- `page` (number) - Page number (1-indexed, default: 1)
- `pageSize` (number) - Items per page (default: 10, max: 100)

**Response:**
```json
{
  "status": "success",
  "data": {
    "contractors": [/* Array of Contractor objects */],
    "total": "number",
    "page": "number",
    "pageSize": "number",
    "totalPages": "number"
  }
}
```

#### 4. GET `/api/admin/contractors/:id`
**File:** `app/api/admin/contractors/[id]/route.ts`

Gets a single contractor's details.

**Auth:** ✅ Required (admin role)
**Authorization:** ✅ Admins only

**Response:** Single Contractor object with `adminNotes` field

#### 5. PUT `/api/admin/contractors/:id`
**File:** `app/api/admin/contractors/[id]/route.ts`

Updates a contractor's details. Admins can edit any field except email.

**Auth:** ✅ Required (admin role)
**Authorization:** ✅ Admins only

**Request Body:** All fields optional, same as contractor PUT + adminNotes

#### 6. DELETE `/api/admin/contractors/:id`
**File:** `app/api/admin/contractors/[id]/route.ts`

Deletes a contractor completely.

**Auth:** ✅ Required (admin role)
**Authorization:** ✅ Admins only

**Response:**
```json
{
  "status": "success",
  "message": "Contractor deleted successfully"
}
```

#### 7. POST `/api/admin/contractors/:id/approve`
**File:** `app/api/admin/contractors/[id]/approve/route.ts`

Approves a pending contractor.

**Auth:** ✅ Required (admin role)
**Authorization:** ✅ Admins only

**Effects:**
- Sets contractor status to `approved`
- Sets `approved_at` timestamp
- Updates `contractor_approvals` record if exists

**Response:** Updated Contractor object

#### 8. POST `/api/admin/contractors/:id/reject`
**File:** `app/api/admin/contractors/[id]/reject/route.ts`

Rejects a pending contractor.

**Auth:** ✅ Required (admin role)
**Authorization:** ✅ Admins only

**Request Body:**
```json
{
  "rejectionReason": "string?"
}
```

**Effects:**
- Sets contractor status to `rejected`
- Updates `contractor_approvals` record if exists with rejection reason

**Response:** Updated Contractor object

#### 9. POST `/api/admin/contractors/:id/feature`
**File:** `app/api/admin/contractors/[id]/feature/route.ts`

Toggles featured status of a contractor.

**Auth:** ✅ Required (admin role)
**Authorization:** ✅ Admins only

**Request Body:**
```json
{
  "featured": "boolean?" // Optional - if omitted, toggles current state
}
```

**Response:** Updated Contractor object with new featured status

#### 10. POST `/api/admin/contractors/:id/suspend`
**File:** `app/api/admin/contractors/[id]/suspend/route.ts`

Toggles suspension status (changes status between suspended/approved).

**Auth:** ✅ Required (admin role)
**Authorization:** ✅ Admins only

**Request Body:**
```json
{
  "suspended": "boolean?" // Optional - if omitted, toggles current state
}
```

**Effects:**
- Sets status to `suspended` or reverts to `approved`
- Updates timestamp

**Response:** Updated Contractor object

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "error": "Error description"
}
```

**Status Codes:**
- `200/201` - Success
- `400` - Bad request (validation, update failure)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not admin/contractor, or accessing others' data)
- `404` - Not found (contractor doesn't exist)
- `500` - Internal server error

---

## Authentication Flow

All routes use the same authentication pattern:

1. Get current user from session: `supabase.auth.getUser()`
2. Verify user exists (401 if not)
3. Get user's profile role from `profiles` table
4. Verify role matches requirements (403 if not)
5. For contractor routes: ensure they own the data they're accessing

---

## Database Tables Used

- `auth.users` - Supabase auth table
- `profiles` - User profiles with roles
- `installers` - Contractor/installer data
- `contractor_approvals` - Approval tracking records

---

## Response Format Standards

All successful responses follow this pattern:
```json
{
  "status": "success",
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

All error responses:
```json
{
  "status": "error",
  "error": "Error message describing what went wrong"
}
```

---

## Testing Checklist

- [ ] GET /api/contractor/profile - Fetch own profile
- [ ] PUT /api/contractor/profile - Update own profile
- [ ] GET /api/admin/contractors - List all contractors
- [ ] GET /api/admin/contractors/:id - Get contractor details
- [ ] PUT /api/admin/contractors/:id - Update contractor
- [ ] DELETE /api/admin/contractors/:id - Delete contractor
- [ ] POST /api/admin/contractors/:id/approve - Approve contractor
- [ ] POST /api/admin/contractors/:id/reject - Reject contractor
- [ ] POST /api/admin/contractors/:id/feature - Toggle featured
- [ ] POST /api/admin/contractors/:id/suspend - Toggle suspension
- [ ] Test 401 Unauthorized (no session)
- [ ] Test 403 Forbidden (wrong role)
- [ ] Test 404 Not Found (invalid contractor ID)
- [ ] Test filtering/pagination on list endpoint
- [ ] Test empty request bodies where allowed

---

## Implementation Notes

1. **Type Safety:** All routes use TypeScript with proper typing
2. **Error Handling:** Comprehensive error handling with appropriate HTTP status codes
3. **Authorization:** Role-based access control for all endpoints
4. **Data Transformation:** Database fields transformed to camelCase in responses
5. **Pagination:** GET list endpoint supports configurable pagination
6. **Filtering:** Multiple filter options on list endpoint
7. **Timestamps:** All updates set `updated_at` timestamp
8. **Audit Trail:** Admin actions tracked in `contractor_approvals` table

---

## Next Steps

1. Integration with contractor dashboard and admin interface
2. Email notifications on approval/rejection
3. Rate limiting on API endpoints
4. Webhook notifications for status changes
5. Analytics and reporting endpoints
6. Bulk action endpoints for admin operations
