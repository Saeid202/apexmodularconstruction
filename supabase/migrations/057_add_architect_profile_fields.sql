-- Add professional profile fields to architects table
ALTER TABLE public.architects
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS professional_role TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS specialization TEXT;

-- Re-generate or adjust policies if necessary (standard select/update policies still apply to all columns)
