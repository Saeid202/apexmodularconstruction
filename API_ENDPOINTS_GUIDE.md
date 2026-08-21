# Contractor Admin API Endpoints - Implementation Guide

## Quick Setup

Create these API route handlers to support the contractor admin dashboard. Place them in `app/api/admin/contractors/`.

## Endpoint Implementations

### 1. GET `/api/admin/contractors`
**Route:** `app/api/admin/contractors/route.ts`

Lists all contractors with optional filtering.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();

  // Verify admin
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Query contractors from your contractors table
  const { data: contractors, error } = await supabase
    .from('contractors')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(contractors);
}
```

### 2. POST `/api/admin/contractors/:id/approve`
**Route:** `app/api/admin/contractors/[id]/approve/route.ts`

Approves a pending contractor.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerClient();

  // Verify admin
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('contractors')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
    })
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
```

### 3. POST `/api/admin/contractors/:id/reject`
**Route:** `app/api/admin/contractors/[id]/reject/route.ts`

Rejects a pending contractor.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerClient();

  // Verify admin
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('contractors')
    .update({ status: 'rejected' })
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
```

### 4. POST `/api/admin/contractors/:id/feature`
**Route:** `app/api/admin/contractors/[id]/feature/route.ts`

Toggles featured status.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerClient();

  // Verify admin
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get current featured status
  const { data: contractor } = await supabase
    .from('contractors')
    .select('featured')
    .eq('id', params.id)
    .single();

  const { error } = await supabase
    .from('contractors')
    .update({ featured: !contractor?.featured })
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
```

### 5. POST `/api/admin/contractors/:id/suspend`
**Route:** `app/api/admin/contractors/[id]/suspend/route.ts`

Toggles suspension status.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerClient();

  // Verify admin
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get current status
  const { data: contractor } = await supabase
    .from('contractors')
    .select('status')
    .eq('id', params.id)
    .single();

  const newStatus = contractor?.status === 'suspended' ? 'approved' : 'suspended';

  const { error } = await supabase
    .from('contractors')
    .update({ status: newStatus })
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
```

### 6. DELETE `/api/admin/contractors/:id`
**Route:** `app/api/admin/contractors/[id]/route.ts`

Deletes a contractor.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerClient();

  // Verify admin
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('contractors')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
```

## Directory Structure

```
app/api/admin/contractors/
├── route.ts                  # GET /api/admin/contractors
├── [id]/
│   ├── route.ts             # DELETE /api/admin/contractors/:id
│   ├── approve/
│   │   └── route.ts         # POST /api/admin/contractors/:id/approve
│   ├── reject/
│   │   └── route.ts         # POST /api/admin/contractors/:id/reject
│   ├── feature/
│   │   └── route.ts         # POST /api/admin/contractors/:id/feature
│   └── suspend/
│       └── route.ts         # POST /api/admin/contractors/:id/suspend
```

## Database Requirements

Ensure your `contractors` table has these columns:
- `id` (UUID, primary key)
- `company_name` (text)
- `contact_name` (text)
- `contact_email` (text)
- `contact_phone` (text)
- `website` (text, nullable)
- `company_description` (text, nullable)
- `service_types` (text[], jsonb)
- `service_areas` (text[], jsonb)
- `years_experience` (int)
- `certifications` (jsonb, nullable)
- `primary_city` (text)
- `province` (text, max 2 chars)
- `full_address` (text)
- `status` (text: 'pending', 'approved', 'rejected', 'suspended')
- `featured` (boolean, default false)
- `rating` (numeric, default 0)
- `reviews_count` (int, default 0)
- `approved_at` (timestamptz, nullable)
- `created_at` (timestamptz, default now())
- `admin_notes` (text, nullable)
- `logo` (text, nullable - URL)

## Authentication Pattern

All endpoints follow this pattern for admin verification:

```typescript
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Optional: Verify admin role
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', session.user.id)
  .single();

if (profile?.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

## Error Handling

All endpoints should return consistent error responses:

```typescript
// 400 - Bad Request
{ error: 'Invalid input' }

// 401 - Unauthorized
{ error: 'Unauthorized' }

// 403 - Forbidden
{ error: 'Forbidden' }

// 404 - Not Found
{ error: 'Contractor not found' }

// 500 - Server Error
{ error: 'Database error message' }
```

## Testing

Test endpoints with curl:

```bash
# Get all contractors
curl http://localhost:3000/api/admin/contractors

# Approve contractor
curl -X POST http://localhost:3000/api/admin/contractors/123/approve

# Delete contractor
curl -X DELETE http://localhost:3000/api/admin/contractors/123
```

## Next Steps

1. Create the API route files following the structure above
2. Test each endpoint with the dashboard
3. Add error handling and validation
4. Implement logging for admin actions
5. Consider adding rate limiting for batch operations
6. Add email notifications for approval/rejection
