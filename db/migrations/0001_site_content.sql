CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS site_content (
  id smallint PRIMARY KEY DEFAULT 1,
  hero jsonb NOT NULL DEFAULT '{}'::jsonb,
  about jsonb NOT NULL DEFAULT '{}'::jsonb,
  contact jsonb NOT NULL DEFAULT '{}'::jsonb,
  blog jsonb NOT NULL DEFAULT '{}'::jsonb,
  social_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  blog_posts jsonb NOT NULL DEFAULT '[]'::jsonb,
  section_visibility jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_content_singleton CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS site_photos (
  id text PRIMARY KEY,
  title text NOT NULL DEFAULT '',
  src text NOT NULL,
  thumbnail_src text NOT NULL,
  width integer NOT NULL DEFAULT 0,
  height integer NOT NULL DEFAULT 0,
  category text NOT NULL,
  alt text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  specifications text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_photos_position ON site_photos (position);
