# Contractor Admin Dashboard Documentation

## Overview

A comprehensive admin dashboard for managing contractors and installers on the CargoPLUS platform.

## Files Created

### 1. `app/admin/contractors/page.tsx`
**Server Component** - Entry point with authentication and authorization

**Features:**
- ✅ Protected route requiring admin authentication
- ✅ Server-side session validation
- ✅ Admin role verification
- ✅ Redirects to login if not authenticated
- ✅ Redirects to home if not admin

### 2. `app/admin/contractors/ContractorManagementClient.tsx`
**Client Component** - Main interactive dashboard

## UI Components & Features

### Header Section
- **Title:** "Contractor Management"
- **Subtitle:** "Manage installers and contractors on your platform"
- **Add Contractor Button:** Opens add modal (purple theme)
- **Statistics Panel:**
  - Total contractors (blue)
  - Pending approvals (yellow)
  - Featured contractors (purple)
  - Average rating (green)

### Search & Filter Bar
- **Search Input:** Search by company name, email, or contact name
- **Filter Toggle Button:** Opens advanced filter sidebar
- **Quick Status Filters:** All, Pending, Approved, Rejected, Suspended
- **Bulk Selection:** Select multiple contractors for batch actions

### Main Table
**Columns:**
1. **Checkbox** - Multi-select for bulk actions
2. **Company** - Company name and contact email (clickable for details)
3. **Location** - City with map pin icon
4. **Services** - Service type badges (shows first 2, "+N more")
5. **Experience** - Years of experience
6. **Status** - Status badge with color coding:
   - 🟡 Pending (yellow)
   - 🟢 Approved (green)
   - 🔴 Rejected (red)
   - 🟠 Suspended (orange)
7. **Rating** - Star rating with review count
8. **Actions** - View and dropdown menu

**Table Features:**
- Hover effects on rows
- Row selection highlighting
- Sorting by name, status, rating, created date
- Pagination (10 items per page)
- Loading spinner while fetching
- Empty state messaging

### Row Actions Dropdown
For each contractor:
- 👁️ **View Profile** - Opens details sidebar
- ✅ **Approve** (if pending) - Approves contractor
- ❌ **Reject** (if pending) - Rejects contractor
- 📈 **Feature/Unfeature** - Toggle featured status
- 🛡️ **Suspend/Activate** - Toggle suspension status
- 🗑️ **Delete** - Removes contractor with confirmation

### Bulk Actions Bar
When contractors are selected:
- Shows selection count
- **Approve All** button (green)
- **Reject All** button (red)
- **Clear** button (gray)

### Filter Sidebar (Desktop/Mobile)
**Filters:**
- 🔽 **Service Type** - Dropdown (All, Solar Installation, Maintenance, etc.)
- 🔽 **Province** - Dropdown (ON, QC, BC, AB, MB, SK, NS, NB, PE, NL)
- 🔽 **Experience Level** - Beginner (0-4), Intermediate (5-9), Expert (10+)
- 🎚️ **Minimum Rating** - Slider (0-5 stars)
- ☑️ **Featured Only** - Toggle checkbox
- 🔄 **Reset Filters** - Resets all filters

### Details Sidebar
Full contractor profile displayed in right slide-out panel:

**Sections:**
1. **Company Information**
   - Company name
   - Contact name
   - Company description

2. **Contact Information**
   - Email (clickable mailto link)
   - Phone (clickable tel link)
   - Website (clickable link)

3. **Service Details**
   - Service types (color badges)
   - Service areas (blue badges)
   - Years of experience with level

4. **Location**
   - City/Province
   - Full address

5. **Certifications** (if any)
   - Certificate name
   - Issued by
   - Expiry date
   - Award icon

6. **Status & Performance**
   - Status badge with date
   - Star rating (visual stars)
   - Review count
   - Featured status (Yes/No)

7. **Admin Notes**
   - Text area for internal notes
   - Placeholder for empty state

8. **Action Buttons**
   - If pending: Approve & Reject buttons
   - If approved: Feature/Unfeature & Suspend/Activate buttons
   - Loading spinners on action

## Data Types

