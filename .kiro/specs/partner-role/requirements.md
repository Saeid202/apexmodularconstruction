# Requirements Document

## Introduction

The Partner Role feature introduces a new user type — Partner — into the Apex Modular Construction platform. A partner is a Chinese engineering company that receives all engineering project submissions, reviews them, and responds with structured quotes (price, timeline, notes) and optional file attachments. Partners log in through the existing auth modal, are created by admins, and have their own dashboard separate from customers and sellers.

## Glossary

- **Partner**: A Chinese company account that reviews engineering project submissions and submits quotes.
- **Admin**: A Apex Modular Construction administrator who creates and manages partner accounts.
- **Customer**: A user who submits engineering projects and receives quotes.
- **Engineering_Project**: A project submission created by a customer containing building specifications and drawings.
- **Quote**: A structured response from a partner to an engineering project, containing price, timeline, validity period, notes, and optional file attachments.
- **Quote_File**: A PDF or Excel file uploaded by a partner as part of a quote.
- **Partner_Dashboard**: The web interface available to authenticated partners.
- **Auth_System**: The existing Supabase-based authentication system shared by all user roles.
- **Chat_Drawer**: The existing real-time messaging component used for project-level communication.
- **RLS**: Row Level Security policies enforced by Supabase.
- **Admin_Client**: The Supabase service-role client that bypasses RLS, used in server actions.

---

## Requirements

### Requirement 1: Partner Account Creation

**User Story:** As an admin, I want to create partner accounts with email and password, so that I can onboard Chinese engineering companies onto the platform.

#### Acceptance Criteria

1. WHEN an admin submits the create-partner form with email, password, company_name, contact_name, and optional phone, THE Admin_Client SHALL create a new auth user with `role='partner'` in user metadata and insert a corresponding row into the `partners` table.
2. IF the email is already registered, THEN THE Admin_Client SHALL return a descriptive error message to the admin.
3. THE Admin_Client SHALL set the partner's initial status to `active` upon creation.
4. WHEN a partner account is created, THE Auth_System SHALL allow the partner to change their password after first login using the existing reset-password flow.
5. THE Admin_Client SHALL list all partners with their company_name, contact_name, email, status, and created_at fields.
6. WHEN an admin updates a partner's status to `suspended` or `active`, THE Admin_Client SHALL persist the change in the `partners` table.

---

### Requirement 2: Partner Authentication

**User Story:** As a partner, I want to log in through the same auth modal as other users, so that I don't need a separate login page.

#### Acceptance Criteria

1. WHEN a user with `role='partner'` in their auth metadata logs in via the Auth_System, THE Auth_System SHALL authenticate them using the existing shared auth modal.
2. WHEN a partner is authenticated, THE HeaderAuth component SHALL display a link to `/partner/dashboard` in the user dropdown.
3. WHEN an unauthenticated user accesses any `/partner/*` route, THE Middleware SHALL redirect them to `/auth/login`.
4. WHEN an authenticated user without `role='partner'` accesses any `/partner/*` route, THE Middleware SHALL redirect them to `/`.
5. WHEN an authenticated partner accesses `/partner/*` routes, THE Middleware SHALL allow access without redirection.

---

### Requirement 3: Partner Dashboard and Navigation

**User Story:** As a partner, I want a dedicated dashboard with sidebar navigation, so that I can efficiently access all partner features.

#### Acceptance Criteria

1. THE Partner_Dashboard SHALL provide a sidebar with navigation links to: Dashboard (`/partner/dashboard`), Projects (`/partner/projects`), and Profile (`/partner/profile`).
2. THE Partner_Dashboard SHALL display three summary statistics: total engineering projects, projects with no submitted quote (pending response), and projects where the partner has submitted a quote (responded).
3. WHEN a partner accesses `/partner/dashboard`, THE Partner_Dashboard SHALL render the statistics using data fetched server-side.
4. WHILE a partner is suspended, THE Partner_Dashboard SHALL display a suspension notice banner.

---

### Requirement 4: Partner Project List

**User Story:** As a partner, I want to see all engineering project submissions, so that I can identify projects to quote.

#### Acceptance Criteria

1. THE Partner_Dashboard SHALL grant partners SELECT access via RLS to all rows in `engineering_projects` and `engineering_project_drawings`.
2. WHEN a partner accesses `/partner/projects`, THE Partner_Dashboard SHALL display a table of all engineering projects with columns: Project Name, Company, Location, Type, Budget, Status, Submitted date, and an Actions column.
3. THE Actions column SHALL include a View link to the project detail page and a Chat button to open the Chat_Drawer.
4. WHEN a partner has already submitted a quote for a project, THE Partner_Dashboard SHALL visually indicate that project as "Quoted" in the table.

