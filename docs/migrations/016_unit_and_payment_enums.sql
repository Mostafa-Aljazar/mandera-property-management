-- Migration 016: Enum renames and additions for openapi.yaml alignment

-- 1. unit_status: vacant → available, occupied → rented
ALTER TYPE unit_status RENAME VALUE 'vacant' TO 'available';
ALTER TYPE unit_status RENAME VALUE 'occupied' TO 'rented';

-- 2. payment_status: pending → due
ALTER TYPE payment_status RENAME VALUE 'pending' TO 'due';

-- 3. maintenance_status: pending → new_request, closed → completed
ALTER TYPE maintenance_status RENAME VALUE 'pending' TO 'new_request';
ALTER TYPE maintenance_status RENAME VALUE 'closed' TO 'completed';

-- 4. Add new values to payment_method (mada, sadad, other)
ALTER TYPE payment_method ADD VALUE 'mada';
ALTER TYPE payment_method ADD VALUE 'sadad';
ALTER TYPE payment_method ADD VALUE 'other';

-- 5. Add new values to expense_type (cleaning, services)
ALTER TYPE expense_type ADD VALUE 'cleaning';
ALTER TYPE expense_type ADD VALUE 'services';

-- 6. Add new values to maintenance_issue_type (appliances, doors_locks, paint, water_leak)
ALTER TYPE maintenance_issue_type ADD VALUE 'appliances';
ALTER TYPE maintenance_issue_type ADD VALUE 'doors_locks';
ALTER TYPE maintenance_issue_type ADD VALUE 'paint';
ALTER TYPE maintenance_issue_type ADD VALUE 'water_leak';

-- 7. Add new values to unit_type (studio, villa, warehouse) and backfill 'other' to 'apartment'
ALTER TYPE unit_type ADD VALUE 'studio';
ALTER TYPE unit_type ADD VALUE 'villa';
ALTER TYPE unit_type ADD VALUE 'warehouse';

-- Backfill existing 'other' unit_types to 'apartment' (since spec has no 'other')
UPDATE units SET unit_type = 'apartment' WHERE unit_type = 'other';

-- 8. Create new rent_period enum (monthly, annually)
CREATE TYPE rent_period AS ENUM ('monthly', 'annually');
