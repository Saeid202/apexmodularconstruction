# Supabase Setup Guide for Apex Modular Construction E-Commerce Platform

This guide walks you through creating and configuring a Supabase project for the Apex Modular Construction e-commerce platform.

## Prerequisites

- A Supabase account (free tier works for development)
- A web browser

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up using one of these methods:
   - GitHub account (recommended)
   - Google account
   - Email and password

## Step 2: Create a New Project

1. Once logged in, click "New Project"
2. Fill in the project details:
   - **Name**: `cargoplus-ecommerce`
   - **Database Password**: Create a strong password (save this somewhere secure)
   - **Region**: Choose the closest region to your users (e.g., `East US (North Virginia)` for North America)
   - **Pricing Plan**: Free tier is sufficient for development
3. Click "Create new project"
4. Wait 1-2 minutes for the project to be provisioned

## Step 3: Get Your Project Credentials

Once your project is ready:

1. In the Supabase dashboard, go to **Settings** (gear icon in the left sidebar)
2. Click **API** in the settings menu
3. You'll find two important values:

   **Project URL:**
   - Located under "Project URL"
   - Looks like: `https://abcdefghijklmnop.supabase.co`

   **Anon Key:**
   - Located under "Project API keys" > "anon public"
   - A long JWT token starting with `eyJ...`

4. **Service Role Key** (for admin operations):
   - Located under "Project API keys" > "service_role"
   - ⚠️ Keep this secret! Never expose it in client-side code

## Step 4: Update Your Environment Variables

1. Open `cargoplus-ecommerce/.env.local` in your code editor
2. Replace the placeholder values with your actual credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
```

**Important Notes:**
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe to use in client-side code
- `SUPABASE_SERVICE_ROLE_KEY` should ONLY be used in server-side code (server actions, API routes)
- Never commit `.env.local` to version control (it's already in `.gitignore`)

## Step 5: Configure Email Authentication

1. In the Supabase dashboard, go to **Authentication** (lock icon in the left sidebar)
2. Click **Providers** 
3. Ensure **Email** is enabled (it should be by default)
4. Configure email settings:
   - **Enable email confirmations**: For production, enable this. For development, you can disable it for easier testing.
   - **Secure email change**: Enable for production
5. Click **Save** when done

### Email Templates (Optional)

To customize email templates for password resets and confirmations:

1. Go to **Authentication** > **Email Templates**
2. Customize the following templates:
   - **Confirm signup**: Email sent when users register
   - **Magic Link**: For passwordless login (if enabled)
   - **Change Email Address**: For email changes
   - **Reset Password**: For password reset requests

## Step 6: Configure Site URL

1. Go to **Authentication** > **URL Configuration**
2. Set your **Site URL**:
   - Development: `http://localhost:3000`
   - Production: Your actual domain (e.g., `https://cargoplus.com`)
3. Add **Redirect URLs** for authentication callbacks:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)

## Step 7: Verify Your Setup

After updating your `.env.local` file:

1. Restart your Next.js development server if it was running
2. The Supabase client should now be able to connect to your project
3. You can verify the connection by checking the Supabase dashboard logs

## Next Steps

Once your Supabase project is configured:

1. **Task 2.2**: Run the database schema migration to create tables
2. **Task 2.4**: Configure Row Level Security policies
3. **Task 2.6**: Create storage buckets for images

## Troubleshooting

### "Invalid API key" error
- Double-check that you copied the entire anon key (it's a long JWT)
- Ensure there are no extra spaces or line breaks

### "Project not found" error
- Verify your project URL is correct
- Check that your project is active in the Supabase dashboard

### Authentication emails not sending
- Check the **Logs** section in Supabase dashboard for errors
- For development, consider disabling email confirmations
- Check your spam folder

### Need Help?
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