---

### Requirement 5: Partner Project Detail and Quote Submission

**User Story:** As a partner, I want to view full project details and submit a structured quote, so that I can respond to engineering project requests.

#### Acceptance Criteria

1. WHEN a partner accesses `/partner/projects/[id]`, THE Partner_Dashboard SHALL display all project fields including: project name, location, type, dimensions, structure type, delivery location, budget range, description, and full customer contact info (full_name, company_name, email, phone).
2. WHEN a project has associated drawings, THE Partner_Dashboard SHALL display download links for each drawing using signed URLs from the `engineering-drawings` storage bucket.
3. THE Partner_Dashboard SHALL render a quote form on the project detail page with fields: price_cad (number, required), timeline_weeks (integer, required), validity_days (integer, required), notes (textarea, optional), and file upload (PDF and Excel files, multiple allowed).
4. WHEN a partner submits the quote form, THE Partner_Dashboard SHALL insert a row into `engineering_quotes` with status `submitted` and upload any attached files to the `engineering-drawings` bucket under the `partner/` prefix.
5. WHEN a partner has already submitted a quote for a project, THE Partner_Dashboard SHALL pre-populate the quote form with existing values and allow the partner to update the quote.
6. IF the quote submission fails, THEN THE Partner_Dashboard SHALL display a descriptive error message without losing the form data.
7. THE RLS policy SHALL allow partners to INSERT and UPDATE only their own rows in `engineering_quotes` and `engineering_quote_files`.
8. THE RLS policy SHALL allow customers to SELECT quotes on their own projects from `engineering_quotes`.

---

### Requirement 6: Partner Messaging

**User Story:** As a partner, I want to send and receive messages on engineering projects, so that I can communicate with customers.

#### Acceptance Criteria

1. WHEN a partner opens the Chat_Drawer on a project, THE Chat_Drawer SHALL fetch messages using the admin client (bypassing RLS) and display all messages for that project.
2. WHEN a partner sends a message, THE Partner_Dashboard SHALL insert a row into `engineering_project_messages` with `sender_role='partner'` using the admin client.
3. THE RLS policy SHALL allow partners to INSERT messages with `sender_role='partner'` on any engineering project.
4. THE RLS policy SHALL allow partners to SELECT all messages on all engineering projects.
5. WHEN a partner sends a message, THE Partner_Dashboard SHALL update the project status to `in_review` if the current status is `pending`.

---

### Requirement 7: Partner Profile Management

**User Story:** As a partner, I want to edit my company profile and change my password, so that I can keep my account information current.

#### Acceptance Criteria

1. WHEN a partner accesses `/partner/profile`, THE Partner_Dashboard SHALL display the current values of company_name, contact_name, phone, and country fetched from the `partners` table.
2. WHEN a partner submits the profile edit form, THE Partner_Dashboard SHALL update the corresponding row in the `partners` table for the authenticated partner's id.
3. THE Partner_Dashboard SHALL provide a change-password form that calls the Auth_System's `updateUser` method with the new password.
4. IF the password change fails, THEN THE Partner_Dashboard SHALL display the error message returned by the Auth_System.

---

### Requirement 8: Database Schema

**User Story:** As a developer, I want the database schema to support all partner operations, so that data is stored correctly and securely.

#### Acceptance Criteria

1. THE database SHALL contain a `partners` table with columns: id (UUID PK referencing auth.users), company_name (text, not null), contact_name (text, not null), email (text, not null), phone (text, nullable), country (text, default 'China'), status (text, default 'active', values: active/suspended), created_at (timestamptz).
2. THE database SHALL contain an `engineering_quotes` table with columns: id (UUID PK), project_id (FK → engineering_projects, cascade delete), partner_id (FK → auth.users), price_cad (numeric, not null), timeline_weeks (integer, not null), validity_days (integer, not null), notes (text, nullable), status (text, default 'submitted'), created_at (timestamptz).
3. THE database SHALL contain an `engineering_quote_files` table with columns: id (UUID PK), quote_id (FK → engineering_quotes, cascade delete), file_name (text, not null), storage_path (text, not null), uploaded_at (timestamptz).
4. THE `profiles` table role CHECK constraint SHALL accept 'partner' as a valid role value.
5. THE storage bucket `engineering-drawings` SHALL have a policy allowing partners to upload objects under the `partner/` prefix.
6. WHEN a partner is deleted from auth.users, THE database SHALL set the partner's id reference to NULL or cascade as appropriate to preserve data integrity.
