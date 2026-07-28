-- Add subdomain and branding JSON configuration to architects table
ALTER TABLE public.architects
ADD COLUMN IF NOT EXISTS subdomain TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{}'::jsonb;

-- Add a check constraint to ensure subdomains only contain lowercase letters, numbers, and hyphens
ALTER TABLE public.architects
DROP CONSTRAINT IF EXISTS architects_subdomain_format_check;

ALTER TABLE public.architects
ADD CONSTRAINT architects_subdomain_format_check
CHECK (subdomain IS NULL OR subdomain ~ '^[a-z0-9-]+$');
