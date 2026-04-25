CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'image',
  usage_type text NOT NULL DEFAULT 'general',
  uploaded_from text NOT NULL DEFAULT 'unknown',
  original_key text NOT NULL UNIQUE,
  original_url text NOT NULL,
  thumbnail_key text,
  thumbnail_url text,
  filename text,
  mime_type text,
  file_size_bytes bigint,
  width integer,
  height integer,
  title text NOT NULL DEFAULT '',
  alt text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_created_at_desc ON media_assets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_assets_usage_type ON media_assets (usage_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_uploaded_from ON media_assets (uploaded_from);
CREATE INDEX IF NOT EXISTS idx_media_assets_status ON media_assets (status);
CREATE INDEX IF NOT EXISTS idx_media_assets_category ON media_assets (category);
