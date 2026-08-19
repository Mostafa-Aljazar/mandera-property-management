-- Migration 017: Add new columns to match openapi.yaml schemas

-- 1. Add district to properties (required by Property schema)
ALTER TABLE properties ADD COLUMN district text;

-- 2. Add unit fields: annual_rent, rent_period, amenities, images, and rename/retype floor/bedrooms
ALTER TABLE units ADD COLUMN annual_rent numeric;
ALTER TABLE units ADD COLUMN rent_period rent_period NOT NULL DEFAULT 'monthly';
ALTER TABLE units ADD COLUMN amenities text[] DEFAULT '{}';
ALTER TABLE units ADD COLUMN images text[] DEFAULT '{}';

-- Rename bedrooms to rooms (same semantics, different name per spec)
ALTER TABLE units RENAME COLUMN bedrooms TO rooms;

-- Change floor from text to integer (already numeric-like but needs explicit cast)
ALTER TABLE units ALTER COLUMN floor TYPE integer USING floor::integer;

-- 3. Add tenant fields: nationality_code, nationality, is_verified
ALTER TABLE tenants ADD COLUMN nationality_code text;
ALTER TABLE tenants ADD COLUMN nationality text;
ALTER TABLE tenants ADD COLUMN is_verified boolean DEFAULT false;

-- 4. Add job_title to users (for UserProfile in auth endpoints)
ALTER TABLE users ADD COLUMN job_title text;

-- 5. Create unit-images storage bucket (multipart unit photos, same RLS pattern as maintenance-images)
-- Note: This is a placeholder SQL; actual bucket creation happens via Supabase console/SDK
-- The RLS policy will be created in the next migration (018)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'unit-images',
  'unit-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT DO NOTHING;
