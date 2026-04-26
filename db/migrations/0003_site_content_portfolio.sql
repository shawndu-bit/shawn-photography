ALTER TABLE site_content
ADD COLUMN IF NOT EXISTS portfolio jsonb NOT NULL DEFAULT '{}'::jsonb;
