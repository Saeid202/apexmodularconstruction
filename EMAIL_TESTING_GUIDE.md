# Email Notifications Testing Guide

This guide provides step-by-step instructions for testing the email notification system.

## Prerequisites

1. ✅ Resend package installed (`npm install`)
2. ⏳ Resend API key (get from [Resend Dashboard](https://resend.com))
3. ✅ Environment variables configured in `.env.local`

## Setup

### 1. Configure Environment Variables

Create `.env.local` with:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=onboarding@resend.dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### 2. Start Development Server

```bash
npm run dev
```

The server runs at `http://localhost:3000`.

## Test Scenarios

### Test 1: Confirmation Email (Signup)

**Objective**: Verify confirmation email is sent when contractor signs up

**Steps**:

1. Make POST request to `/api/contractor/signup`:

```bash
curl -X POST http://localhost:3000/api/contractor/signup \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Construction Inc",
    "contactName": "John Smith",
    "contactEmail": "john@example.com",
    "contactPhone": "555-123-4567",
    "website": "https://example.com",
    "description": "Quality construction services",
    "serviceTypes": ["installation", "repair"],
    "serviceAreas": ["Toronto", "Ottawa"],
    "yearsOfExperience": 5,
    "certifications": [
      {
        "name": "CSA Certification",
        "issuedBy": "CSA Group",
        "expiryDate": "2025-12-31"
      }
    ],
    "primaryLocation": "Toronto",
    "province": "ON",
    "address": "123 Main St, Toronto, ON M1A 1A1",
    "password": "SecurePass123!"
  }'
```

2. **Expected Response**:
```json
{
  "message": "Contractor application submitted successfully! Pending admin approval.",
  "user_id": "uuid-value",
  "installer_id": "uuid-value"
}
```

3. **Verify Email**:
   - Visit [Resend Emails Dashboard](https://resend.com/emails)
   - Look for email with subject: "Welcome to Cargoplus! Your Application is Under Review"
   - Verify recipient is `john@example.com`
   - Click to view email content

4. **Email Content Verification**:
   - ✅ Contains contractor name: "John Smith"
   - ✅ Contains company name: "Test Construction Inc"
   - ✅ Mentions 24-hour review timeline
   - ✅ Contains dashboard link: `/contractor/dashboard`
   - ✅ Professional formatting with brand colors

---

### Test 2: Approval Email

**Objective**: Verify approval email is sent when admin approves contractor

**Prerequisites**:
- You have a contractor ID from Test 1 (or create new contractor)
- You have admin authentication token

**Steps**:

1. Get your admin user ID (from Supabase or your auth system)

2. Make POST request to approve endpoint:

```bash
# Replace [id] with installer_id from signup response
curl -X POST http://localhost:3000/api/admin/contractors/[id]/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [admin_token]"
```

3. **Expected Response**:
```json
{
  "status": "success",
  "message": "Contractor approved successfully. Approval email sent.",
  "data": {
    "id": "uuid",
    "companyName": "Test Construction Inc",
    "contactName": "John Smith",
    "contactEmail": "john@example.com",
    "status": "approved",
    ...
  }
}
```

4. **Verify Email**:
   - Visit [Resend Emails Dashboard](https://resend.com/emails)
   - Look for email with subject: "Your Cargoplus Contractor Application is Approved!"
   - Verify recipient is `john@example.com`

5. **Email Content Verification**:
   - ✅ Contains contractor name: "John Smith"
   - ✅ Contains congratulations message
   - ✅ Contains dashboard link with "Access Your Dashboard" button
   - ✅ Contains next steps checklist
   - ✅ Professional formatting

---

### Test 3: Rejection Email

**Objective**: Verify rejection email with optional reason is sent

**Prerequisites**:
- You have a contractor ID
- You have admin authentication token

**Steps**:

1. Make POST request to reject endpoint:

```bash
# Replace [id] with installer_id
curl -X POST http://localhost:3000/api/admin/contractors/[id]/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [admin_token]" \
  -d '{
    "rejectionReason": "Certifications not current. Please update certifications and reapply."
  }'
```

2. **Expected Response**:
```json
{
  "status": "success",
  "message": "Contractor rejected successfully. Rejection email sent.",
  "data": {
    "id": "uuid",
    "companyName": "Test Construction Inc",
    "contactName": "John Smith",
    "contactEmail": "john@example.com",
    "status": "rejected",
    ...
  }
}
```

3. **Verify Email**:
   - Visit [Resend Emails Dashboard](https://resend.com/emails)
   - Look for email with subject: "Cargoplus Contractor Application Status"
   - Verify recipient is `john@example.com`

4. **Email Content Verification**:
   - ✅ Contains contractor name: "John Smith"
   - ✅ Professional rejection message
   - ✅ Contains rejection reason: "Certifications not current..."
   - ✅ Contains "Contact Support" button
   - ✅ Contains "Want to apply again?" section
   - ✅ Professional formatting

---

### Test 4: Rejection Without Reason

**Objective**: Verify rejection email works without optional reason

**Steps**:

1. Make POST request without rejection reason:

```bash
curl -X POST http://localhost:3000/api/admin/contractors/[id]/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [admin_token]" \
  -d '{}'
```

2. **Verify Email**:
   - Check Resend dashboard for rejection email
   - Verify it doesn't contain a "Feedback" section
   - Verify rest of content is still professional

---

### Test 5: Error Handling

**Objective**: Verify emails fail gracefully without blocking API response

**Steps**:

1. Set invalid `RESEND_API_KEY` in `.env.local`:
```env
RESEND_API_KEY=invalid_key_here
```

2. Restart dev server: `npm run dev`

3. Make signup request (from Test 1)

4. **Expected Behavior**:
   - ✅ API returns 201 success response
   - ✅ Error is logged to console:
     ```
     Failed to send email: {
       to: 'john@example.com',
       subject: 'Welcome to Cargoplus! Your Application is Under Review',
       error: 'Unauthorized...'
     }
     ```
   - ✅ Contractor is created in database
   - ✅ User experience not affected

5. **Fix and Retry**:
   - Set correct `RESEND_API_KEY`
   - Restart server
   - Repeat signup test
   - Verify email now sends successfully

---

## Debugging

### Check Console Logs

Development server logs contain email activity:

```bash
npm run dev
```

**Success log**:
```
Email sent to john@example.com
```

**Error log**:
```
Failed to send email: {
  to: 'john@example.com',
  subject: 'Welcome to Cargoplus!',
  error: 'API key invalid'
}
```

### Check Resend Dashboard

1. Visit [Resend Emails](https://resend.com/emails)
2. View all sent emails
3. Click email to see:
   - Recipient
   - Subject
   - HTML rendering
   - Delivery status
   - Open/click tracking (if applicable)

### Common Issues

| Issue | Solution |
|-------|----------|
| **Email not showing in Resend dashboard** | 1. Verify API key is correct<br>2. Check console for error<br>3. Verify FROM_EMAIL is set<br>4. Restart dev server |
| **Email shows as bounced** | 1. Verify recipient email is valid<br>2. Check if it's an invalid test email<br>3. Try with real email address |
| **API returns error instead of success** | 1. Check if contractor data validation passes<br>2. Verify Supabase connection<br>3. Check admin token is valid (for approve/reject) |
| **HTML not formatted correctly** | 1. Check email client supports HTML<br>2. View raw email in Resend dashboard<br>3. Inspect template code in templates.ts |

## Batch Testing

To test multiple emails at once:

### Create 5 Contractors

```bash
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/contractor/signup \
    -H "Content-Type: application/json" \
    -d '{
      "companyName": "Test Company '"$i"'",
      "contactName": "Test User '"$i"'",
      "contactEmail": "test'"$i"'@example.com",
      "contactPhone": "555-000-000'"$i"'",
      "serviceTypes": ["installation"],
      "serviceAreas": ["Toronto"],
      "yearsOfExperience": 5,
      "certifications": [],
      "primaryLocation": "Toronto",
      "province": "ON",
      "password": "TestPass123!"
    }'
  sleep 1
done
```

Then check Resend dashboard for 5 confirmation emails.

## Email Template Testing

### Test Responsive Design

1. Send test email to your actual email address
2. Open in different email clients:
   - Gmail (web)
   - Outlook
   - Apple Mail
   - Mobile (Gmail app, Outlook app)
3. Verify:
   - ✅ Text is readable
   - ✅ Buttons are clickable
   - ✅ Images display correctly
   - ✅ Formatting is preserved

### Test Dark Mode

1. Send test email
2. Open in email client with dark mode
3. Verify:
   - ✅ Text is still readable
   - ✅ Colors are appropriate
   - ✅ Buttons are visible

## Performance Testing

### Monitor Email Send Time

The email sending is non-blocking, so it shouldn't affect API response time significantly.

**Expected**: API response < 500ms (email sent in background)

```bash
time curl -X POST http://localhost:3000/api/contractor/signup \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

## Production Testing

Before deploying to production:

1. **Verify Domain** in Resend dashboard
   - Add DNS records (DKIM, SPF, DMARC)
   - Complete verification process

2. **Test with Production Key**
   - Get production Resend API key
   - Set in environment variables
   - Test all email flows

3. **Update FROM_EMAIL**
   ```env
   FROM_EMAIL=noreply@cargoplus.com
   ```

4. **Update APP_URL**
   ```env
   NEXT_PUBLIC_APP_URL=https://cargoplus.com
   ```

5. **Send Test Emails**
   - Test with real contractor signups
   - Verify emails arrive in production inbox
   - Check deliverability metrics

## Rollback Plan

If emails stop working in production:

1. **Check Resend Status**: [Resend Status Page](https://status.resend.com)

2. **Verify Environment Variables**:
   - Confirm API key is correct
   - Confirm FROM_EMAIL is correct

3. **Check Error Logs**: Look for email error messages

4. **Temporary Workaround**:
   - Emails are non-blocking, so system continues working
   - Admin can manually email contractors if needed

5. **Recovery**:
   - Fix environment variable
   - Restart application
   - Emails resume automatically

## Success Criteria

✅ **Signup**: Confirmation email sent within 1 second
✅ **Approval**: Approval email sent within 1 second
✅ **Rejection**: Rejection email sent within 1 second
✅ **Error Handling**: API succeeds even if email fails
✅ **Formatting**: All emails display correctly in major email clients
✅ **Logging**: All email activities logged to console

---

For troubleshooting help, see `EMAIL_SETUP.md` or contact Resend support.
