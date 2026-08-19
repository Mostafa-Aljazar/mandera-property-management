-- Migration 015: Rebuild property_type enum to match openapi.yaml
-- Old: building, villa, complex, other
-- New: residential, commercial, mixed_use

-- Step 1: Add new enum
CREATE TYPE property_type_new AS ENUM ('residential', 'commercial', 'mixed_use');

-- Step 2: Backfill existing data to text, then cast back
-- First, convert the column to text (safe intermediate step)
ALTER TABLE properties ALTER COLUMN type TYPE text;

-- Step 3: Map old values to new values
UPDATE properties SET type = 'residential' WHERE type IN ('building', 'villa', 'complex', 'other');

-- Step 4: Cast back to the new enum type
ALTER TABLE properties ALTER COLUMN type TYPE property_type_new USING type::property_type_new;

-- Step 5: Drop the old enum
DROP TYPE property_type;

-- Step 6: Rename the new enum to the original name
ALTER TYPE property_type_new RENAME TO property_type;
