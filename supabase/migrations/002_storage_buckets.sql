-- ============================================
-- Apex Modular Construction E-Commerce Platform
-- Storage Buckets Migration
-- ============================================
-- Requirements: 1.1
-- This migration creates storage buckets and policies for file uploads
-- Run this migration in the Supabase SQL Editor after running 001_initial_schema.sql

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create storage buckets for different image types
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('seller-logos', 'seller-logos', true),
  ('hero-slides', 'hero-slides', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Product Images: Public read access
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Product Images: Sellers can upload
CREATE POLICY "Sellers can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

-- Product Images: Sellers can update their own uploads
CREATE POLICY "Sellers can update own product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images');

-- Product Images: Sellers can delete their own uploads
CREATE POLICY "Sellers can delete own product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images');

-- Seller Logos: Public read access
CREATE POLICY "Public can view seller logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'seller-logos');

-- Seller Logos: Sellers can upload their logo
CREATE POLICY "Sellers can upload seller logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'seller-logos');

-- Seller Logos: Sellers can update their logo
CREATE POLICY "Sellers can update own seller logos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'seller-logos');

-- Hero Slides: Public read access
CREATE POLICY "Public can view hero slides"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hero-slides');

-- Hero Slides: Only admins can manage (via service role)
-- Admin operations use the service role client which bypasses RLS
-- No additional policies needed - service role has full access
