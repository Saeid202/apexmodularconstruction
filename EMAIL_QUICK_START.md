# Email Notifications - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Get Resend API Key
1. Go to [Resend.com](https://resend.com)
2. Sign up for free account
3. Get API key from dashboard
4. Copy key to clipboard

### Step 3: Configure Environment
Create `.env.local` with:
```env
RESEND_API_KEY=your_key_here
FROM_EMAIL=onboarding@resend.dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### Step 4: Start Dev Server
```bash
npm run dev
```

### Step 5: Test Email Flow
```bash
curl -X POST http://localhost:3000/api/contractor/signup \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Company",
    "contactName": "John Doe",
    "contactEmail": "john@example.com",
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

### Step 6: Check Email
Visit [Resend Emails Dashboard](https://resend.com/emails) to see your test email!

---

## 📧 Email Types

| Email | Trigger | Subject |
|-------|---------|---------|
| Confirmation | Contractor signup | "Welcome to Cargoplus! Your Application is Under Review" |
| Approval | Admin approves | "Your Cargoplus Contractor Application is Approved!" |
| Rejection | Admin rejects | "Cargoplus Contractor Application Status" |

---

## 🔧 API Endpoints

### Signup
```
POST /api/contractor/signup
Sends: Confirmation email ✅
Blocking: No (non-blocking)
```

### Approve
```
POST /api/admin/contractors/:id/approve
Sends: Approval email ✅
Blocking: No (non-blocking)
```

### Reject
```
POST /api/admin/contractors/:id/reject
Sends: Rejection email with optional reason ✅
Blocking: No (non-blocking)
```

---

## 💾 File Locations

**Email Service**: `lib/email/service.ts`
**Email Templates**: `lib/email/templates.ts`
**API Routes**:
- `app/api/contractor/signup/route.ts`
- `app/api/admin/contractors/[id]/approve/route.ts`
- `app/api/admin/contractors/[id]/reject/route.ts`

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| Email not sending | Check API key in `.env.local` |
| API doesn't respond | Check email service logs in console |
| Email not formatted | Visit Resend dashboard to view raw email |
| "Unauthorized" error | Verify RESEND_API_KEY is correct |

---

## ✅ Features

✅ Non-blocking email delivery  
✅ Professional HTML templates  
✅ Error logging  
✅ XSS protection  
✅ Responsive design  
✅ Brand colors included  
✅ Type-safe TypeScript  
✅ Production ready  

---

## 📚 Full Guides

- **Setup Details**: See `EMAIL_SETUP.md`
- **Testing Guide**: See `EMAIL_TESTING_GUIDE.md`
- **Implementation**: See `EMAIL_IMPLEMENTATION_SUMMARY.md`
- **Checklist**: See `IMPLEMENTATION_CHECKLIST.md`

---

## ⚡ Quick Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

---

## 🔐 Security

- ✅ API keys in environment variables
- ✅ XSS protection (HTML escaping)
- ✅ No sensitive data in logs
- ✅ Resend handles DKIM/SPF/DMARC

---

## 📞 Support

- **Resend Docs**: [resend.com/docs](https://resend.com/docs)
- **Resend Support**: [resend.com/support](https://resend.com/support)
- **Setup Help**: See `EMAIL_SETUP.md`

---

**Status**: ✅ Ready to use  
**Build**: ✅ Passing  
**Tests**: ⏳ Ready for your testing
