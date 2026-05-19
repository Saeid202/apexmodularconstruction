# Implementation Plan: Partner Role

## Overview

Add a `partner` user type to Apex Modular Construction. Partners are Chinese engineering companies that log in via the existing auth modal, view all engineering project submissions, submit structured quotes, and message customers. The implementation follows the established seller/admin patterns throughout the codebase.

## Tasks

- [x] 1. Database migration and TypeScript types
  - The migration file `supabase/migrations/008_partner_role.sql` already exists — verify it is complete and correct against the design
  - Add `Partner`, `EngineeringQuote`, and `EngineeringQuoteFile` interfaces to `types/database.ts`
  - Add `'partner'` to the `role` union in the `profiles` table Row/Insert/Update types
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 2. Middleware: protect /partner/* routes
  - [x] 2.1 Add `/partner/*` route protection block to `middleware.ts`
    - Unauthenticated users → redirect to `/auth/login`
    - Authenticated users without `role='partner'` in `user_metadata` → redirect to `/`
    - Authenticated partners → allow through
    - Add `/partner/:path*` to the `config.matcher` array
    - _Requirements: 2.3, 2.4, 2.5_
  - [ ]* 2.2 Write property test for middleware partner route protection
    - **Property 4: Middleware blocks non-partners from /partner/* routes**
    - **Validates: Requirements 2.3, 2.4**

- [x] 3. Server actions: admin partner management (`app/actions/partner-admin.ts`)
  - [x] 3.1 Implement `createPartner(input)` using `createAdminClient`
    - Call `auth.admin.createUser` with `user_metadata: { role: 'partner' }`
    - Insert row into `partners` table with `status = 'active'`
    - Return descriptive error if email already registered
    - _Requirements: 1.1, 1.2, 1.3_
  - [ ]* 3.2 Write property test for `createPartner` — newly created partners always have status 'active'
    - **Property 1: Newly created partners always have status 'active'**
    - **Validates: Requirements 1.3**
  - [x] 3.3 Implement `listPartners()` — fetch all rows from `partners` table via admin client
    - Return `company_name`, `contact_name`, `email`, `status`, `created_at`
    - _Requirements: 1.5_
  - [ ]* 3.4 Write property test for `listPartners` — listing returns all created partners
    - **Property 2: Partner listing returns all created partners**
    - **Validates: Requirements 1.5**
  - [x] 3.5 Implement `updatePartnerStatus(id, status)` — update `partners.status` via admin client
    - _Requirements: 1.6_
  - [ ]* 3.6 Write property test for `updatePartnerStatus` — status update round-trip
    - **Property 3: Partner status update round-trip**
    - **Validates: Requirements 1.6**

- [x] 4. Server actions: partner-facing operations (`app/actions/partner.ts`)
  - [x] 4.1 Implement `getPartnerDashboardStats()` — total projects, pending (no quote from this partner), responded (has quote from this partner)
    - _Requirements: 3.2_
  - [ ]* 4.2 Write property test for dashboard statistics consistency
    - **Property 5: Dashboard statistics are consistent with data**
    - **Validates: Requirements 3.2**
  - [x] 4.3 Implement `getAllProjectsForPartner()` — fetch all engineering projects with a flag indicating whether this partner has submitted a quote
    - _Requirements: 4.1, 4.2_
  - [x] 4.4 Implement `getProjectDetailForPartner(id)` — fetch single project with drawings (signed URLs) and existing quote if any
    - _Requirements: 5.1, 5.2_
  - [x] 4.5 Implement `submitQuote(projectId, input, files[])` — upsert row in `engineering_quotes`, upload files to `engineering-drawings` bucket under `partner/` prefix, insert rows in `engineering_quote_files`
    - _Requirements: 5.4, 5.7_
  - [ ]* 4.6 Write property test for quote submission round-trip
    - **Property 8: Quote submission round-trip preserves all fields**
    - **Validates: Requirements 5.4**
  - [x] 4.7 Implement `getPartnerProfile()` and `updatePartnerProfile(input)` — read/write the authenticated partner's row in `partners`
    - _Requirements: 7.1, 7.2_
  - [ ]* 4.8 Write property test for partner profile update round-trip
    - **Property 13: Partner profile update round-trip**
    - **Validates: Requirements 7.2**

- [x] 5. Partner messaging server actions
  - [x] 5.1 Add `getPartnerProjectMessages(projectId)` and `sendPartnerMessage(projectId, message, attachments)` to `app/actions/engineering-messages.ts`
    - Both use `createAdminClient` (bypasses RLS, mirrors `adminGetProjectMessages` / `adminSendPartnerMessage`)
    - `sendPartnerMessage` inserts with `sender_role = 'partner'` and updates project status to `'in_review'` if currently `'pending'`
    - Add `markPartnerMessagesRead(projectId)` helper
    - _Requirements: 6.1, 6.2, 6.5_
  - [ ]* 5.2 Write property test — partner messages always have sender_role='partner'
    - **Property 10: Partner messages always have sender_role='partner'**
    - **Validates: Requirements 6.2**
  - [ ]* 5.3 Write property test — sending a message transitions pending projects to in_review
    - **Property 11: Sending a message transitions pending projects to in_review**
    - **Validates: Requirements 6.5**

- [x] 6. Checkpoint — ensure all server actions and middleware compile without errors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Partner layout and sidebar
  - [x] 7.1 Create `components/layout/PartnerSidebar.tsx` — client component mirroring `SellerSidebar` with links: Dashboard (`/partner/dashboard`), Projects (`/partner/projects`), Profile (`/partner/profile`)
    - _Requirements: 3.1_
  - [x] 7.2 Create `app/partner/layout.tsx` — wraps children in `PartnerSidebar` with a logout button, mirrors `app/seller/layout.tsx`
    - _Requirements: 3.1_
  - [x] 7.3 Create `app/partner/LogoutButton.tsx` — client component, signs out and redirects to `/auth/login`

- [x] 8. Partner dashboard page (`app/partner/dashboard/page.tsx`)
  - Server component; calls `getPartnerDashboardStats()` and `getPartnerProfile()`
  - Renders three stat cards: Total Projects, Pending Response, Responded
  - Renders suspension banner when `partner.status === 'suspended'`
  - _Requirements: 3.2, 3.3, 3.4_
  - [ ]* 8.1 Write property test — dashboard statistics are consistent with data
    - **Property 5: Dashboard statistics are consistent with data**
    - **Validates: Requirements 3.2**

- [x] 9. Partner projects list page (`app/partner/projects/page.tsx`)
  - Server component; calls `getAllProjectsForPartner()`
  - Table columns: Project Name, Company, Location, Type, Budget, Status, Submitted, Actions
  - Actions column: View link to `/partner/projects/[id]` and Chat button (opens `ChatDrawer`)
  - Visually indicate "Quoted" badge on rows where partner has submitted a quote
  - _Requirements: 4.2, 4.3, 4.4_
  - [ ]* 9.1 Write property test — quoted projects are visually indicated
    - **Property 6: Quoted projects are visually indicated**
    - **Validates: Requirements 4.4**

- [x] 10. Partner project detail page and QuoteForm
  - [x] 10.1 Create `app/partner/projects/[id]/page.tsx` — server component
    - Calls `getProjectDetailForPartner(id)`, renders all project fields and customer contact info
    - Renders download links for drawings using signed URLs
    - Passes existing quote (if any) to `QuoteForm` for pre-population
    - _Requirements: 5.1, 5.2, 5.5_
  - [ ]* 10.2 Write property test — drawing download links match stored drawings
    - **Property 7: Drawing download links match stored drawings**
    - **Validates: Requirements 5.2**
  - [x] 10.3 Create `app/partner/projects/[id]/QuoteForm.tsx` — client component
    - Fields: price_cad (number, required), timeline_weeks (integer, required), validity_days (integer, required), notes (textarea, optional), file upload (PDF/Excel, multiple)
    - On submit: calls `submitQuote`; on error: displays message without resetting form data
    - Pre-populates fields when existing quote is passed as prop
    - _Requirements: 5.3, 5.4, 5.5, 5.6_
  - [ ]* 10.4 Write property test — quote pre-population matches stored values
    - **Property 9: Quote pre-population matches stored values**
    - **Validates: Requirements 5.5**
  - [ ]* 10.5 Write property test — quote submission round-trip preserves all fields
    - **Property 8: Quote submission round-trip preserves all fields**
    - **Validates: Requirements 5.4**

- [x] 11. Partner profile page
  - [x] 11.1 Create `app/partner/profile/PartnerProfileForm.tsx` — client component
    - Fetches profile on mount via `getPartnerProfile()`; fields: company_name, contact_name, phone, country
    - On submit: calls `updatePartnerProfile`; displays success/error feedback
    - _Requirements: 7.1, 7.2_
  - [ ]* 11.2 Write property test — partner profile display matches database
    - **Property 12: Partner profile display matches database**
    - **Validates: Requirements 7.1**
  - [x] 11.3 Create `app/partner/profile/page.tsx` — server component wrapping `PartnerProfileForm`
    - Includes a change-password section that calls `supabase.auth.updateUser({ password })`
    - Displays error message on password change failure
    - _Requirements: 7.3, 7.4_

- [x] 12. HeaderAuth: add partner dashboard link
  - In `components/layout/HeaderAuth.tsx`, add `else if (userRole === 'partner')` branch rendering a link to `/partner/dashboard`
  - _Requirements: 2.2_

- [x] 13. Admin partner management page (`app/admin/partners/page.tsx`)
  - Client component; calls `listPartners()` on mount
  - Table: company_name, contact_name, email, status, created_at
  - "Create Partner" form/modal: fields email, password, company_name, contact_name, phone (optional); calls `createPartner`; shows error on duplicate email
  - Status toggle button per row calls `updatePartnerStatus`
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6_

- [x] 14. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- The migration file `supabase/migrations/008_partner_role.sql` already exists; task 1 verifies and extends types only
- Property tests use [fast-check](https://github.com/dubzzz/fast-check) with mocked Supabase clients; minimum 100 iterations each
- All partner server actions use `createServerClient` (anon, respects RLS) except messaging which uses `createAdminClient`
- The `ChatDrawer` component is reused as-is; partner pages pass `getPartnerProjectMessages` / `sendPartnerMessage` / `markPartnerMessagesRead` as props
