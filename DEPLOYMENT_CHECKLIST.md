# Deployment Checklist: Product Inclusions & Certificates Feature

## Pre-Deployment ✓

### Database Migrations
- [ ] Run migration `039_product_inclusions_certificates.sql` in Supabase
  - Creates `what_is_included` column on products table
  - Creates `certificates_standards` column on products table
  - Adds GIN indexes for performance
  - Adds constraints to ensure valid JSONB arrays
  
- [ ] Run migration `040_certificates_bucket.sql` in Supabase
  - Creates `certificates` storage bucket
  - Sets up RLS policies for public read and seller write/delete access

### Code Review
- [ ] Review `ProductInclusionsPanel.tsx` component
  - Styling matches design system
  - Tab switching works correctly
  - Null/empty handling is correct
  
- [ ] Review `EditProductForm.tsx` updates
  - State management for both sections
  - File upload logic works
  - Form submission includes new fields
  
- [ ] Review `app/actions/seller.ts` updates
  - JSON parsing handles both fields
  - File upload happens before product save
  - Error handling is robust
  
- [ ] Review `types/index.ts` updates
  - New `CertificateStandard` interface is correct
  - `ProductWithRelations` type includes new fields
  
- [ ] Review database query updates in `page.tsx`
  - Type definitions include new fields
  - Transform function maps fields correctly
  - Null handling is safe

### Local Testing

#### Seller Center
- [ ] Test adding "What's Included" items
  - Add multiple items
  - Edit items
  - Delete items
  - Empty items are filtered before save
  - Data persists after save
  
- [ ] Test adding "Certificates & Standards"
  - Add title and description
  - Upload file (test different file types: PDF, image, document)
  - Edit certificate data
  - Change file (replace existing)
  - Delete certificate
  - Data persists after save
  - File URL is correct and accessible
  
- [ ] Test form submission
  - Save works without filling in new sections (optional)
  - Save works with only "What's Included"
  - Save works with only "Certificates"
  - Save works with both sections filled
  - Loading message shows proper status ("Uploading files...")
  - Success notification appears

#### Product Detail Page
- [ ] Test displaying "What's Included" tab
  - Bullet points render correctly
  - Gold color is visible
  - Layout is readable
  
- [ ] Test displaying "Certificates & Standards" tab
  - Certificate title, description, and download button render
  - Download button works and opens correct file
  - Multiple certificates display correctly
  
- [ ] Test tab switching
  - Click between tabs
  - Correct content displays
  - Smooth transitions
  
- [ ] Test with empty data
  - Panel doesn't render if both sections empty
  - Panel renders if only one section has data
  - Panel shows only tabs with data
  
- [ ] Test sticky behavior on desktop
  - Image gallery and panels stay fixed while scrolling right column
  - No overlap with header
  - Mobile view doesn't have stickiness (scrolls normally)
  
- [ ] Test on different screen sizes
  - Mobile: Single column, normal scroll
  - Tablet: Verify layout transitions
  - Desktop: Two column with sticky left

### Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### File Upload Testing
- [ ] Test PDF upload and download
- [ ] Test image upload (PNG, JPG) and display
- [ ] Test large file handling (>10MB - verify limits)
- [ ] Test with special characters in filename
- [ ] Verify files are stored in correct S3/Supabase path: `{seller_id}/{product_id}/{filename}`
- [ ] Verify public access works (anonymous users can download)

### Error Handling
- [ ] Test with network error during file upload
  - User sees error message
  - Can retry upload
  - Previous data not lost
  
- [ ] Test with database save error
  - Appropriate error message shown
  - User can retry
  
- [ ] Test with invalid JSON in database (if corrupted)
  - Component handles gracefully
  - Doesn't crash page

### Performance
- [ ] Load product with large number of items in "What's Included" (50+)
  - No lag or slowdown
- [ ] Load product with many certificates (10+)
  - Tab switching is responsive
- [ ] Database query performance with GIN indexes
  - No N+1 queries

