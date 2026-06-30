# Contractor API Routes - Quick Reference

## Contractor Routes

| Method | Endpoint | Description | Auth Required | File |
|--------|----------|-------------|----------------|------|
| GET | `/api/contractor/profile` | Get own contractor profile | ✅ Contractor | `app/api/contractor/profile/route.ts` |
| PUT | `/api/contractor/profile` | Update own contractor profile | ✅ Contractor | `app/api/contractor/profile/route.ts` |

---

## Admin Routes

| Method | Endpoint | Description | Auth Required | File |
|--------|----------|-------------|----------------|------|
| GET | `/api/admin/contractors` | List all contractors (with filters) | ✅ Admin | `app/api/admin/contractors/route.ts` |
| GET | `/api/admin/contractors/:id` | Get contractor details | ✅ Admin | `app/api/admin/contractors/[id]/route.ts` |
| PUT | `/api/admin/contractors/:id` | Update contractor details | ✅ Admin | `app/api/admin/contractors/[id]/route.ts` |
| DELETE | `/api/admin/contractors/:id` | Delete contractor | ✅ Admin | `app/api/admin/contractors/[id]/route.ts` |
| POST | `/api/admin/contractors/:id/approve` | Approve pending contractor | ✅ Admin | `app/api/admin/contractors/[id]/approve/route.ts` |
| POST | `/api/admin/contractors/:id/reject` | Reject pending contractor | ✅ Admin | `app/api/admin/contractors/[id]/reject/route.ts` |
| POST | `/api/admin/contractors/:id/feature` | Toggle featured status | ✅ Admin | `app/api/admin/contractors/[id]/feature/route.ts` |
| POST | `/api/admin/contractors/:id/suspend` | Toggle suspension status | ✅ Admin | `app/api/admin/contractors/[id]/suspend/route.ts` |

---

## Response Status Codes

| Code | Meaning | Used When |
|------|---------|-----------|
| 200 | OK | Successful GET or PUT |
| 201 | Created | Successful POST (creation) |
| 400 | Bad Request | Invalid input, validation failed, or operation failed |
| 401 | Unauthorized | No valid session/auth token |
| 403 | Forbidden | Auth valid but insufficient permissions (wrong role) |
| 404 | Not Found | Contractor doesn't exist |
| 500 | Server Error | Unexpected server error |

---

## Error Response Format

```json
{
  "status": "error",
  "error": "Error message describing what went wrong"
}
```

---

## Success Response Format

```json
{
  "status": "success",
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

---

## Contractor Object Structure

```typescript
{
  id: string;                    // UUID
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  description?: string;
  serviceTypes: string[];        // e.g., ["solar_installation", "maintenance"]
  serviceAreas: string[];        // e.g., ["ON", "QC"]
  yearsExperience: number;
  certifications: Array<{
    name: string;
    issuedBy: string;
    expiryDate: string;
  }>;
  primaryLocation: string;       // City/Location
  province: string;              // Province code
  address?: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  featured: boolean;
  averageRating: number;         // 0-5
  totalReviews: number;
  createdAt: string;             // ISO 8601
  approvedAt?: string;           // ISO 8601 (when approved)
  logo?: string;                 // Image URL
  adminNotes?: string;           // Admin-only field
}
```

---

## Query Parameters for GET /api/admin/contractors

| Parameter | Type | Default | Example |
|-----------|------|---------|---------|
| search | string | "" | `search=acme` |
| status | string | "all" | `status=pending` |
| serviceType | string | undefined | `serviceType=solar_installation` |
| province | string | undefined | `province=ON` |
| experienceLevel | string | undefined | `experienceLevel=expert` |
| featuredOnly | boolean | false | `featuredOnly=true` |
| ratingMin | number | 0 | `ratingMin=4` |
| sortBy | string | "created" | `sortBy=name` |
| sortOrder | string | "desc" | `sortOrder=asc` |
| page | number | 1 | `page=2` |
| pageSize | number | 10 | `pageSize=25` |

---

## Common Usage Patterns

### Get Current Contractor Profile
```javascript
const response = await fetch('/api/contractor/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { data } = await response.json();
```

### Update Own Profile
```javascript
const response = await fetch('/api/contractor/profile', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    website: 'https://example.com',
    serviceTypes: ['solar_installation']
  })
});
```

### List Pending Contractors (Admin)
```javascript
const response = await fetch('/api/admin/contractors?status=pending&page=1', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
const { data } = await response.json();
```

### Approve a Contractor (Admin)
```javascript
const response = await fetch(`/api/admin/contractors/${id}/approve`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
const { data } = await response.json();
```

### Toggle Featured Status (Admin)
```javascript
const response = await fetch(`/api/admin/contractors/${id}/feature`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    featured: true  // optional - omit to toggle
  })
});
```

---

## Field Constraints

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Auto-generated, read-only |
| companyName | string | Required, max 255 chars |
| contactEmail | string | Required, valid email format, read-only (cannot be changed via API) |
| serviceTypes | array | Required, at least 1 item |
| serviceAreas | array | Required, at least 1 item |
| yearsExperience | number | >= 0 |
| status | enum | "pending", "approved", "rejected", "suspended" |
| featured | boolean | true or false |
| averageRating | number | 0-5 |
| pageSize | number | 1-100 (max) |

---

## Authorization Rules

### Contractor Access
- Can GET their own profile only
- Can PUT their own profile only (not: email, status, featured, rating)
- Returns 403 if accessing another contractor's data

### Admin Access
- Can GET all contractors
- Can PUT any contractor's details
- Can DELETE any contractor
- Can POST all action endpoints (approve, reject, feature, suspend)
- Returns 403 if user doesn't have admin role

---

## Database Field Mappings

| API Response | Database Column | Updatable by Contractor | Updatable by Admin |
|-------------|-----------------|------------------------|-------------------|
| companyName | company_name | ❌ | ✅ |
| contactName | contact_name | ✅ | ✅ |
| contactEmail | contact_email | ❌ | ❌ |
| contactPhone | contact_phone | ✅ | ✅ |
| website | website | ✅ | ✅ |
| description | description | ✅ | ✅ |
| serviceTypes | service_types | ✅ | ✅ |
| serviceAreas | service_areas | ✅ | ✅ |
| yearsExperience | experience_years | ✅ | ✅ |
| certifications | certifications | ✅ | ✅ |
| primaryLocation | primary_location | ✅ | ✅ |
| province | province | ✅ | ✅ |
| address | address | ✅ | ✅ |
| status | status | ❌ | ✅ |
| featured | featured | ❌ | ✅ |
| adminNotes | admin_notes | ❌ | ✅ |
| averageRating | average_rating | ❌ | ❌ |
| totalReviews | total_reviews | ❌ | ❌ |

---

## Error Examples

### 401 Unauthorized
```json
{
  "status": "error",
  "error": "Unauthorized - no user session"
}
```

### 403 Forbidden
```json
{
  "status": "error",
  "error": "Forbidden - admin access required"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "error": "Contractor not found"
}
```

### 400 Bad Request
```json
{
  "status": "error",
  "error": "Failed to update profile"
}
```

---

## Implementation Notes

1. All timestamps are ISO 8601 format
2. All IDs are UUIDs (lowercase)
3. Status codes follow REST conventions
4. Response format is consistent across all endpoints
5. Field names use camelCase in responses (transformed from snake_case in database)
6. Pagination is 1-indexed (page=1 is the first page)
7. Admin actions (approve, reject) update related records in contractor_approvals table
8. Suspension uses status field (not a separate suspended boolean)

---

**Last Updated:** 2026-06-12
**All Routes:** ✅ Implemented and TypeScript-validated
