-- ============================================
-- Apex Modular Construction E-Commerce Platform
-- Add Contractor Fields to Profiles Table
-- ============================================
-- This migration adds contractor-specific fields to the profiles table

-- Add contractor-specific columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS province TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS service_types TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS service_areas TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]';