### Contractor Interface
```typescript
interface Contractor {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  companyDescription?: string;
  serviceTypes: string[];
  serviceAreas: string[];
  yearsExperience: number;
  certifications: Certification[];
  primaryCity: string;
  province: string;
  fullAddress: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  featured: boolean;
  rating: number;
  reviewsCount: number;
  approvedAt?: string;
  createdAt: string;
  adminNotes?: string;
  logo?: string;
}

interface Certification {
  id: string;
  name: string;
  issuedBy: string;
  expiryDate: string;
}
```

### Filter State
```typescript
interface Filters {
  status: "all" | "pending" | "approved" | "rejected" | "suspended";
  serviceType: string;
  province: string;
  experienceLevel: "all" | "beginner" | "intermediate" | "expert";
  featuredOnly: boolean;
  ratingMin: number;
}
```

## API Endpoints Required

The dashboard expects these API endpoints to exist:

### GET `/api/admin/contractors`
Returns array of all contractors

### GET `/api/admin/contractors/:id`
Returns single contractor details

### POST `/api/admin/contractors`
Creates new contractor
- Body: Contractor data without ID

### PUT `/api/admin/contractors/:id`
Updates contractor information
- Body: Updated contractor fields

### DELETE `/api/admin/contractors/:id`
Deletes contractor

### POST `/api/admin/contractors/:id/approve`
Approves pending contractor

### POST `/api/admin/contractors/:id/reject`
Rejects pending contractor

### POST `/api/admin/contractors/:id/feature`
Toggles featured status

### POST `/api/admin/contractors/:id/suspend`
Toggles suspension status (suspended/active)

## Navigation Integration

Added to admin sidebar navigation in `app/admin/layout.tsx`:
- Path: `/admin/contractors`
- Label: "Contractors"
- Icon: Briefcase

## Design System

### Colors
- **Purple:** Primary action buttons, featured status (#a855f7)
- **Green:** Approve actions, success states (#16a34a)
- **Red:** Reject actions, delete actions (#dc2626)
- **Orange:** Suspend actions, warnings (#ea580c)
- **Yellow:** Pending status, caution (#eab308)
- **Blue:** Statistics, information (#3b82f6)
- **Gray:** Secondary elements, borders (#6b7280)

### Typography
- **Headings:** Font-bold, gray-900
- **Labels:** Text-xs, uppercase, tracking-wide, gray-500
- **Body:** Text-sm, gray-700

### Spacing
- **Header:** px-8 py-6
- **Content:** p-8
- **Cards:** rounded-lg, border-gray-200
- **Table:** px-4 py-3

### Icons
- lucide-react for all icons
- h-4 w-4 for most icons
- h-6 w-6 for loading spinners

## Key Features

✅ **Search & Filter**
- Real-time search by name/email/contact
- Multi-field filtering
- Advanced sidebar filters
- Reset filters button

✅ **Sorting**
- Sort by name, status, rating, creation date
- Ascending/descending order

✅ **Pagination**
- 10 items per page
- Previous/Next navigation
- Page counter

✅ **Bulk Actions**
- Select multiple contractors
- Batch approve/reject
- Visual feedback on selection

✅ **Status Management**
- Approve pending contractors
- Reject pending contractors
- Suspend/activate accounts
- Feature/unfeature listings

✅ **Details View**
- Comprehensive contractor profile
- All certifications and documents
- Contact information
- Service areas and types
- Rating and review info

✅ **Responsive Design**
- Sidebar collapses on mobile
- Table scrolls horizontally
- Touch-friendly buttons
- Adaptive grid layouts

✅ **User Feedback**
- Loading spinners
- Action confirmation dialogs
- Disabled states on loading
- Empty state messaging
- Status change animations

## Usage

1. Navigate to `/admin/contractors`
2. View all contractors in table format
3. Use search to find specific contractors
4. Use filters to narrow results
5. Click company name or eye icon to view full profile
6. Use dropdown menu for actions (approve, reject, feature, suspend, delete)
7. Select multiple contractors and use bulk actions for batch operations
8. Update admin notes in the details sidebar

## Future Enhancements

- Export contractors to CSV
- Email templates for approval/rejection
- Contractor performance analytics
- Review management system
- Scheduled suspension notices
- Batch email campaigns
- Contractor documents upload/review
- SLA tracking
- Compliance verification
