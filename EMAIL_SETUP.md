# Email Notifications Setup Guide

This document explains how to set up email notifications for the contractor system using Resend.

## Overview

The email notification system sends transactional emails to contractors at key stages:
- **Confirmation**: When a contractor signs up
- **Approval**: When their application is approved by admin
- **Rejection**: When their application is rejected by admin

## Email Service: Resend

We use [Resend](https://resend.com) for email delivery. Resend is optimized for transactional emails and integrates seamlessly with Next.js.

### Why Resend?

- ✅ No configuration needed for `.local` testing
- ✅ Built for Next.js applications
- ✅ Free tier includes 100 emails/day
- ✅ Simple API with TypeScript support
- ✅ Professional HTML email templates
- ✅ Excellent deliverability

## Installation

Resend has already been added to `package.json`. Install dependencies:

```bash
npm install
# or
yarn install
```

## Environment Variables

Add the following to your `.env.local` file:

```env
# Resend Email Service
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=noreply@cargoplus.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting Your Resend API Key

1. Go to [Resend Dashboard](https://resend.com/dashboard)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and paste it in your `.env.local` as `RESEND_API_KEY`

### FROM_EMAIL Configuration

The `FROM_EMAIL` variable controls the sender address for all emails. Options:

**Local Development:**
```env
FROM_EMAIL=onboarding@resend.dev
```
This is Resend's test email that works without domain verification.

**Production:**
```env
FROM_EMAIL=noreply@cargoplus.com
```
Requires domain verification in Resend dashboard.

### NEXT_PUBLIC_APP_URL

This URL is used in email templates for links:
- Local: `http://localhost:3000`
- Production: `https://cargoplus.com`

## Email Templates

Email templates are located in `lib/email/templates.ts`:

### 1. Confirmation Email
- **Trigger**: After successful contractor signup
- **Route**: `POST /api/contractor/signup`
- **Subject**: "Welcome to Cargoplus! Your Application is Under Review"
- **Content**: 
  - Thanks for applying
  - Explains 24-hour review timeline
  - Link to dashboard to track status

### 2. Approval Email
- **Trigger**: Admin approves contractor
- **Route**: `POST /api/admin/contractors/[id]/approve`
- **Subject**: "Your Cargoplus Contractor Application is Approved!"
- **Content**:
  - Congratulations message
  - Dashboard access link
  - Next steps checklist

### 3. Rejection Email
- **Trigger**: Admin rejects contractor
- **Route**: `POST /api/admin/contractors/[id]/reject`
- **Subject**: "Cargoplus Contractor Application Status"
- **Content**:
  - Professional rejection message
  - Optional rejection reason (if provided by admin)
  - Support contact information
  - Option to reapply

## Email Service Implementation

### Service Layer: `lib/email/service.ts`

The `sendEmail()` function:
- Sends emails asynchronously
- **Gracefully handles failures** - errors are logged but don't block API responses
- Returns `void` (fire and forget pattern)

### Usage Example

```typescript
import { sendEmail } from '@/lib/email/service'
import { approvalEmailTemplate } from '@/lib/email/templates'

const html = approvalEmailTemplate('John Doe', 'ABC Construction')

await sendEmail({
  to: 'john@company.com',
  subject: 'Your Application is Approved!',
  html: html,
})
```

## Error Handling

If email sending fails:
1. Error is logged to console with details:
   - Recipient email
   - Subject
   - Error message
2. **API request completes successfully**
3. User never experiences a blocked request due to email failure

This prevents email service issues from affecting user experience.

## Testing Emails

### Local Development

1. Set `FROM_EMAIL=onboarding@resend.dev` (Resend test email)
2. Get a free Resend API key from their dashboard
3. Set `RESEND_API_KEY` in `.env.local`
4. Test the signup flow at `POST /api/contractor/signup`

### Check Resend Dashboard

Visit [Resend Emails](https://resend.com/emails) to view:
- Email delivery status
- Open/click tracking
- Failed deliveries
- Test email history

## Troubleshooting

### Email Not Sending

**Issue**: Emails not showing up in Resend dashboard

**Solutions**:
1. Verify `RESEND_API_KEY` is set correctly
2. Check console logs for error messages
3. Ensure `FROM_EMAIL` is set to `onboarding@resend.dev` for testing
4. Check Resend dashboard for any API issues

### API Key Invalid

**Issue**: "Unauthorized" error when sending emails

**Solution**:
1. Get a new API key from Resend dashboard
2. Confirm it's correctly set in `.env.local`
3. Restart the development server: `npm run dev`

### Emails Not Formatted Correctly

**Issue**: HTML emails display as plain text

**Solution**:
1. Verify email client supports HTML
2. Check the `html` property in the email template
3. Resend automatically sets `Content-Type: text/html`

## Production Deployment

When deploying to production:

1. **Set environment variables** in your hosting platform
   - `RESEND_API_KEY` (production key)
   - `FROM_EMAIL` (your domain email)
   - `NEXT_PUBLIC_APP_URL` (production URL)

2. **Verify your domain** in Resend dashboard
   - Add DNS records (DKIM, SPF, DMARC)
   - Follow Resend's domain verification guide

3. **Update sender email** to your branded address:
   ```env
   FROM_EMAIL=noreply@cargoplus.com
   ```

4. **Monitor deliverability** in Resend dashboard
   - Check bounce rates
   - Monitor spam reports
   - Review failed deliveries

## API Routes

### Signup Route
```
POST /api/contractor/signup
- Sends confirmation email after successful signup
- Email is sent asynchronously (non-blocking)
```

### Approval Route
```
POST /api/admin/contractors/[id]/approve
- Sends approval email to contractor
- Email is sent asynchronously (non-blocking)
```

### Rejection Route
```
POST /api/admin/contractors/[id]/reject
- Sends rejection email with optional feedback
- Email is sent asynchronously (non-blocking)
- Supports custom rejection reason
```

## Testing the Complete Flow

1. **Create a test contractor**:
   ```bash
   curl -X POST http://localhost:3000/api/contractor/signup \
     -H "Content-Type: application/json" \
     -d '{
       "companyName": "Test Company",
       "contactName": "Test User",
       "contactEmail": "test@example.com",
       "contactPhone": "555-1234",
       "serviceTypes": ["installation"],
       "serviceAreas": ["Toronto"],
       "yearsOfExperience": 5,
       "certifications": [],
       "primaryLocation": "Toronto",
       "province": "ON",
       "password": "TestPass123!"
     }'
   ```

2. **Check Resend dashboard** for confirmation email

3. **Approve as admin**:
   ```bash
   curl -X POST http://localhost:3000/api/admin/contractors/[installer_id]/approve \
     -H "Authorization: Bearer [admin_token]"
   ```

4. **Check Resend dashboard** for approval email

5. **Reject a contractor**:
   ```bash
   curl -X POST http://localhost:3000/api/admin/contractors/[installer_id]/reject \
     -H "Authorization: Bearer [admin_token]" \
     -H "Content-Type: application/json" \
     -d '{
       "rejectionReason": "Certifications not current"
     }'
   ```

6. **Check Resend dashboard** for rejection email

## Email Template Customization

To customize email templates:

1. Open `lib/email/templates.ts`
2. Modify the template functions:
   - `confirmationEmailTemplate()`
   - `approvalEmailTemplate()`
   - `rejectionEmailTemplate()`
3. Update brand colors, links, or messaging
4. Email styling is scoped within `<style>` tags

## Support

For issues with Resend:
- [Resend Documentation](https://resend.com/docs)
- [Resend Support](https://resend.com/support)

For application issues:
- Check console logs in development
- Review error messages in Resend dashboard
- Check API response status codes