---

## Deployment Steps

### 1. Database Update
```bash
# In Supabase SQL Editor:
-- Run 039_product_inclusions_certificates.sql
-- Run 040_certificates_bucket.sql
```

### 2. Code Deployment
- [ ] Pull latest code from git
- [ ] Run `npm install` (if dependencies changed)
- [ ] Build: `npm run build`
- [ ] Verify no build errors
- [ ] Deploy to production

### 3. Post-Deployment Verification

#### Check Database
- [ ] Verify `what_is_included` column exists on products table
- [ ] Verify `certificates_standards` column exists on products table
- [ ] Verify `certificates` bucket exists in storage

#### Check Frontend
- [ ] Visit product detail page
- [ ] Verify ProductInclusionsPanel imports correctly (no console errors)
- [ ] Check responsive design on various screen sizes

#### Check Seller Center
- [ ] Login as seller
- [ ] Edit a product
- [ ] Verify new form sections appear
- [ ] Test adding inclusions and certificates
- [ ] Save and verify data persists

#### Monitor Logs
- [ ] Check server logs for errors
- [ ] Check browser console for JavaScript errors
- [ ] Monitor Supabase logs for database errors
- [ ] Monitor storage logs for upload failures

---

## Rollback Plan

If issues occur post-deployment:

### Quick Rollback
1. Revert to previous git commit
2. Redeploy application
3. Existing products continue to work (both columns default to empty arrays)

### Data Safety
- No data is lost in rollback
- Database columns remain (no destructive migration)
- Can re-deploy feature without data loss

---

## Post-Deployment Tasks

### Analytics
- [ ] Monitor usage of new feature
- [ ] Track file upload success/failure rates
- [ ] Monitor storage usage in certificates bucket

### Documentation
- [ ] Update user guide for sellers
- [ ] Document new fields in product schema
- [ ] Update API documentation if applicable

### Monitoring
- [ ] Set up alerts for file upload failures
- [ ] Monitor storage bucket growth
- [ ] Track any database performance issues

### Future Improvements (Optional)
- [ ] Add file size limits in form validation
- [ ] Add drag-and-drop file upload
- [ ] Add bulk certificate management
- [ ] Add certificate expiration dates
- [ ] Add email notifications for certificate expiry

---

## Success Criteria

Feature is considered successfully deployed when:

- [x] All migrations applied without errors
- [x] Frontend components render without console errors
- [x] Sellers can add/edit "What's Included" items
- [x] Sellers can add/edit "Certificates & Standards" with file uploads
- [x] Customers can view "What's Included" and "Certificates" on product detail page
- [x] Files upload to correct storage location
- [x] Files are publicly accessible for download
- [x] Sticky positioning works correctly on desktop
- [x] Responsive design works on all screen sizes
- [x] Empty sections don't display when no data
- [x] All tests pass without errors
- [x] No performance degradation on product detail page

---

## Team Communication

### Notify
- [ ] QA team of changes for testing
- [ ] Customer support of new feature
- [ ] Sellers via email/announcement (optional)

### Prepare Support
- [ ] Create FAQ for common questions
- [ ] Prepare screenshots for sellers
- [ ] Document file upload requirements (formats, sizes)

---

## Version Information

- **Feature Version:** 1.0
- **Migration Files:** 039, 040
- **Components Added:** ProductInclusionsPanel
- **Components Modified:** ProductDetailClient, EditProductForm
- **Files Modified:** 5 (see IMPLEMENTATION_SUMMARY.md)
- **Database Changes:** 2 columns, 1 storage bucket

---

## Contact & Support

For questions about this feature:
- Review `IMPLEMENTATION_SUMMARY.md` for technical details
- Review `FEATURE_DIAGRAM.md` for visual layout
- Check `EditProductForm.tsx` for seller UI
- Check `ProductInclusionsPanel.tsx` for customer view

---

**Created:** [Date]
**Last Updated:** [Date]
**Status:** Ready for Deployment
