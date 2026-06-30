-- Add youtube_url column to products table
-- Stores a YouTube video URL for product demo/showcase videos.
-- Zero storage cost — video is hosted on YouTube, we only store the URL.

ALTER TABLE products ADD COLUMN IF NOT EXISTS youtube_url TEXT;

COMMENT ON COLUMN products.youtube_url IS 'Optional YouTube video URL for product demo. Accepts any YouTube URL format (watch, youtu.be, shorts).';
